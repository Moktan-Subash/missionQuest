import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MissionsScreen from './MissionsScreen';
import type { Mission, MissionAttempt, Profile, Wallet } from '../types';

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
  duration_days: 3,
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
  gameFilter: 'ALL' as const,
  setGameFilter: vi.fn(),
  filteredMissions: [mission],
  expandedMissionId: null,
  setExpandedMissionId: vi.fn(),
  attempts: [] as MissionAttempt[],
  missionFees: { Easy: 0, Medium: 10, Hard: 20, Expert: 30 },
  activeAttempt: null,
  handleStartMission: vi.fn(),
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

  it('expands mission details when "Show rules & details..." is clicked', async () => {
    const setExpandedMissionId = vi.fn();
    const user = userEvent.setup();
    render(<MissionsScreen {...baseProps} setExpandedMissionId={setExpandedMissionId} />);
    await user.click(screen.getByRole('button', { name: /show rules & details/i }));
    expect(setExpandedMissionId).toHaveBeenCalledWith('m1');
  });

  it('calls handleStartMission with the mission when Accept Mission is clicked', async () => {
    const handleStartMission = vi.fn();
    const user = userEvent.setup();
    render(<MissionsScreen {...baseProps} handleStartMission={handleStartMission} />);
    await user.click(screen.getByRole('button', { name: /accept mission/i }));
    expect(handleStartMission).toHaveBeenCalledWith(mission);
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
});
