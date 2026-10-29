import { useEffect } from 'react';
import type { Feedback, Mission } from '../types';

interface HomeScreenProps {
  publicFeedback: Feedback[];
  filteredMissions: Mission[];
  gameFilter: 'ALL' | 'MLBB' | 'PUBG' | 'OTHERS';
  setGameFilter: (filter: 'ALL' | 'MLBB' | 'PUBG' | 'OTHERS') => void;
  goToMissions: () => void;
}

const PREVIEW_COUNT = 6;
// Sections a viewer can be "in" while scrolling -- the URL hash tracks
// whichever one is centered in the viewport (see the IntersectionObserver
// effect below), so a link to e.g. /#reviews always lands where expected.
const SPY_SECTION_IDS = ['tournaments', 'missions', 'reviews'];

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--warning)', letterSpacing: '1px' }}>
      {'★'.repeat(rating)}
      <span style={{ color: 'var(--border-color)' }}>{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'G';
}

function HomeScreen({ publicFeedback, filteredMissions, gameFilter, setGameFilter, goToMissions }: HomeScreenProps) {
  const previewMissions = filteredMissions.slice(0, PREVIEW_COUNT);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible && window.location.hash !== `#${mostVisible.target.id}`) {
          window.history.replaceState(null, '', `#${mostVisible.target.id}`);
        }
      },
      // A thin band near vertical center -- a section only counts as "current"
      // once it's actually crossed the middle of the screen, not just barely
      // peeking in at the top or bottom edge.
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    SPY_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // Re-attach whenever a gated section (reviews, or the mission grid's
    // empty/populated state) mounts or unmounts -- publicFeedback and
    // filteredMissions arrive asynchronously after HomeScreen's first
    // render, so the #reviews section in particular doesn't exist in the
    // DOM yet on that very first effect run.
  }, [publicFeedback.length, filteredMissions.length]);

  return (
    <div className="screen animate-fade-in">
      <section id="tournaments">
        {/* HERO MARKETING SECTION -- shown to everyone regardless of login state */}
        <div className="hero-section">
          <div className="hero-badge">
            <span className="pulse-dot"></span> Complete missions. Earn rewards. Level up.
          </div>
          <h1 className="hero-title">
            Gaming Missions.<br />
            <span className="text-real">Real</span><span className="text-rewards">Rewards.</span>
          </h1>
          <p className="hero-desc">
            Join the ultimate gaming challenge platform. Complete missions in your favorite games, earn real cash rewards, and connect with gamers worldwide.
          </p>
        </div>
      </section>

      {/* FEATURED MISSIONS PREVIEW -- a taste of what's on offer, filterable
          by game, capped at PREVIEW_COUNT with a CTA through to the full board. */}
      <section id="missions" className="home-section">
        <div className="home-section-header">
          <h2 className="home-section-title">🎯 Featured Missions</h2>
          <p className="home-section-subtitle">Real cash rewards across every game we support.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0 32px' }}>
          <div className="game-filters">
            <button onClick={() => setGameFilter('ALL')} className={`filter-btn ${gameFilter === 'ALL' ? 'active' : ''}`}>ALL</button>
            <button onClick={() => setGameFilter('MLBB')} className={`filter-btn ${gameFilter === 'MLBB' ? 'active' : ''}`}>MLBB</button>
            <button onClick={() => setGameFilter('PUBG')} className={`filter-btn ${gameFilter === 'PUBG' ? 'active' : ''}`}>PUBG</button>
            <button onClick={() => setGameFilter('OTHERS')} className={`filter-btn ${gameFilter === 'OTHERS' ? 'active' : ''}`}>OTHERS</button>
          </div>
        </div>

        {previewMissions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
            No missions available right now. Check back soon!
          </p>
        ) : (
          <div className="missions-grid">
            {previewMissions.map((mission) => (
              <div
                key={mission.id}
                onClick={goToMissions}
                className={`mission-card mission-card-preview ${mission.game.toLowerCase().includes('pubg') ? 'card-pubg' : 'card-mlbb'}`}
              >
                <div className="mission-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h3 className="mission-card-title">{mission.title}</h3>
                    <span className={`difficulty-chip difficulty-${(mission.difficulty || 'Medium').toLowerCase()}`}>
                      {mission.difficulty || 'Medium'}
                    </span>
                  </div>
                  <div className="mission-card-game">{mission.game}</div>
                  <div className="mission-card-info-row">
                    <div className="info-item info-item-reward">🏆 Rs. {mission.reward_amount.toFixed(0)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <button className="btn btn-primary" onClick={goToMissions} style={{ padding: '0.7rem 2rem' }}>
            View All Missions →
          </button>
        </div>
      </section>

      {/* PLAYER REVIEWS: public testimonials, part of the marketing pitch */}
      {publicFeedback.length > 0 && (
        <section id="reviews" className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">💬 Player Reviews</h2>
            <p className="home-section-subtitle">What real players are saying about MissionQuest.</p>
          </div>

          <div className="reviews-summary">
            <span className="reviews-summary-score">
              {(publicFeedback.reduce((sum, f) => sum + f.rating, 0) / publicFeedback.length).toFixed(1)}
            </span>
            <div className="reviews-summary-meta">
              <Stars rating={Math.round(publicFeedback.reduce((sum, f) => sum + f.rating, 0) / publicFeedback.length)} />
              <span className="reviews-summary-count">{publicFeedback.length} review{publicFeedback.length === 1 ? '' : 's'}</span>
            </div>
          </div>

          <div className="reviews-grid">
            {publicFeedback.map((f) => {
              const name = f.profile?.display_name || 'Gamer';
              return (
                <div key={f.id} className="review-card">
                  <span className="review-card-quote" aria-hidden="true">"</span>
                  <div className="review-card-head">
                    <div className="review-avatar">{initialsFor(name)}</div>
                    <div className="review-card-head-text">
                      <strong className="review-name">{name}</strong>
                      <Stars rating={f.rating} />
                    </div>
                  </div>
                  {f.comment && <p className="review-comment">{f.comment}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default HomeScreen;
