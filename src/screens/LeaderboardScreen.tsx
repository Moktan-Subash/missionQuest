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
    <div className={`lb-podium-card lb-rank-${rank}`} onClick={() => openPlayerProfile(player.id)}>
      <span className="lb-podium-num font-display" aria-hidden="true">{rank}</span>
      {rank === 1 && <span className="lb-podium-crown">👑</span>}
      <div className="lb-podium-avatar">
        <img src={player.avatar_url || 'https://www.gravatar.com/avatar?d=mp'} alt="" />
      </div>
      <div className="lb-podium-name">
        <span>{player.display_name}</span>
        {user && player.id === user.id && <span className="lb-you">You</span>}
      </div>
      <div className="lb-podium-xp font-display">{player.xp} XP</div>
      <div className="lb-podium-quests">{player.missions_completed} quests</div>
    </div>
  );
}

function LeaderboardScreen({ leaderboard, user, leaderboardPeriod, setLeaderboardPeriod, openPlayerProfile }: LeaderboardScreenProps) {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const totalXp = leaderboard.reduce((sum, p) => sum + p.xp, 0);
  const totalQuests = leaderboard.reduce((sum, p) => sum + p.missions_completed, 0);

  return (
    <div className="screen page">
      <div className="page-head">
        <div>
          <h2 className="page-title font-display">Leaderboard</h2>
          <p className="page-subtitle">Top players {PERIOD_LABEL[leaderboardPeriod]}</p>
        </div>
        <div className="chip-row">
          <button onClick={() => setLeaderboardPeriod('all')} className={`chip ${leaderboardPeriod === 'all' ? 'active' : ''}`}>All-Time</button>
          <button onClick={() => setLeaderboardPeriod('month')} className={`chip ${leaderboardPeriod === 'month' ? 'active' : ''}`}>Monthly</button>
          <button onClick={() => setLeaderboardPeriod('week')} className={`chip ${leaderboardPeriod === 'week' ? 'active' : ''}`}>Weekly</button>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="page-empty">
          No completed quests {PERIOD_LABEL[leaderboardPeriod]} yet.
        </div>
      ) : (
        <>
          <div className="lb-stats">
            <div className="lb-stat">
              <div className="lb-stat-val font-display">{leaderboard.length}</div>
              <div className="lb-stat-lbl">Ranked Players</div>
            </div>
            <div className="lb-stat">
              <div className="lb-stat-val font-display">{totalXp.toLocaleString()}</div>
              <div className="lb-stat-lbl">Total XP {PERIOD_LABEL[leaderboardPeriod]}</div>
            </div>
            <div className="lb-stat">
              <div className="lb-stat-val font-display">{totalQuests}</div>
              <div className="lb-stat-lbl">Quests Completed</div>
            </div>
          </div>

          <div className="lb-podium">
            {top3[1] && <PodiumCard player={top3[1]} rank={2} user={user} openPlayerProfile={openPlayerProfile} />}
            {top3[0] && <PodiumCard player={top3[0]} rank={1} user={user} openPlayerProfile={openPlayerProfile} />}
            {top3[2] && <PodiumCard player={top3[2]} rank={3} user={user} openPlayerProfile={openPlayerProfile} />}
          </div>

          {rest.length > 0 && (
            <div className="lb-list">
              <div className="lb-list-head" aria-hidden="true">
                <span>Rank</span>
                <span>Gamer</span>
                <span>Quests Done</span>
                <span>XP Score</span>
              </div>
              {rest.map((player, index) => {
                const isMe = !!user && player.id === user.id;
                return (
                  <div
                    key={player.id}
                    className={`lb-row ${isMe ? 'is-me' : ''}`}
                    style={{ '--i': index } as React.CSSProperties}
                    onClick={() => openPlayerProfile(player.id)}
                  >
                    <span className="lb-row-rank font-display">{index + 4}</span>
                    <div className="lb-row-player">
                      <img src={player.avatar_url || 'https://www.gravatar.com/avatar?d=mp'} alt="" />
                      <div className="lb-row-player-text">
                        <div className="lb-row-name">
                          <span>{player.display_name}</span>
                          {isMe && <span className="lb-you">You</span>}
                        </div>
                        <span className="lb-row-quests-mobile">{player.missions_completed} quests</span>
                      </div>
                    </div>
                    <span className="lb-row-quests">{player.missions_completed}</span>
                    <span className="lb-row-xp font-display">{player.xp} XP</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LeaderboardScreen;
