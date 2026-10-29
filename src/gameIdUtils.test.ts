import { describe, expect, it } from 'vitest';
import { missionGameIdBlocker } from './gameIdUtils';
import type { GameIdLink } from './types';

const link = (game_type: string, status: GameIdLink['status']): GameIdLink => ({
  id: `${game_type}-${status}`,
  user_id: 'u1',
  game_type,
  in_game_id: '12345',
  status,
  admin_notes: null,
  submitted_at: '2026-07-10T00:00:00.000Z',
  screenshot_url: null,
  verification_method: null,
  ai_extracted_id: null,
  ai_extracted_nickname: null,
});

describe('missionGameIdBlocker', () => {
  it('blocks every mission when no game ID is linked', () => {
    expect(missionGameIdBlocker('Mobile Legends', [])).toMatch(/Mobile Legends/);
    expect(missionGameIdBlocker('Some Custom Game', [])).toMatch(/at least one game ID/);
  });

  it('allows a listed game once that game has a verified ID', () => {
    expect(missionGameIdBlocker('Mobile Legends', [link('Mobile Legends', 'verified')])).toBeNull();
  });

  it('blocks a listed game when only a different game is verified', () => {
    expect(missionGameIdBlocker('Mobile Legends', [link('PUBG Mobile', 'verified')])).toMatch(/Mobile Legends/);
  });

  it('does not count pending or rejected IDs', () => {
    expect(missionGameIdBlocker('Mobile Legends', [link('Mobile Legends', 'pending')])).not.toBeNull();
    expect(missionGameIdBlocker('Mobile Legends', [link('Mobile Legends', 'rejected')])).not.toBeNull();
  });

  it('allows a custom game when any game has a verified ID', () => {
    expect(missionGameIdBlocker('Some Custom Game', [link('PUBG Mobile', 'verified')])).toBeNull();
    expect(missionGameIdBlocker('Some Custom Game', [link('PUBG Mobile', 'pending')])).not.toBeNull();
  });
});
