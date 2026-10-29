import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MissionsScreen from './MissionsScreen';
import type { GameIdLink, Mission, MissionAttempt, Profile, Wallet } from '../types';

const mission: Mission = {
  id: 'm1',
  title: 'Savage Dominator',
  description: 'Get a Savage in ranked.',
  game: 'MLBB',
  reward_amount: 100,
  xp_reward: 50,
  rules: 'Screenshot of the kill feed.',
  difficulty: 'Hard',
  is_active: true,
};

const profile: Profile = {
  id: 'p1',
  display_name: 'Sujal',
  avatar_url: null,
  phone: null,
  is_phone_verified: false,
  role: 'player',
  kyc_status: 'unverified',
  membership_tier: 'free',
  daily_mission_limit: 2,
  xp: 340,
  missions_completed: 5,
  is_banned: false,
  is_deactivated: false,
};

const wallet: Wallet = { id: 'w1', balance: 500 };

const approvedAttempt: MissionAttempt = {
  id: 'att1',
  user_id: 'u1',
  mission_id: 'm1',
  started_at: '2026-07-10T00:00:00.000Z',
  expires_at: '2026-07-13T00:00:00.000Z',
  screenshot_urls: ['https://example.com/proof.png'],
  video_url: null,
  video_timestamp: null,
  status: 'approved',
  rejection_reason: null,
  submitted_at: '2026-07-12T00:00:00.000Z',
  is_paid_entry: false,
  mission,
};

const baseProps = {
  user: null as unknown,
  profile: null as Profile | null,
  wallet: null as Wallet | null,
  platformSettings: {} as Record<string, string>,
  gameFilter: 'ALL' as const,
  setGameFilter: vi.fn(),
  filteredMissions: [mission],
  expandedMissionId: null,
  setExpandedMissionId: vi.fn(),
  attempts: [] as MissionAttempt[],
  missionFees: { Easy: 0, Medium: 10, Hard: 20, Expert: 30 },
  activeAttempt: null,
  gameIdLinks: [] as GameIdLink[],
  handleStartMission: vi.fn(),
};

const verifiedMlbbLink: GameIdLink = {
  id: 'g1',
  user_id: 'u1',
  game_type: 'Mobile Legends',
  in_game_id: '12345',
  status: 'verified',
  admin_notes: null,
  submitted_at: '2026-07-10T00:00:00.000Z',
  screenshot_url: null,
  verification_method: null,
  ai_extracted_id: null,
  ai_extracted_nickname: null,
};

