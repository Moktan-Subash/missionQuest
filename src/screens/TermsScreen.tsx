function TermsScreen() {
  return (
    <div className="screen animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'left' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Terms & Conditions</h2>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '1rem' }}>Last updated: July 31, 2026</p>
      <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        ⚠️ Draft — this has not yet been reviewed by a lawyer, particularly the
        Tournaments and Challenges sections involving real-money prizes and
        wagers. Do not treat this as final or legally binding until it has
        been reviewed under Nepali law.
      </div>

      <div className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>
        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>1. Acceptance of Terms</h3>
          <p>By creating an account on MissionQuest ("the Platform", "we", "us"), you agree to these Terms & Conditions and our Privacy Policy. If you do not agree, do not create an account or use the Platform.</p>
        </section>

        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>2. Eligibility</h3>
          <p>You must be at least 18 years old to create an account, hold a wallet balance, or participate in any mission, tournament, or challenge on the Platform. By registering, you confirm that you meet this requirement. MissionQuest is currently operated on an individual basis, pending future company registration, and is offered from and governed under the laws of Nepal (see Section 11).</p>
        </section>

        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>3. Missions & Rewards</h3>
          <p>Mission rewards are credited to your in-app wallet only after an administrator reviews and approves your submitted proof (screenshots and, for missions that support it, a player-hosted video link). MissionQuest reserves the right to reject submissions that do not meet the stated mission requirements, and to ban accounts that submit fraudulent or manipulated proof.</p>
        </section>

        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>4. Wallet, Deposits & Withdrawals</h3>
          <p>Wallet balances are not real currency until a withdrawal is processed via eSewa or PayPal. Deposit and withdrawal requests are reviewed manually by an administrator and may take time to process. MissionQuest is not responsible for delays caused by third-party payment providers (eSewa, PayPal) or for funds sent to incorrect payment details you provided.</p>
        </section>

        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>5. Tournaments</h3>
          <p>Tournaments have a stated prize pool, registration requirements, and rules set by MissionQuest. Registering for a tournament does not guarantee entry into the prize pool if minimum participation requirements are not met, or if you fail to check in or otherwise breach the tournament's rules. Match results, forfeits, and disqualifications are determined by MissionQuest administrators at their reasonable discretion, and their decision on a result or dispute is final.</p>
        </section>

        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>6. Challenges (Player-vs-Player Wagers)</h3>
          <p>The Challenges feature lets verified players stake real money from their wallet against another player in a 1v1 or team match, with the winner receiving the combined stake. By creating or accepting a challenge, you acknowledge and accept the risk of losing your staked amount based on the outcome of the match. Stakes are held from your wallet balance for the duration of the challenge and are only released, refunded, or paid out according to the challenge's resolution (completion, cancellation, or admin-resolved dispute). Attempting to manipulate a match outcome, collude with an opponent, or submit false results is grounds for forfeiture of the stake and a ban.</p>
        </section>

        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>7. Membership Tiers</h3>
          <p>MissionQuest offers optional paid membership tiers (Bronze, Gold) that increase your daily mission limit and unlock features such as Challenges. Membership payments are <strong>non-refundable</strong> once processed, including if you later downgrade, get banned for a violation of these Terms, or stop using the Platform. Membership benefits apply only for the duration of the tier you purchased and do not carry over if you change tiers.</p>
        </section>

        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>8. Game ID Verification (KYC)</h3>
          <p>Certain features (Tournaments, Challenges) require you to link and verify an in-game ID for the relevant game. MissionQuest may use manual review or automated (AI-assisted) verification of a submitted screenshot to confirm your in-game identity. Submitting a false or manipulated screenshot for verification is grounds for rejection of the request and, on repeated attempts, an account ban.</p>
        </section>

        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>9. Account Conduct & Bans</h3>
          <p>Submitting fraudulent proof, abusing the mission system, manipulating tournament or challenge outcomes, or violating the rules of the games featured on this platform may result in a ban and forfeiture of your wallet balance. You may deactivate your own account at any time from your Profile; deactivation does not entitle you to a refund of any membership payment or wallet balance already spent.</p>
        </section>

        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>10. Disclaimer & Limitation of Liability</h3>
          <p>MissionQuest is provided "as is" without warranties of any kind. We do not guarantee the Platform will be uninterrupted, error-free, or free of bugs. To the fullest extent permitted by law, MissionQuest is not liable for indirect, incidental, or consequential damages arising from your use of the Platform, including losses related to wallet balance, mission rewards, tournament prizes, or challenge stakes, except where caused by our own confirmed fraud or willful misconduct.</p>
        </section>

        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>11. Governing Law</h3>
          <p>These Terms are governed by the laws of Nepal. Any dispute arising from your use of the Platform that cannot be resolved informally through our in-app Support feature will be subject to the jurisdiction of the courts of Nepal.</p>
        </section>

        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>12. Changes to These Terms</h3>
          <p>MissionQuest may update these terms from time to time. Continued use of the Platform after a change constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>13. Contact</h3>
          <p>Questions about these Terms, or disputes about a mission, tournament, or challenge, should be raised through the in-app Support feature (Profile → Support).</p>
        </section>
      </div>
    </div>
  );
}

export default TermsScreen;
