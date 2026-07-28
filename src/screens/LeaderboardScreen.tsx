interface LeaderboardScreenProps {
  leaderboard: any[];
  user: any;
  leaderboardPeriod: 'all' | 'week' | 'month';
  setLeaderboardPeriod: (period: 'all' | 'week' | 'month') => void;
  openPlayerProfile: (playerId: string) => void;
}

const PERIOD_LABEL: Record<'all' | 'week' | 'month', string> = {
  all: 'all-time',
  week: 'this week',
  month: 'this month',
};

function PodiumCard({ player, rank, user, openPlayerProfile }: { player: any; rank: 1 | 2 | 3; user: any; openPlayerProfile: (playerId: string) => void }) {
  return (
    <div className={`podium-card podium-rank-${rank}`} style={{ cursor: 'pointer' }} onClick={() => openPlayerProfile(player.id)}>
      {rank === 1 && <span className="podium-crown">👑</span>}
      <div className="podium-avatar-ring">
        <img src={player.avatar_url || 'https://www.gravatar.com/avatar?d=mp'} className="podium-avatar" alt="" />
      </div>
      <div className="podium-rank-num">{rank}</div>
      <div className="podium-name">
        {player.display_name}
        {user && player.id === user.id && <span className="badge badge-pubg" style={{ fontSize: '0.55rem', marginLeft: '6px', verticalAlign: 'middle' }}>You</span>}
      </div>
      <div className="podium-xp">{player.xp} XP</div>
      <div className="podium-quests">{player.missions_completed} quests</div>
    </div>
  );
}

function LeaderboardScreen({ leaderboard, user, leaderboardPeriod, setLeaderboardPeriod, openPlayerProfile }: LeaderboardScreenProps) {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const totalXp = leaderboard.reduce((sum, p) => sum + p.xp, 0);
  const totalQuests = leaderboard.reduce((sum, p) => sum + p.missions_completed, 0);

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', textAlign: 'left', margin: 0 }}>Leaderboard (Top Players)</h2>
        <div className="game-filters">
          <button onClick={() => setLeaderboardPeriod('all')} className={`filter-btn ${leaderboardPeriod === 'all' ? 'active' : ''}`}>All-Time</button>
          <button onClick={() => setLeaderboardPeriod('month')} className={`filter-btn ${leaderboardPeriod === 'month' ? 'active' : ''}`}>Monthly</button>
          <button onClick={() => setLeaderboardPeriod('week')} className={`filter-btn ${leaderboardPeriod === 'week' ? 'active' : ''}`}>Weekly</button>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No completed quests {PERIOD_LABEL[leaderboardPeriod]} yet.
        </div>
      ) : (
        <>
          <div className="stat-tiles-bar">
            <div className="stat-tile">
              <div className="stat-tile-val">{leaderboard.length}</div>
              <div className="stat-tile-lbl">Ranked Players</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-val">{totalXp.toLocaleString()}</div>
              <div className="stat-tile-lbl">Total XP {PERIOD_LABEL[leaderboardPeriod]}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-val">{totalQuests}</div>
              <div className="stat-tile-lbl">Quests Completed</div>
            </div>
          </div>

          <div className="podium">
            {top3[1] && <PodiumCard player={top3[1]} rank={2} user={user} openPlayerProfile={openPlayerProfile} />}
            {top3[0] && <PodiumCard player={top3[0]} rank={1} user={user} openPlayerProfile={openPlayerProfile} />}
            {top3[2] && <PodiumCard player={top3[2]} rank={3} user={user} openPlayerProfile={openPlayerProfile} />}
          </div>

          {rest.length > 0 && (
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '1.5rem' }}>Rank</th>
                    <th>Gamer</th>
                    <th>Quests Done</th>
                    <th style={{ paddingRight: '1.5rem' }}>XP Score</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((player, index) => (
                    <tr key={player.id} className="leaderboard-row" style={{ cursor: 'pointer' }} onClick={() => openPlayerProfile(player.id)}>
                      <td style={{ paddingLeft: '1.5rem' }}>
                        <span className="rank-badge">{index + 4}</span>
                      </td>
                      <td>
                        <div className="player-cell">
                          <img
                            src={player.avatar_url || 'https://www.gravatar.com/avatar?d=mp'}
                            className="player-avatar"
                            alt=""
                          />
                          <span style={{ fontWeight: 600, color: '#fff' }}>{player.display_name}</span>
                          {user && player.id === user.id && <span className="badge badge-pubg" style={{ fontSize: '0.6rem' }}>You</span>}
                        </div>
                      </td>
                      <td>{player.missions_completed}</td>
                      <td style={{ paddingRight: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>
                        {player.xp} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LeaderboardScreen;
