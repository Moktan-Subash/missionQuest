import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminSubmissions from './AdminSubmissions';
import type { Mission, MissionAttempt, Profile } from '../../types';

const mission: Mission = {
  id: 'm1',
  title: 'Savage Dominator',
  description: 'Get a Savage in ranked.',
  game: 'MLBB',
  reward_amount: 150,
  xp_reward: 50,
  rules: 'Screenshot of the kill feed.',
  difficulty: 'Hard',
  is_active: true,
  duration_days: 3,
};

const profile: Profile = {
  id: 'u1',
  display_name: 'Sujal',
  avatar_url: null,
  phone: '9800000000',
  is_phone_verified: true,
  role: 'player',
  kyc_status: 'verified',
  membership_tier: 'gold',
  daily_mission_limit: 2,
  xp: 500,
  missions_completed: 9,
  is_banned: false,
  is_deactivated: false,
};

const activeAttempt: MissionAttempt = {
  id: 'att1',
  user_id: 'u1',
  mission_id: 'm1',
  started_at: '2026-07-14T00:00:00.000Z',
  expires_at: '2026-07-17T00:00:00.000Z',
  screenshot_url: null,
  status: 'active',
  rejection_reason: null,
  submitted_at: null,
  is_paid_entry: false,
  mission,
  profile,
};

const pendingAttempt: MissionAttempt = {
  ...activeAttempt,
  id: 'att2',
  status: 'pending_review',
  screenshot_url: 'https://example.com/proof.png',
  submitted_at: '2026-07-14T02:00:00.000Z',
};

const baseProps = {
  allActiveAttempts: [] as MissionAttempt[],
  allPendingSubmissions: [] as MissionAttempt[],
  allAttempts: [] as MissionAttempt[],
  attemptFilter: 'all' as const,
  setAttemptFilter: vi.fn(),
  adminRejectionReason: {} as { [key: string]: string },
  setAdminRejectionReason: vi.fn(),
  handleAdminApproveSubmission: vi.fn(),
  handleAdminRejectSubmission: vi.fn(),
  formatCountdown: vi.fn(() => '02:00:00'),
};

describe('AdminSubmissions', () => {
  it('shows empty-state copy for all three sections when there is no data', () => {
    render(<AdminSubmissions {...baseProps} />);
    expect(screen.getByText(/No players currently have an active mission running/)).toBeInTheDocument();
    expect(screen.getByText(/No submissions currently pending review/)).toBeInTheDocument();
    expect(screen.getByText(/No mission activity in this category/)).toBeInTheDocument();
  });

  it('lists an in-progress attempt with its countdown', () => {
    render(<AdminSubmissions {...baseProps} allActiveAttempts={[activeAttempt]} />);
    expect(screen.getByText('Sujal')).toBeInTheDocument();
    expect(screen.getByText('Savage Dominator')).toBeInTheDocument();
    expect(screen.getByText(/02:00:00/)).toBeInTheDocument();
  });

  it('calls handleAdminApproveSubmission and handleAdminRejectSubmission for a pending screenshot', async () => {
    const handleAdminApproveSubmission = vi.fn();
    const handleAdminRejectSubmission = vi.fn();
    const user = userEvent.setup();
    render(
      <AdminSubmissions
        {...baseProps}
        allPendingSubmissions={[pendingAttempt]}
        handleAdminApproveSubmission={handleAdminApproveSubmission}
        handleAdminRejectSubmission={handleAdminRejectSubmission}
      />
    );
    await user.click(screen.getByRole('button', { name: /approve & pay/i }));
    expect(handleAdminApproveSubmission).toHaveBeenCalledWith('att2');

    await user.click(screen.getByRole('button', { name: /^reject$/i }));
    expect(handleAdminRejectSubmission).toHaveBeenCalledWith('att2');
  });

  it('updates the rejection reason text for the right submission', async () => {
    const setAdminRejectionReason = vi.fn();
    const user = userEvent.setup();
    render(
      <AdminSubmissions
        {...baseProps}
        allPendingSubmissions={[pendingAttempt]}
        setAdminRejectionReason={setAdminRejectionReason}
      />
    );
    await user.type(screen.getByPlaceholderText('Rejection reason...'), 'x');
    expect(setAdminRejectionReason).toHaveBeenCalledWith({ att2: 'x' });
  });

  it('calls setAttemptFilter when a status chip is clicked', async () => {
    const setAttemptFilter = vi.fn();
    const user = userEvent.setup();
    render(
      <AdminSubmissions
        {...baseProps}
        allAttempts={[activeAttempt]}
        setAttemptFilter={setAttemptFilter}
      />
    );
    await user.click(screen.getByRole('button', { name: /^approved$/i }));
    expect(setAttemptFilter).toHaveBeenCalledWith('approved');
  });

  it('filters the activity feed by status', () => {
    const rejectedAttempt: MissionAttempt = { ...activeAttempt, id: 'att3', status: 'rejected', rejection_reason: 'Blurry photo' };
    render(
      <AdminSubmissions
        {...baseProps}
        allAttempts={[activeAttempt, rejectedAttempt]}
        attemptFilter="rejected"
      />
    );
    expect(screen.getByText('Blurry photo')).toBeInTheDocument();
    expect(screen.queryByText(/⏱️ In Progress/)).not.toBeInTheDocument();
  });
});
