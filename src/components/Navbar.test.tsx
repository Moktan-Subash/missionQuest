import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';
import type { Profile, Wallet } from '../types';

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

const wallet: Wallet = { id: 'w1', balance: 1250 };

describe('Navbar', () => {
  it('shows a Sign In button when logged out', () => {
    render(
      <Navbar
        user={null}
        profile={null}
        wallet={null}
        handleLogout={vi.fn()}
        setShowLoginModal={vi.fn()}
        handleTabClick={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  it('calls setShowLoginModal(true) when Sign In is clicked', async () => {
    const setShowLoginModal = vi.fn();
    const user = userEvent.setup();
    render(
      <Navbar
        user={null}
        profile={null}
        wallet={null}
        handleLogout={vi.fn()}
        setShowLoginModal={setShowLoginModal}
        handleTabClick={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(setShowLoginModal).toHaveBeenCalledWith(true);
  });

  it('shows balance, XP and a Logout button when logged in with a profile', () => {
    render(
      <Navbar
        user={{ id: 'u1' }}
        profile={profile}
        wallet={wallet}
        handleLogout={vi.fn()}
        setShowLoginModal={vi.fn()}
        handleTabClick={vi.fn()}
      />
    );
    expect(screen.getByText(/Rs\. 1250/)).toBeInTheDocument();
    expect(screen.getByText(/340 XP/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('calls handleLogout when Logout is clicked', async () => {
    const handleLogout = vi.fn();
    const user = userEvent.setup();
    render(
      <Navbar
        user={{ id: 'u1' }}
        profile={profile}
        wallet={wallet}
        handleLogout={handleLogout}
        setShowLoginModal={vi.fn()}
        handleTabClick={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('hides balance/XP pills when logged in but profile has not loaded yet', () => {
    render(
      <Navbar
        user={{ id: 'u1' }}
        profile={null}
        wallet={null}
        handleLogout={vi.fn()}
        setShowLoginModal={vi.fn()}
        handleTabClick={vi.fn()}
      />
    );
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('navigates to the missions tab when the logo is clicked', async () => {
    const handleTabClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Navbar
        user={null}
        profile={null}
        wallet={null}
        handleLogout={vi.fn()}
        setShowLoginModal={vi.fn()}
        handleTabClick={handleTabClick}
      />
    );
    await user.click(screen.getByText('MISSIONQUEST'));
    expect(handleTabClick).toHaveBeenCalledWith('missions');
  });
});
