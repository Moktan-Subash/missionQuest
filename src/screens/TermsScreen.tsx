function TermsScreen() {
  return (
    <div className="screen animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'left' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Terms & Conditions</h2>
      <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        ⚠️ Placeholder text — this has not been reviewed by a lawyer and is not
        legally binding yet. Replace this page with real terms before the app
        is used by real players for real money.
      </div>

      <div className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>
        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>1. Acceptance of Terms</h3>
          <p>By creating an account on MissionQuest, you agree to these Terms & Conditions and our Privacy Policy.</p>
        </section>
        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>2. Missions & Rewards</h3>
          <p>Mission rewards are credited to your in-app wallet only after an administrator reviews and approves your submitted proof. MissionQuest reserves the right to reject submissions that do not meet the stated mission requirements.</p>
        </section>
        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>3. Wallet & Withdrawals</h3>
          <p>Wallet balances are not real currency until a withdrawal is processed via eSewa or PayPal. Withdrawal requests are reviewed manually and may take time to process.</p>
        </section>
        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>4. Account Conduct</h3>
          <p>Submitting fraudulent proof, abusing the mission system, or violating the rules of the games featured on this platform may result in a ban and forfeiture of wallet balance.</p>
        </section>
        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>5. Changes to These Terms</h3>
          <p>MissionQuest may update these terms from time to time. Continued use of the platform after a change constitutes acceptance of the updated terms.</p>
        </section>
      </div>
    </div>
  );
}

export default TermsScreen;
