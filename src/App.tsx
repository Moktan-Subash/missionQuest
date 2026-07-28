import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { isSameNepalDay } from './dateUtils';
import './App.css';
import {
  GAME_OPTIONS,
  VALID_TABS,
  ADMIN_SECTIONS,
  type Tab,
  type AdminSection,
  type Profile,
  type Wallet,
  type Mission,
  type MissionAttempt,
  type PayoutRequest,
  type DepositRequest,
  type MembershipRequest,
  type GameIdLink,
  type Notification,
  type SupportTicket,
  type Feedback,
  type Tournament,
  type TournamentRegistration,
  type TournamentTeamMember,
  type VerifiedPlayer,
  type TournamentMatch,
  type TournamentMatchMessage,
  type AnalyticsData,
  type Challenge,
  type ChallengeMessage,
} from './types';
import Navbar from './components/Navbar';
import BackgroundDecoration from './components/BackgroundDecoration';
import ActiveMissionBanner from './components/ActiveMissionBanner';
import HomeScreen from './screens/HomeScreen';
import MissionsScreen from './screens/MissionsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import WalletScreen from './screens/WalletScreen';
import MembershipScreen from './screens/MembershipScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import TournamentsScreen from './screens/TournamentsScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import AdminScreen from './screens/admin/AdminScreen';
import AdminLoginScreen, { AdminAccessDenied } from './screens/admin/AdminLoginScreen';
import AdminNavbar from './components/AdminNavbar';
import LoginModal from './components/modals/LoginModal';
import WithdrawModal from './components/modals/WithdrawModal';
import AddMoneyModal from './components/modals/AddMoneyModal';
import MembershipUpgradeModal from './components/modals/MembershipUpgradeModal';
import PhoneVerificationModal from './components/modals/PhoneVerificationModal';
import MissionFormModal from './components/modals/MissionFormModal';
import PlayerDetailModal from './components/modals/PlayerDetailModal';
import SupportTicketModal from './components/modals/SupportTicketModal';
import FeedbackModal from './components/modals/FeedbackModal';
import DeleteAccountModal from './components/modals/DeleteAccountModal';
import TournamentRegistrationModal from './components/modals/TournamentRegistrationModal';
import TeamRosterModal from './components/modals/TeamRosterModal';
import MatchChatModal from './components/modals/MatchChatModal';
import SubmitResultModal from './components/modals/SubmitResultModal';
import TournamentFormModal, { type TournamentFormState } from './components/modals/TournamentFormModal';
import CreateChallengeModal from './components/modals/CreateChallengeModal';
import AcceptChallengeModal from './components/modals/AcceptChallengeModal';
import ChallengeChatModal from './components/modals/ChallengeChatModal';
import SubmitChallengeResultModal from './components/modals/SubmitChallengeResultModal';
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';

const STATIC_PAGES = ['/terms', '/privacy'];

