import { GAME_OPTIONS, type GameIdLink } from './types';

// Mirrors the game-ID check in public.start_mission_attempt() in schema.sql --
// keep in sync. A listed game needs a verified ID for that exact game; a
// custom "Other" game (no way to link an ID for it) needs at least one
// verified ID of any game. Returns null when the player may play, otherwise
// the message to show them.
export function missionGameIdBlocker(missionGame: string, gameIdLinks: GameIdLink[]): string | null {
  const verified = gameIdLinks.filter((g) => g.status === 'verified');

  if (GAME_OPTIONS.includes(missionGame)) {
    return verified.some((g) => g.game_type === missionGame)
      ? null
      : `Link and verify your ${missionGame} game ID in your Profile before playing this mission.`;
  }

  return verified.length > 0
    ? null
    : 'Link and verify at least one game ID in your Profile before playing missions.';
}
