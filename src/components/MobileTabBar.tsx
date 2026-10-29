import type { Profile, Tab } from '../types';
import { NAV_ITEMS, NavIcon } from './navItems';

interface MobileTabBarProps {
  user: any;
  profile: Profile | null;
  activeTab: Tab | null;
  handleTabClick: (tab: Tab) => void;
}

// Floating bottom tab bar, shown below 900px in place of the header pills.
function MobileTabBar({ user, profile, activeTab, handleTabClick }: MobileTabBarProps) {
  return (
    <nav className="mobile-tabbar" aria-label="Main">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.tab}
          onClick={() => handleTabClick(item.tab)}
          className={`mobile-tab ${activeTab === item.tab ? 'active' : ''}`}
          aria-current={activeTab === item.tab ? 'page' : undefined}
        >
          <NavIcon name={item.icon} size={22} />
          <span>{item.label}{item.tab === 'challenges' && user && profile?.membership_tier === 'free' ? ' 🔒' : ''}</span>
        </button>
      ))}
    </nav>
  );
}

export default MobileTabBar;
