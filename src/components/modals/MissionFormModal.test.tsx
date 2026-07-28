import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MissionFormModal from './MissionFormModal';
import type { FormEvent } from 'react';

const baseForm = {
  title: 'Savage Dominator',
  description: 'Get a Savage in ranked.',
  game: 'Mobile Legends',
  customGame: '',
  reward_amount: '100',
  xp_reward: '50',
  rules: 'Screenshot of the kill feed.',
  difficulty: 'Hard' as const,
  is_active: true,
  allows_video_link: false,
};

const baseProps = {
  editingMissionId: null,
  setShowMissionModal: vi.fn(),
  missionFormError: '',
  missionForm: baseForm,
  setMissionForm: vi.fn(),
  gameOptions: ['Mobile Legends', 'PUBG Mobile'],
  handleSaveMission: vi.fn(),
};

describe('MissionFormModal', () => {
  it('shows "Add New Mission" when creating and "Edit Mission" when editing', () => {
    const { rerender } = render(<MissionFormModal {...baseProps} />);
    expect(screen.getByText('Add New Mission')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create mission/i })).toBeInTheDocument();

    rerender(<MissionFormModal {...baseProps} editingMissionId="m1" />);
    expect(screen.getByText('Edit Mission')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows the custom game input only when "Other" is selected', () => {
    render(<MissionFormModal {...baseProps} missionForm={{ ...baseForm, game: 'Other' }} />);
    expect(screen.getByPlaceholderText('e.g. Valorant Mobile')).toBeInTheDocument();
  });

  it('does not show the custom game input for a known game', () => {
    render(<MissionFormModal {...baseProps} />);
    expect(screen.queryByPlaceholderText('e.g. Valorant Mobile')).not.toBeInTheDocument();
  });

  it('shows the mission form error message when set', () => {
    render(<MissionFormModal {...baseProps} missionFormError="Title is required" />);
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('calls setMissionForm with the updated title as the user types', async () => {
    const setMissionForm = vi.fn();
    const user = userEvent.setup();
    render(<MissionFormModal {...baseProps} setMissionForm={setMissionForm} />);
    await user.type(screen.getByPlaceholderText('e.g. Savage Dominator'), 'X');
    expect(setMissionForm).toHaveBeenCalledWith({ ...baseForm, title: 'Savage DominatorX' });
  });

  it('calls setShowMissionModal(false) when Cancel is clicked', async () => {
    const setShowMissionModal = vi.fn();
    const user = userEvent.setup();
    render(<MissionFormModal {...baseProps} setShowMissionModal={setShowMissionModal} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(setShowMissionModal).toHaveBeenCalledWith(false);
  });

  it('calls handleSaveMission when the form is submitted', () => {
    const handleSaveMission = vi.fn((e: FormEvent) => e.preventDefault());
    const { container } = render(
      <MissionFormModal {...baseProps} handleSaveMission={handleSaveMission} />
    );
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);
    expect(handleSaveMission).toHaveBeenCalledTimes(1);
  });
});
