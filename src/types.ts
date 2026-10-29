export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_phone_verified: boolean;
  role: 'player' | 'admin' | 'moderator';
  kyc_status: 'unverified' | 'pending' | 'verified' | 'suspended';
  membership_tier: 'free' | 'bronze' | 'gold';
  daily_mission_limit: number;
  xp: number;
  missions_completed: number;
  is_banned: boolean;
  is_deactivated: boolean;
}

export interface Wallet {
  id: string;
  balance: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  game: string;
  reward_amount: number;
  xp_reward: number;
  rules: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  is_active: boolean;
  // When true, proof submission also accepts a player-hosted video link
  // (YouTube/Drive/etc, never uploaded to or compressed by us) alongside
  // the required screenshots. When false, screenshots only.
  allows_video_link?: boolean;
}

export interface MissionAttempt {
  id: string;
  user_id: string;
  mission_id: string;
  started_at: string;
  expires_at: string;
  // Up to 3 screenshot URLs, always required regardless of allows_video_link.
  screenshot_urls: string[];
  // Player-hosted video link + optional "proof appears around" marker --
  // only used/required when mission.allows_video_link is true.
  video_url: string | null;
  video_timestamp: string | null;
  status: 'active' | 'pending_review' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  rejection_reason: string | null;
  submitted_at: string | null;
  is_paid_entry: boolean;
  mission?: Mission;
  profile?: Profile;
}

export interface PayoutRequest {
  id: string;
  user_id: string;
  amount: number;
  payment_method: 'esewa' | 'paypal';
  payment_details: string;
  status: 'pending' | 'processed' | 'cancelled' | 'rejected';
  admin_notes: string | null;
  transaction_id: string | null;
  requested_at: string;
  profile?: Profile;
}

export interface DepositRequest {
  id: string;
  user_id: string;
  amount: number;
  payment_method: 'esewa' | 'paypal';
  reference_note: string;
  proof_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  requested_at: string;
  profile?: Profile;
}

export interface MembershipRequest {
  id: string;
  user_id: string;
  tier: 'bronze' | 'gold';
  amount: number;
  payment_method: 'esewa' | 'paypal';
  reference_note: string;
  proof_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  requested_at: string;
  profile?: Profile;
}

export interface GameIdLink {
  id: string;
  user_id: string;
  game_type: string;
  in_game_id: string;
  status: 'pending' | 'verified' | 'rejected';
  admin_notes: string | null;
  submitted_at: string;
  screenshot_url: string | null;
  verification_method: 'manual' | 'ai_vision' | null;
  ai_extracted_id: string | null;
  ai_extracted_nickname: string | null;
  profile?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: 'broadcast' | 'mission' | 'payout' | 'deposit' | 'membership' | 'tournament' | 'game_id' | 'support' | 'admin' | 'account' | 'challenge'
    | 'admin_gameid' | 'admin_mission' | 'admin_deposit' | 'admin_payout' | 'admin_membership' | 'admin_support' | 'admin_challenge';
  related_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  issue_type: string;
  description: string;
  contact_email: string;
  status: 'open' | 'in_progress' | 'resolved';
  admin_notes: string | null;
  created_at: string;
  profile?: Profile;
}

export const ISSUE_TYPES = ['Payment issue', 'Mission dispute', 'Account access', 'Bug report', 'Other'];

export interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: Profile;
}

export const GAME_OPTIONS = ['Mobile Legends', 'PUBG Mobile', 'Call of Duty Mobile', 'League of Legends', 'Free Fire', 'Clash Royale'];

export interface Tournament {
  id: string;
  game_type: 'MLBB' | 'PUBG' | 'FREEFIRE' | 'COD' | 'CR';
  title: string;
  description: string | null;
  prize_pool: number;
  xp_reward: number;
  min_participants: number;
  registration_unit: 'team' | 'player';
  team_size: number;
  bracket_style: 'elimination' | 'battle_royale';
  status: 'upcoming' | 'registration_open' | 'ongoing' | 'completed' | 'cancelled';
  start_date: string | null;
  registration_deadline: string | null;
  livestream_url: string | null;
  rules: string | null;
  banner_url: string | null;
  registered_count: number;
  winner_registration_id: string | null;
  completed_at: string | null;
  winner?: { team_name: string | null; profile?: { display_name: string | null } | null } | null;
  created_by: string | null;
  created_at: string;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  team_name: string | null;
  registered_at: string;
  profile?: Profile;
}

