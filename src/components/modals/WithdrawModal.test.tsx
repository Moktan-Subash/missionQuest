import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WithdrawModal from './WithdrawModal';
import type { Wallet } from '../../types';
import type { FormEvent } from 'react';

const wallet: Wallet = { id: 'w1', balance: 1000 };

const baseProps = {
  setShowWithdrawModal: vi.fn(),
  withdrawError: '',
  withdrawMethod: 'esewa' as const,
  setWithdrawMethod: vi.fn(),
  withdrawDetails: '',
  setWithdrawDetails: vi.fn(),
  withdrawAmount: '',
  setWithdrawAmount: vi.fn(),
  wallet,
  handleWithdrawRequest: vi.fn(),
};

describe('WithdrawModal', () => {
  it('shows the eSewa phone label and max balance by default', () => {
    render(<WithdrawModal {...baseProps} />);
    expect(screen.getByText('eSewa Phone Number')).toBeInTheDocument();
    expect(screen.getByText(/Max: Rs\. 1000/)).toBeInTheDocument();
  });

  it('switches the details label to PayPal Email when method is paypal', () => {
    render(<WithdrawModal {...baseProps} withdrawMethod="paypal" />);
    expect(screen.getByText('PayPal Email')).toBeInTheDocument();
    expect(screen.queryByText('eSewa Phone Number')).not.toBeInTheDocument();
  });

  it('shows the withdraw error message when set', () => {
    render(<WithdrawModal {...baseProps} withdrawError="Amount exceeds balance" />);
    expect(screen.getByText('Amount exceeds balance')).toBeInTheDocument();
  });

  it('calls setWithdrawMethod when the payment method select changes', async () => {
    const setWithdrawMethod = vi.fn();
    const user = userEvent.setup();
    render(<WithdrawModal {...baseProps} setWithdrawMethod={setWithdrawMethod} />);
    await user.selectOptions(screen.getByRole('combobox'), 'paypal');
    expect(setWithdrawMethod).toHaveBeenCalledWith('paypal');
  });

  it('calls setShowWithdrawModal(false) when Cancel is clicked', async () => {
    const setShowWithdrawModal = vi.fn();
    const user = userEvent.setup();
    render(<WithdrawModal {...baseProps} setShowWithdrawModal={setShowWithdrawModal} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(setShowWithdrawModal).toHaveBeenCalledWith(false);
  });

  it('calls handleWithdrawRequest when the form is submitted', () => {
    const handleWithdrawRequest = vi.fn((e: FormEvent) => e.preventDefault());
    const { container } = render(
      <WithdrawModal {...baseProps} handleWithdrawRequest={handleWithdrawRequest} />
    );
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);
    expect(handleWithdrawRequest).toHaveBeenCalledTimes(1);
  });
});
