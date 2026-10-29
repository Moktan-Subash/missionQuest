import type { MembershipRequest, Profile } from '../types';

interface MembershipScreenProps {
  user: any;
  profile: Profile | null;
  handleUpgradeTier: (tier: 'free' | 'bronze' | 'gold') => void;
  membershipRequests: MembershipRequest[];
}

function MembershipScreen({ user, profile, handleUpgradeTier, membershipRequests }: MembershipScreenProps) {
  return (
    <div className="screen page">
      <div className="page-head">
        <div>
          <h2 className="page-title font-display">Membership Plan</h2>
          <p className="page-subtitle">
            {user ? (
              <>
                Your current tier is:{' '}
                <strong className="tier-name">
                  {profile?.membership_tier}
                </strong>{' '}
                (Daily limit: {profile?.daily_mission_limit} quests per day).
              </>
            ) : (
              <>Sign in to upgrade your quest tier and complete more missions daily.</>
            )}
          </p>
        </div>
      </div>

      {user && profile && (
        <div className="lb-stats sub-stats">
          <div className="lb-stat">
            <div className="lb-stat-val font-display">{profile.membership_tier}</div>
            <div className="lb-stat-lbl">Current Tier</div>
          </div>
          <div className="lb-stat">
            <div className="lb-stat-val font-display">{profile.daily_mission_limit}</div>
            <div className="lb-stat-lbl">Quests / Day</div>
          </div>
          <div className="lb-stat">
            <div className="lb-stat-val font-display">⭐ {profile.xp}</div>
            <div className="lb-stat-lbl">XP Score</div>
          </div>
        </div>
      )}

      <div className="subs-grid">
        {/* Plan: Free */}
        <div className={`card sub-card ${user && profile?.membership_tier === 'free' ? 'active-tier' : ''}`}>
          <div className="sub-card-icon">🎮</div>
          <div className="sub-title">Challenger</div>
          <div className="sub-price">Rs. 0</div>
          <ul className="sub-features">
            <li>3 Quests / day</li>
            <li>Basic Support</li>
            <li>3 Days Verification Window</li>
          </ul>
          <button
            onClick={() => handleUpgradeTier('free')}
            disabled={user && profile?.membership_tier === 'free'}
            className="btn btn-secondary"
          >
            {user && profile?.membership_tier === 'free' ? 'Current Tier' : 'Select'}
          </button>
        </div>

        {/* Plan: Bronze */}
        <div className={`card sub-card sub-card-bronze ${user && profile?.membership_tier === 'bronze' ? 'active-tier' : ''}`}>
          <div className="sub-card-icon">⚡</div>
          <div className="sub-title">Bronze Pro</div>
          <div className="sub-price">Rs. 499<span className="sub-price-unit">/mo</span></div>
          <ul className="sub-features">
            <li>5 Quests / day</li>
            <li>Priority Review Queue</li>
            <li>Bronze Only Quests Access</li>
          </ul>
          <button
            onClick={() => handleUpgradeTier('bronze')}
            disabled={user && profile?.membership_tier === 'bronze'}
            className="btn btn-primary"
          >
            {user && profile?.membership_tier === 'bronze' ? 'Current Tier' : 'Upgrade'}
          </button>
        </div>

        {/* Plan: Gold */}
        <div className={`card sub-card sub-card-gold ${user && profile?.membership_tier === 'gold' ? 'active-tier' : ''}`}>
          <span className="sub-card-ribbon">Best Value</span>
          <div className="sub-card-icon">👑</div>
          <div className="sub-title">Gold Master</div>
          <div className="sub-price">Rs. 999<span className="sub-price-unit">/mo</span></div>
          <ul className="sub-features">
            <li>9 Quests / day</li>
            <li>Instant Review Priority</li>
            <li>Double Rewards Access</li>
          </ul>
          <button
            onClick={() => handleUpgradeTier('gold')}
            disabled={user && profile?.membership_tier === 'gold'}
            className="btn btn-gold"
          >
            {user && profile?.membership_tier === 'gold' ? 'Current Tier' : 'Upgrade'}
          </button>
        </div>
      </div>

      {user && membershipRequests.length > 0 && (
        <div className="wl-panel page-section">
          <h3 className="wl-panel-title font-display">Your Upgrade Requests</h3>
          <div className="req-list">
            {membershipRequests.map((req) => {
              const reqStatusStyle: Record<string, { label: string; icon: string; color: string; bg: string }> = {
                pending: { label: 'Pending', icon: '⏳', color: 'var(--warning)', bg: 'rgba(255, 176, 32, 0.1)' },
                approved: { label: 'Completed', icon: '✅', color: 'var(--success)', bg: 'rgba(198, 255, 0, 0.1)' },
                rejected: { label: 'Cancelled', icon: '❌', color: 'var(--danger)', bg: 'rgba(255, 77, 77, 0.1)' }
              };
              const s = reqStatusStyle[req.status];
              return (
                <div key={req.id} className="req-item">
                  <div>
                    <strong>{req.tier}</strong>
                    <span className="req-item-meta"> · Rs. {req.amount.toFixed(0)} · {req.payment_method.toUpperCase()}</span>
                    {req.admin_notes && (
                      <div className="req-item-note">Note: {req.admin_notes}</div>
                    )}
                  </div>
                  <span className={`req-status req-status-${req.status}`}>
                    {s.icon} {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MembershipScreen;
