import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WalletScreen from './WalletScreen';
import type { DepositRequest, PayoutRequest, Wallet } from '../types';

const wallet: Wallet = { id: 'w1', balance: 750 };

const deposit: DepositRequest = {
  id: 'd1',
  user_id: 'u1',
  amount: 500,
  payment_method: 'esewa',
  reference_note: 'TXN123',
  proof_url: null,
  status: 'approved',
  admin_notes: null,
  requested_at: '2026-07-10T00:00:00.000Z',
};

const payout: PayoutRequest = {
  id: 'p1',
  user_id: 'u1',
  amount: 200,
  payment_method: 'paypal',
  payment_details: 'gamer@paypal.com',
  status: 'pending',
  admin_notes: null,
  transaction_id: null,
  requested_at: '2026-07-11T00:00:00.000Z',
};

describe('WalletScreen', () => {
  it('shows the wallet balance and empty history states', () => {
    render(
      <WalletScreen
        wallet={wallet}
        setShowAddMoneyModal={vi.fn()}
        setShowWithdrawModal={vi.fn()}
        deposits={[]}
        payouts={[]}
      />
    );
    expect(screen.getByText(/Rs\. 750/)).toBeInTheDocument();
    expect(screen.getByText('No deposits requested yet.')).toBeInTheDocument();
    expect(screen.getByText('No withdrawals requested yet.')).toBeInTheDocument();
  });

  it('renders deposit and payout history rows when present', () => {
    render(
      <WalletScreen
        wallet={wallet}
        setShowAddMoneyModal={vi.fn()}
        setShowWithdrawModal={vi.fn()}
        deposits={[deposit]}
        payouts={[payout]}
      />
    );
    expect(screen.getByText('Ref: TXN123')).toBeInTheDocument();
    expect(screen.getByText('Details: gamer@paypal.com')).toBeInTheDocument();
  });

  it('disables Withdraw Cash when the balance is zero', () => {
    render(
      <WalletScreen
        wallet={{ id: 'w1', balance: 0 }}
        setShowAddMoneyModal={vi.fn()}
        setShowWithdrawModal={vi.fn()}
        deposits={[]}
        payouts={[]}
      />
    );
    expect(screen.getByRole('button', { name: /withdraw cash/i })).toBeDisabled();
  });

  it('enables Withdraw Cash when there is a positive balance', () => {
    render(
      <WalletScreen
        wallet={wallet}
        setShowAddMoneyModal={vi.fn()}
        setShowWithdrawModal={vi.fn()}
        deposits={[]}
        payouts={[]}
      />
    );
    expect(screen.getByRole('button', { name: /withdraw cash/i })).toBeEnabled();
  });

  it('calls setShowAddMoneyModal(true) and setShowWithdrawModal(true) on click', async () => {
    const setShowAddMoneyModal = vi.fn();
    const setShowWithdrawModal = vi.fn();
    const user = userEvent.setup();
    render(
      <WalletScreen
        wallet={wallet}
        setShowAddMoneyModal={setShowAddMoneyModal}
        setShowWithdrawModal={setShowWithdrawModal}
        deposits={[]}
        payouts={[]}
      />
    );
    await user.click(screen.getByRole('button', { name: /add money/i }));
    expect(setShowAddMoneyModal).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole('button', { name: /withdraw cash/i }));
    expect(setShowWithdrawModal).toHaveBeenCalledWith(true);
  });
});
