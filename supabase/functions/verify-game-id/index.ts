// Edge Function: verify-game-id
//
// Reads the screenshot a player uploaded when linking an in-game ID, asks a
// vision AI model what User ID + nickname it sees, and auto-verifies the
// game_id_links row if that matches what the player submitted. If it doesn't
// match (or the AI can't confidently read the image), the row is left in its
// existing 'pending' state for the existing admin review queue to handle by
// eye -- this function only ever adds automatic verification on top of that
// queue, it never removes the manual fallback.
//
// This is the first Edge Function in the project. Everything else so far is
// client + Postgres SECURITY DEFINER RPC, but Postgres can't make outbound
// HTTP calls to a third-party AI API on its own -- that's the one thing that
// forces code to live here instead of in schema.sql.
//
// Deploy: supabase functions deploy verify-game-id
// Requires one secret: supabase secrets set GEMINI_API_KEY=<your key>
// (get a free-tier key at https://aistudio.google.com/apikey)

import { createClient } from 'jsr:@supabase/supabase-js@2';

const GEMINI_MODEL = 'gemini-2.5-flash-lite';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// Loose match: strips everything but letters/digits and lowercases, so
// "123 456 789" and "123456789" (or minor casing/spacing differences in a
// nickname) still count as a match. This is deliberately forgiving -- a
// false "pending" just costs an admin a manual look, same as today.
function looseMatch(a: string, b: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const na = normalize(a);
  const nb = normalize(b);
  return na.length > 0 && (na === nb || na.includes(nb) || nb.includes(na));
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { linkId } = await req.json();
    if (!linkId) {
      return jsonResponse({ error: 'linkId is required' }, 400);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Not authenticated' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      return jsonResponse({ error: 'Server is not configured with a GEMINI_API_KEY secret yet' }, 500);
    }

    // Scoped to the caller's own JWT, only used to confirm who's asking.
    const callerClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData.user) {
      return jsonResponse({ error: 'Not authenticated' }, 401);
    }

    // Service role: bypasses RLS so this function can read the private
    // screenshot bucket and write the verification result regardless of the
    // (admin-only) UPDATE policy on game_id_links.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: link, error: linkError } = await adminClient
      .from('game_id_links')
      .select('*')
      .eq('id', linkId)
      .single();

    if (linkError || !link) {
      return jsonResponse({ error: 'Game ID link not found' }, 404);
    }

    if (link.user_id !== userData.user.id) {
      return jsonResponse({ error: 'This link does not belong to you' }, 403);
    }

    if (!link.screenshot_url) {
      return jsonResponse({ error: 'No screenshot on file for this link' }, 400);
    }

    const { data: imageBlob, error: downloadError } = await adminClient
      .storage
      .from('game_id_screenshots')
      .download(link.screenshot_url);

    if (downloadError || !imageBlob) {
      return jsonResponse({ error: 'Could not read the uploaded screenshot' }, 500);
    }

    const imageBuffer = await imageBlob.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const mimeType = imageBlob.type || 'image/jpeg';

    const prompt = `This is a screenshot of a ${link.game_type} player profile screen. ` +
      `Read the player's User ID (and Zone/Server ID if shown separately) and their ` +
      `in-game nickname/username exactly as displayed. Respond with strict JSON only: ` +
      `{"user_id": "...", "nickname": "...", "readable": true|false}. ` +
      `Set "readable" to false if this doesn't look like a game profile screen or the ` +
      `ID/nickname aren't clearly visible.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64Image } },
            ],
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                user_id: { type: 'STRING' },
                nickname: { type: 'STRING' },
                readable: { type: 'BOOLEAN' },
              },
              required: ['user_id', 'nickname', 'readable'],
            },
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API error:', errText);
      return jsonResponse({ error: 'Vision check failed, left pending for admin review', verified: false }, 200);
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    let extracted: { user_id?: string; nickname?: string; readable?: boolean };
    try {
      extracted = JSON.parse(rawText);
    } catch {
      extracted = { readable: false };
    }

    const extractedId = extracted.user_id?.trim() ?? '';
    const extractedNickname = extracted.nickname?.trim() ?? '';
    const isMatch = !!extracted.readable && looseMatch(extractedId, link.in_game_id);

    const { error: updateError } = await adminClient
      .from('game_id_links')
      .update({
        verification_method: 'ai_vision',
        ai_extracted_id: extractedId || null,
        ai_extracted_nickname: extractedNickname || null,
        status: isMatch ? 'verified' : 'pending',
        admin_notes: isMatch
          ? null
          : `AI read User ID "${extractedId || '(unreadable)'}" from the screenshot, which doesn't match the submitted "${link.in_game_id}". Please review manually.`,
      })
      .eq('id', linkId);

    if (updateError) {
      console.error('Failed to write verification result:', updateError);
      return jsonResponse({ error: 'Verification ran but saving the result failed' }, 500);
    }

    return jsonResponse({ verified: isMatch, extractedId, extractedNickname });
  } catch (e) {
    console.error('verify-game-id error:', e);
    return jsonResponse({ error: 'Unexpected error during verification' }, 500);
  }
});
