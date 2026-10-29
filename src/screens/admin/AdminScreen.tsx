import type {
  AdminSection,
  DepositRequest,
  Feedback,
  GameIdLink,
  MembershipRequest,
  Mission,
  MissionAttempt,
  PayoutRequest,
  Profile,
  SupportTicket,
  Tournament,
  TournamentRegistration,
  TournamentTeamMember,
  TournamentMatch,
  AnalyticsData,
  Challenge,
} from '../../types';
import AdminMissionsManager from './AdminMissionsManager';
import AdminSubmissions from './AdminSubmissions';
import AdminPayouts from './AdminPayouts';
import AdminDeposits from './AdminDeposits';
import AdminMembershipRequests from './AdminMembershipRequests';
import AdminPlayers from './AdminPlayers';
import AdminGameIds from './AdminGameIds';
import AdminBroadcast from './AdminBroadcast';
import AdminSupportTickets from './AdminSupportTickets';
import AdminFeedback from './AdminFeedback';
import AdminTournaments from './AdminTournaments';
import AdminChallenges from './AdminChallenges';
import AdminAnalytics from './AdminAnalytics';

type AttemptFilter = 'all' | 'active' | 'pending_review' | 'approved' | 'rejected' | 'expired' | 'cancelled';

interface AdminScreenProps {
  adminSection: AdminSection;
  setAdminSection: (section: AdminSection) => void;
  fetchAdminPanelData: () => void;
  user: any;

  // Missions Manager
  adminMissions: Mission[];
  openAddMissionModal: () => void;
  openEditMissionModal: (mission: Mission) => void;
  handleToggleMissionActive: (mission: Mission) => void;

  // Submissions
  allActiveAttempts: MissionAttempt[];
  allPendingSubmissions: MissionAttempt[];
  allAttempts: MissionAttempt[];
  attemptFilter: AttemptFilter;
  setAttemptFilter: (filter: AttemptFilter) => void;
  adminRejectionReason: { [key: string]: string };
  setAdminRejectionReason: (reasons: { [key: string]: string }) => void;
  handleAdminApproveSubmission: (attemptId: string) => void;
  handleAdminRejectSubmission: (attemptId: string) => void;
  formatCountdown: (expiresAt: string) => string;

  // Payouts
  allPendingPayouts: PayoutRequest[];
  allPayouts: PayoutRequest[];
  adminTxId: { [key: string]: string };
  setAdminTxId: (ids: { [key: string]: string }) => void;
  handleAdminProcessPayout: (payoutId: string) => void;
  handleAdminRejectPayout: (payoutId: string) => void;

  // Deposits
  allPendingDeposits: DepositRequest[];
  allDeposits: DepositRequest[];
  handleAdminApproveDeposit: (depositId: string) => void;
  handleAdminRejectDeposit: (depositId: string) => void;

  // Membership
  allPendingMembershipRequests: MembershipRequest[];
  allMembershipRequests: MembershipRequest[];
  handleAdminApproveMembership: (requestId: string) => void;
  handleAdminRejectMembership: (requestId: string) => void;

  // Players
  adminPlayers: Profile[];
  playerSearch: string;
  setPlayerSearch: (search: string) => void;
  openPlayerDetail: (player: Profile) => void;
  handleTogglePlayerBan: (player: Profile) => void;
  handleToggleAccountDeactivation: (player: Profile) => void;

  // Game IDs
  allPendingGameIdLinks: GameIdLink[];
  allGameIdLinks: GameIdLink[];
  handleAdminVerifyGameId: (linkId: string) => void;
  handleAdminRejectGameId: (linkId: string) => void;
  handleViewGameIdScreenshot: (path: string) => void;
  handleRetryGameIdVerification: (linkId: string) => void;
  retryingGameIdVerification: string | null;

  // Broadcast
  broadcastForm: { title: string; body: string };
  setBroadcastForm: (form: { title: string; body: string }) => void;
  sendingBroadcast: boolean;
  handleSendBroadcast: (e: React.FormEvent) => void;

  // Support
  allSupportTickets: SupportTicket[];
  handleAdminUpdateSupportTicketStatus: (ticketId: string, status: 'in_progress' | 'resolved', notes: string) => void;

  // Feedback
  allFeedback: Feedback[];

