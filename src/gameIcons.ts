import mlbbIcon from './assets/games/mlbb.webp';
import pubgIcon from './assets/games/pubg.webp';
import cocIcon from './assets/games/coc.webp';

// Keyed by the exact GAME_OPTIONS strings in types.ts. Not every key here is
// necessarily a selectable game yet (e.g. Clash of Clans isn't in
// GAME_OPTIONS) -- this just means the icon is ready to go the moment it is.
export const GAME_ICONS: Record<string, string> = {
  'Mobile Legends': mlbbIcon,
  'PUBG Mobile': pubgIcon,
  'Clash of Clans': cocIcon,
};
