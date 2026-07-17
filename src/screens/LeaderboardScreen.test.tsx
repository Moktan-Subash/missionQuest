import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeaderboardScreen from './LeaderboardScreen';

const players = [
  { id: 'p1', display_name: 'Sujal', avatar_url: null, xp: 900, missions_completed: 10 },
  { id: 'p2', display_name: 'Anish', avatar_url: null, xp: 700, missions_completed: 8 },
];

const defaultProps = {
  leaderboard: players,
  user: null as unknown,
  leaderboardPeriod: 'all' as const,
  setLeaderboardPeriod: vi.fn(),
};

describe('LeaderboardScreen', () => {
  it('renders each player with rank, name, quests done and XP', () => {
    render(<LeaderboardScreen {...defaultProps} />);
    expect(screen.getByText('Sujal')).toBeInTheDocument();
    expect(screen.getByText('Anish')).toBeInTheDocument();
    expect(screen.getByText('900 XP')).toBeInTheDocument();
    expect(screen.getByText('700 XP')).toBeInTheDocument();
  });

  it('shows an empty-state message when the leaderboard is empty', () => {
    render(<LeaderboardScreen {...defaultProps} leaderboard={[]} />);
    expect(screen.getByText('Leaderboard (Top Players)')).toBeInTheDocument();
    expect(screen.getByText(/No completed quests/)).toBeInTheDocument();
  });

  it('marks the current user\'s row with a "You" badge', () => {
    render(<LeaderboardScreen {...defaultProps} user={{ id: 'p2' }} />);
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('does not show a "You" badge for a guest', () => {
    render(<LeaderboardScreen {...defaultProps} />);
    expect(screen.queryByText('You')).not.toBeInTheDocument();
  });

  it('calls setLeaderboardPeriod when a period button is clicked', async () => {
    const setLeaderboardPeriod = vi.fn();
    const user = userEvent.setup();
    render(<LeaderboardScreen {...defaultProps} setLeaderboardPeriod={setLeaderboardPeriod} />);
    await user.click(screen.getByRole('button', { name: 'Weekly' }));
    expect(setLeaderboardPeriod).toHaveBeenCalledWith('week');
    await user.click(screen.getByRole('button', { name: 'Monthly' }));
    expect(setLeaderboardPeriod).toHaveBeenCalledWith('month');
  });

  it('highlights the active period button', () => {
    render(<LeaderboardScreen {...defaultProps} leaderboardPeriod="week" />);
    expect(screen.getByRole('button', { name: 'Weekly' }).className).toContain('active');
    expect(screen.getByRole('button', { name: 'All-Time' }).className).not.toContain('active');
  });
});
