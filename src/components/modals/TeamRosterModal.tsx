import type { TournamentRegistration, TournamentTeamMember, VerifiedPlayer } from '../../types';

interface TeamRosterModalProps {
  rosterManagingRegistration: TournamentRegistration;
  teamSize: number;
  myTeamMembers: TournamentTeamMember[];
  setShowTeamRosterModal: (show: boolean) => void;
  playerSearchQuery: string;
  handleSearchPlayers: (query: string) => void;
  playerSearchResults: VerifiedPlayer[];
  searchingPlayers: boolean;
  handleAddTeamMember: (playerId: string) => void;
  handleRemoveTeamMember: (teamMemberId: string) => void;
  savingRosterChange: boolean;
  rosterError: string;
}

function TeamRosterModal({
  rosterManagingRegistration,
  teamSize,
  myTeamMembers,
  setShowTeamRosterModal,
  playerSearchQuery,
  handleSearchPlayers,
  playerSearchResults,
  searchingPlayers,
  handleAddTeamMember,
  handleRemoveTeamMember,
  savingRosterChange,
  rosterError,
}: TeamRosterModalProps) {
  const roster = myTeamMembers.filter((m) => m.registration_id === rosterManagingRegistration.id);
  const isFull = roster.length >= teamSize;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3>Team Roster: {rosterManagingRegistration.team_name}</h3>
          <button className="modal-close" onClick={() => setShowTeamRosterModal(false)}>×</button>
        </div>

        {rosterError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {rosterError}
          </div>
        )}

        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
          {roster.length} / {teamSize} players
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {roster.map((member) => (
            <div key={member.id} className="profile-row">
              <span className="profile-row-label">
                {member.profile?.display_name}
                {member.is_captain && <span style={{ color: 'var(--warning)', fontSize: '0.7rem', marginLeft: '6px' }}>CAPTAIN</span>}
              </span>
              {!member.is_captain && (
                <button
                  onClick={() => handleRemoveTeamMember(member.id)}
                  className="btn btn-secondary"
                  disabled={savingRosterChange}
                  style={{ padding: '2px 10px', fontSize: '0.7rem', color: 'var(--danger)' }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {!isFull && (
          <>
            <div className="form-group">
              <label className="form-label">Search verified players</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name..."
                value={playerSearchQuery}
                onChange={(e) => handleSearchPlayers(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto', marginBottom: '1rem' }}>
              {searchingPlayers && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Searching...</p>}
              {!searchingPlayers && playerSearchResults.length === 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No eligible players found. They need a verified game ID for this game and not already be on a team.
                </p>
              )}
              {playerSearchResults.map((player) => (
                <div key={player.id} className="profile-row">
                  <span className="profile-row-label">
                    {player.display_name} <span style={{ color: 'var(--text-dim)', fontFamily: 'monospace', fontSize: '0.75rem' }}>({player.in_game_id})</span>
                  </span>
                  <button
                    onClick={() => handleAddTeamMember(player.id)}
                    className="btn btn-primary"
                    disabled={savingRosterChange}
                    style={{ padding: '2px 12px', fontSize: '0.75rem' }}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowTeamRosterModal(false)}>
          Done
        </button>
      </div>
    </div>
  );
}

export default TeamRosterModal;
