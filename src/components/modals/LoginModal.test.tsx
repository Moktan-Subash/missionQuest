import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginModal from './LoginModal';

describe('LoginModal', () => {
  it('renders the sign-in heading and no error banner by default', () => {
    render(
      <LoginModal setShowLoginModal={vi.fn()} authError="" handleGoogleLogin={vi.fn()} />
    );
    expect(screen.getByText('Gamer Sign In')).toBeInTheDocument();
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });

  it('shows the auth error message when provided', () => {
    render(
      <LoginModal
        setShowLoginModal={vi.fn()}
        authError="Invalid credentials, please try again."
        handleGoogleLogin={vi.fn()}
      />
    );
    expect(screen.getByText('Invalid credentials, please try again.')).toBeInTheDocument();
  });

  it('calls handleGoogleLogin when the Google button is clicked', async () => {
    const handleGoogleLogin = vi.fn();
    const user = userEvent.setup();
    render(
      <LoginModal setShowLoginModal={vi.fn()} authError="" handleGoogleLogin={handleGoogleLogin} />
    );
    await user.click(screen.getByRole('button', { name: /google account/i }));
    expect(handleGoogleLogin).toHaveBeenCalledTimes(1);
  });

  it('calls setShowLoginModal(false) when the close button is clicked', async () => {
    const setShowLoginModal = vi.fn();
    const user = userEvent.setup();
    render(
      <LoginModal setShowLoginModal={setShowLoginModal} authError="" handleGoogleLogin={vi.fn()} />
    );
    await user.click(screen.getByText('×'));
    expect(setShowLoginModal).toHaveBeenCalledWith(false);
  });
});
