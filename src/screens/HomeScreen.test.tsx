import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomeScreen from './HomeScreen';
import type { Feedback, Mission, Profile } from '../types';

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

const baseProps = {
  publicFeedback: [] as Feedback[],
  filteredMissions: [mission] as Mission[],
  gameFilter: 'ALL' as const,
  setGameFilter: vi.fn(),
  goToMissions: vi.fn(),
};

describe('HomeScreen', () => {
  it('shows the marketing hero regardless of login state', () => {
    render(<HomeScreen {...baseProps} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gaming Missions.RealRewards.');
  });

  it('shows featured missions and calls goToMissions when a card or the CTA is clicked', async () => {
    const goToMissions = vi.fn();
    const user = userEvent.setup();
    render(<HomeScreen {...baseProps} goToMissions={goToMissions} />);

    expect(screen.getByText('Savage Dominator')).toBeInTheDocument();
    await user.click(screen.getByText('Savage Dominator'));
    expect(goToMissions).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /view all missions/i }));
    expect(goToMissions).toHaveBeenCalledTimes(2);
  });

  it('calls setGameFilter when a game filter chip is clicked', async () => {
    const setGameFilter = vi.fn();
    const user = userEvent.setup();
    render(<HomeScreen {...baseProps} setGameFilter={setGameFilter} />);
    await user.click(screen.getByRole('button', { name: 'MLBB' }));
    expect(setGameFilter).toHaveBeenCalledWith('MLBB');
  });

  it('shows player reviews with an average rating when feedback exists, and hides the section when empty', () => {
    const { rerender } = render(<HomeScreen {...baseProps} />);
    expect(screen.queryByText(/Player Reviews/)).not.toBeInTheDocument();

    rerender(
      <HomeScreen
        {...baseProps}
        publicFeedback={[
          { id: 'f1', user_id: 'u1', rating: 5, comment: 'Great app!', created_at: '2026-01-01', profile: { ...profile, display_name: 'Sujal' } },
          { id: 'f2', user_id: 'u2', rating: 3, comment: null, created_at: '2026-01-02', profile: { ...profile, display_name: 'Anish' } },
        ]}
      />
    );
    expect(screen.getByText(/Player Reviews/)).toBeInTheDocument();
    expect(screen.getByText('4.0')).toBeInTheDocument();
    expect(screen.getByText('Sujal')).toBeInTheDocument();
    expect(screen.getByText('Great app!')).toBeInTheDocument();
    expect(screen.getByText('Anish')).toBeInTheDocument();
  });
});
