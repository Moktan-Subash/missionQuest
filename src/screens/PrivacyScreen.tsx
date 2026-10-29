function PrivacyScreen() {
  return (
    <div className="screen animate-fade-in page legal">
      <h2 className="page-title font-display">Privacy Policy</h2>
      <p className="page-subtitle">Last updated: July 31, 2026</p>
      <div className="legal-warning">
        ⚠️ Draft — this has not yet been reviewed by a lawyer, particularly
        around the government ID (KYC) documents this Platform collects. Do
        not treat this as final or legally binding until reviewed under
        Nepal's data protection requirements.
      </div>

      <div className="legal-body">
        <section>
          <h3>1. Information We Collect</h3>
          <p>We collect: your email, name, and profile picture via Google Sign-In; your phone number (for phone verification); in-game IDs you link and their verification screenshots; a copy of a government-issued ID (Citizenship card or Driver's License) if you choose to complete KYC verification to unlock withdrawals; mission-submission screenshots and, where applicable, a video link you provide (hosted by you on YouTube/Drive/etc — we never store or download the video itself); deposit and withdrawal payment details and proof screenshots; support ticket and feedback content; and your activity data (missions completed, XP, tournament/challenge participation, in-app chat messages between match participants).</p>
        </section>

        <section>
          <h3>2. How We Use It</h3>
          <p>Your information is used to operate the mission/reward system, verify your identity for withdrawals and tournament/challenge eligibility, review submitted proof, process deposit and withdrawal requests via eSewa or PayPal, run the leaderboard and public player profiles, and respond to support requests.</p>
        </section>

        <section>
          <h3>3. Who Can See It</h3>
          <p>Platform administrators can view your submissions, KYC documents, payment details, and support tickets in order to review and process them. Other players can see your display name, avatar, XP, completed mission count and titles, and public reviews you've left — this is shown by design on the leaderboard and public profiles. Teammates and opponents in a tournament match or challenge can see your display name and any messages you send in that match's chat. We do not sell your data to third parties.</p>
        </section>

        <section>
          <h3>4. Third-Party Services</h3>
          <p>We rely on Google (sign-in), Supabase (database, authentication, and file storage), and Vercel (hosting) to run the Platform — your account and submitted data is processed by these providers on our behalf. eSewa and PayPal process your actual payment transactions; we only see the reference/proof you submit, not your full payment credentials. If a mission allows video proof, the video itself lives on whatever service you upload it to (e.g. YouTube, Google Drive) under that service's own privacy terms, not ours.</p>
        </section>

        <section>
          <h3>5. Data Retention & Deletion</h3>
          <p>You can request account deletion or deactivation from your Profile page. Deactivating your account hides your public profile and prevents login; some records (e.g. completed transactions, past mission approvals) may be retained as required for financial recordkeeping or dispute resolution even after deletion.</p>
        </section>

        <section>
          <h3>6. Your Rights</h3>
          <p>You can request a copy of the personal data we hold about you, ask us to correct inaccurate information, or request deletion of your account, by contacting us through Support. We will respond to reasonable requests within a reasonable timeframe.</p>
        </section>

        <section>
          <h3>7. Children's Privacy</h3>
          <p>MissionQuest is not intended for anyone under 18 (see our Terms & Conditions), and we do not knowingly collect data from minors. If we become aware that an account belongs to someone under 18, we will deactivate it.</p>
        </section>

        <section>
          <h3>8. Changes to This Policy</h3>
          <p>We may update this Privacy Policy from time to time. Continued use of the Platform after a change constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h3>9. Contact</h3>
          <p>Questions about this policy, or requests regarding your data, can be sent via the Support feature on your Profile page.</p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyScreen;
