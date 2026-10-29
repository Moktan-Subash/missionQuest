import type { ReactNode } from 'react';
import type { Tab } from '../types';

// Shared by the desktop header pills and the mobile bottom tab bar.
export const NAV_ITEMS: { tab: Tab; label: string; icon: IconName }[] = [
  { tab: 'missions', label: 'Missions', icon: 'target' },
  { tab: 'tournaments', label: 'Tournaments', icon: 'trophy' },
  { tab: 'challenges', label: 'Challenges', icon: 'swords' },
  { tab: 'leaderboard', label: 'Leaderboard', icon: 'chart' },
  { tab: 'wallet', label: 'Wallet', icon: 'wallet' },
];

type IconName = 'target' | 'trophy' | 'swords' | 'chart' | 'wallet' | 'bell' | 'user' | 'logout';

const ICON_PATHS: Record<IconName, ReactNode> = {
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></>,
  swords: <><path d="M14.5 17.5 3 6V3h3l11.5 11.5" /><path d="m13 19 6-6M16 16l4 4M19 21l2-2" /><path d="M9.5 6.5 14 2h3v3l-4.5 4.5" /><path d="m5 14 6 6M3 21l2-2" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M16 15h2M6 6l9-3 1 3" /></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></>,
};

export function NavIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  );
}
