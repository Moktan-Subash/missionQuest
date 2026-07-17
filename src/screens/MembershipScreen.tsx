import type { MembershipRequest, Profile } from '../types';

interface MembershipScreenProps {
  user: any;
  profile: Profile | null;
  handleUpgradeTier: (tier: 'free' | 'bronze' | 'gold') => void;
  membershipRequests: MembershipRequest[];
}

function MembershipScreen({ user, profile, handleUpgradeTier, membershipRequests }: MembershipScreenProps) {
  return (
    <div className="screen">
      <h2 style={{ fontSize: '1.5rem', textAlign: 'left', marginBottom: '0.5rem' }}>Membership Plan</h2>
      <p style={{ textAlign: 'left', marginBottom: '2rem', color: 'var(--text-muted)' }}>
        {user ? (
          <>
            Your current tier is:{' '}
            <strong style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>
              {profile?.membership_tier}
            </strong>{' '}
            (Daily limit: {profile?.daily_mission_limit} quests per day).
          </>
        ) : (
          <>Sign in to upgrade your quest tier and complete more missions daily.</>
        )}
      </p>

      {user && profile && (
        <div className="stat-tiles-bar">
          <div className="stat-tile">
            <div className="stat-tile-val" style={{ textTransform: 'uppercase' }}>{profile.membership_tier}</div>
            <div className="stat-tile-lbl">Current Tier</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-val">{profile.daily_mission_limit}</div>
            <div className="stat-tile-lbl">Quests / Day</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-val">⭐ {profile.xp}</div>
            <div className="stat-tile-lbl">XP Score</div>
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
            style={{ marginTop: 'auto' }}
          >
            {user && profile?.membership_tier === 'free' ? 'Current Tier' : 'Select'}
          </button>
        </div>

        {/* Plan: Bronze */}
        <div className={`card sub-card sub-card-bronze ${user && profile?.membership_tier === 'bronze' ? 'active-tier' : ''}`}>
          <div className="sub-card-icon">⚡</div>
          <div className="sub-title">Bronze Pro</div>
          <div className="sub-price">Rs. 499<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/mo</span></div>
          <ul className="sub-features">
            <li>5 Quests / day</li>
            <li>Priority Review Queue</li>
            <li>Bronze Only Quests Access</li>
          </ul>
          <button
            onClick={() => handleUpgradeTier('bronze')}
            disabled={user && profile?.membership_tier === 'bronze'}
            className="btn btn-primary"
            style={{ marginTop: 'auto' }}
          >
            {user && profile?.membership_tier === 'bronze' ? 'Current Tier' : 'Upgrade'}
          </button>
        </div>

        {/* Plan: Gold */}
        <div className={`card sub-card sub-card-gold ${user && profile?.membership_tier === 'gold' ? 'active-tier' : ''}`}>
          <span className="sub-card-ribbon">Best Value</span>
          <div className="sub-card-icon">👑</div>
          <div className="sub-title">Gold Master</div>
          <div className="sub-price">Rs. 999<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/mo</span></div>
          <ul className="sub-features">
            <li>9 Quests / day</li>
            <li>Instant Review Priority</li>
            <li>Double Rewards Access</li>
          </ul>
          <button
            onClick={() => handleUpgradeTier('gold')}
            disabled={user && profile?.membership_tier === 'gold'}
            className="btn btn-gold"
            style={{ marginTop: 'auto' }}
          >
            {user && profile?.membership_tier === 'gold' ? 'Current Tier' : 'Upgrade'}
          </button>
        </div>
      </div>

      {user && membershipRequests.length > 0 && (
        <div className="card" style={{ textAlign: 'left', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', color: 'var(--primary)' }}>Your Upgrade Requests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {membershipRequests.map((req) => {
              const reqStatusStyle: Record<string, { label: string; icon: string; color: string; bg: string }> = {
                pending: { label: 'Pending', icon: '⏳', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
                approved: { label: 'Completed', icon: '✅', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
                rejected: { label: 'Cancelled', icon: '❌', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)' }
              };
              const s = reqStatusStyle[req.status];
              return (
                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.9rem' }}>
                    <strong style={{ color: '#fff', textTransform: 'uppercase' }}>{req.tier}</strong>
                    <span style={{ color: 'var(--text-muted)' }}> · Rs. {req.amount.toFixed(0)} · {req.payment_method.toUpperCase()}</span>
                    {req.admin_notes && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Note: {req.admin_notes}</div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', color: s.color, background: s.bg, whiteSpace: 'nowrap' }}>
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