describe('MissionsScreen', () => {
  it('hides the welcome header for guests', () => {
    render(<MissionsScreen {...baseProps} />);
    expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument();
  });

  it('shows a welcome header with balance and XP for logged-in users', () => {
    render(
      <MissionsScreen
        {...baseProps}
        user={{ id: 'u1' }}
        profile={profile}
        wallet={wallet}
      />
    );
    expect(screen.getByText(/Welcome back, Sujal!/)).toBeInTheDocument();
    expect(screen.getByText(/Rs\. 500/)).toBeInTheDocument();
  });

  it('shows the empty state when there are no missions to show', () => {
    render(<MissionsScreen {...baseProps} filteredMissions={[]} />);
    expect(screen.getByText(/No missions available right now/)).toBeInTheDocument();
  });

  it('calls setGameFilter when a filter chip is clicked', async () => {
    const setGameFilter = vi.fn();
    const user = userEvent.setup();
    render(<MissionsScreen {...baseProps} setGameFilter={setGameFilter} />);
    await user.click(screen.getByRole('button', { name: 'MLBB' }));
    expect(setGameFilter).toHaveBeenCalledWith('MLBB');
  });

  it('expands mission details when the card is clicked', async () => {
    const setExpandedMissionId = vi.fn();
    const user = userEvent.setup();
    render(<MissionsScreen {...baseProps} setExpandedMissionId={setExpandedMissionId} />);
    await user.click(screen.getByText('Savage Dominator'));
    expect(setExpandedMissionId).toHaveBeenCalledWith('m1');
  });

  it('collapses mission details when an already-expanded card is clicked again', async () => {
    const setExpandedMissionId = vi.fn();
    const user = userEvent.setup();
    render(<MissionsScreen {...baseProps} expandedMissionId="m1" setExpandedMissionId={setExpandedMissionId} />);
    await user.click(screen.getByText('Savage Dominator'));
    expect(setExpandedMissionId).toHaveBeenCalledWith(null);
  });

  it('does not toggle the expanded state when Accept Mission is clicked', async () => {
    const setExpandedMissionId = vi.fn();
    const user = userEvent.setup();
    render(<MissionsScreen {...baseProps} setExpandedMissionId={setExpandedMissionId} />);
    await user.click(screen.getByRole('button', { name: /accept mission/i }));
    expect(setExpandedMissionId).not.toHaveBeenCalled();
  });

  it('calls handleStartMission with the mission when Accept Mission is clicked', async () => {
    const handleStartMission = vi.fn();
    const user = userEvent.setup();
    render(<MissionsScreen {...baseProps} handleStartMission={handleStartMission} />);
    await user.click(screen.getByRole('button', { name: /accept mission/i }));
    expect(handleStartMission).toHaveBeenCalledWith(mission);
  });

  it('locks the mission for a logged-in player without a verified ID for that game, but keeps it clickable', async () => {
    const handleStartMission = vi.fn();
    const user = userEvent.setup();
    render(
      <MissionsScreen
        {...baseProps}
        user={{ id: 'u1' }}
        profile={profile}
        filteredMissions={[{ ...mission, game: 'Mobile Legends' }]}
        gameIdLinks={[{ ...verifiedMlbbLink, game_type: 'PUBG Mobile' }]}
        handleStartMission={handleStartMission}
      />
    );
    await user.click(screen.getByRole('button', { name: /verify game id to play/i }));
    expect(handleStartMission).toHaveBeenCalled();
  });

  it('shows Accept Mission once the player has a verified ID for that game', () => {
    render(
      <MissionsScreen
        {...baseProps}
        user={{ id: 'u1' }}
        profile={profile}
        filteredMissions={[{ ...mission, game: 'Mobile Legends' }]}
        gameIdLinks={[verifiedMlbbLink]}
      />
    );
    expect(screen.getByRole('button', { name: /accept mission/i })).toBeInTheDocument();
  });

  it('renders past submissions for a logged-in user', () => {
    render(
      <MissionsScreen
        {...baseProps}
        user={{ id: 'u1' }}
        profile={profile}
        wallet={wallet}
        attempts={[approvedAttempt]}
      />
    );
    expect(screen.getByText('Your Submissions')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
    expect(screen.getByText(/\+Rs\. 100/)).toBeInTheDocument();
  });

  it('hides the How to Play section in production when no tutorial video is configured', () => {
    // The dev-only placeholder fallback is intentionally active under Vitest
    // (import.meta.env.DEV is true there too) -- stub it to false to assert
    // the actual guarantee that matters: real players never see a placeholder.
    vi.stubEnv('DEV', false);
    render(<MissionsScreen {...baseProps} />);
    expect(screen.queryByText('New Player Guide')).not.toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('shows the dev-only placeholder video when no tutorial video is configured locally', () => {
    vi.stubEnv('DEV', true);
    render(<MissionsScreen {...baseProps} />);
    expect(screen.getByText('New Player Guide')).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('embeds the tutorial video once platform_settings.tutorial_video_url is set', () => {
    render(
      <MissionsScreen
        {...baseProps}
        platformSettings={{ tutorial_video_url: 'https://youtu.be/dQw4w9WgXcQ' }}
      />
    );
    expect(screen.getByText('New Player Guide')).toBeInTheDocument();
    expect(screen.getByText('Get paid.')).toBeInTheDocument();
    expect(screen.getByTitle('How to play MissionQuest')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    );
  });
});
