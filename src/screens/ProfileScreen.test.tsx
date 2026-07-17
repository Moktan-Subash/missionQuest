import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileScreen from './ProfileScreen';
import type { Profile } from '../types';

const baseProfile: Profile = {
  id: 'p1',
  display_name: 'Sujal',
  avatar_url: null,
  phone: null,
  is_phone_verified: false,
  role: 'player',
  kyc_status: 'unverified',
  membership_tier: 'gold',
  daily_mission_limit: 2,
  xp: 340,
  missions_completed: 12,
  is_banned: false,
  is_deactivated: false,
};

const user = { id: 'u1', email: 'sujal@example.com' };

const defaultProps = {
  user,
  profile: baseProfile,
  handleLogout: vi.fn(),
  setShowPhoneModal: vi.fn(),
  handleSubmitKycDocument: vi.fn(),
  gameIdLinks: [],
  gameIdForm: { game_type: 'Mobile Legends', in_game_id: '' },
  setGameIdForm: vi.fn(),
  gameIdScreenshotFile: null,
  setGameIdScreenshotFile: vi.fn(),
  linkingGameId: false,
  verifyingGameId: false,
  gameIdError: '',
  handleLinkGameId: vi.fn(),
  handleUnlinkGameId: vi.fn(),
  openSupportModal: vi.fn(),
  openFeedbackModal: vi.fn(),
  setShowDeleteAccountModal: vi.fn(),
};

describe('ProfileScreen', () => {
  it('renders profile name, email and stats', () => {
    render(<ProfileScreen {...defaultProps} />);
    expect(screen.getByText('Sujal')).toBeInTheDocument();
    expect(screen.getByText('sujal@example.com')).toBeInTheDocument();
    expect(screen.getByText(/340/)).toBeInTheDocument();
  });

  it('shows a Link Phone button when no phone is on file, and hides it once verified', () => {
    const { rerender } = render(<ProfileScreen {...defaultProps} />);
    expect(screen.getByRole('button', { name: /link phone/i })).toBeInTheDocument();

    rerender(<ProfileScreen {...defaultProps} profile={{ ...baseProfile, phone: '9800000000' }} />);
    expect(screen.queryByRole('button', { name: /link phone/i })).not.toBeInTheDocument();
    expect(screen.getByText(/9800000000/)).toBeInTheDocument();
  });

  it('calls setShowPhoneModal(true) when Link Phone is clicked', async () => {
    const setShowPhoneModal = vi.fn();
    const u = userEvent.setup();
    render(<ProfileScreen {...defaultProps} setShowPhoneModal={setShowPhoneModal} />);
    await u.click(screen.getByRole('button', { name: /link phone/i }));
    expect(setShowPhoneModal).toHaveBeenCalledWith(true);
  });

  it('shows the Submit ID Document button only while unverified', () => {
    render(<ProfileScreen {...defaultProps} profile={{ ...baseProfile, kyc_status: 'verified' }} />);
    expect(screen.queryByRole('button', { name: /submit id document/i })).not.toBeInTheDocument();
    expect(screen.getByText(/fully verified for payouts/i)).toBeInTheDocument();
  });

  it('calls handleSubmitKycDocument when Submit ID Document is clicked', async () => {
    const handleSubmitKycDocument = vi.fn();
    const u = userEvent.setup();
    render(<ProfileScreen {...defaultProps} handleSubmitKycDocument={handleSubmitKycDocument} />);
    await u.click(screen.getByRole('button', { name: /submit id document/i }));
    expect(handleSubmitKycDocument).toHaveBeenCalledTimes(1);
  });

  it('calls handleLogout when Log Out Account is clicked', async () => {
    const handleLogout = vi.fn();
    const u = userEvent.setup();
    render(<ProfileScreen {...defaultProps} handleLogout={handleLogout} />);
    await u.click(screen.getByRole('button', { name: /log out account/i }));
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('lists linked game IDs with their verification status', () => {
    render(
      <ProfileScreen
        {...defaultProps}
        gameIdLinks={[
          { id: 'g1', user_id: 'u1', game_type: 'PUBG Mobile', in_game_id: '5551234', status: 'verified', admin_notes: null, submitted_at: '2026-01-01', screenshot_url: null, verification_method: null, ai_extracted_id: null, ai_extracted_nickname: null },
        ]}
      />
    );
    expect(screen.getByText('PUBG Mobile')).toBeInTheDocument();
    expect(screen.getByText('5551234')).toBeInTheDocument();
    expect(screen.getByText('verified')).toBeInTheDocument();
  });

  it('calls handleLinkGameId when the game ID form is submitted', () => {
    const handleLinkGameId = vi.fn((e) => e.preventDefault());
    render(<ProfileScreen {...defaultProps} handleLinkGameId={handleLinkGameId} />);
    const form = screen.getByRole('button', { name: /link id/i }).closest('form')!;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(handleLinkGameId).toHaveBeenCalledTimes(1);
  });
});
