interface PhoneVerificationModalProps {
  otpSent: boolean;
  setOtpSent: (sent: boolean) => void;
  phoneInput: string;
  setPhoneInput: (phone: string) => void;
  phoneError: string;
  otpInput: string;
  setOtpInput: (otp: string) => void;
  otpResendCountdown: number;
  handleSendOTP: (e: React.FormEvent) => void;
  handleVerifyOTP: (e: React.FormEvent) => void;
  handleResendOTP: () => void;
  handleCancelPhoneVerification: () => void;
}

function PhoneVerificationModal({
  otpSent,
  setOtpSent,
  phoneInput,
  setPhoneInput,
  phoneError,
  otpInput,
  setOtpInput,
  otpResendCountdown,
  handleSendOTP,
  handleVerifyOTP,
  handleResendOTP,
  handleCancelPhoneVerification,
}: PhoneVerificationModalProps) {
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3>{otpSent ? 'Enter OTP Code' : 'Phone Linking Required'}</h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', textAlign: 'left', lineHeight: 1.4 }}>
          {otpSent
            ? `Enter the 6-digit verification code sent to +977 ${phoneInput}.`
            : 'To participate in missions and receive payouts via eSewa, you must verify and link your phone number.'}
        </p>

        {phoneError && (
          <div className="form-error">
            {phoneError}
          </div>
        )}

        {!otpSent ? (
          /* STEP 1: ENTER MOBILE NUMBER */
          <form onSubmit={handleSendOTP}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                className="form-control"
                required
                placeholder="98XXXXXXXX"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
              Send Verification Code
            </button>

            <button
              type="button"
              onClick={handleCancelPhoneVerification}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '12px' }}
            >
              Sign Out & Cancel
            </button>
          </form>
        ) : (
          /* STEP 2: ENTER OTP CODE */
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                pattern="\d{6}"
                className="form-control"
                required
                placeholder="Enter 6-Digit Code"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.25em', fontWeight: 'bold' }}
              />
            </div>

            <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
              Verify & Link Phone
            </button>

            {/* Resend Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '0.8rem' }}>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                style={{ background: 'none', border: 'none', color: '#C6FF00', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                ← Change Number
              </button>

              {otpResendCountdown > 0 ? (
                <span style={{ color: 'var(--text-dim)' }}>Resend in {otpResendCountdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                >
                  Resend OTP Code
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleCancelPhoneVerification}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '20px' }}
            >
              Sign Out & Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default PhoneVerificationModal;
