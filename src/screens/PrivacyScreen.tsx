function PrivacyScreen() {
  return (
    <div className="screen animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'left' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Privacy Policy</h2>
      <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        ⚠️ Placeholder text — this has not been reviewed by a lawyer and is not
        legally binding yet. Replace this page with a real privacy policy
        before the app is used by real players for real money.
      </div>

      <div className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>
        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>1. Information We Collect</h3>
          <p>We collect your email and profile info via Google Sign-In, your phone number (for phone verification), linked in-game IDs, KYC identity documents you choose to upload, and mission-submission screenshots.</p>
        </section>
        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>2. How We Use It</h3>
          <p>Your information is used to operate the mission/reward system, verify your identity for payouts, review mission submissions, and process withdrawal requests via eSewa or PayPal.</p>
        </section>
        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>3. Who Can See It</h3>
          <p>Platform administrators can view your submissions, KYC documents, and support tickets in order to review and process them. We do not sell your data to third parties.</p>
        </section>
        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>4. Data Retention & Deletion</h3>
          <p>You can request account deletion from your Profile page. See our account deletion flow for details on what happens to your data.</p>
        </section>
        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>5. Contact</h3>
          <p>Questions about this policy can be sent via the Contact Support form on your Profile page.</p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyScreen;
