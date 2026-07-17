import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPlayers from './AdminPlayers';
import type { Profile } from '../../types';

const makePlayer = (overrides: Partial<Profile>): Profile => ({
  id: 'p1',
  display_name: 'Sujal',
  avatar_url: null,
  phone: null,
  is_phone_verified: false,
  role: 'player',
  kyc_status: 'unverified',
  membership_tier: 'free',
  daily_mission_limit: 2,
  xp: 100,
  missions_completed: 3,
  is_banned: false,
  is_deactivated: false,
  ...overrides,
});

const players = [
  makePlayer({ id: 'p1', display_name: 'Sujal' }),
  makePlayer({ id: 'p2', display_name: 'Anish', is_banned: true }),
];

describe('AdminPlayers', () => {
  it('shows "No players yet." when the list is empty', () => {
    render(
      <AdminPlayers
        adminPlayers={[]}
        playerSearch=""
        setPlayerSearch={vi.fn()}
        openPlayerDetail={vi.fn()}
        handleTogglePlayerBan={vi.fn()}
        handleToggleAccountDeactivation={vi.fn()}
        user={{ id: 'admin1' }}
      />
    );
    expect(screen.getByText('No players yet.')).toBeInTheDocument();
  });

  it('renders each player with a Banned tag when applicable', () => {
    render(
      <AdminPlayers
        adminPlayers={players}
        playerSearch=""
        setPlayerSearch={vi.fn()}
        openPlayerDetail={vi.fn()}
        handleTogglePlayerBan={vi.fn()}
        handleToggleAccountDeactivation={vi.fn()}
        user={{ id: 'admin1' }}
      />
    );
    expect(screen.getByText('Sujal')).toBeInTheDocument();
    expect(screen.getByText('Anish')).toBeInTheDocument();
    expect(screen.getByText('Banned')).toBeInTheDocument();
  });

  it('calls setPlayerSearch as the search box is typed into', async () => {
    const setPlayerSearch = vi.fn();
    const user = userEvent.setup();
    render(
      <AdminPlayers
        adminPlayers={players}
        playerSearch=""
        setPlayerSearch={setPlayerSearch}
        openPlayerDetail={vi.fn()}
        handleTogglePlayerBan={vi.fn()}
        handleToggleAccountDeactivation={vi.fn()}
        user={{ id: 'admin1' }}
      />
    );
    await user.type(screen.getByPlaceholderText('Search by name...'), 'A');
    expect(setPlayerSearch).toHaveBeenCalledWith('A');
  });

  it('calls openPlayerDetail and handleTogglePlayerBan for a given player', async () => {
    const openPlayerDetail = vi.fn();
    const handleTogglePlayerBan = vi.fn();
    const user = userEvent.setup();
    render(
      <AdminPlayers
        adminPlayers={players}
        playerSearch=""
        setPlayerSearch={vi.fn()}
        openPlayerDetail={openPlayerDetail}
        handleTogglePlayerBan={handleTogglePlayerBan}
        handleToggleAccountDeactivation={vi.fn()}
        user={{ id: 'admin1' }}
      />
    );
    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    await user.click(viewButtons[0]);
    expect(openPlayerDetail).toHaveBeenCalledWith(players[0]);

    const banButton = screen.getByRole('button', { name: /^ban$/i });
    await user.click(banButton);
    expect(handleTogglePlayerBan).toHaveBeenCalledWith(players[0]);
  });

  it('disables the ban button for the admin\'s own row', () => {
    render(
      <AdminPlayers
        adminPlayers={players}
        playerSearch=""
        setPlayerSearch={vi.fn()}
        openPlayerDetail={vi.fn()}
        handleTogglePlayerBan={vi.fn()}
        handleToggleAccountDeactivation={vi.fn()}
        user={{ id: 'p1' }}
      />
    );
    expect(screen.getByRole('button', { name: /^ban$/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^unban$/i })).toBeEnabled();
  });

  it('shows a Deactivated tag and calls handleToggleAccountDeactivation for a given player', async () => {
    const handleToggleAccountDeactivation = vi.fn();
    const user = userEvent.setup();
    const deactivatedPlayers = [
      makePlayer({ id: 'p1', display_name: 'Sujal' }),
      makePlayer({ id: 'p2', display_name: 'Anish', is_deactivated: true }),
    ];
    render(
      <AdminPlayers
        adminPlayers={deactivatedPlayers}
        playerSearch=""
        setPlayerSearch={vi.fn()}
        openPlayerDetail={vi.fn()}
        handleTogglePlayerBan={vi.fn()}
        handleToggleAccountDeactivation={handleToggleAccountDeactivation}
        user={{ id: 'admin1' }}
      />
    );
    expect(screen.getByText('Deactivated')).toBeInTheDocument();

    const deactivateButton = screen.getByRole('button', { name: /^deactivate$/i });
    await user.click(deactivateButton);
    expect(handleToggleAccountDeactivation).toHaveBeenCalledWith(deactivatedPlayers[0]);
  });
});