  // Tournaments
  tournaments: Tournament[];
  openCreateTournamentModal: () => void;
  openEditTournamentModal: (tournament: Tournament) => void;
  handleUpdateTournamentStatus: (tournamentId: string, status: Tournament['status']) => void;
  adminTournamentRegistrations: TournamentRegistration[];
  adminTournamentTeamMembers: TournamentTeamMember[];
  adminTournamentMatches: TournamentMatch[];
  fetchTournamentRegistrations: (tournamentId: string) => void;
  handleRemoveTournamentRegistration: (registrationId: string, tournamentId: string) => void;
  handleGenerateMatches: (tournament: Tournament) => void;
  generatingMatches: boolean;
  handleSetScheduledTime: (matchId: string, tournamentId: string, scheduledTimeLocal: string) => void;
  handleConfirmMatchResult: (matchId: string, winnerRegistrationId: string, tournamentId: string) => void;
  handleUpdateLobbyResult: (participantId: string, placement: number | null, points: number | null, tournamentId: string) => void;
  handleMarkMatchCompleted: (matchId: string, tournamentId: string) => void;

  // Challenges
  adminPendingChallenges: Challenge[];
  handleConfirmChallengeResult: (challengeId: string, winnerUserId: string) => void;

  // Analytics
  analyticsData: AnalyticsData | null;
  loadingAnalytics: boolean;
  fetchAnalyticsData: () => void;
}