// TODO: replace with the real account URLs before launch.
const SOCIAL_LINKS = {
  instagram: '#',
  tiktok: '#',
  youtube: '#',
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // Auth states
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Main UI states
  const pathTab = location.pathname.slice(1);
  const activeTab: Tab = VALID_TABS.includes(pathTab as Tab) ? (pathTab as Tab) : 'missions';
  const [gameFilter, setGameFilter] = useState<'ALL' | 'MLBB' | 'PUBG' | 'OTHERS'>('ALL');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'all' | 'week' | 'month'>('all');
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  
  // Data states
  const [missions, setMissions] = useState<Mission[]>([]);
  const [attempts, setAttempts] = useState<MissionAttempt[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<MissionAttempt | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [missionFees, setMissionFees] = useState<Record<string, number>>({});
  const [platformSettings, setPlatformSettings] = useState<Record<string, string>>({});
  const [publicFeedback, setPublicFeedback] = useState<Feedback[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [myTournamentRegistrations, setMyTournamentRegistrations] = useState<TournamentRegistration[]>([]);
  const [showTournamentRegModal, setShowTournamentRegModal] = useState(false);
  const [registeringTournament, setRegisteringTournament] = useState<Tournament | null>(null);
  const [tournamentRegForm, setTournamentRegForm] = useState({ team_name: '' });
  const [myTeamMembers, setMyTeamMembers] = useState<TournamentTeamMember[]>([]);
  const [showTeamRosterModal, setShowTeamRosterModal] = useState(false);
  const [rosterManagingRegistration, setRosterManagingRegistration] = useState<TournamentRegistration | null>(null);
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [playerSearchResults, setPlayerSearchResults] = useState<VerifiedPlayer[]>([]);
  const [searchingPlayers, setSearchingPlayers] = useState(false);
  const [savingRosterChange, setSavingRosterChange] = useState(false);
  const [rosterError, setRosterError] = useState('');
  const [submittingTournamentReg, setSubmittingTournamentReg] = useState(false);
  const [tournamentRegError, setTournamentRegError] = useState('');
  const [showTournamentFormModal, setShowTournamentFormModal] = useState(false);
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  const [tournamentForm, setTournamentForm] = useState<TournamentFormState>({
    game_type: 'MLBB',
    format: 'team',
    team_size: '5',
    title: '',
    description: '',
    prize_pool: '50000',
    xp_reward: '0',
    min_participants: '2',
    status: 'registration_open',
    start_date: '',
    registration_deadline: '',
    livestream_url: '',
    rules: '',
  });
  const [tournamentFormError, setTournamentFormError] = useState('');
  const [tournamentBannerFile, setTournamentBannerFile] = useState<File | null>(null);
  const [editingTournamentBannerUrl, setEditingTournamentBannerUrl] = useState<string | null>(null);
  const [savingTournament, setSavingTournament] = useState(false);
  const [adminTournamentRegistrations, setAdminTournamentRegistrations] = useState<TournamentRegistration[]>([]);
  const [adminTournamentTeamMembers, setAdminTournamentTeamMembers] = useState<TournamentTeamMember[]>([]);
  const [myMatches, setMyMatches] = useState<TournamentMatch[]>([]);
  const [adminTournamentMatches, setAdminTournamentMatches] = useState<TournamentMatch[]>([]);
  const [bracketMatches, setBracketMatches] = useState<TournamentMatch[]>([]);
  // Set by handleNotificationClick when a tournament/challenge notification
  // is clicked, so the target screen can auto-open/scroll to that specific
  // item once it mounts, then clear itself.
  const [deepLinkTournamentId, setDeepLinkTournamentId] = useState<string | null>(null);
  const [deepLinkChallengeId, setDeepLinkChallengeId] = useState<string | null>(null);
  const [generatingMatches, setGeneratingMatches] = useState(false);
  const [showMatchChatModal, setShowMatchChatModal] = useState(false);
  const [chattingMatch, setChattingMatch] = useState<TournamentMatch | null>(null);
  const [matchMessages, setMatchMessages] = useState<TournamentMatchMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChatMessage, setSendingChatMessage] = useState(false);
  const [showSubmitResultModal, setShowSubmitResultModal] = useState(false);
  const [submittingResultMatch, setSubmittingResultMatch] = useState<TournamentMatch | null>(null);
  const [resultWinnerId, setResultWinnerId] = useState('');
  const [resultProofFile, setResultProofFile] = useState<File | null>(null);
  const [submittingResult, setSubmittingResult] = useState(false);
  const [resultSubmitError, setResultSubmitError] = useState('');
  const [gameIdLinks, setGameIdLinks] = useState<GameIdLink[]>([]);
  const [gameIdForm, setGameIdForm] = useState({ game_type: GAME_OPTIONS[0], in_game_id: '' });
  const [gameIdScreenshotFile, setGameIdScreenshotFile] = useState<File | null>(null);
  const [linkingGameId, setLinkingGameId] = useState(false);
  const [verifyingGameId, setVerifyingGameId] = useState(false);
  const [retryingGameIdVerification, setRetryingGameIdVerification] = useState<string | null>(null);
  const [gameIdError, setGameIdError] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', body: '' });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({ issue_type: 'Payment issue', description: '', contact_email: '' });
  const [submittingSupportTicket, setSubmittingSupportTicket] = useState(false);
  const [supportError, setSupportError] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deactivatingAccount, setDeactivatingAccount] = useState(false);

  // --- CHALLENGES (peer-to-peer wagered 1v1/team matches) ---
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [challengeGameFilter, setChallengeGameFilter] = useState<'ALL' | Challenge['game_type']>('ALL');
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    game_type: 'MLBB' as Challenge['game_type'],
    mode: 'solo' as Challenge['mode'],
    stake_amount: '',
    team_size: '2',
    team_name: '',
  });
  // Shared roster-builder state, reused by both the create-challenge modal
  // and the accept-team-challenge modal (only one is ever open at a time).
  const [challengeRoster, setChallengeRoster] = useState<VerifiedPlayer[]>([]);
  const [challengeRosterQuery, setChallengeRosterQuery] = useState('');
  const [challengeRosterResults, setChallengeRosterResults] = useState<VerifiedPlayer[]>([]);
  const [searchingChallengeRoster, setSearchingChallengeRoster] = useState(false);
  const [creatingChallenge, setCreatingChallenge] = useState(false);
  const [challengeFormError, setChallengeFormError] = useState('');
  const [showAcceptChallengeModal, setShowAcceptChallengeModal] = useState(false);
  const [acceptingChallenge, setAcceptingChallenge] = useState<Challenge | null>(null);
  const [acceptTeamName, setAcceptTeamName] = useState('');
  const [acceptingChallengeSubmitting, setAcceptingChallengeSubmitting] = useState(false);
  const [acceptChallengeError, setAcceptChallengeError] = useState('');
  const [showChallengeChatModal, setShowChallengeChatModal] = useState(false);
  const [chattingChallenge, setChattingChallenge] = useState<Challenge | null>(null);
  const [challengeMessages, setChallengeMessages] = useState<ChallengeMessage[]>([]);
  const [challengeChatInput, setChallengeChatInput] = useState('');
  const [sendingChallengeChatMessage, setSendingChallengeChatMessage] = useState(false);
  const [showSubmitChallengeResultModal, setShowSubmitChallengeResultModal] = useState(false);
  const [submittingResultChallenge, setSubmittingResultChallenge] = useState<Challenge | null>(null);
  const [challengeResultWinnerId, setChallengeResultWinnerId] = useState('');
  const [challengeResultProofFile, setChallengeResultProofFile] = useState<File | null>(null);
  const [submittingChallengeResult, setSubmittingChallengeResult] = useState(false);
  const [challengeResultSubmitError, setChallengeResultSubmitError] = useState('');
  const [adminPendingChallenges, setAdminPendingChallenges] = useState<Challenge[]>([]);

  // Action/Modal states
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  // Withdraw Form states
  const [withdrawMethod, setWithdrawMethod] = useState<'esewa' | 'paypal'>('esewa');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // Add Money (Deposit) Form states
  const [depositMethod, setDepositMethod] = useState<'esewa' | 'paypal'>('esewa');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositReference, setDepositReference] = useState('');
  const [depositProofFile, setDepositProofFile] = useState<File | null>(null);
  const [depositError, setDepositError] = useState('');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  // Membership Upgrade Request Form states
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [membershipTierRequested, setMembershipTierRequested] = useState<'bronze' | 'gold'>('bronze');
  const [membershipPaymentSource, setMembershipPaymentSource] = useState<'wallet' | 'external'>('external');
  const [membershipMethod, setMembershipMethod] = useState<'esewa' | 'paypal'>('esewa');
  const [membershipReference, setMembershipReference] = useState('');
  const [membershipProofFile, setMembershipProofFile] = useState<File | null>(null);
  const [membershipError, setMembershipError] = useState('');
  const [submittingMembership, setSubmittingMembership] = useState(false);
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>([]);

  // Phone Form states
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpResendCountdown, setOtpResendCountdown] = useState(60);

  // Timer states
  const [timeRemaining, setTimeRemaining] = useState<string>('30:00');
  const timerIntervalRef = useRef<any>(null);

  // Admin Tab lists
  const [allPendingSubmissions, setAllPendingSubmissions] = useState<MissionAttempt[]>([]);
  const [allActiveAttempts, setAllActiveAttempts] = useState<MissionAttempt[]>([]);
  const [allAttempts, setAllAttempts] = useState<MissionAttempt[]>([]);
  const [attemptFilter, setAttemptFilter] = useState<'all' | 'active' | 'pending_review' | 'approved' | 'rejected' | 'expired' | 'cancelled'>('all');
  const [allPendingPayouts, setAllPendingPayouts] = useState<PayoutRequest[]>([]);
  const [allPayouts, setAllPayouts] = useState<PayoutRequest[]>([]);
  const [allPendingDeposits, setAllPendingDeposits] = useState<DepositRequest[]>([]);
  const [allDeposits, setAllDeposits] = useState<DepositRequest[]>([]);
  const [allPendingMembershipRequests, setAllPendingMembershipRequests] = useState<MembershipRequest[]>([]);
  const [allMembershipRequests, setAllMembershipRequests] = useState<MembershipRequest[]>([]);
  const [allPendingGameIdLinks, setAllPendingGameIdLinks] = useState<GameIdLink[]>([]);
  const [allGameIdLinks, setAllGameIdLinks] = useState<GameIdLink[]>([]);
  const [allSupportTickets, setAllSupportTickets] = useState<SupportTicket[]>([]);
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [adminRejectionReason, setAdminRejectionReason] = useState<{[key: string]: string}>({});
  const [adminTxId, setAdminTxId] = useState<{[key: string]: string}>({});

  // Admin Dashboard: sub-navigation is real routing (/admin/:section), not
  // local-only state -- bookmarkable, survives reload, back button works.
  const adminSectionFromPath = location.pathname.replace(/^\/admin\/?/, '') as AdminSection;
  const adminSection: AdminSection = ADMIN_SECTIONS.includes(adminSectionFromPath) ? adminSectionFromPath : 'missions';
  const setAdminSection = (section: AdminSection) => navigate(`/admin/${section}`);
  const [, setAdminClockTick] = useState(0);

  // Admin: Mission Manager
  const [adminMissions, setAdminMissions] = useState<Mission[]>([]);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [missionForm, setMissionForm] = useState({
    title: '',
    description: '',
    game: GAME_OPTIONS[0],
    customGame: '',
    reward_amount: '',
    xp_reward: '',
    rules: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard' | 'Expert',
    is_active: true
  });
  const [missionFormError, setMissionFormError] = useState('');

  // Admin: Player Manager
  const [adminPlayers, setAdminPlayers] = useState<Profile[]>([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [viewingPlayer, setViewingPlayer] = useState<Profile | null>(null);
  const [viewingPlayerWallet, setViewingPlayerWallet] = useState<Wallet | null>(null);
  const [viewingPlayerAttempts, setViewingPlayerAttempts] = useState<MissionAttempt[]>([]);
  const [viewingPlayerLoading, setViewingPlayerLoading] = useState(false);

  // Admin: Analytics
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // 1. Listen to Auth Changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
        setShowLoginModal(false);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
        setShowLoginModal(false);
      } else {
        setProfile(null);
        setWallet(null);
        setAttempts([]);
        setActiveAttempt(null);
        setMyTournamentRegistrations([]);
        setMyTeamMembers([]);
        setMyMatches([]);
        setMyChallenges([]);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1b. Live sync: wallet balance and mission attempt status can change from
  // an admin action while the player has the tab open, so subscribe to those
  // two tables via Supabase Realtime instead of relying on manual refresh.
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-live-sync-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'wallets', filter: `id=eq.${user.id}` },
        (payload) => setWallet(payload.new as Wallet)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mission_attempts', filter: `user_id=eq.${user.id}` },
        () => fetchUserData(user.id)
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => setNotifications((prev) => [payload.new as Notification, ...prev])
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_matches' },
        () => fetchUserData(user.id)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_match_participants' },
        () => fetchUserData(user.id)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'challenges', filter: `creator_user_id=eq.${user.id}` },
        () => fetchUserData(user.id)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'challenges', filter: `acceptor_user_id=eq.${user.id}` },
        () => fetchUserData(user.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 1c. Auto sign-out after 45 minutes of inactivity. Any mouse/keyboard/touch
  // activity resets the timer; only runs while a user is actually logged in.
  useEffect(() => {
    if (!user) return;

    const IDLE_TIMEOUT_MS = 45 * 60 * 1000;
    let idleTimer: ReturnType<typeof setTimeout>;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(async () => {
        await supabase.auth.signOut();
        alert("You've been signed out after 45 minutes of inactivity.");
      }, IDLE_TIMEOUT_MS);
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((event) => window.addEventListener(event, resetIdleTimer));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      activityEvents.forEach((event) => window.removeEventListener(event, resetIdleTimer));
    };
  }, [user]);

  // 2. Load Public Data
  useEffect(() => {
    fetchMissions();
    fetchMissionFees();
    fetchPlatformSettings();
    fetchPublicFeedback();
    fetchTournaments();
    fetchChallenges();
  }, []);

  // 2z. Live sync for tournament registration counts -- runs for everyone,
  // including guests, since watching the counter climb toward the minimum is
  // the whole point of the public tournament page.
  useEffect(() => {
    const channel = supabase
      .channel('public-tournaments-live-sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tournaments' },
        (payload) => {
          const updated = payload.new as Tournament;
          setTournaments((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        }
      )
      .on(
        // Full refetch (rather than merging payload.new) because the public
        // challenge list needs creator_profile/acceptor_profile joins that
        // a raw postgres_changes payload doesn't carry.
        'postgres_changes',
        { event: '*', schema: 'public', table: 'challenges' },
        () => fetchChallenges()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 2z2. Match chat: fetches the log for whichever match is open, then
  // subscribes to live inserts for it. Scoped to the modal's lifetime (keyed
  // on chattingMatch?.id) rather than the always-on user-live-sync channel,
  // since it's only relevant while the chat modal is actually open.
  useEffect(() => {
    if (!chattingMatch) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from('tournament_match_messages')
        .select('*, profile:profiles(*)')
        .eq('match_id', chattingMatch.id)
        .order('created_at', { ascending: true });
      if (!cancelled) setMatchMessages((data as TournamentMatchMessage[]) || []);
    })();

    const channel = supabase
      .channel(`match-chat-${chattingMatch.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tournament_match_messages', filter: `match_id=eq.${chattingMatch.id}` },
        async (payload) => {
          const msg = payload.new as TournamentMatchMessage;
          const { data: senderProfile } = await supabase.from('profiles').select('*').eq('id', msg.sender_user_id).single();
          setMatchMessages((prev) => [...prev, { ...msg, profile: (senderProfile as Profile) || undefined }]);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [chattingMatch?.id]);

  // 2z3. Challenge chat: same scoped-to-modal-lifetime pattern as match chat above.
  useEffect(() => {
    if (!chattingChallenge) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from('challenge_messages')
        .select('*, profile:profiles(*)')
        .eq('challenge_id', chattingChallenge.id)
        .order('created_at', { ascending: true });
      if (!cancelled) setChallengeMessages((data as ChallengeMessage[]) || []);
    })();

    const channel = supabase
      .channel(`challenge-chat-${chattingChallenge.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'challenge_messages', filter: `challenge_id=eq.${chattingChallenge.id}` },
        async (payload) => {
          const msg = payload.new as ChallengeMessage;
          const { data: senderProfile } = await supabase.from('profiles').select('*').eq('id', msg.sender_user_id).single();
          setChallengeMessages((prev) => [...prev, { ...msg, profile: (senderProfile as Profile) || undefined }]);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [chattingChallenge?.id]);

  // 2a. Leaderboard refetches whenever the selected period (all/week/month) changes.
  useEffect(() => {
    fetchLeaderboard(leaderboardPeriod);
  }, [leaderboardPeriod]);

  // 2b. Redirect unknown paths to the Missions tab. /terms and /privacy are
  // static pages outside the Tab system, / is the standalone landing page
  // (HomeScreen), and /admin is the standalone admin dashboard (its own
  // login gate, rendered before the player shell below) -- all allowlisted
  // here so they don't bounce.
  useEffect(() => {
    if (STATIC_PAGES.includes(location.pathname)) return;
    if (location.pathname === '/') return;
    if (location.pathname.startsWith('/admin')) return;
    if (!VALID_TABS.includes(location.pathname.slice(1) as Tab)) {
      navigate('/missions', { replace: true });
    }
  }, [location.pathname, navigate]);

  // 2c. Redirect away from account-only tabs (wallet/profile) if logged out.
  useEffect(() => {
    if (authLoading) return;
    const accountTabs: Tab[] = ['wallet', 'profile', 'notifications'];
    if (!user && accountTabs.includes(activeTab)) {
      navigate('/missions', { replace: true });
    }
  }, [user, activeTab, authLoading, navigate]);

  // 2d. Landing on bare /admin (no section) as an authorized admin/moderator
  // drops straight into the missions section, same as opening a normal app.
  useEffect(() => {
    if (authLoading || location.pathname !== '/admin') return;
    if (user && (profile?.role === 'admin' || profile?.role === 'moderator')) {
      navigate('/admin/missions', { replace: true });
    }
  }, [location.pathname, authLoading, user, profile, navigate]);

  // 3. Keep Active Mission Timer Updated
  useEffect(() => {
    if (activeAttempt) {
      updateTimer();
      timerIntervalRef.current = setInterval(updateTimer, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeAttempt]);

  // Tick every second while viewing admin submissions, so live countdowns stay accurate
  useEffect(() => {
    if (adminSection !== 'submissions') return;
    const interval = setInterval(() => setAdminClockTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [adminSection]);

  // No cron/background job in this app -- missed check-in is resolved
  // opportunistically whenever a signed-in user's match data loads.
  // attemptedForfeitMatchIds guards against a retry loop: if the RPC call
  // fails (e.g. it doesn't exist in the DB yet) the refetch below would
  // otherwise keep finding the same still-unresolved match and firing again
  // on every render.
  const attemptedForfeitMatchIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!user) return;
    const eligible = myMatches.filter((m) =>
      !attemptedForfeitMatchIds.current.has(m.id)
      && m.match_type === 'bracket'
      && m.status !== 'completed'
      && !!m.scheduled_time
      && new Date(m.scheduled_time).getTime() < Date.now()
      && (m.participants || []).length === 2
      && (m.participants || []).filter((p) => p.checked_in_at).length === 1
    );
    if (eligible.length === 0) return;

    eligible.forEach((m) => attemptedForfeitMatchIds.current.add(m.id));
    Promise.all(eligible.map((m) => supabase.rpc('resolve_missed_checkin', { p_match_id: m.id })))
      .then(() => fetchUserData(user.id));
  }, [myMatches, user]);

  // Same opportunistic pattern: fires the "check-in is open" notification
  // once the 30-minute window starts, guarded server-side by
  // checkin_reminder_sent_at so it can only ever go out once per match.
  const attemptedCheckinReminderIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!user) return;
    const eligible = myMatches.filter((m) =>
      !attemptedCheckinReminderIds.current.has(m.id)
      && m.match_type === 'bracket'
      && m.status !== 'completed'
      && !m.checkin_reminder_sent_at
      && !!m.scheduled_time
      && new Date(m.scheduled_time).getTime() - Date.now() <= 30 * 60 * 1000
    );
    if (eligible.length === 0) return;

    eligible.forEach((m) => attemptedCheckinReminderIds.current.add(m.id));
    Promise.all(eligible.map((m) => supabase.rpc('send_checkin_reminder', { p_match_id: m.id })))
      .then(() => fetchUserData(user.id));
  }, [myMatches, user]);

  // Read notifications auto-delete 12 hours after being read; unread ones
  // stick around indefinitely. No RPC needed -- the DELETE RLS policy's
  // USING clause already encodes the exact retention rule, so this blanket
  // delete only ever actually removes rows that have aged out. Fires once
  // per login, which is enough to keep the list tidy over time.
  useEffect(() => {
    if (!user) return;
    supabase.from('notifications').delete().eq('user_id', user.id)
      .then(() => setNotifications((prev) => prev.filter((n) =>
        !n.read_at || Date.now() - new Date(n.read_at).getTime() < 12 * 60 * 60 * 1000
      )));
  }, [user]);

  // Same opportunistic-trigger pattern as the missed-check-in forfeit above,
  // but runs for every visitor (including guests) since it only touches
  // tournament status, not user-specific data -- whoever loads the public
  // tournament list first after the deadline passes closes it for everyone.
  const attemptedRegCloseIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    const eligible = tournaments.filter((t) =>
      !attemptedRegCloseIds.current.has(t.id)
      && t.status === 'registration_open'
      && !!t.registration_deadline
      && new Date(t.registration_deadline).getTime() < Date.now()
    );
    if (eligible.length === 0) return;

    eligible.forEach((t) => attemptedRegCloseIds.current.add(t.id));
    Promise.all(eligible.map((t) => supabase.rpc('close_expired_registration', { p_tournament_id: t.id })))
      .then(() => fetchTournaments());
  }, [tournaments]);

  // Same opportunistic pattern for challenges: expire_open_challenges() has no
  // permission check (its own WHERE clause is the real guard), so it's safe
  // to call it whenever anyone's browser has an open challenge in state past
  // its 24h window. Runs for every visitor for the same reason as tournament
  // registration close above.
  const attemptedChallengeExpireIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    const eligible = challenges.filter((c) =>
      !attemptedChallengeExpireIds.current.has(c.id)
      && c.status === 'open'
      && new Date(c.expires_at).getTime() < Date.now()
    );
    if (eligible.length === 0) return;

    eligible.forEach((c) => attemptedChallengeExpireIds.current.add(c.id));
    supabase.rpc('expire_open_challenges', {}).then(() => fetchChallenges());
  }, [challenges]);

  const formatCountdown = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Expired';
    const minutes = Math.floor(diffMs / 1000 / 60);
    const seconds = Math.floor((diffMs / 1000) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const updateTimer = () => {
    if (!activeAttempt) return;
    const expiresAt = new Date(activeAttempt.expires_at).getTime();
    const now = Date.now();
    const difference = expiresAt - now;

    if (difference <= 0) {
      setTimeRemaining('00:00');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      markAttemptExpired(activeAttempt.id);
    } else {
      const minutes = Math.floor(difference / 1000 / 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeRemaining(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }
  };

  const markAttemptExpired = async (attemptId: string) => {
    const { error } = await supabase
      .from('mission_attempts')
      .update({ status: 'expired' })
      .eq('id', attemptId);

    if (!error) {
      setActiveAttempt(null);
      if (user) fetchUserData(user.id);
    }
  };

  const handleCancelMission = async (attemptId: string) => {
    if (!window.confirm("Cancel this mission? It will still count towards today's mission limit.")) return;

    const { error } = await supabase
      .from('mission_attempts')
      .update({ status: 'cancelled' })
      .eq('id', attemptId);

    if (error) {
      alert(error.message);
    } else {
      setActiveAttempt(null);
      if (user) fetchUserData(user.id);
    }
  };

  const fetchUserData = async (userId: string) => {
    setAuthLoading(true);
    try {
      // 1. Fetch Profile (create on the fly if missing!)
      let { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!profileData) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const email = currentUser?.email || '';
        const name = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.display_name || email.split('@')[0] || 'Gamer';
        const avatar = currentUser?.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar?d=mp';

        const newProfile = {
          id: userId,
          display_name: name,
          avatar_url: avatar,
          membership_tier: 'free',
          daily_mission_limit: 3,
          xp: 0,
          missions_completed: 0,
          kyc_status: 'unverified',
          role: 'player',
          phone: null
        };

        const { data: insertedProfile, error: insertErr } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (insertErr) {
          throw insertErr;
        }
        profileData = insertedProfile;
      }

      if (profileData.is_deactivated) {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setAuthError('This account has been deactivated. Contact support to reactivate it.');
        setAuthLoading(false);
        // setShowLoginModal(false) already fired optimistically on sign-in
        // before this async check resolved, so surface this immediately too.
        alert('This account has been deactivated. Contact support to reactivate it.');
        return;
      }

      setProfile(profileData);

      // Phone verification is temporarily not enforced -- no SMS provider is
      // configured in Supabase yet, so supabase.auth.updateUser({ phone })
      // always fails and this modal was a dead-end blocking every login.
      // Re-enable both this check and the one in handleStartMission below
      // once a real SMS provider (Twilio etc.) is connected.
      // if (!profileData.phone || !profileData.is_phone_verified) {
      //   setShowPhoneModal(true);
      // }

      // 2. Fetch Wallet (create on the fly if missing!)
      let { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!walletData) {
        const newWallet = {
          id: userId,
          user_id: userId,
          balance: 0.00
        };
        const { data: insertedWallet, error: walletInsertErr } = await supabase
          .from('wallets')
          .insert(newWallet)
          .select()
          .single();
        
        if (!walletInsertErr) {
          walletData = insertedWallet;
        }
      }
      setWallet(walletData || null);

      // 3. Fetch Mission Attempts
      const { data: attemptsData } = await supabase
        .from('mission_attempts')
        .select('*, mission:missions(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (attemptsData) {
        setAttempts(attemptsData as MissionAttempt[]);
        const active = attemptsData.find(
          (a) => a.status === 'active' && new Date(a.expires_at).getTime() > Date.now()
        );
        setActiveAttempt((active as MissionAttempt) || null);
      }

      const { data: payoutData } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false });
      setPayouts(payoutData || []);

      const { data: depositData } = await supabase
        .from('deposit_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false });
      setDeposits((depositData as DepositRequest[]) || []);

      const { data: membershipData } = await supabase
        .from('membership_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false });
      setMembershipRequests((membershipData as MembershipRequest[]) || []);

      const { data: gameIdData } = await supabase
        .from('game_id_links')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });
      setGameIdLinks((gameIdData as GameIdLink[]) || []);

      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      setNotifications((notificationsData as Notification[]) || []);

      const { data: tournamentRegData } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('user_id', userId);
      setMyTournamentRegistrations((tournamentRegData as TournamentRegistration[]) || []);

      const myRegistrationIds = (tournamentRegData || []).map((r) => r.id);
      if (myRegistrationIds.length > 0) {
        const { data: teamMembersData } = await supabase
          .from('tournament_team_members')
          .select('*, profile:profiles(*)')
          .in('registration_id', myRegistrationIds);
        setMyTeamMembers((teamMembersData as TournamentTeamMember[]) || []);

        const { data: myMatchParticipantRows } = await supabase
          .from('tournament_match_participants')
          .select('match_id')
          .in('registration_id', myRegistrationIds);
        const myMatchIds = [...new Set((myMatchParticipantRows || []).map((r) => r.match_id))];

        if (myMatchIds.length > 0) {
          const { data: matchesData } = await supabase
            .from('tournament_matches')
            .select('*, participants:tournament_match_participants(*, registration:tournament_registrations(*, profile:profiles(*)))')
            .in('id', myMatchIds);
          setMyMatches((matchesData as TournamentMatch[]) || []);
        } else {
          setMyMatches([]);
        }
      } else {
        setMyTeamMembers([]);
        setMyMatches([]);
      }

      // "My challenges" mirrors myTournamentRegistrations -- the captain's
      // own rows (creator or acceptor), not the full public roster. Teammates
      // can always find "their" challenge via the public browse list too,
      // since challenge rosters are publicly viewable same as tournaments.
      const { data: myChallengesData } = await supabase
        .from('challenges')
        .select('*, creator_profile:profiles!creator_user_id(*), acceptor_profile:profiles!acceptor_user_id(*)')
        .or(`creator_user_id.eq.${userId},acceptor_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      setMyChallenges((myChallengesData as Challenge[]) || []);

      // Only load admin data when actually on the standalone /admin page --
      // an admin/moderator browsing the normal player app is just a player.
      if ((profileData.role === 'admin' || profileData.role === 'moderator') && window.location.pathname.startsWith('/admin')) {
        fetchAdminPanelData();
      }

    } catch (e: any) {
      console.error('Failed to load account data:', e.message);
      setAuthError('Failed to load your account: ' + e.message);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setWallet(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchAdminPanelData = async () => {
    const { data: submissionsData } = await supabase
      .from('mission_attempts')
      .select('*, mission:missions(*), profile:profiles(*)')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true });
    setAllPendingSubmissions((submissionsData as MissionAttempt[]) || []);

    const { data: activeAttemptsData } = await supabase
      .from('mission_attempts')
      .select('*, mission:missions(*), profile:profiles(*)')
      .eq('status', 'active')
      .order('started_at', { ascending: false });

    const now = Date.now();
    const stillActive = (activeAttemptsData || []).filter((a) => new Date(a.expires_at).getTime() > now);
    const staleExpiredIds = (activeAttemptsData || [])
      .filter((a) => new Date(a.expires_at).getTime() <= now)
      .map((a) => a.id);

    if (staleExpiredIds.length > 0) {
      await supabase.from('mission_attempts').update({ status: 'expired' }).in('id', staleExpiredIds);
    }
    setAllActiveAttempts(stillActive as MissionAttempt[]);

    const { data: allAttemptsData } = await supabase
      .from('mission_attempts')
      .select('*, mission:missions(*), profile:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    setAllAttempts((allAttemptsData as MissionAttempt[]) || []);

    const { data: payoutsData } = await supabase
      .from('payout_requests')
      .select('*, profile:profiles(*)')
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });
    setAllPendingPayouts((payoutsData as PayoutRequest[]) || []);

    const { data: allPayoutsData } = await supabase
      .from('payout_requests')
      .select('*, profile:profiles(*)')
      .order('requested_at', { ascending: false })
      .limit(100);
    setAllPayouts((allPayoutsData as PayoutRequest[]) || []);

    const { data: depositsData } = await supabase
      .from('deposit_requests')
      .select('*, profile:profiles(*)')
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });
    setAllPendingDeposits((depositsData as DepositRequest[]) || []);

    const { data: allDepositsData } = await supabase
      .from('deposit_requests')
      .select('*, profile:profiles(*)')
      .order('requested_at', { ascending: false })
      .limit(100);
    setAllDeposits((allDepositsData as DepositRequest[]) || []);

    const { data: membershipPendingData } = await supabase
      .from('membership_requests')
      .select('*, profile:profiles(*)')
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });
    setAllPendingMembershipRequests((membershipPendingData as MembershipRequest[]) || []);

    const { data: allMembershipData } = await supabase
      .from('membership_requests')
      .select('*, profile:profiles(*)')
      .order('requested_at', { ascending: false })
      .limit(100);
    setAllMembershipRequests((allMembershipData as MembershipRequest[]) || []);

    const { data: missionsData } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });
    setAdminMissions((missionsData as Mission[]) || []);

    const { data: playersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setAdminPlayers((playersData as Profile[]) || []);

    const { data: gameIdPendingData } = await supabase
      .from('game_id_links')
      .select('*, profile:profiles(*)')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });
    setAllPendingGameIdLinks((gameIdPendingData as GameIdLink[]) || []);

    const { data: allGameIdData } = await supabase
      .from('game_id_links')
      .select('*, profile:profiles(*)')
      .order('submitted_at', { ascending: false })
      .limit(100);
    setAllGameIdLinks((allGameIdData as GameIdLink[]) || []);

    const { data: supportTicketsData } = await supabase
      .from('support_tickets')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    setAllSupportTickets((supportTicketsData as SupportTicket[]) || []);

    const { data: feedbackData } = await supabase
      .from('feedback')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    setAllFeedback((feedbackData as Feedback[]) || []);

    const { data: pendingChallengesData } = await supabase
      .from('challenges')
      .select('*, creator_profile:profiles!creator_user_id(*), acceptor_profile:profiles!acceptor_user_id(*)')
      .eq('status', 'awaiting_review')
      .order('result_submitted_at', { ascending: true });
    setAdminPendingChallenges((pendingChallengesData as Challenge[]) || []);
  };

  // Unlimited (non-capped) aggregate queries -- separate from the .limit(100)
  // "recent activity" queries above, since totals would silently undercount
  // once the platform has more than 100 deposits/payouts/mission approvals.
  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);

    const { data: depositsData } = await supabase
      .from('deposit_requests')
      .select('amount')
      .eq('status', 'approved');
    const totalDeposits = (depositsData || []).reduce((sum, d) => sum + Number(d.amount), 0);

    const { data: membershipData } = await supabase
      .from('membership_requests')
      .select('amount')
      .eq('status', 'approved');
    const totalMembershipRevenue = (membershipData || []).reduce((sum, m) => sum + Number(m.amount), 0);

    const { data: payoutsData } = await supabase
      .from('payout_requests')
      .select('amount')
      .eq('status', 'processed');
    const totalPayouts = (payoutsData || []).reduce((sum, p) => sum + Number(p.amount), 0);

    const { data: approvedAttempts } = await supabase
      .from('mission_attempts')
      .select('mission:missions(title, reward_amount)')
      .eq('status', 'approved');

    const missionTotals: Record<string, number> = {};
    let totalMissionRewardsPaid = 0;
    ((approvedAttempts as any[]) || []).forEach((a) => {
      const title = a.mission?.title || 'Unknown';
      const amount = Number(a.mission?.reward_amount || 0);
      missionTotals[title] = (missionTotals[title] || 0) + amount;
      totalMissionRewardsPaid += amount;
    });
    const missionBreakdown = Object.entries(missionTotals)
      .map(([title, total]) => ({ title, total }))
      .sort((a, b) => b.total - a.total);

    setAnalyticsData({ totalDeposits, totalMembershipRevenue, totalPayouts, totalMissionRewardsPaid, missionBreakdown });
    setLoadingAnalytics(false);
  };

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select('*')
      .eq('is_active', true);

    setMissions(data || []);
  };

  const fetchLeaderboard = async (period: 'all' | 'week' | 'month' = 'all') => {
    const { data } = await supabase.rpc('get_leaderboard', { p_period: period });
    setLeaderboard(data || []);
  };

  const fetchMissionFees = async () => {
    const { data } = await supabase
      .from('mission_difficulty_fees')
      .select('difficulty, fee');

    const feeMap: Record<string, number> = {};
    (data || []).forEach((row) => { feeMap[row.difficulty] = row.fee; });
    setMissionFees(feeMap);
  };

  const fetchPlatformSettings = async () => {
    const { data } = await supabase
      .from('platform_settings')
      .select('key, value');

    const settingsMap: Record<string, string> = {};
    (data || []).forEach((row) => { settingsMap[row.key] = row.value; });
    setPlatformSettings(settingsMap);
  };

  const fetchPublicFeedback = async () => {
    const { data } = await supabase
      .from('feedback')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(50);
    setPublicFeedback((data as Feedback[]) || []);
  };

  const fetchTournaments = async () => {
    const { data } = await supabase
      .from('tournaments')
      .select('*, winner:tournament_registrations!winner_registration_id(team_name, profile:profiles(display_name))')
      .order('created_at', { ascending: false });
    setTournaments((data as Tournament[]) || []);
  };

  // Public bracket view: once matches are generated, anyone can see the full
  // round-by-round breakdown (byes, eliminations, everyone) -- same RLS
  // exception that makes bracket-drawn registrations publicly readable.
  const fetchTournamentBracket = async (tournamentId: string) => {
    const { data } = await supabase
      .from('tournament_matches')
      .select('*, participants:tournament_match_participants(*, registration:tournament_registrations(*, profile:profiles(*)))')
      .eq('tournament_id', tournamentId)
      .order('round', { ascending: true })
      .order('label', { ascending: true });
    setBracketMatches((data as TournamentMatch[]) || []);
  };

  // Public browse list: every open (and recently resolved) challenge, same
  // "fully public" visibility as tournaments -- no separate per-game fetch,
  // the game filter is applied client-side same as the Missions game filter.
  const fetchChallenges = async () => {
    const { data } = await supabase
      .from('challenges')
      .select('*, creator_profile:profiles!creator_user_id(*), acceptor_profile:profiles!acceptor_user_id(*)')
      .order('created_at', { ascending: false })
      .limit(200);
    setChallenges((data as Challenge[]) || []);
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) setAuthError(error.message);
  };

  // Same OAuth flow as the player sign-in, but redirects back to /admin
  // afterwards instead of the homepage -- used only by the standalone
  // admin login page.
  const handleAdminGoogleLogin = async () => {
    setAuthError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    });
    if (error) setAuthError(error.message);
  };

  // Start countdown timer for Resend OTP
  useEffect(() => {
    let interval: any;
    if (otpSent && otpResendCountdown > 0) {
      interval = setInterval(() => {
        setOtpResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpResendCountdown]);

  // Nepal-only local input (e.g. 98XXXXXXXX) -> E.164 for the Supabase Auth phone APIs.
  const toE164Phone = (localNumber: string) => `+977${localNumber.replace(/\D/g, '')}`;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    if (!phoneInput || phoneInput.length < 8) {
      setPhoneError('Please enter a valid phone number.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ phone: toE164Phone(phoneInput) });
    if (error) {
      setPhoneError(error.message || 'Failed to send verification code. Please try again.');
      return;
    }

    setOtpSent(true);
    setOtpResendCountdown(60);
  };

  const handleResendOTP = async () => {
    setPhoneError('');
    const { error } = await supabase.auth.updateUser({ phone: toE164Phone(phoneInput) });
    if (error) {
      setPhoneError(error.message || 'Failed to send verification code. Please try again.');
      return;
    }
    setOtpResendCountdown(60);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: toE164Phone(phoneInput),
      token: otpInput,
      type: 'phone_change',
    });

    if (verifyError) {
      setPhoneError(verifyError.message || 'Failed to verify code. Please try again.');
      return;
    }

    const { data: updatedData, error } = await supabase
      .from('profiles')
      .update({
        phone: phoneInput,
        is_phone_verified: true,
      })
      .eq('id', user.id)
      .select();

    if (error || !updatedData || updatedData.length === 0) {
      setPhoneError(error?.message || 'Failed to link phone number. Please try again.');
      return;
    }

    setShowPhoneModal(false);
    setOtpSent(false);
    setOtpInput('');
    fetchUserData(user.id);
    alert('Phone number verified & linked successfully!');
  };

  const handleStartMission = async (mission: Mission) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!profile) return;

    if (profile.is_banned) {
      alert('Your account has been banned from participating in missions. Contact support if you believe this is a mistake.');
      return;
    }

    // Same temporary bypass as the login-time check above -- see that
    // comment for why.
    // if (!profile.phone || !profile.is_phone_verified) {
    //   setShowPhoneModal(true);
    //   return;
    // }

    if (activeAttempt) {
      alert('You already have an active mission running!');
      return;
    }

    const sameMissionToday = attempts.filter((a) => a.mission_id === mission.id && isSameNepalDay(a.started_at)).length;
    if (sameMissionToday >= 2) {
      alert('You have already attempted this mission the maximum number of times today.');
      return;
    }

    const attemptsToday = attempts.filter((a) => isSameNepalDay(a.started_at)).length;
    const isPaidEntry = attemptsToday >= profile.daily_mission_limit;
    const fee = missionFees[mission.difficulty || 'Medium'] || 0;

    const confirmMsg = isPaidEntry
      ? `You've used up your ${profile.daily_mission_limit} free missions today.\n\n` +
        `Accept "${mission.title}" anyway by paying a Rs. ${fee} entry fee from your wallet?\n\n` +
        `⚠️ MISSION GUIDELINES:\n` +
        `- You will have exactly 30 minutes to complete the mission.\n` +
        `- You must upload screenshot proof before the timer expires.\n` +
        `- You can only play one active mission at a time.`
      : `Are you sure you want to accept "${mission.title}"?\n\n` +
        `⚠️ MISSION GUIDELINES:\n` +
        `- You will have exactly 30 minutes to complete the mission.\n` +
        `- You must upload screenshot proof before the timer expires.\n` +
        `- You can only play one active mission at a time.\n\n` +
        `Do you want to start the quest timer now?`;

    if (!window.confirm(confirmMsg)) return;

    const { data, error } = await supabase.rpc('start_mission_attempt', { p_mission_id: mission.id });

    if (error) {
      alert(error.message);
    } else {
      setActiveAttempt(data as MissionAttempt);
      fetchUserData(user.id);
    }
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAttempt || !proofFile || !user) return;

    setSubmittingProof(true);
    try {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${user.id}/${activeAttempt.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('proof_photo')
        .upload(fileName, proofFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('proof_photo')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('mission_attempts')
        .update({
          screenshot_url: publicUrl,
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', activeAttempt.id);

      if (updateError) throw updateError;

      alert('Proof submitted successfully! It will be verified by an admin.');
      setActiveAttempt(null);
      setProofFile(null);
      fetchUserData(user.id);

    } catch (err: any) {
      alert('Failed to submit proof: ' + err.message);
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');

    if (profile?.is_banned) {
      setWithdrawError('Your account has been banned from requesting withdrawals.');
      return;
    }

    if (!wallet || !withdrawAmount || !withdrawDetails) {
      setWithdrawError('Please fill out all fields.');
      return;
    }

    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError('Please enter a valid amount.');
      return;
    }

    if (amountNum > wallet.balance) {
      setWithdrawError('Insufficient balance.');
      return;
    }

    const { error } = await supabase
      .from('payout_requests')
      .insert({
        amount: amountNum,
        payment_method: withdrawMethod,
        payment_details: withdrawDetails,
        status: 'pending'
      });

    if (error) {
      setWithdrawError(error.message);
    } else {
      alert('Withdrawal request submitted!');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawDetails('');
      if (user) fetchUserData(user.id);
    }
  };

  const handleDepositRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');

    if (!user) return;

    if (!depositAmount || !depositReference) {
      setDepositError('Please fill out all fields.');
      return;
    }

    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setDepositError('Please enter a valid amount.');
      return;
    }

    setSubmittingDeposit(true);
    try {
      let proofUrl: string | null = null;

      if (depositProofFile) {
        const fileExt = depositProofFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('deposit_proof')
          .upload(fileName, depositProofFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('deposit_proof').getPublicUrl(fileName);
        proofUrl = publicUrl;
      }

      const { error } = await supabase
        .from('deposit_requests')
        .insert({
          amount: amountNum,
          payment_method: depositMethod,
          reference_note: depositReference,
          proof_url: proofUrl,
          status: 'pending'
        });

      if (error) throw error;

      alert('Deposit request submitted! An admin will verify your payment and credit your wallet.');
      setShowAddMoneyModal(false);
      setDepositAmount('');
      setDepositReference('');
      setDepositProofFile(null);
      fetchUserData(user.id);
    } catch (err: any) {
      setDepositError(err.message);
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const handleUpgradeTier = async (tier: 'free' | 'bronze' | 'gold') => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!profile) return;

    if (tier !== 'free') {
      const price = tier === 'gold' ? 999 : 499;
      setMembershipTierRequested(tier);
      setMembershipPaymentSource(wallet && wallet.balance >= price ? 'wallet' : 'external');
      setMembershipMethod('esewa');
      setMembershipReference('');
      setMembershipProofFile(null);
      setMembershipError('');
      setShowMembershipModal(true);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        membership_tier: 'free',
        daily_mission_limit: 3
      })
      .eq('id', user.id);

    if (error) {
      alert(error.message);
    } else {
      alert('Switched to FREE tier.');
      fetchUserData(user.id);
    }
  };

  const handleWalletMembershipUpgrade = async () => {
    if (!user) return;

    const { error } = await supabase.rpc('upgrade_membership_with_wallet', { p_tier: membershipTierRequested });

    if (error) {
      setMembershipError(error.message);
    } else {
      alert(`Upgraded to ${membershipTierRequested.toUpperCase()} tier!`);
      setShowMembershipModal(false);
      fetchUserData(user.id);
    }
  };

  const handleMembershipRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setMembershipError('');

    if (!user) return;

    if (!membershipReference) {
      setMembershipError('Please enter the transaction reference.');
      return;
    }

    setSubmittingMembership(true);
    try {
      let proofUrl: string | null = null;

      if (membershipProofFile) {
        const fileExt = membershipProofFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('membership_proof')
          .upload(fileName, membershipProofFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('membership_proof').getPublicUrl(fileName);
        proofUrl = publicUrl;
      }

      const amount = membershipTierRequested === 'gold' ? 999 : 499;

      const { error } = await supabase
        .from('membership_requests')
        .insert({
          tier: membershipTierRequested,
          amount,
          payment_method: membershipMethod,
          reference_note: membershipReference,
          proof_url: proofUrl,
          status: 'pending'
        });

      if (error) throw error;

      alert('Upgrade request submitted! An admin will verify your payment and upgrade your tier.');
      setShowMembershipModal(false);
      setMembershipReference('');
      setMembershipProofFile(null);
      fetchUserData(user.id);
    } catch (err: any) {
      setMembershipError(err.message);
    } finally {
      setSubmittingMembership(false);
    }
  };

  // --- ADMIN ACTIONS ---
  const handleAdminApproveSubmission = async (attemptId: string) => {
    const { error } = await supabase
      .from('mission_attempts')
      .update({ status: 'approved' })
      .eq('id', attemptId);

    if (error) {
      alert(error.message);
    } else {
      alert('Mission approved! Payout instantly triggered.');
      fetchAdminPanelData();
      if (user) fetchUserData(user.id);
    }
  };

  const handleAdminRejectSubmission = async (attemptId: string) => {
    const reason = adminRejectionReason[attemptId] || 'Screenshots do not match requirements.';
    const { error } = await supabase
      .from('mission_attempts')
      .update({
        status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', attemptId);

    if (error) {
      alert(error.message);
    } else {
      alert('Mission submission rejected.');
      fetchAdminPanelData();
      if (user) fetchUserData(user.id);
    }
  };

  const handleAdminProcessPayout = async (payoutId: string) => {
    const txId = adminTxId[payoutId] || 'TXN-' + Math.floor(Math.random() * 10000000);

    const { error } = await supabase.rpc('process_payout', {
      p_payout_id: payoutId,
      p_transaction_id: txId
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Payout processed!');
      fetchAdminPanelData();
      if (user) fetchUserData(user.id);
    }
  };

  const handleAdminRejectPayout = async (payoutId: string) => {
    const reason = adminRejectionReason[payoutId] || 'Invalid payment details.';
    const { error } = await supabase
      .from('payout_requests')
      .update({
        status: 'rejected',
        admin_notes: reason
      })
      .eq('id', payoutId);

    if (error) {
      alert(error.message);
    } else {
      alert('Payout rejected.');
      fetchAdminPanelData();
      if (user) fetchUserData(user.id);
    }
  };

  const handleAdminApproveDeposit = async (depositId: string) => {
    const { error } = await supabase.rpc('approve_deposit', { p_deposit_id: depositId });

    if (error) {
      alert(error.message);
    } else {
      alert('Deposit approved! Wallet credited.');
      fetchAdminPanelData();
      if (user) fetchUserData(user.id);
    }
  };

  const handleAdminRejectDeposit = async (depositId: string) => {
    const reason = adminRejectionReason[depositId] || 'Could not verify this payment.';
    const { error } = await supabase
      .from('deposit_requests')
      .update({
        status: 'rejected',
        admin_notes: reason
      })
      .eq('id', depositId);

    if (error) {
      alert(error.message);
    } else {
      alert('Deposit rejected.');
      fetchAdminPanelData();
      if (user) fetchUserData(user.id);
    }
  };

  const handleAdminApproveMembership = async (requestId: string) => {
    const { error } = await supabase.rpc('approve_membership_upgrade', { p_request_id: requestId });

    if (error) {
      alert(error.message);
    } else {
      alert('Membership upgrade approved!');
      fetchAdminPanelData();
      if (user) fetchUserData(user.id);
    }
  };

  const handleAdminRejectMembership = async (requestId: string) => {
    const reason = adminRejectionReason[requestId] || 'Could not verify this payment.';
    const { error } = await supabase
      .from('membership_requests')
      .update({
        status: 'rejected',
        admin_notes: reason
      })
      .eq('id', requestId);

    if (error) {
      alert(error.message);
    } else {
      alert('Membership request rejected.');
      fetchAdminPanelData();
      if (user) fetchUserData(user.id);
    }
  };

  const handleAdminVerifyGameId = async (linkId: string) => {
    const { error } = await supabase
      .from('game_id_links')
      .update({ status: 'verified', admin_notes: null })
      .eq('id', linkId);

    if (error) {
      alert(error.message);
    } else {
      fetchAdminPanelData();
    }
  };

  const handleAdminRejectGameId = async (linkId: string) => {
    const reason = adminRejectionReason[linkId] || 'Could not verify this in-game ID.';
    const { error } = await supabase
      .from('game_id_links')
      .update({ status: 'rejected', admin_notes: reason })
      .eq('id', linkId);

    if (error) {
      alert(error.message);
    } else {
      fetchAdminPanelData();
    }
  };

  const handleViewGameIdScreenshot = async (path: string) => {
    const { data, error } = await supabase.storage.from('game_id_screenshots').createSignedUrl(path, 300);
    if (error) {
      alert(error.message);
    } else {
      window.open(data.signedUrl, '_blank');
    }
  };

  const handleRetryGameIdVerification = async (linkId: string) => {
    setRetryingGameIdVerification(linkId);
    const { error } = await supabase.functions.invoke('verify-game-id', { body: { linkId } });
    setRetryingGameIdVerification(null);
    if (error) {
      alert('Retry failed: ' + error.message);
    }
    fetchAdminPanelData();
  };

  // --- ADMIN: MISSION MANAGER ---
  const openAddMissionModal = () => {
    setEditingMissionId(null);
    setMissionForm({
      title: '',
      description: '',
      game: GAME_OPTIONS[0],
      customGame: '',
      reward_amount: '',
      xp_reward: '',
      rules: '',
      difficulty: 'Medium',
      is_active: true
    });
    setMissionFormError('');
    setShowMissionModal(true);
  };

  const openEditMissionModal = (mission: Mission) => {
    setEditingMissionId(mission.id);
    const isKnownGame = GAME_OPTIONS.includes(mission.game);
    setMissionForm({
      title: mission.title,
      description: mission.description,
      game: isKnownGame ? mission.game : 'Other',
      customGame: isKnownGame ? '' : mission.game,
      reward_amount: String(mission.reward_amount),
      xp_reward: String(mission.xp_reward),
      rules: mission.rules,
      difficulty: mission.difficulty || 'Medium',
      is_active: mission.is_active
    });
    setMissionFormError('');
    setShowMissionModal(true);
  };

  const handleSaveMission = async (e: React.FormEvent) => {
    e.preventDefault();
    setMissionFormError('');

    const rewardNum = parseFloat(missionForm.reward_amount);
    const xpNum = parseInt(missionForm.xp_reward, 10);
    const finalGame = missionForm.game === 'Other' ? missionForm.customGame.trim() : missionForm.game;

    if (!missionForm.title || !finalGame || !missionForm.description || !missionForm.rules) {
      setMissionFormError('Please fill out all fields.');
      return;
    }
    if (isNaN(rewardNum) || rewardNum <= 0) {
      setMissionFormError('Please enter a valid reward amount.');
      return;
    }
    if (isNaN(xpNum) || xpNum <= 0) {
      setMissionFormError('Please enter a valid XP reward.');
      return;
    }

    const payload = {
      title: missionForm.title,
      description: missionForm.description,
      game: finalGame,
      reward_amount: rewardNum,
      xp_reward: xpNum,
      rules: missionForm.rules,
      difficulty: missionForm.difficulty,
      is_active: missionForm.is_active
    };

    const { error } = editingMissionId
      ? await supabase.from('missions').update(payload).eq('id', editingMissionId)
      : await supabase.from('missions').insert(payload);

    if (error) {
      setMissionFormError(error.message);
    } else {
      setShowMissionModal(false);
      fetchAdminPanelData();
      fetchMissions();
    }
  };

  const handleToggleMissionActive = async (mission: Mission) => {
    const { error } = await supabase
      .from('missions')
      .update({ is_active: !mission.is_active })
      .eq('id', mission.id);

    if (error) {
      alert(error.message);
    } else {
      fetchAdminPanelData();
      fetchMissions();
    }
  };

  // --- ADMIN: PLAYER MANAGER ---
  const handleTogglePlayerBan = async (player: Profile) => {
    const confirmMsg = player.is_banned
      ? `Unban ${player.display_name}?`
      : `Ban ${player.display_name}? They will be blocked from starting missions or requesting withdrawals.`;
    if (!window.confirm(confirmMsg)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !player.is_banned })
      .eq('id', player.id);

    if (error) {
      alert(error.message);
    } else {
      fetchAdminPanelData();
      if (viewingPlayer?.id === player.id) {
        setViewingPlayer({ ...player, is_banned: !player.is_banned });
      }
    }
  };

  const openPlayerDetail = async (player: Profile) => {
    setViewingPlayer(player);
    setViewingPlayerLoading(true);
    setViewingPlayerWallet(null);
    setViewingPlayerAttempts([]);

    const { data: walletData } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', player.id)
      .maybeSingle();
    setViewingPlayerWallet(walletData || null);

    const { data: attemptsData } = await supabase
      .from('mission_attempts')
      .select('*, mission:missions(*)')
      .eq('user_id', player.id)
      .order('created_at', { ascending: false });
    setViewingPlayerAttempts((attemptsData as MissionAttempt[]) || []);

    setViewingPlayerLoading(false);
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    await supabase.auth.signOut();
  };

  const handleSubmitKycDocument = async () => {
    const { error } = await supabase.from('profiles').update({ kyc_status: 'pending' }).eq('id', user.id);
    if (!error) {
      alert('Verification document uploaded! Status set to pending.');
      fetchUserData(user.id);
    }
  };

  const handleLinkGameId = async (e: React.FormEvent) => {
    e.preventDefault();
    setGameIdError('');

    if (!gameIdForm.in_game_id.trim()) {
      setGameIdError('Enter your in-game user ID.');
      return;
    }

    if (!gameIdScreenshotFile) {
      setGameIdError('Upload a screenshot of your in-game profile screen (needed for auto-verification).');
      return;
    }

    setLinkingGameId(true);
    try {
      const fileExt = gameIdScreenshotFile.name.split('.').pop();
      const screenshotPath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('game_id_screenshots')
        .upload(screenshotPath, gameIdScreenshotFile, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;

      const { data: linkData, error: linkError } = await supabase.rpc('link_game_id', {
        p_game_type: gameIdForm.game_type,
        p_in_game_id: gameIdForm.in_game_id.trim(),
        p_screenshot_url: screenshotPath,
      });
      if (linkError) throw linkError;

      setGameIdForm({ game_type: GAME_OPTIONS[0], in_game_id: '' });
      setGameIdScreenshotFile(null);
      setLinkingGameId(false);

      setVerifyingGameId(true);
      const { error: verifyError } = await supabase.functions.invoke('verify-game-id', {
        body: { linkId: (linkData as GameIdLink).id },
      });
      if (verifyError) {
        console.error('Auto-verification unavailable, left pending for admin review:', verifyError.message);
      }
    } catch (e: any) {
      setGameIdError(e.message);
    } finally {
      setLinkingGameId(false);
      setVerifyingGameId(false);
      fetchUserData(user.id);
    }
  };

  const handleUnlinkGameId = async (linkId: string, gameType: string) => {
    if (!window.confirm(`Unlink your ${gameType} ID? You'll need to relink and re-verify to add it back.`)) return;

    const { error } = await supabase.from('game_id_links').delete().eq('id', linkId);
    if (error) {
      alert(error.message);
    } else {
      fetchUserData(user.id);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    const readAt = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true, read_at: readAt } : n)));
    await supabase.from('notifications').update({ is_read: true, read_at: readAt }).eq('id', notificationId);
  };

  const handleMarkAllNotificationsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    const readAt = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at ?? readAt })));
    await supabase.from('notifications').update({ is_read: true, read_at: readAt }).in('id', unreadIds);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.body.trim()) return;

    setSendingBroadcast(true);
    const { error } = await supabase.rpc('broadcast_notification', {
      p_title: broadcastForm.title.trim(),
      p_body: broadcastForm.body.trim(),
    });
    setSendingBroadcast(false);

    if (error) {
      alert(error.message);
    } else {
      alert('Broadcast sent to all players.');
      setBroadcastForm({ title: '', body: '' });
    }
  };

  const openSupportModal = () => {
    setSupportForm({ issue_type: 'Payment issue', description: '', contact_email: user?.email || '' });
    setSupportError('');
    setShowSupportModal(true);
  };

  const handleSubmitSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportError('');

    if (!supportForm.description.trim() || !supportForm.contact_email.trim()) {
      setSupportError('Fill in your contact email and a description of the issue.');
      return;
    }

    setSubmittingSupportTicket(true);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      issue_type: supportForm.issue_type,
      description: supportForm.description.trim(),
      contact_email: supportForm.contact_email.trim(),
    });
    setSubmittingSupportTicket(false);

    if (error) {
      setSupportError(error.message);
    } else {
      alert('Support ticket submitted. Our team will get back to you.');
      setSupportForm({ issue_type: 'Payment issue', description: '', contact_email: user.email || '' });
      setShowSupportModal(false);
    }
  };

  const handleAdminUpdateSupportTicketStatus = async (ticketId: string, status: 'in_progress' | 'resolved', notes: string) => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status, admin_notes: notes || null })
      .eq('id', ticketId);

    if (error) {
      alert(error.message);
    } else {
      fetchAdminPanelData();
    }
  };

  const openFeedbackModal = () => {
    setFeedbackForm({ rating: 0, comment: '' });
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackForm.rating === 0) return;

    setSubmittingFeedback(true);
    const { error } = await supabase.from('feedback').insert({
      user_id: user.id,
      rating: feedbackForm.rating,
      comment: feedbackForm.comment.trim() || null,
    });
    setSubmittingFeedback(false);

    if (error) {
      alert(error.message);
    } else {
      alert('Thanks for the feedback!');
      setShowFeedbackModal(false);
    }
  };

  const openTournamentRegistration = (tournament: Tournament) => {
    setRegisteringTournament(tournament);
    setTournamentRegForm({ team_name: '' });
    setTournamentRegError('');
    setShowTournamentRegModal(true);
  };

  const handleSubmitTournamentRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringTournament) return;
    setTournamentRegError('');

    const isTeam = registeringTournament.registration_unit === 'team';
    if (isTeam && !tournamentRegForm.team_name.trim()) {
      setTournamentRegError('Team name is required.');
      return;
    }

    setSubmittingTournamentReg(true);
    const { data, error } = await supabase.rpc('register_for_tournament', {
      p_tournament_id: registeringTournament.id,
      p_team_name: isTeam ? tournamentRegForm.team_name.trim() : null,
    });
    setSubmittingTournamentReg(false);

    if (error) {
      setTournamentRegError(error.message);
    } else {
      setShowTournamentRegModal(false);
      fetchTournaments();
      if (user) await fetchUserData(user.id);
      if (isTeam && data) {
        openTeamRosterModal(data as TournamentRegistration);
      }
    }
  };

  // --- TOURNAMENT: TEAM ROSTER (search + add/remove verified players) ---
  const openTeamRosterModal = (registration: TournamentRegistration) => {
    setRosterManagingRegistration(registration);
    setPlayerSearchQuery('');
    setPlayerSearchResults([]);
    setRosterError('');
    setShowTeamRosterModal(true);
  };

  const handleSearchPlayers = async (query: string) => {
    setPlayerSearchQuery(query);
    if (!rosterManagingRegistration) return;

    setSearchingPlayers(true);
    const { data, error } = await supabase.rpc('search_verified_players', {
      p_tournament_id: rosterManagingRegistration.tournament_id,
      p_query: query,
    });
    setSearchingPlayers(false);

    if (!error) {
      setPlayerSearchResults((data as VerifiedPlayer[]) || []);
    }
  };

  const handleAddTeamMember = async (playerId: string) => {
    if (!rosterManagingRegistration) return;
    setRosterError('');
    setSavingRosterChange(true);

    const { error } = await supabase.rpc('add_team_member', {
      p_registration_id: rosterManagingRegistration.id,
      p_user_id: playerId,
    });
    setSavingRosterChange(false);

    if (error) {
      setRosterError(error.message);
    } else {
      handleSearchPlayers(playerSearchQuery);
      if (user) fetchUserData(user.id);
    }
  };

  const handleRemoveTeamMember = async (teamMemberId: string) => {
    setRosterError('');
    setSavingRosterChange(true);

    const { error } = await supabase.rpc('remove_team_member', { p_team_member_id: teamMemberId });
    setSavingRosterChange(false);

    if (error) {
      setRosterError(error.message);
    } else {
      if (user) fetchUserData(user.id);
    }
  };

  // --- ADMIN: TOURNAMENTS ---
  // <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in the viewer's
  // local time, not UTC -- so the stored UTC ISO string needs the timezone
  // offset baked back in before slicing, or the field would show a time
  // shifted by the admin's UTC offset.
  const toLocalInputValue = (iso: string | null): string => {
    if (!iso) return '';
    const d = new Date(iso);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const openCreateTournamentModal = () => {
    setEditingTournamentId(null);
    setTournamentForm({
      game_type: 'MLBB',
      format: 'team',
      team_size: '5',
      title: '',
      description: '',
      prize_pool: '50000',
      xp_reward: '0',
      min_participants: '2',
      status: 'registration_open',
      start_date: '',
      registration_deadline: '',
      livestream_url: '',
      rules: '',
    });
    setTournamentBannerFile(null);
    setEditingTournamentBannerUrl(null);
    setTournamentFormError('');
    setShowTournamentFormModal(true);
  };

  const openEditTournamentModal = (tournament: Tournament) => {
    setEditingTournamentId(tournament.id);
    setTournamentForm({
      game_type: tournament.game_type,
      format: tournament.registration_unit === 'team' ? 'team' : 'solo',
      team_size: String(tournament.team_size),
      title: tournament.title,
      description: tournament.description || '',
      prize_pool: String(tournament.prize_pool),
      xp_reward: String(tournament.xp_reward),
      min_participants: String(tournament.min_participants),
      status: tournament.status,
      start_date: toLocalInputValue(tournament.start_date),
      registration_deadline: toLocalInputValue(tournament.registration_deadline),
      livestream_url: tournament.livestream_url || '',
      rules: tournament.rules || '',
    });
    setTournamentBannerFile(null);
    setEditingTournamentBannerUrl(tournament.banner_url);
    setTournamentFormError('');
    setShowTournamentFormModal(true);
  };

  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setTournamentFormError('');

    if (!tournamentForm.title.trim()) {
      setTournamentFormError('Title is required.');
      return;
    }

    setSavingTournament(true);
    try {
      let bannerUrl: string | undefined;

      if (tournamentBannerFile) {
        const fileExt = tournamentBannerFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('tournament_banners')
          .upload(fileName, tournamentBannerFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('tournament_banners').getPublicUrl(fileName);
        bannerUrl = publicUrl;
      }

      const payload: Record<string, unknown> = {
        game_type: tournamentForm.game_type,
        title: tournamentForm.title.trim(),
        description: tournamentForm.description.trim() || null,
        prize_pool: Number(tournamentForm.prize_pool) || 0,
        xp_reward: Number(tournamentForm.xp_reward) || 0,
        min_participants: Number(tournamentForm.min_participants) || 1,
        registration_unit: tournamentForm.format === 'team' ? 'team' : 'player',
        team_size: tournamentForm.format === 'team' ? (Number(tournamentForm.team_size) || 5) : 1,
        status: tournamentForm.status,
        start_date: tournamentForm.start_date ? new Date(tournamentForm.start_date).toISOString() : null,
        registration_deadline: tournamentForm.registration_deadline ? new Date(tournamentForm.registration_deadline).toISOString() : null,
        livestream_url: tournamentForm.livestream_url.trim() || null,
        rules: tournamentForm.rules.trim() || null,
      };
      if (bannerUrl) payload.banner_url = bannerUrl;

      const { error } = editingTournamentId
        ? await supabase.from('tournaments').update(payload).eq('id', editingTournamentId)
        : await supabase.from('tournaments').insert({ ...payload, created_by: user.id });

      if (error) throw error;

      setShowTournamentFormModal(false);
      fetchTournaments();
    } catch (err: any) {
      setTournamentFormError(err.message);
    } finally {
      setSavingTournament(false);
    }
  };

  const handleUpdateTournamentStatus = async (tournamentId: string, status: Tournament['status']) => {
    const { error } = await supabase.from('tournaments').update({ status }).eq('id', tournamentId);
    if (error) {
      alert(error.message);
    } else {
      fetchTournaments();
    }
  };

  const fetchTournamentRegistrations = async (tournamentId: string) => {
    const { data } = await supabase
      .from('tournament_registrations')
      .select('*, profile:profiles(*)')
      .eq('tournament_id', tournamentId)
      .order('registered_at', { ascending: true });
    setAdminTournamentRegistrations((data as TournamentRegistration[]) || []);

    const { data: teamData } = await supabase
      .from('tournament_team_members')
      .select('*, profile:profiles(*)')
      .eq('tournament_id', tournamentId);
    setAdminTournamentTeamMembers((teamData as TournamentTeamMember[]) || []);

    const { data: matchesData } = await supabase
      .from('tournament_matches')
      .select('*, participants:tournament_match_participants(*, registration:tournament_registrations(*, profile:profiles(*)))')
      .eq('tournament_id', tournamentId)
      .order('round', { ascending: true })
      .order('label', { ascending: true });
    setAdminTournamentMatches((matchesData as TournamentMatch[]) || []);
  };

  const handleGenerateMatches = async (tournament: Tournament) => {
    const confirmMsg = tournament.bracket_style === 'elimination'
      ? 'Generate the bracket now? This locks in the current registrations and cannot be undone.'
      : 'Generate lobbies now? This locks in the current registrations and cannot be undone.';
    if (!window.confirm(confirmMsg)) return;

    setGeneratingMatches(true);
    const { error } = tournament.bracket_style === 'elimination'
      ? await supabase.rpc('generate_bracket', { p_tournament_id: tournament.id })
      : await supabase.rpc('generate_pubg_lobbies', { p_tournament_id: tournament.id });
    setGeneratingMatches(false);

    if (error) {
      alert(error.message);
    } else {
      fetchTournamentRegistrations(tournament.id);
    }
  };

  const handleSetScheduledTime = async (matchId: string, tournamentId: string, scheduledTimeLocal: string) => {
    const scheduledTime = scheduledTimeLocal ? new Date(scheduledTimeLocal).toISOString() : null;
    const { error } = await supabase.rpc('set_match_scheduled_time', { p_match_id: matchId, p_scheduled_time: scheduledTime });
    if (error) {
      alert(error.message);
    } else {
      fetchTournamentRegistrations(tournamentId);
    }
  };

  const handleCheckInForMatch = async (matchId: string) => {
    const { error } = await supabase.rpc('check_in_for_match', { p_match_id: matchId });
    if (error) {
      alert(error.message);
    } else if (user) {
      fetchUserData(user.id);
    }
  };

  const openMatchChat = (match: TournamentMatch) => {
    setChattingMatch(match);
    setShowMatchChatModal(true);
    setChatInput('');
  };

  const closeMatchChat = () => {
    setShowMatchChatModal(false);
    setChattingMatch(null);
    setMatchMessages([]);
  };

  const handleSendMatchMessage = async () => {
    if (!chattingMatch || !user || !chatInput.trim()) return;
    setSendingChatMessage(true);
    const { error } = await supabase.from('tournament_match_messages').insert({
      match_id: chattingMatch.id,
      sender_user_id: user.id,
      body: chatInput.trim(),
    });
    setSendingChatMessage(false);
    if (error) {
      alert(error.message);
    } else {
      setChatInput('');
    }
  };

  const openSubmitResultModal = (match: TournamentMatch) => {
    setSubmittingResultMatch(match);
    setResultWinnerId('');
    setResultProofFile(null);
    setResultSubmitError('');
    setShowSubmitResultModal(true);
  };

  const handleSubmitMatchResult = async () => {
    if (!submittingResultMatch || !user) return;
    if (submittingResultMatch.match_type === 'bracket' && !resultWinnerId) {
      setResultSubmitError('Select the winning team.');
      return;
    }

    setSubmittingResult(true);
    setResultSubmitError('');
    try {
      let proofUrl: string | null = null;
      if (resultProofFile) {
        const fileExt = resultProofFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('match_result_proofs')
          .upload(fileName, resultProofFile, { cacheControl: '3600', upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('match_result_proofs').getPublicUrl(fileName);
        proofUrl = publicUrl;
      }

      const { error } = await supabase.rpc('submit_match_result', {
        p_match_id: submittingResultMatch.id,
        p_proposed_winner_registration_id: submittingResultMatch.match_type === 'bracket' ? resultWinnerId : null,
        p_result_proof_url: proofUrl,
      });
      if (error) throw error;

      setShowSubmitResultModal(false);
      setSubmittingResultMatch(null);
      fetchUserData(user.id);
    } catch (e: any) {
      setResultSubmitError(e.message);
    } finally {
      setSubmittingResult(false);
    }
  };

  const handleConfirmMatchResult = async (matchId: string, winnerRegistrationId: string, tournamentId: string) => {
    const { error } = await supabase.rpc('confirm_match_result', { p_match_id: matchId, p_winner_registration_id: winnerRegistrationId });
    if (error) {
      alert(error.message);
    } else {
      fetchTournamentRegistrations(tournamentId);
    }
  };

  const handleUpdateLobbyResult = async (participantId: string, placement: number | null, points: number | null, tournamentId: string) => {
    const { error } = await supabase
      .from('tournament_match_participants')
      .update({ result_placement: placement, result_points: points })
      .eq('id', participantId);
    if (error) {
      alert(error.message);
    } else {
      fetchTournamentRegistrations(tournamentId);
    }
  };

  const handleMarkMatchCompleted = async (matchId: string, tournamentId: string) => {
    const { error } = await supabase.from('tournament_matches').update({ status: 'completed' }).eq('id', matchId);
    if (error) {
      alert(error.message);
    } else {
      fetchTournamentRegistrations(tournamentId);
    }
  };

  const handleRemoveTournamentRegistration = async (registrationId: string, tournamentId: string) => {
    if (!window.confirm('Remove this registration?')) return;

    const { error } = await supabase.from('tournament_registrations').delete().eq('id', registrationId);
    if (error) {
      alert(error.message);
    } else {
      fetchTournaments();
      fetchTournamentRegistrations(tournamentId);
    }
  };

  // --- CHALLENGES (peer-to-peer wagered 1v1/team matches) ---
  const openCreateChallengeModal = () => {
    setChallengeForm({ game_type: 'MLBB', mode: 'solo', stake_amount: '', team_size: '2', team_name: '' });
    setChallengeRoster([]);
    setChallengeRosterQuery('');
    setChallengeRosterResults([]);
    setChallengeFormError('');
    setShowCreateChallengeModal(true);
  };

  // Shared by both the create and accept-team-challenge modals -- searches
  // verified players for whichever game_type is currently relevant, and
  // filters out players already picked so the same result can't be added twice.
  const handleSearchChallengeRoster = async (query: string, gameType: Challenge['game_type']) => {
    setChallengeRosterQuery(query);
    setSearchingChallengeRoster(true);
    const { data, error } = await supabase.rpc('search_verified_players_for_challenge', {
      p_game_type: gameType,
      p_query: query,
    });
    setSearchingChallengeRoster(false);
    if (!error) {
      const pickedIds = new Set(challengeRoster.map((p) => p.id));
      setChallengeRosterResults(((data as VerifiedPlayer[]) || []).filter((p) => !pickedIds.has(p.id)));
    }
  };

  const handleAddChallengeRosterPlayer = (player: VerifiedPlayer, maxSize: number) => {
    if (challengeRoster.length >= maxSize) return;
    setChallengeRoster((prev) => [...prev, player]);
    setChallengeRosterResults((prev) => prev.filter((p) => p.id !== player.id));
  };

  const handleRemoveChallengeRosterPlayer = (playerId: string) => {
    setChallengeRoster((prev) => prev.filter((p) => p.id !== playerId));
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setChallengeFormError('');

    const isTeam = challengeForm.mode === 'team';
    const teamSize = parseInt(challengeForm.team_size, 10);
    if (isTeam && (!challengeForm.team_name.trim())) {
      setChallengeFormError('Team name is required.');
      return;
    }
    if (isTeam && challengeRoster.length !== teamSize - 1) {
      setChallengeFormError(`Add exactly ${teamSize - 1} teammate(s) -- you're the captain, making a full ${teamSize}-player team.`);
      return;
    }

    setCreatingChallenge(true);
    const { error } = await supabase.rpc('create_challenge', {
      p_game_type: challengeForm.game_type,
      p_mode: challengeForm.mode,
      p_stake_amount: parseFloat(challengeForm.stake_amount),
      p_team_size: isTeam ? teamSize : null,
      p_team_name: isTeam ? challengeForm.team_name.trim() : null,
      p_roster_user_ids: isTeam ? challengeRoster.map((p) => p.id) : null,
    });
    setCreatingChallenge(false);

    if (error) {
      setChallengeFormError(error.message);
    } else {
      setShowCreateChallengeModal(false);
      fetchChallenges();
      if (user) fetchUserData(user.id);
    }
  };

  const openAcceptChallengeModal = (challenge: Challenge) => {
    setAcceptingChallenge(challenge);
    setAcceptTeamName('');
    setChallengeRoster([]);
    setChallengeRosterQuery('');
    setChallengeRosterResults([]);
    setAcceptChallengeError('');
    setShowAcceptChallengeModal(true);
  };

  const handleAcceptSoloChallenge = async (challenge: Challenge) => {
    const { error } = await supabase.rpc('accept_challenge', { p_challenge_id: challenge.id });
    if (error) {
      alert(error.message);
    } else {
      fetchChallenges();
      if (user) fetchUserData(user.id);
    }
  };

  const handleAcceptTeamChallenge = async () => {
    if (!acceptingChallenge) return;
    setAcceptChallengeError('');

    const teamSize = acceptingChallenge.team_size || 0;
    if (!acceptTeamName.trim()) {
      setAcceptChallengeError('Team name is required.');
      return;
    }
    if (challengeRoster.length !== teamSize - 1) {
      setAcceptChallengeError(`Add exactly ${teamSize - 1} teammate(s) -- you're the captain, making a full ${teamSize}-player team.`);
      return;
    }

    setAcceptingChallengeSubmitting(true);
    const { error } = await supabase.rpc('accept_challenge', {
      p_challenge_id: acceptingChallenge.id,
      p_team_name: acceptTeamName.trim(),
      p_roster_user_ids: challengeRoster.map((p) => p.id),
    });
    setAcceptingChallengeSubmitting(false);

    if (error) {
      setAcceptChallengeError(error.message);
    } else {
      setShowAcceptChallengeModal(false);
      setAcceptingChallenge(null);
      fetchChallenges();
      if (user) fetchUserData(user.id);
    }
  };

  const handleCancelChallenge = async (challengeId: string) => {
    if (!window.confirm('Cancel this challenge? Your stake will be refunded.')) return;
    const { error } = await supabase.rpc('cancel_challenge', { p_challenge_id: challengeId });
    if (error) {
      alert(error.message);
    } else {
      fetchChallenges();
      if (user) fetchUserData(user.id);
    }
  };

  const openChallengeChat = (challenge: Challenge) => {
    setChattingChallenge(challenge);
    setShowChallengeChatModal(true);
    setChallengeChatInput('');
  };

  const closeChallengeChat = () => {
    setShowChallengeChatModal(false);
    setChattingChallenge(null);
    setChallengeMessages([]);
  };

  const handleSendChallengeMessage = async () => {
    if (!chattingChallenge || !user || !challengeChatInput.trim()) return;
    setSendingChallengeChatMessage(true);
    const { error } = await supabase.from('challenge_messages').insert({
      challenge_id: chattingChallenge.id,
      sender_user_id: user.id,
      body: challengeChatInput.trim(),
    });
    setSendingChallengeChatMessage(false);
    if (error) {
      alert(error.message);
    } else {
      setChallengeChatInput('');
    }
  };

  const openSubmitChallengeResultModal = (challenge: Challenge) => {
    setSubmittingResultChallenge(challenge);
    setChallengeResultWinnerId('');
    setChallengeResultProofFile(null);
    setChallengeResultSubmitError('');
    setShowSubmitChallengeResultModal(true);
  };

  const handleSubmitChallengeResult = async () => {
    if (!submittingResultChallenge || !user) return;
    if (!challengeResultWinnerId) {
      setChallengeResultSubmitError('Select the winner.');
      return;
    }

    setSubmittingChallengeResult(true);
    setChallengeResultSubmitError('');
    try {
      let proofUrl: string | null = null;
      if (challengeResultProofFile) {
        const fileExt = challengeResultProofFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('challenge_result_proofs')
          .upload(fileName, challengeResultProofFile, { cacheControl: '3600', upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('challenge_result_proofs').getPublicUrl(fileName);
        proofUrl = publicUrl;
      }

      const { error } = await supabase.rpc('submit_challenge_result', {
        p_challenge_id: submittingResultChallenge.id,
        p_proposed_winner_user_id: challengeResultWinnerId,
        p_result_proof_url: proofUrl,
      });
      if (error) throw error;

      setShowSubmitChallengeResultModal(false);
      setSubmittingResultChallenge(null);
      fetchChallenges();
      if (user) fetchUserData(user.id);
    } catch (e: any) {
      setChallengeResultSubmitError(e.message);
    } finally {
      setSubmittingChallengeResult(false);
    }
  };

  // --- ADMIN: CHALLENGES ---
  const handleConfirmChallengeResult = async (challengeId: string, winnerUserId: string) => {
    const { error } = await supabase.rpc('confirm_challenge_result', { p_challenge_id: challengeId, p_winner_user_id: winnerUserId });
    if (error) {
      alert(error.message);
    } else {
      fetchChallenges();
      fetchAdminPanelData();
    }
  };

  const handleDeactivateAccount = async () => {
    setDeactivatingAccount(true);
    const { error } = await supabase.rpc('deactivate_own_account');
    setDeactivatingAccount(false);

    if (error) {
      alert(error.message);
    } else {
      setShowDeleteAccountModal(false);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      alert('Your account has been deactivated.');
    }
  };

  const handleToggleAccountDeactivation = async (player: Profile) => {
    const confirmMsg = player.is_deactivated
      ? `Reactivate ${player.display_name}'s account?`
      : `Deactivate ${player.display_name}'s account? They will be signed out and blocked from logging in.`;
    if (!window.confirm(confirmMsg)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ is_deactivated: !player.is_deactivated })
      .eq('id', player.id);

    if (error) {
      alert(error.message);
    } else {
      fetchAdminPanelData();
    }
  };

  const handleCancelPhoneVerification = async () => {
    await supabase.auth.signOut();
    setShowPhoneModal(false);
    setOtpSent(false);
  };

  const handleTabClick = (tab: Tab) => {
    if ((tab === 'wallet' || tab === 'profile' || tab === 'notifications') && !user) {
      setShowLoginModal(true);
      return;
    }
    navigate(`/${tab}`);
  };

  // Central click-routing for notifications. Most categories just land on a
  // general tab (existing CATEGORY_TAB-style behavior below), but tournament/
  // challenge carry a related_id pointing at one specific item, and every
  // admin_* category carries an admin sub-section to jump straight into --
  // both handled here since NotificationsScreen shouldn't need to know about
  // adminSection or the tournament/challenge screens' internal state.
  const ADMIN_SECTION_BY_CATEGORY: Partial<Record<Notification['category'], typeof adminSection>> = {
    admin_gameid: 'gameids',
    admin_mission: 'submissions',
    admin_deposit: 'deposits',
    admin_payout: 'payouts',
    admin_membership: 'membership',
    admin_support: 'support',
    admin_challenge: 'challenges',
  };

  // Only non-admin categories land on a normal player tab; every admin_*
  // category (plus the generic 'admin' one) instead navigates to the
  // standalone /admin page below.
  const NOTIFICATION_TAB: Partial<Record<Notification['category'], Tab>> = {
    broadcast: 'missions',
    mission: 'missions',
    payout: 'wallet',
    deposit: 'wallet',
    membership: 'membership',
    tournament: 'tournaments',
    game_id: 'profile',
    support: 'profile',
    account: 'profile',
    challenge: 'challenges',
  };

  const handleNotificationClick = (n: Notification) => {
    const adminTarget = ADMIN_SECTION_BY_CATEGORY[n.category];
    if (adminTarget) {
      // setAdminSection navigates straight to /admin/<section> -- calling
      // navigate('/admin') afterwards would overwrite that back to the bare
      // /admin route, which then bounces to the default Missions section.
      setAdminSection(adminTarget);
      fetchAdminPanelData();
      return;
    }
    if (n.category === 'admin') {
      fetchAdminPanelData();
      navigate('/admin');
      return;
    }
    if (n.category === 'tournament' && n.related_id) {
      setDeepLinkTournamentId(n.related_id);
    } else if (n.category === 'challenge' && n.related_id) {
      setDeepLinkChallengeId(n.related_id);
    }
    handleTabClick(NOTIFICATION_TAB[n.category] || 'missions');
  };

  const filteredMissions = missions.filter((m) => {
    if (gameFilter === 'ALL') return true;
    const gameLower = m.game.toLowerCase();
    const isMLBB = gameLower.includes('legends') || gameLower.includes('mlbb');
    const isPUBG = gameLower.includes('pubg');
    if (gameFilter === 'MLBB') return isMLBB;
    if (gameFilter === 'PUBG') return isPUBG;
    if (gameFilter === 'OTHERS') return !isMLBB && !isPUBG;
    return false;
  });

  const unreadNotificationCount = notifications.filter((n) => !n.is_read).length;

  // STANDALONE ADMIN PAGE -- entirely separate from the player app below:
  // no Navbar, no player tabs, no footer. Every visitor here is either shown
  // a dedicated admin login gate or, once authenticated as admin/moderator,
  // the real admin dashboard. Everyone else, everywhere else in this app,
  // is just a player.
  if (location.pathname.startsWith('/admin')) {
    const isAdminOrMod = profile?.role === 'admin' || profile?.role === 'moderator';
    return (
      <div id="root">
        {authLoading ? (
          <div className="admin-gate">
            <div className="admin-gate-card">
              <h1 className="admin-gate-title">Loading...</h1>
            </div>
          </div>
        ) : !user ? (
          <AdminLoginScreen authError={authError} handleAdminGoogleLogin={handleAdminGoogleLogin} />
        ) : !isAdminOrMod ? (
          <AdminAccessDenied email={user.email} handleLogout={handleLogout} />
        ) : (
          <>
          <AdminNavbar
            notifications={notifications}
            handleMarkNotificationRead={handleMarkNotificationRead}
            handleNotificationClick={handleNotificationClick}
            handleLogout={handleLogout}
          />
          <AdminScreen
            adminSection={adminSection}
            setAdminSection={setAdminSection}
            fetchAdminPanelData={fetchAdminPanelData}
            user={user}
            adminMissions={adminMissions}
            openAddMissionModal={openAddMissionModal}
            openEditMissionModal={openEditMissionModal}
            handleToggleMissionActive={handleToggleMissionActive}
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
            allPendingPayouts={allPendingPayouts}
            allPayouts={allPayouts}
            adminTxId={adminTxId}
            setAdminTxId={setAdminTxId}
            handleAdminProcessPayout={handleAdminProcessPayout}
            handleAdminRejectPayout={handleAdminRejectPayout}
            allPendingDeposits={allPendingDeposits}
            allDeposits={allDeposits}
            handleAdminApproveDeposit={handleAdminApproveDeposit}
            handleAdminRejectDeposit={handleAdminRejectDeposit}
            allPendingMembershipRequests={allPendingMembershipRequests}
            allMembershipRequests={allMembershipRequests}
            handleAdminApproveMembership={handleAdminApproveMembership}
            handleAdminRejectMembership={handleAdminRejectMembership}
            adminPlayers={adminPlayers}
            playerSearch={playerSearch}
            setPlayerSearch={setPlayerSearch}
            openPlayerDetail={openPlayerDetail}
            handleTogglePlayerBan={handleTogglePlayerBan}
            handleToggleAccountDeactivation={handleToggleAccountDeactivation}
            allPendingGameIdLinks={allPendingGameIdLinks}
            allGameIdLinks={allGameIdLinks}
            handleAdminVerifyGameId={handleAdminVerifyGameId}
            handleAdminRejectGameId={handleAdminRejectGameId}
            handleViewGameIdScreenshot={handleViewGameIdScreenshot}
            handleRetryGameIdVerification={handleRetryGameIdVerification}
            retryingGameIdVerification={retryingGameIdVerification}
            broadcastForm={broadcastForm}
            setBroadcastForm={setBroadcastForm}
            sendingBroadcast={sendingBroadcast}
            handleSendBroadcast={handleSendBroadcast}
            allSupportTickets={allSupportTickets}
            handleAdminUpdateSupportTicketStatus={handleAdminUpdateSupportTicketStatus}
            allFeedback={allFeedback}
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
            adminPendingChallenges={adminPendingChallenges}
            handleConfirmChallengeResult={handleConfirmChallengeResult}
            analyticsData={analyticsData}
            loadingAnalytics={loadingAnalytics}
            fetchAnalyticsData={fetchAnalyticsData}
          />

          {/* MODAL: ADD / EDIT MISSION */}
          {showMissionModal && (
            <MissionFormModal
              editingMissionId={editingMissionId}
              setShowMissionModal={setShowMissionModal}
              missionFormError={missionFormError}
              missionForm={missionForm}
              setMissionForm={setMissionForm}
              gameOptions={GAME_OPTIONS}
              handleSaveMission={handleSaveMission}
            />
          )}

          {/* MODAL: PLAYER DETAIL */}
          {viewingPlayer && (
            <PlayerDetailModal
              viewingPlayer={viewingPlayer}
              setViewingPlayer={setViewingPlayer}
              viewingPlayerWallet={viewingPlayerWallet}
              viewingPlayerLoading={viewingPlayerLoading}
              viewingPlayerAttempts={viewingPlayerAttempts}
              handleTogglePlayerBan={handleTogglePlayerBan}
              user={user}
            />
          )}

          {/* MODAL: CREATE/EDIT TOURNAMENT */}
          {showTournamentFormModal && (
            <TournamentFormModal
              setShowTournamentFormModal={setShowTournamentFormModal}
              tournamentForm={tournamentForm}
              setTournamentForm={setTournamentForm}
              editingTournamentId={editingTournamentId}
              tournamentFormError={tournamentFormError}
              handleSaveTournament={handleSaveTournament}
              tournamentBannerFile={tournamentBannerFile}
              setTournamentBannerFile={setTournamentBannerFile}
              existingBannerUrl={editingTournamentBannerUrl}
              savingTournament={savingTournament}
            />
          )}
          </>
        )}
      </div>
    );
  }

  return (
    <div id="root">
      <BackgroundDecoration />

      {/* 1. TOP NAVBAR */}
      <Navbar user={user} profile={profile} wallet={wallet} handleLogout={handleLogout} setShowLoginModal={setShowLoginModal} handleTabClick={handleTabClick} />

      {/* 2. STANDALONE LANDING PAGE (outside the Tab system, same page for
          everyone regardless of login state -- the missions board itself
          only lives at /missions now) */}
      {location.pathname === '/' ? (
        <div className="container" style={{ paddingBottom: '3rem' }}>
          <HomeScreen
            publicFeedback={publicFeedback}
            filteredMissions={filteredMissions}
            gameFilter={gameFilter}
            setGameFilter={setGameFilter}
            goToMissions={() => handleTabClick('missions')}
          />
        </div>
      ) : STATIC_PAGES.includes(location.pathname) ? (
        <div className="container" style={{ paddingBottom: '3rem' }}>
          {location.pathname === '/terms' ? <TermsScreen /> : <PrivacyScreen />}
        </div>
      ) : authLoading && user ? (
        <div style={{ margin: 'auto', textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Loading Profile...</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Retrieving secure wallet balance</p>
        </div>
      ) : (
        /* 3. LOGGED IN DASHBOARD */
        <div className="container" style={{ paddingBottom: '3rem' }}>
          {/* TABS NAVIGATION */}
          <div className="tabs-header">
            <button onClick={() => handleTabClick('missions')} className={`tab-btn ${activeTab === 'missions' ? 'active' : ''}`}>
              🎯 Missions
            </button>
            <button onClick={() => handleTabClick('leaderboard')} className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}>
              🏆 Leaderboard
            </button>
            <button onClick={() => handleTabClick('tournaments')} className={`tab-btn ${activeTab === 'tournaments' ? 'active' : ''}`}>
              💰 Tournaments
            </button>
            <button onClick={() => handleTabClick('challenges')} className={`tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}>
              ⚔️ Challenges
            </button>
            <button onClick={() => handleTabClick('wallet')} className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}>
              💼 Wallet
            </button>
            <button onClick={() => handleTabClick('membership')} className={`tab-btn ${activeTab === 'membership' ? 'active' : ''}`}>
              ⭐ Upgrade
            </button>
            <button onClick={() => handleTabClick('profile')} className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}>
              👤 Profile
            </button>
            {user && (
              <button onClick={() => handleTabClick('notifications')} className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}>
                🔔 Notifications{unreadNotificationCount > 0 ? ` (${unreadNotificationCount})` : ''}
              </button>
            )}
          </div>

          {/* ACTIVE MISSION BLOCK */}
          <ActiveMissionBanner
            user={user}
            activeAttempt={activeAttempt}
            timeRemaining={timeRemaining}
            proofFile={proofFile}
            setProofFile={setProofFile}
            submittingProof={submittingProof}
            handleProofSubmit={handleProofSubmit}
            handleCancelMission={handleCancelMission}
          />

          {/* SCREEN: MISSIONS BOARD */}
          {activeTab === 'missions' && (
            <MissionsScreen
              user={user}
              profile={profile}
              wallet={wallet}
              gameFilter={gameFilter}
              setGameFilter={setGameFilter}
              filteredMissions={filteredMissions}
              expandedMissionId={expandedMissionId}
              setExpandedMissionId={setExpandedMissionId}
              attempts={attempts}
              missionFees={missionFees}
              activeAttempt={activeAttempt}
              handleStartMission={handleStartMission}
            />
          )}

          {/* SCREEN: LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <LeaderboardScreen
              leaderboard={leaderboard}
              user={user}
              leaderboardPeriod={leaderboardPeriod}
              setLeaderboardPeriod={setLeaderboardPeriod}
            />
          )}

          {/* SCREEN: WALLET (Only accessible if logged in) */}
          {activeTab === 'wallet' && user && (
            <WalletScreen
              wallet={wallet}
              setShowAddMoneyModal={setShowAddMoneyModal}
              setShowWithdrawModal={setShowWithdrawModal}
              deposits={deposits}
              payouts={payouts}
            />
          )}

          {/* SCREEN: MEMBERSHIP */}
          {activeTab === 'membership' && (
            <MembershipScreen
              user={user}
              profile={profile}
              handleUpgradeTier={handleUpgradeTier}
              membershipRequests={membershipRequests}
            />
          )}

          {/* SCREEN: USER PROFILE */}
          {activeTab === 'profile' && user && profile && (
            <ProfileScreen
              user={user}
              profile={profile}
              handleLogout={handleLogout}
              setShowPhoneModal={setShowPhoneModal}
              handleSubmitKycDocument={handleSubmitKycDocument}
              gameIdLinks={gameIdLinks}
              gameIdForm={gameIdForm}
              setGameIdForm={setGameIdForm}
              gameIdScreenshotFile={gameIdScreenshotFile}
              setGameIdScreenshotFile={setGameIdScreenshotFile}
              linkingGameId={linkingGameId}
              verifyingGameId={verifyingGameId}
              gameIdError={gameIdError}
              handleLinkGameId={handleLinkGameId}
              handleUnlinkGameId={handleUnlinkGameId}
              openSupportModal={openSupportModal}
              openFeedbackModal={openFeedbackModal}
              setShowDeleteAccountModal={setShowDeleteAccountModal}
            />
          )}

          {/* SCREEN: NOTIFICATIONS */}
          {activeTab === 'notifications' && user && (
            <NotificationsScreen
              notifications={notifications}
              handleMarkNotificationRead={handleMarkNotificationRead}
              handleMarkAllNotificationsRead={handleMarkAllNotificationsRead}
              handleNotificationClick={handleNotificationClick}
            />
          )}

          {/* SCREEN: TOURNAMENTS */}
          {activeTab === 'tournaments' && (
            <TournamentsScreen
              user={user}
              tournaments={tournaments}
              myRegistrations={myTournamentRegistrations}
              myTeamMembers={myTeamMembers}
              myMatches={myMatches}
              gameIdLinks={gameIdLinks}
              openTournamentRegistration={openTournamentRegistration}
              openTeamRosterModal={openTeamRosterModal}
              setShowLoginModal={setShowLoginModal}
              handleTabClick={handleTabClick}
              handleCheckInForMatch={handleCheckInForMatch}
              openMatchChat={openMatchChat}
              openSubmitResultModal={openSubmitResultModal}
              bracketMatches={bracketMatches}
              fetchTournamentBracket={fetchTournamentBracket}
              deepLinkTournamentId={deepLinkTournamentId}
              clearDeepLinkTournament={() => setDeepLinkTournamentId(null)}
            />
          )}

          {/* SCREEN: CHALLENGES */}
          {activeTab === 'challenges' && (
            <ChallengesScreen
              user={user}
              challenges={challenges}
              myChallenges={myChallenges}
              gameIdLinks={gameIdLinks}
              challengeGameFilter={challengeGameFilter}
              setChallengeGameFilter={setChallengeGameFilter}
              setShowLoginModal={setShowLoginModal}
              handleTabClick={handleTabClick}
              deepLinkChallengeId={deepLinkChallengeId}
              clearDeepLinkChallenge={() => setDeepLinkChallengeId(null)}
              openCreateChallengeModal={openCreateChallengeModal}
              openAcceptChallengeModal={openAcceptChallengeModal}
              handleAcceptSoloChallenge={handleAcceptSoloChallenge}
              handleCancelChallenge={handleCancelChallenge}
              openChallengeChat={openChallengeChat}
              openSubmitChallengeResultModal={openSubmitChallengeResultModal}
            />
          )}

        </div>
      )}

      {/* 5. FOOTER */}
      <footer className="main-footer">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
            <Link to="/terms" style={{ color: 'var(--text-muted)' }}>Terms & Conditions</Link>
            <Link to="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>Follow Us:</span>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>Instagram</a>
            <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>TikTok</a>
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>YouTube</a>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            © 2026 MISSIONQUEST. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      {/* 6. MODAL: LOG IN (GOOGLE OAUTH ONLY) */}
      {showLoginModal && (
        <LoginModal
          setShowLoginModal={setShowLoginModal}
          authError={authError}
          handleGoogleLogin={handleGoogleLogin}
        />
      )}

      {/* 7. MODAL: WITHDRAW CASH */}
      {showWithdrawModal && (
        <WithdrawModal
          setShowWithdrawModal={setShowWithdrawModal}
          withdrawError={withdrawError}
          withdrawMethod={withdrawMethod}
          setWithdrawMethod={setWithdrawMethod}
          withdrawDetails={withdrawDetails}
          setWithdrawDetails={setWithdrawDetails}
          withdrawAmount={withdrawAmount}
          setWithdrawAmount={setWithdrawAmount}
          wallet={wallet}
          handleWithdrawRequest={handleWithdrawRequest}
        />
      )}

      {/* 7b. MODAL: ADD MONEY (DEPOSIT REQUEST) */}
      {showAddMoneyModal && (
        <AddMoneyModal
          setShowAddMoneyModal={setShowAddMoneyModal}
          depositError={depositError}
          depositMethod={depositMethod}
          setDepositMethod={setDepositMethod}
          platformSettings={platformSettings}
          depositAmount={depositAmount}
          setDepositAmount={setDepositAmount}
          depositReference={depositReference}
          setDepositReference={setDepositReference}
          setDepositProofFile={setDepositProofFile}
          submittingDeposit={submittingDeposit}
          handleDepositRequest={handleDepositRequest}
        />
      )}

      {/* 7c. MODAL: MEMBERSHIP UPGRADE REQUEST */}
      {showMembershipModal && (
        <MembershipUpgradeModal
          setShowMembershipModal={setShowMembershipModal}
          membershipTierRequested={membershipTierRequested}
          membershipError={membershipError}
          wallet={wallet}
          membershipPaymentSource={membershipPaymentSource}
          setMembershipPaymentSource={setMembershipPaymentSource}
          handleWalletMembershipUpgrade={handleWalletMembershipUpgrade}
          membershipMethod={membershipMethod}
          setMembershipMethod={setMembershipMethod}
          platformSettings={platformSettings}
          membershipReference={membershipReference}
          setMembershipReference={setMembershipReference}
          setMembershipProofFile={setMembershipProofFile}
          submittingMembership={submittingMembership}
          handleMembershipRequest={handleMembershipRequest}
        />
      )}

      {/* 8. MODAL: MANDATORY PHONE VERIFICATION WITH OTP FLOW */}
      {showPhoneModal && (
        <PhoneVerificationModal
          otpSent={otpSent}
          setOtpSent={setOtpSent}
          phoneInput={phoneInput}
          setPhoneInput={setPhoneInput}
          phoneError={phoneError}
          otpInput={otpInput}
          setOtpInput={setOtpInput}
          otpResendCountdown={otpResendCountdown}
          handleSendOTP={handleSendOTP}
          handleVerifyOTP={handleVerifyOTP}
          handleResendOTP={handleResendOTP}
          handleCancelPhoneVerification={handleCancelPhoneVerification}
        />
      )}

      {/* 11. MODAL: CONTACT SUPPORT */}
      {showSupportModal && (
        <SupportTicketModal
          setShowSupportModal={setShowSupportModal}
          supportForm={supportForm}
          setSupportForm={setSupportForm}
          submittingSupportTicket={submittingSupportTicket}
          supportError={supportError}
          handleSubmitSupportTicket={handleSubmitSupportTicket}
        />
      )}

      {/* 12. MODAL: RATE US / FEEDBACK */}
      {showFeedbackModal && (
        <FeedbackModal
          setShowFeedbackModal={setShowFeedbackModal}
          feedbackForm={feedbackForm}
          setFeedbackForm={setFeedbackForm}
          submittingFeedback={submittingFeedback}
          handleSubmitFeedback={handleSubmitFeedback}
        />
      )}

      {/* 13. MODAL: DELETE ACCOUNT */}
      {showDeleteAccountModal && (
        <DeleteAccountModal
          setShowDeleteAccountModal={setShowDeleteAccountModal}
          deactivatingAccount={deactivatingAccount}
          handleDeactivateAccount={handleDeactivateAccount}
        />
      )}

      {/* 14. MODAL: TOURNAMENT REGISTRATION */}
      {showTournamentRegModal && registeringTournament && (
        <TournamentRegistrationModal
          registeringTournament={registeringTournament}
          setShowTournamentRegModal={setShowTournamentRegModal}
          tournamentRegForm={tournamentRegForm}
          setTournamentRegForm={setTournamentRegForm}
          submittingTournamentReg={submittingTournamentReg}
          tournamentRegError={tournamentRegError}
          handleSubmitTournamentRegistration={handleSubmitTournamentRegistration}
        />
      )}

      {/* 14b. MODAL: TEAM ROSTER MANAGEMENT */}
      {showTeamRosterModal && rosterManagingRegistration && (
        <TeamRosterModal
          rosterManagingRegistration={rosterManagingRegistration}
          teamSize={tournaments.find((t) => t.id === rosterManagingRegistration.tournament_id)?.team_size ?? 5}
          myTeamMembers={myTeamMembers}
          setShowTeamRosterModal={setShowTeamRosterModal}
          playerSearchQuery={playerSearchQuery}
          handleSearchPlayers={handleSearchPlayers}
          playerSearchResults={playerSearchResults}
          searchingPlayers={searchingPlayers}
          handleAddTeamMember={handleAddTeamMember}
          handleRemoveTeamMember={handleRemoveTeamMember}
          savingRosterChange={savingRosterChange}
          rosterError={rosterError}
        />
      )}

      {/* 14c. MODAL: MATCH CHAT */}
      {showMatchChatModal && chattingMatch && user && (
        <MatchChatModal
          match={chattingMatch}
          messages={matchMessages}
          currentUserId={user.id}
          chatInput={chatInput}
          setChatInput={setChatInput}
          sendingChatMessage={sendingChatMessage}
          onSend={handleSendMatchMessage}
          onClose={closeMatchChat}
        />
      )}

      {/* 14d. MODAL: SUBMIT MATCH RESULT */}
      {showSubmitResultModal && submittingResultMatch && (
        <SubmitResultModal
          match={submittingResultMatch}
          myRegistrationId={
            myTournamentRegistrations.find((r) => r.tournament_id === submittingResultMatch.tournament_id)?.id || ''
          }
          resultWinnerId={resultWinnerId}
          setResultWinnerId={setResultWinnerId}
          resultProofFile={resultProofFile}
          setResultProofFile={setResultProofFile}
          submittingResult={submittingResult}
          resultSubmitError={resultSubmitError}
          onSubmit={handleSubmitMatchResult}
          onClose={() => setShowSubmitResultModal(false)}
        />
      )}

      {/* MODAL: CREATE CHALLENGE */}
      {showCreateChallengeModal && (
        <CreateChallengeModal
          challengeForm={challengeForm}
          setChallengeForm={setChallengeForm}
          challengeRoster={challengeRoster}
          challengeRosterQuery={challengeRosterQuery}
          challengeRosterResults={challengeRosterResults}
          searchingChallengeRoster={searchingChallengeRoster}
          handleSearchChallengeRoster={handleSearchChallengeRoster}
          handleAddChallengeRosterPlayer={handleAddChallengeRosterPlayer}
          handleRemoveChallengeRosterPlayer={handleRemoveChallengeRosterPlayer}
          creatingChallenge={creatingChallenge}
          challengeFormError={challengeFormError}
          onSubmit={handleCreateChallenge}
          onClose={() => setShowCreateChallengeModal(false)}
        />
      )}

      {/* MODAL: ACCEPT TEAM CHALLENGE */}
      {showAcceptChallengeModal && acceptingChallenge && (
        <AcceptChallengeModal
          challenge={acceptingChallenge}
          acceptTeamName={acceptTeamName}
          setAcceptTeamName={setAcceptTeamName}
          challengeRoster={challengeRoster}
          challengeRosterQuery={challengeRosterQuery}
          challengeRosterResults={challengeRosterResults}
          searchingChallengeRoster={searchingChallengeRoster}
          handleSearchChallengeRoster={handleSearchChallengeRoster}
          handleAddChallengeRosterPlayer={handleAddChallengeRosterPlayer}
          handleRemoveChallengeRosterPlayer={handleRemoveChallengeRosterPlayer}
          acceptingChallengeSubmitting={acceptingChallengeSubmitting}
          acceptChallengeError={acceptChallengeError}
          onSubmit={handleAcceptTeamChallenge}
          onClose={() => setShowAcceptChallengeModal(false)}
        />
      )}

      {/* MODAL: CHALLENGE CHAT */}
      {showChallengeChatModal && chattingChallenge && user && (
        <ChallengeChatModal
          challenge={chattingChallenge}
          messages={challengeMessages}
          currentUserId={user.id}
          chatInput={challengeChatInput}
          setChatInput={setChallengeChatInput}
          sendingChatMessage={sendingChallengeChatMessage}
          onSend={handleSendChallengeMessage}
          onClose={closeChallengeChat}
        />
      )}

      {/* MODAL: SUBMIT CHALLENGE RESULT */}
      {showSubmitChallengeResultModal && submittingResultChallenge && (
        <SubmitChallengeResultModal
          challenge={submittingResultChallenge}
          challengeResultWinnerId={challengeResultWinnerId}
          setChallengeResultWinnerId={setChallengeResultWinnerId}
          challengeResultProofFile={challengeResultProofFile}
          setChallengeResultProofFile={setChallengeResultProofFile}
          submittingChallengeResult={submittingChallengeResult}
          challengeResultSubmitError={challengeResultSubmitError}
          onSubmit={handleSubmitChallengeResult}
          onClose={() => setShowSubmitChallengeResultModal(false)}
        />
      )}

    </div>
  );
}

export default App;
