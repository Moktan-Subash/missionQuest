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
};

describe('ActiveMissionBanner', () => {
  it('renders nothing when there is no active attempt', () => {
    const { container } = render(
      <ActiveMissionBanner
        user={{ id: 'u1' }}
        activeAttempt={null}
        timeRemaining="00:00:00"
        proofFile={null}
        setProofFile={vi.fn()}
        submittingProof={false}
        handleProofSubmit={vi.fn()}
        handleCancelMission={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there is no logged-in user', () => {
    const { container } = render(
      <ActiveMissionBanner
        user={null}
        activeAttempt={activeAttempt}
        timeRemaining="00:00:00"
        proofFile={null}
        setProofFile={vi.fn()}
        submittingProof={false}
        handleProofSubmit={vi.fn()}
        handleCancelMission={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows mission title, description and the countdown when active', () => {
    render(
      <ActiveMissionBanner
        user={{ id: 'u1' }}
        activeAttempt={activeAttempt}
        timeRemaining="12:34:56"
        proofFile={null}
        setProofFile={vi.fn()}
        submittingProof={false}
        handleProofSubmit={vi.fn()}
        handleCancelMission={vi.fn()}
      />
    );
    expect(screen.getByText(/Savage Dominator/)).toBeInTheDocument();
    expect(screen.getByText('Get a Savage in ranked.')).toBeInTheDocument();
    expect(screen.getByText('12:34:56')).toBeInTheDocument();
  });

  it('disables the submit button until a proof file is chosen', () => {
    render(
      <ActiveMissionBanner
        user={{ id: 'u1' }}
        activeAttempt={activeAttempt}
        timeRemaining="12:34:56"
        proofFile={null}
        setProofFile={vi.fn()}
        submittingProof={false}
        handleProofSubmit={vi.fn()}
        handleCancelMission={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /submit screenshot/i })).toBeDisabled();
  });

  it('enables the submit button once a proof file is present and calls handleProofSubmit on submit', () => {
    const handleProofSubmit = vi.fn((e: FormEvent) => e.preventDefault());
    const file = new File(['data'], 'proof.png', { type: 'image/png' });
    const { container } = render(
      <ActiveMissionBanner
        user={{ id: 'u1' }}
        activeAttempt={activeAttempt}
        timeRemaining="12:34:56"
        proofFile={file}
        setProofFile={vi.fn()}
        submittingProof={false}
        handleProofSubmit={handleProofSubmit}
        handleCancelMission={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /submit screenshot/i })).toBeEnabled();
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);
    expect(handleProofSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls handleCancelMission with the attempt id when Cancel Mission is clicked', async () => {
    const handleCancelMission = vi.fn();
    const user = userEvent.setup();
    render(
      <ActiveMissionBanner
        user={{ id: 'u1' }}
        activeAttempt={activeAttempt}
        timeRemaining="12:34:56"
        proofFile={null}
        setProofFile={vi.fn()}
        submittingProof={false}
        handleProofSubmit={vi.fn()}
        handleCancelMission={handleCancelMission}
      />
    );
    await user.click(screen.getByRole('button', { name: /cancel mission/i }));
    expect(handleCancelMission).toHaveBeenCalledWith('att1');
  });
});