function AdminScreen({
  adminSection,
  setAdminSection,
  fetchAdminPanelData,
  user,
  adminMissions,
  openAddMissionModal,
  openEditMissionModal,
  handleToggleMissionActive,
  allActiveAttempts,
  allPendingSubmissions,
  allAttempts,
  attemptFilter,
  setAttemptFilter,
  adminRejectionReason,
  setAdminRejectionReason,
  handleAdminApproveSubmission,
  handleAdminRejectSubmission,
  formatCountdown,
  allPendingPayouts,
  allPayouts,
  adminTxId,
  setAdminTxId,
  handleAdminProcessPayout,
  handleAdminRejectPayout,
  allPendingDeposits,
  allDeposits,
  handleAdminApproveDeposit,
  handleAdminRejectDeposit,
  allPendingMembershipRequests,
  allMembershipRequests,
  handleAdminApproveMembership,
  handleAdminRejectMembership,
  adminPlayers,
  playerSearch,
  setPlayerSearch,
  openPlayerDetail,
  handleTogglePlayerBan,
  handleToggleAccountDeactivation,
  allPendingGameIdLinks,
  allGameIdLinks,
  handleAdminVerifyGameId,
  handleAdminRejectGameId,
  handleViewGameIdScreenshot,
  handleRetryGameIdVerification,
  retryingGameIdVerification,
  broadcastForm,
  setBroadcastForm,
  sendingBroadcast,
  handleSendBroadcast,
  allSupportTickets,
  handleAdminUpdateSupportTicketStatus,
  allFeedback,
  tournaments,
  openCreateTournamentModal,
  openEditTournamentModal,
  handleUpdateTournamentStatus,
  adminTournamentRegistrations,
  adminTournamentTeamMembers,
  adminTournamentMatches,
  fetchTournamentRegistrations,
  handleRemoveTournamentRegistration,
  handleGenerateMatches,
  generatingMatches,
  handleSetScheduledTime,
  handleConfirmMatchResult,
  handleUpdateLobbyResult,
  handleMarkMatchCompleted,
  adminPendingChallenges,
  handleConfirmChallengeResult,
  analyticsData,
  loadingAnalytics,
  fetchAnalyticsData,
}: AdminScreenProps) {
  return (
    <div className="screen animate-fade-in container admin-console">
      <h2 className="page-title font-display admin-console-title">
        Admin Operations Console
      </h2>

      {/* Sub-navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '24px' }}>
        <div className="game-filters">
          <button onClick={() => { setAdminSection('missions'); fetchAdminPanelData(); }} className={`filter-btn ${adminSection === 'missions' ? 'active' : ''}`}>
            🎯 Missions
          </button>
          <button onClick={() => { setAdminSection('submissions'); fetchAdminPanelData(); }} className={`filter-btn ${adminSection === 'submissions' ? 'active' : ''}`}>
            ✅ Submissions{allPendingSubmissions.length > 0 ? ` (${allPendingSubmissions.length})` : ''}
          </button>
          <button onClick={() => { setAdminSection('payouts'); fetchAdminPanelData(); }} className={`filter-btn ${adminSection === 'payouts' ? 'active' : ''}`}>
            💰 Payouts{allPendingPayouts.length > 0 ? ` (${allPendingPayouts.length})` : ''}
          </button>
          <button onClick={() => { setAdminSection('deposits'); fetchAdminPanelData(); }} className={`filter-btn ${adminSection === 'deposits' ? 'active' : ''}`}>
            💵 Deposits{allPendingDeposits.length > 0 ? ` (${allPendingDeposits.length})` : ''}
          </button>
          <button onClick={() => { setAdminSection('membership'); fetchAdminPanelData(); }} className={`filter-btn ${adminSection === 'membership' ? 'active' : ''}`}>
            ⭐ Membership{allPendingMembershipRequests.length > 0 ? ` (${allPendingMembershipRequests.length})` : ''}
          </button>
          <button onClick={() => { setAdminSection('players'); fetchAdminPanelData(); }} className={`filter-btn ${adminSection === 'players' ? 'active' : ''}`}>
            👥 Players
          </button>
          <button onClick={() => { setAdminSection('gameids'); fetchAdminPanelData(); }} className={`filter-btn ${adminSection === 'gameids' ? 'active' : ''}`}>
            🎮 Game IDs{allPendingGameIdLinks.length > 0 ? ` (${allPendingGameIdLinks.length})` : ''}
          </button>
          <button onClick={() => setAdminSection('broadcast')} className={`filter-btn ${adminSection === 'broadcast' ? 'active' : ''}`}>
            📢 Broadcast
          </button>
          <button onClick={() => { setAdminSection('support'); fetchAdminPanelData(); }} className={`filter-btn ${adminSection === 'support' ? 'active' : ''}`}>
            💬 Support{allSupportTickets.filter((t) => t.status === 'open').length > 0 ? ` (${allSupportTickets.filter((t) => t.status === 'open').length})` : ''}
          </button>
          <button onClick={() => { setAdminSection('feedback'); fetchAdminPanelData(); }} className={`filter-btn ${adminSection === 'feedback' ? 'active' : ''}`}>
            ⭐ Feedback
          </button>
          <button onClick={() => setAdminSection('tournaments')} className={`filter-btn ${adminSection === 'tournaments' ? 'active' : ''}`}>
            💰 Tournaments
          </button>
          <button onClick={() => { setAdminSection('challenges'); fetchAdminPanelData(); }} className={`filter-btn ${adminSection === 'challenges' ? 'active' : ''}`}>
            ⚔️ Challenges{adminPendingChallenges.length > 0 ? ` (${adminPendingChallenges.length})` : ''}
          </button>
          <button onClick={() => { setAdminSection('analytics'); fetchAnalyticsData(); }} className={`filter-btn ${adminSection === 'analytics' ? 'active' : ''}`}>
            📊 Analytics
          </button>
        </div>
        <button onClick={() => fetchAdminPanelData()} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          🔄 Refresh
        </button>
      </div>

      {/* MISSIONS MANAGER */}
      {adminSection === 'missions' && (
        <AdminMissionsManager
          adminMissions={adminMissions}
          openAddMissionModal={openAddMissionModal}
          openEditMissionModal={openEditMissionModal}
          handleToggleMissionActive={handleToggleMissionActive}
        />
      )}

      {/* SUBMISSIONS */}
      {adminSection === 'submissions' && (
        <AdminSubmissions
          allActiveAttempts={allActiveAttempts}
          allPendingSubmissions={allPendingSubmissions}
          allAttempts={allAttempts}
          attemptFilter={attemptFilter}
          setAttemptFilter={setAttemptFilter}
          adminRejectionReason={adminRejectionReason}
          setAdminRejectionReason={setAdminRejectionReason}
          handleAdminApproveSubmission={handleAdminApproveSubmission}
          handleAdminRejectSubmission={handleAdminRejectSubmission}
          formatCountdown={formatCountdown}
        />
      )}

      {/* PAYOUTS */}
      {adminSection === 'payouts' && (
        <AdminPayouts
          allPendingPayouts={allPendingPayouts}
          allPayouts={allPayouts}
          adminTxId={adminTxId}
          setAdminTxId={setAdminTxId}
          handleAdminProcessPayout={handleAdminProcessPayout}
          handleAdminRejectPayout={handleAdminRejectPayout}
        />
      )}

      {/* DEPOSITS */}
      {adminSection === 'deposits' && (
        <AdminDeposits
          allPendingDeposits={allPendingDeposits}
          allDeposits={allDeposits}
          adminRejectionReason={adminRejectionReason}
          setAdminRejectionReason={setAdminRejectionReason}
          handleAdminApproveDeposit={handleAdminApproveDeposit}
          handleAdminRejectDeposit={handleAdminRejectDeposit}
        />
      )}

      {/* MEMBERSHIP */}
      {adminSection === 'membership' && (
        <AdminMembershipRequests
          allPendingMembershipRequests={allPendingMembershipRequests}
          allMembershipRequests={allMembershipRequests}
          adminRejectionReason={adminRejectionReason}
          setAdminRejectionReason={setAdminRejectionReason}
          handleAdminApproveMembership={handleAdminApproveMembership}
          handleAdminRejectMembership={handleAdminRejectMembership}
        />
      )}

      {/* PLAYERS */}
      {adminSection === 'players' && (
        <AdminPlayers
          adminPlayers={adminPlayers}
          playerSearch={playerSearch}
          setPlayerSearch={setPlayerSearch}
          openPlayerDetail={openPlayerDetail}
          handleTogglePlayerBan={handleTogglePlayerBan}
          handleToggleAccountDeactivation={handleToggleAccountDeactivation}
          user={user}
        />
      )}

      {/* GAME IDS */}
      {adminSection === 'gameids' && (
        <AdminGameIds
          allPendingGameIdLinks={allPendingGameIdLinks}
          allGameIdLinks={allGameIdLinks}
          adminRejectionReason={adminRejectionReason}
          setAdminRejectionReason={setAdminRejectionReason}
          handleAdminVerifyGameId={handleAdminVerifyGameId}
          handleAdminRejectGameId={handleAdminRejectGameId}
          handleViewGameIdScreenshot={handleViewGameIdScreenshot}
          handleRetryGameIdVerification={handleRetryGameIdVerification}
          retryingGameIdVerification={retryingGameIdVerification}
        />
      )}

      {/* BROADCAST */}
      {adminSection === 'broadcast' && (
        <AdminBroadcast
          broadcastForm={broadcastForm}
          setBroadcastForm={setBroadcastForm}
          sendingBroadcast={sendingBroadcast}
          handleSendBroadcast={handleSendBroadcast}
        />
      )}

      {/* SUPPORT */}
      {adminSection === 'support' && (
        <AdminSupportTickets
          allSupportTickets={allSupportTickets}
          handleAdminUpdateSupportTicketStatus={handleAdminUpdateSupportTicketStatus}
        />
      )}

      {/* FEEDBACK */}
      {adminSection === 'feedback' && (
        <AdminFeedback allFeedback={allFeedback} />
      )}

      {/* TOURNAMENTS */}
      {adminSection === 'tournaments' && (
        <AdminTournaments
          tournaments={tournaments}
          openCreateTournamentModal={openCreateTournamentModal}
          openEditTournamentModal={openEditTournamentModal}
          handleUpdateTournamentStatus={handleUpdateTournamentStatus}
          adminTournamentRegistrations={adminTournamentRegistrations}
          adminTournamentTeamMembers={adminTournamentTeamMembers}
          adminTournamentMatches={adminTournamentMatches}
          fetchTournamentRegistrations={fetchTournamentRegistrations}
          handleRemoveTournamentRegistration={handleRemoveTournamentRegistration}
          handleGenerateMatches={handleGenerateMatches}
          generatingMatches={generatingMatches}
          handleSetScheduledTime={handleSetScheduledTime}
          handleConfirmMatchResult={handleConfirmMatchResult}
          handleUpdateLobbyResult={handleUpdateLobbyResult}
          handleMarkMatchCompleted={handleMarkMatchCompleted}
        />
      )}

      {/* CHALLENGES */}
      {adminSection === 'challenges' && (
        <AdminChallenges
          adminPendingChallenges={adminPendingChallenges}
          handleConfirmChallengeResult={handleConfirmChallengeResult}
        />
      )}

      {/* ANALYTICS */}
      {adminSection === 'analytics' && (
        <AdminAnalytics
          analyticsData={analyticsData}
          loadingAnalytics={loadingAnalytics}
          fetchAnalyticsData={fetchAnalyticsData}
          adminPlayers={adminPlayers}
        />
      )}
    </div>
  );
}

export default AdminScreen;