export interface TournamentTeamMember {
  id: string;
  tournament_id: string;
  registration_id: string;
  user_id: string;
  is_captain: boolean;
  added_at: string;
  profile?: Profile;
}

export interface VerifiedPlayer {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  in_game_id: string;
}

export interface TournamentMatchParticipant {
  id: string;
  match_id: string;
  registration_id: string;
  checked_in_at: string | null;
  result_placement: number | null;
  result_points: number | null;
  registration?: TournamentRegistration;
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round: number;
  label: string;
  match_type: 'bracket' | 'lobby';
  status: 'scheduled' | 'checkin' | 'ready' | 'in_progress' | 'awaiting_review' | 'completed';
  scheduled_time: string | null;
  best_of: number;
  winner_registration_id: string | null;
  proposed_winner_registration_id: string | null;
  result_proof_url: string | null;
  result_submitted_by: string | null;
  result_submitted_at: string | null;
  checkin_reminder_sent_at: string | null;
  created_at: string;
  participants?: TournamentMatchParticipant[];
}

export interface TournamentMatchMessage {
  id: string;
  match_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
  profile?: Profile;
}

// Mirrors public.tournament_game_id_type() in schema.sql -- keep in sync.
export const TOURNAMENT_GAME_ID_TYPE: Record<Tournament['game_type'], string> = {
  MLBB: 'Mobile Legends',
  PUBG: 'PUBG Mobile',
  FREEFIRE: 'Free Fire',
  COD: 'Call of Duty Mobile',
  CR: 'Clash Royale',
};

export interface MissionEarningBreakdown {
  title: string;
  total: number;
}

export interface AnalyticsData {
  totalDeposits: number;
  totalMembershipRevenue: number;
  totalPayouts: number;
  totalMissionRewardsPaid: number;
  missionBreakdown: MissionEarningBreakdown[];
}

// Row shape returned by public.get_player_completed_missions -- the safe,
// already-approved-only subset of another player's mission history, shown
// on the leaderboard's player detail view.
export interface PlayerCompletedMission {
  mission_title: string;
  game: string;
  reward_amount: number;
  xp_reward: number;
  submitted_at: string | null;
}

export interface ChallengeTeamMember {
  id: string;
  challenge_id: string;
  side: 'creator' | 'acceptor';
  user_id: string;
  is_captain: boolean;
  added_at: string;
  profile?: Profile;
}

export interface ChallengeMessage {
  id: string;
  challenge_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
  profile?: Profile;
}

export interface Challenge {
  id: string;
  game_type: Tournament['game_type'];
  mode: 'solo' | 'team';
  team_size: number | null;
  stake_amount: number;
  status: 'open' | 'accepted' | 'awaiting_review' | 'completed' | 'cancelled' | 'expired';
  creator_user_id: string;
  creator_team_name: string | null;
  acceptor_user_id: string | null;
  acceptor_team_name: string | null;
  proposed_winner_user_id: string | null;
  result_proof_url: string | null;
  result_submitted_by: string | null;
  result_submitted_at: string | null;
  winner_user_id: string | null;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  creator_profile?: Profile;
  acceptor_profile?: Profile;
  team_members?: ChallengeTeamMember[];
}

// 'admin' is intentionally not a Tab -- the admin dashboard lives at the
// standalone /admin route (see App.tsx), never inside the player tab system.
export type Tab = 'missions' | 'leaderboard' | 'wallet' | 'membership' | 'profile' | 'notifications' | 'tournaments' | 'challenges';
export const VALID_TABS: Tab[] = ['missions', 'leaderboard', 'wallet', 'membership', 'profile', 'notifications', 'tournaments', 'challenges'];

// Admin dashboard sub-sections, routed at /admin/:section (see App.tsx).
export type AdminSection = 'missions' | 'submissions' | 'payouts' | 'deposits' | 'membership' | 'players' | 'gameids' | 'broadcast' | 'support' | 'feedback' | 'tournaments' | 'challenges' | 'analytics';
export const ADMIN_SECTIONS: AdminSection[] = ['missions', 'submissions', 'payouts', 'deposits', 'membership', 'players', 'gameids', 'broadcast', 'support', 'feedback', 'tournaments', 'challenges', 'analytics'];
