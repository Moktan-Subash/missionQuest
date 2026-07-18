import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { isSameNepalDay } from './dateUtils';
import './App.css';
import {
  GAME_OPTIONS,
  VALID_TABS,
  type Tab,
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
} from './types';
import Navbar from './components/Navbar';
import BackgroundDecoration from './components/BackgroundDecoration';
import ActiveMissionBanner from './components/ActiveMissionBanner';
import MissionsScreen from './screens/MissionsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import WalletScreen from './screens/WalletScreen';
import MembershipScreen from './screens/MembershipScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import TournamentsScreen from './screens/TournamentsScreen';
import AdminScreen from './screens/admin/AdminScreen';
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

  // Admin Dashboard: sub-navigation
  const [adminSection, setAdminSection] = useState<'missions' | 'submissions' | 'payouts' | 'deposits' | 'membership' | 'players' | 'gameids' | 'broadcast' | 'support' | 'feedback' | 'tournaments' | 'analytics'>('missions');
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

  // 2a. Leaderboard refetches whenever the selected period (all/week/month) changes.
  useEffect(() => {
    fetchLeaderboard(leaderboardPeriod);
  }, [leaderboardPeriod]);

  // 2b. Redirect root / unknown paths to the Missions tab. /terms and /privacy
  // are static pages outside the Tab system, so they're allowlisted here.
  useEffect(() => {
    if (STATIC_PAGES.includes(location.pathname)) return;
    if (!VALID_TABS.includes(location.pathname.slice(1) as Tab)) {
      navigate('/missions', { replace: true });
    }
  }, [location.pathname, navigate]);

  // 2c. Redirect away from account-only tabs (wallet/profile) if logged out,
  // and away from /admin if logged out or not an admin/moderator
  useEffect(() => {
    if (authLoading) return;
    const accountTabs: Tab[] = ['wallet', 'profile', 'notifications'];
    if (!user && accountTabs.includes(activeTab)) {
      navigate('/missions', { replace: true });
      return;
    }
    const isAdminOrMod = profile?.role === 'admin' || profile?.role === 'moderator';
    if (activeTab === 'admin' && (!user || !isAdminOrMod)) {
      navigate('/missions', { replace: true });
    }
  }, [user, profile, activeTab, authLoading, navigate]);

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

      // Check if phone needs verification
      if (!profileData.phone || !profileData.is_phone_verified) {
        setShowPhoneModal(true);
      }

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

      if (profileData.role === 'admin' || profileData.role === 'moderator') {
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
      setPhoneError(error.message);
      return;
    }

    setOtpSent(true);
    setOtpResendCountdown(60);
  };

  const handleResendOTP = async () => {
    setPhoneError('');
    const { error } = await supabase.auth.updateUser({ phone: toE164Phone(phoneInput) });
    if (error) {
      setPhoneError(error.message);
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
      setPhoneError(verifyError.message);
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

    if (!profile.phone || !profile.is_phone_verified) {
      setShowPhoneModal(true);
      return;
    }

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
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)));
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  };

  const handleMarkAllNotificationsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
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

  return (
    <div id="root">
      <BackgroundDecoration />

      {/* 1. TOP NAVBAR */}
      <Navbar user={user} profile={profile} wallet={wallet} handleLogout={handleLogout} setShowLoginModal={setShowLoginModal} />

      {/* 2. STATIC LEGAL PAGES (outside the Tab system) */}
      {STATIC_PAGES.includes(location.pathname) ? (
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
            {user && (profile?.role === 'admin' || profile?.role === 'moderator') && (
              <button onClick={() => handleTabClick('admin')} className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`} style={{ border: '1px solid var(--warning)', color: 'var(--warning)' }}>
                🛠️ Admin Control
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
              publicFeedback={publicFeedback}
              tournaments={tournaments}
              goToTournaments={() => handleTabClick('tournaments')}
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
            />
          )}

          {/* SCREEN: REAL ADMIN DASHBOARD */}
          {user && activeTab === 'admin' && (profile?.role === 'admin' || profile?.role === 'moderator') && (
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
              analyticsData={analyticsData}
              loadingAnalytics={loadingAnalytics}
              fetchAnalyticsData={fetchAnalyticsData}
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

      {/* 9. MODAL: ADD / EDIT MISSION (ADMIN) */}
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

      {/* 10. MODAL: PLAYER DETAIL (ADMIN) */}
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

      {/* 15. MODAL: ADMIN CREATE/EDIT TOURNAMENT */}
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
    </div>
  );
}

export default App;
