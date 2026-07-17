# MissionQuest

A gaming missions + esports tournament platform. Players complete in-game challenges
("missions") for real cash rewards, and compete in admin-run MLBB/PUBG Mobile
tournaments with full bracket/lobby automation. Built for the Nepal market (eSewa)
with PayPal as the international payment rail.

This document is for programmers picking up the codebase — it covers architecture,
where things live, how the money/security model works, and what's still unfinished.

## Tech stack

- **Frontend**: Vite + React 19 + TypeScript, React Router for tabs/routes.
- **Backend**: none. [Supabase](https://supabase.com) (Postgres + Auth + Storage +
  Realtime) is the entire backend. There is no Node/Express server anywhere in this
  repo — the client talks to Supabase directly via `@supabase/supabase-js`.
- **Charts**: `recharts` (admin analytics only).
- **Testing**: Vitest + React Testing Library.
- **Linting**: `oxlint`.

Run `npm run verify` (== `tsc -b && oxlint && vitest run`) before considering any
change done. This is the project's one CI gate.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # if it doesn't exist, create it — see below
npm run dev
```

`.env.local` needs:
```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

To stand up the database, run [`schema.sql`](schema.sql) in the Supabase SQL editor
against a fresh project. **Known gap**: `public.is_admin()` is referenced ~30 times
throughout `schema.sql` (every admin-gated RLS policy calls it) but is never defined
in the file itself — it exists only in the live Supabase project this was originally
built against, created directly in the SQL editor before `schema.sql` became the
source of truth. On a fresh project you must define it yourself first, e.g.:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```
(Check the live project's actual definition first if you have access to it — the
above is a reconstruction based on how every caller uses it, not a copy of the
original.)

## Architecture

**No backend server — Postgres Row Level Security (RLS) is the entire security
boundary.** Every table the client can query has RLS enabled; policies decide what
each user can see. Supabase auto-generates the REST API from the schema, so there's
no route/controller layer to audit — the schema *is* the API surface.

**Anything atomic, cross-user, or that needs to bypass a table's normal RLS
(searching other users' data, crediting a wallet, generating a bracket) is a
`SECURITY DEFINER` Postgres function, called from the client via `supabase.rpc(...)`.**
This is the single most important pattern in the codebase — look at
`register_for_tournament`, `approve_deposit`, `start_mission_attempt`, or
`generate_bracket` in `schema.sql` for the shape: validate the caller, validate the
business rules, do the write(s), return. Never trust a client-computed value for
anything money- or fairness-related; the RPC re-derives/re-validates everything
server-side.

**Admins are broadly trusted.** Most admin actions are a plain `UPDATE ... WHERE
is_admin()` RLS policy called directly from the client (no RPC needed) — e.g.
updating tournament status, scheduling a match, editing mission fee tiers. RPCs are
reserved for admin actions that are *compound* (e.g. `confirm_match_result`, which
also has to trigger bracket-round advancement).

**Realtime**: tables that need to update live without a manual refresh (wallet
balance, mission attempt status, tournament registered_count, match check-in state,
chat messages, notifications) are added to the `supabase_realtime` publication and
subscribed to via `postgres_changes` channels in `App.tsx`. Search `.channel(` there
to find every live subscription.

**Function-signature gotcha**: `CREATE OR REPLACE FUNCTION` does **not** replace a
function if you change its parameter list — Postgres treats it as a new overload and
leaves the old one live and callable. Whenever you change an RPC's arguments, add an
explicit `DROP FUNCTION IF EXISTS name(old_arg_types);` right before the new
definition (search `schema.sql` for `DROP FUNCTION IF EXISTS public.register_for_tournament`
for a real example of this biting the project once already).

**Nepal-time daily resets**: daily mission limits reset at Nepal midnight (UTC+5:45),
not UTC midnight. See `src/dateUtils.ts` (`isSameNepalDay`) — this was a real bug fix,
not a style choice; don't "simplify" it back to UTC comparisons.

## Project structure

```
schema.sql              Single source of truth for the entire database — tables,
                         RLS policies, triggers, RPCs, storage buckets, seed data.
                         Organized as numbered sections (1-20), append-only in
                         practice (new sections added at the end rather than
                         editing historical CREATE TABLE statements).

src/
  App.tsx                Central state/handler hub. Owns nearly all React state,
                          all Supabase calls, all Realtime subscriptions, and
                          renders every screen/modal. Screens and modals are
                          otherwise "dumb" — they receive data + handlers as props.
  types.ts                All TypeScript interfaces, one per DB table/RPC shape,
                          plus a couple of derived/computed types (AnalyticsData).
  dateUtils.ts            Nepal-timezone day-boundary helpers.
  supabaseClient.ts        Supabase client init.

  components/             Small reusable pieces (Navbar, CountdownTimer,
                           BackgroundDecoration, ActiveMissionBanner).
  components/modals/       All modals (login, deposit, withdraw, mission form,
                            tournament registration, team roster, match chat,
                            submit result, etc.) — presentational, driven by props.

  screens/                 Top-level tab screens (Missions, Leaderboard, Wallet,
                            Membership, Profile, Notifications, Tournaments,
                            Terms, Privacy).
  screens/admin/            AdminScreen.tsx is the shell + sub-nav; each admin
                             section (Missions, Submissions, Payouts, Deposits,
                             Membership, Players, Game IDs, Broadcast, Support,
                             Feedback, Tournaments, Analytics) is its own component.
```

Pattern for extending the admin panel: add a new `AdminXxx.tsx` under
`screens/admin/`, thread its data/handlers down from `App.tsx` → `AdminScreen.tsx` →
your component, and add a sub-nav button + section entry in `AdminScreen.tsx`.

## Features

### Player-facing

- **Auth**: Google OAuth only (via Supabase Auth), plus a Nepal-phone-number
  verification step (real SMS OTP via Supabase Phone Auth — provider not yet
  configured in the dashboard, see "Known gaps").
- **Missions**: browse active missions by game, start an attempt (enforces a daily
  free-mission limit by membership tier, a 2-attempts-per-mission-per-day cap, and
  optional paid entry beyond the free limit — all enforced server-side in
  `start_mission_attempt`), submit a screenshot as proof, track a countdown timer,
  see approve/reject status. Approval instantly credits the wallet via a trigger.
- **Wallet**: balance, deposit requests (manual send + admin verification, with
  screenshot proof upload), withdrawal/payout requests (eSewa or PayPal).
- **Membership**: Free / Bronze / Gold tiers (raises the daily mission limit),
  upgradeable either by admin-verified manual payment or instantly from wallet
  balance.
- **Leaderboard**: all-time / weekly / monthly XP rankings.
- **Profile**: linked in-game IDs per game (admin-verified — no official
  MLBB/PUBG/etc. API exists to verify live), notifications inbox, support ticket
  form, rate-us/feedback, Terms & Privacy pages, account deactivation
  (self-service; not permanent deletion — see "Known gaps").
- **Tournaments** (the largest feature area — full operational system, not just a
  listing page):
  1. Browse live tournaments (MLBB team-based, PUBG solo), see prize pool and
     registration progress live.
  2. Register — gated on having a verified in-game ID for that game.
  3. Team captains build their roster by searching and adding other verified
     players (not free-text) — a player can't join two teams (enforced by a DB
     `UNIQUE` constraint, not app logic).
  4. Admin closes registration and clicks **Generate Bracket** (MLBB, random
     single-elimination, auto-byes, best-of-3 final) or **Generate Lobbies**
     (PUBG, random groups of ~25).
  5. Players see their match/lobby, a live countdown to the scheduled time, and a
     **Check In** button that appears exactly 30 minutes before kickoff (captain
     only).
  6. Once checked in, a **match chat** opens between the two team captains (or all
     lobby leaders for PUBG) to exchange a custom room code — plain text, live via
     Realtime.
  7. After the match, the captain **submits a result** (bracket: picks the winner,
     optional screenshot; lobby: just flags "played") — admin **confirms** it
     (bracket: this auto-advances the bracket to the next round once the whole
     round is decided, all the way to the final; lobby: admin enters
     placement/points per player).

### Admin-facing (`/admin`, `role IN ('admin', 'moderator')`)

Missions manager, submission review queue, payout processing, deposit
verification, membership request verification, player management (ban/unban,
deactivate/reactivate, KYC), in-game ID verification, broadcast notifications,
support ticket queue, feedback view, full tournament management (create/edit
tournaments, upload banner images, manage registrations/rosters, generate
brackets/lobbies, schedule matches, confirm results), and **Analytics** (revenue
breakdown chart, membership tier distribution pie chart, per-mission earnings
breakdown chart — see `AdminAnalytics.tsx`).

## Database overview

`schema.sql` sections, in order:
1. Profiles (linked to `auth.users`, role/KYC/membership tier/XP live here)
2. Wallets
3. Missions
4. Mission attempts (start/submit/approve/reject + instant-payout trigger)
5. Payout requests (atomic, race-safe processing)
6. Seed data (default missions)
7. Realtime publication setup (wallets, mission_attempts)
8. In-game ID links
9. Notifications (admin broadcast + auto status-change alerts)
10. Support tickets
11. Feedback / ratings
12. Account deactivation
13. Leaderboard aggregation RPC (all/week/month)
14. Tournaments + registrations
15. Tournament banner image storage
16. **Tournament ops Phase A** — team members table, verified-player search,
    add/remove team member RPCs
17. **Tournament ops Phase B** — matches + participants tables, bracket/lobby
    generation RPCs
18. **Tournament ops Phase C** — match scheduling, check-in RPC
19. **Tournament ops Phase D** — match chat table + RLS (captains only)
20. **Tournament ops Phase E** — result submission, admin confirmation, automatic
    bracket-round advancement

Also scattered inline (not numbered, added earlier in the project): mission
difficulty/entry fees, platform settings, deposit requests, membership requests.

## Testing

`npm run test` (or `npm run verify` for the full gate). 73 tests across 12 files —
`dateUtils` unit tests plus component tests for representative screens/modals
(Vitest + React Testing Library, jsdom environment). Coverage is intentionally
representative, not exhaustive — most screens/modals don't have dedicated test
files.

## Known gaps / not production-ready

- **`is_admin()` undefined in schema.sql** — see "Getting started" above.
- **Payments are manual**: deposits/membership upgrades are "user sends money
  externally, uploads a screenshot, admin verifies" — no real eSewa/PayPal API
  integration yet. Planned approach (see `notes.txt`): client kicks off checkout →
  provider confirms → a Supabase Edge Function verifies server-side → calls a
  `SECURITY DEFINER` RPC to credit the wallet, same pattern as everything else.
- **Phone OTP**: code path is real (Supabase Phone Auth), but no SMS provider
  (Twilio/MessageBird/Vonage) is configured in the Supabase dashboard yet, so
  `updateUser({phone})` will fail until that's set up. Verify Nepal (+977)
  deliverability specifically before picking a provider.
- **Delete account is deactivation, not deletion** — permanent `auth.users` row
  deletion needs the Supabase service-role key, which must run server-side (an
  Edge Function, not yet built).
- **Legal pages are placeholder text** — Terms & Privacy need real legal review
  before going live.
- **Footer social links** (Instagram/TikTok/YouTube) are still `href="#"`
  placeholders — real URLs were never provided.
- **No "disband team" action** — a captain can remove individual non-captain
  roster members but can't cancel their own team's registration entirely.
- **PUBG lobby scoring is fully manual** — admin enters placement/points per
  player after watching the match; there's no automated screenshot/API-based
  scoring engine (deliberately out of scope, flagged as a simplification when
  built).
- **Analytics totals** use dedicated unlimited queries (correct at any scale), but
  most other admin "recent activity" list views cap at the 100 most recent rows —
  fine for operational use, not a source of truth for historical totals.
- Not yet deployed; not a git repository as of this writing.
