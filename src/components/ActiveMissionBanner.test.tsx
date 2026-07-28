import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActiveMissionBanner from './ActiveMissionBanner';
import type { Mission, MissionAttempt } from '../types';
import type { FormEvent } from 'react';

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

const videoMission: Mission = { ...mission, id: 'm2', allows_video_link: true };

const activeAttempt: MissionAttempt = {
  id: 'att1',
  user_id: 'u1',
  mission_id: 'm1',
  started_at: '2026-07-14T00:00:00.000Z',
  expires_at: '2026-07-17T00:00:00.000Z',
  screenshot_urls: [],
  video_url: null,
  video_timestamp: null,
  status: 'active',
  rejection_reason: null,
  submitted_at: null,
  is_paid_entry: false,
  mission,
};

const videoAttempt: MissionAttempt = { ...activeAttempt, id: 'att2', mission_id: 'm2', mission: videoMission };

const baseProps = {
  user: { id: 'u1' },
  activeAttempt,
  timeRemaining: '12:34:56',
  proofFiles: [] as File[],
  setProofFiles: vi.fn(),
  proofVideoUrl: '',
  setProofVideoUrl: vi.fn(),
  proofVideoTimestamp: '',
  setProofVideoTimestamp: vi.fn(),
  submittingProof: false,
  handleProofSubmit: vi.fn(),
  handleCancelMission: vi.fn(),
};

describe('ActiveMissionBanner', () => {
  it('renders nothing when there is no active attempt', () => {
    const { container } = render(<ActiveMissionBanner {...baseProps} activeAttempt={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there is no logged-in user', () => {
    const { container } = render(<ActiveMissionBanner {...baseProps} user={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows mission title, description and the countdown when active', () => {
    render(<ActiveMissionBanner {...baseProps} />);
    expect(screen.getByText(/Savage Dominator/)).toBeInTheDocument();
    expect(screen.getByText('Get a Savage in ranked.')).toBeInTheDocument();
    expect(screen.getByText('12:34:56')).toBeInTheDocument();
  });

  it('does not show video fields for a mission that does not allow video link', () => {
    render(<ActiveMissionBanner {...baseProps} />);
    expect(screen.queryByPlaceholderText(/youtube.com/i)).not.toBeInTheDocument();
  });

  it('disables the submit button until at least one screenshot is chosen', () => {
    render(<ActiveMissionBanner {...baseProps} />);
    expect(screen.getByRole('button', { name: /submit proof/i })).toBeDisabled();
  });

  it('enables the submit button once a screenshot is present and calls handleProofSubmit on submit', () => {
    const handleProofSubmit = vi.fn((e: FormEvent) => e.preventDefault());
    const file = new File(['data'], 'proof.png', { type: 'image/png' });
    const { container } = render(
      <ActiveMissionBanner {...baseProps} proofFiles={[file]} handleProofSubmit={handleProofSubmit} />
    );
    expect(screen.getByRole('button', { name: /submit proof/i })).toBeEnabled();
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);
    expect(handleProofSubmit).toHaveBeenCalledTimes(1);
  });

  it('requires a video link for a video-allowed mission even with screenshots present', () => {
    const file = new File(['data'], 'proof.png', { type: 'image/png' });
    render(<ActiveMissionBanner {...baseProps} activeAttempt={videoAttempt} proofFiles={[file]} proofVideoUrl="" />);
    expect(screen.getByPlaceholderText(/youtube.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit proof/i })).toBeDisabled();
  });

  it('enables submit for a video-allowed mission once both a screenshot and a video link are present', () => {
    const file = new File(['data'], 'proof.png', { type: 'image/png' });
    render(
      <ActiveMissionBanner
        {...baseProps}
        activeAttempt={videoAttempt}
        proofFiles={[file]}
        proofVideoUrl="https://youtube.com/watch?v=abc"
      />
    );
    expect(screen.getByRole('button', { name: /submit proof/i })).toBeEnabled();
  });

  it('calls handleCancelMission with the attempt id when Cancel Mission is clicked', async () => {
    const handleCancelMission = vi.fn();
    const user = userEvent.setup();
    render(<ActiveMissionBanner {...baseProps} handleCancelMission={handleCancelMission} />);
    await user.click(screen.getByRole('button', { name: /cancel mission/i }));
    expect(handleCancelMission).toHaveBeenCalledWith('att1');
  });
});
