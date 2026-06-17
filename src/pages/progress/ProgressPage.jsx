import React from 'react';
import { useAppState } from '../../state/AppStateContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Trophy, Flame, Award } from '../../components/icons/index.jsx';
import { DailyChecklistCard } from '../../components/gamification/DailyChecklistCard.jsx';
import { WeeklyChallengeCard } from '../../components/gamification/WeeklyChallengeCard.jsx';
import { AchievementsGrid } from '../../components/gamification/AchievementsGrid.jsx';

export function ProgressPage() {
  const { state, derived, actions } = useAppState();
  useDocumentTitle('Progress & Eco Score');

  const { level, levelProgress } = derived;

  return (
    <div className="progress-page">
      <PageHeader
        icon={Trophy}
        eyebrow="Gamification"
        title="Eco score & progress"
        description="Earn points, sustain streaks, complete weekly challenges, and unlock achievements."
      />

      <style>{`
        .progress-summary-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          margin-top: 2rem;
          margin-bottom: 2.5rem;
        }
        @media (min-width: 768px) {
          .progress-summary-grid {
            grid-template-columns: 1.5fr 1fr;
          }
        }
        .progress-card {
          background: var(--color-paper);
          border: 1px solid var(--color-line);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          box-shadow: var(--shadow-card);
        }
        .streak-card-wrapper {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: var(--color-paper);
          border: 1px solid var(--color-line);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          box-shadow: var(--shadow-card);
        }
        .level-progress-bar-container {
          margin-top: 1rem;
        }
        .level-progress-bar-track {
          width: 100%;
          height: 10px;
          background: var(--color-mist);
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 0.5rem;
          border: 1px solid var(--color-line);
        }
        .level-progress-bar-fill {
          height: 100%;
          background: var(--color-canopy);
          border-radius: 9999px;
          transition: width 0.3s ease;
        }
        .progress-cards-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          margin-bottom: 2.5rem;
        }
        @media (min-width: 1024px) {
          .progress-cards-row {
            grid-template-columns: 1.2fr 1fr;
          }
        }
      `}</style>

      <div className="progress-summary-grid">
        <div className="progress-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-moss)', letterSpacing: '0.05em' }}>
                Current Level
              </span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--color-canopy-dark)', margin: '0.25rem 0' }}>
                {level.name}
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-moss)', letterSpacing: '0.05em' }}>
                Eco Score
              </span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--color-clay)', margin: '0.25rem 0', fontFamily: 'var(--font-mono)' }}>
                {state.ecoScore} <span style={{ fontSize: '1rem', color: 'var(--color-charcoal-soft)', fontWeight: 500 }}>pts</span>
              </h3>
            </div>
          </div>

          {levelProgress.next ? (
            <div className="level-progress-bar-container">
              <div className="level-progress-bar-track">
                <div className="level-progress-bar-fill" style={{ width: `${levelProgress.percent}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-charcoal-soft)' }}>
                <span>Level range: {level.min} - {levelProgress.next.min} pts</span>
                <strong>{levelProgress.pointsToNext} pts to next level ({levelProgress.next.name})</strong>
              </div>
            </div>
          ) : (
            <p style={{ margin: '1rem 0 0', fontSize: '0.85rem', color: 'var(--color-moss)', fontWeight: 600 }}>
              🌟 Max Level Reached! You are an Eco Legend.
            </p>
          )}
        </div>

        <div className="streak-card-wrapper">
          <div style={{
            background: state.streak.current > 0 ? 'var(--color-danger-bg)' : 'var(--color-mist)',
            padding: '12px',
            borderRadius: '50%',
            color: state.streak.current > 0 ? 'var(--color-danger)' : 'var(--color-charcoal-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={32} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-moss)', letterSpacing: '0.05em' }}>
              Activity Streak
            </span>
            <h3 style={{ fontSize: '1.6rem', margin: '0.15rem 0' }}>
              {state.streak.current} {state.streak.current === 1 ? 'day' : 'days'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-charcoal-soft)' }}>
              Longest streak: {state.streak.longest} {state.streak.longest === 1 ? 'day' : 'days'}. Track daily actions to grow your streak!
            </p>
          </div>
        </div>
      </div>

      <div className="progress-cards-row">
        <DailyChecklistCard compact={false} />
        
        {derived.challenge && (
          <WeeklyChallengeCard
            challenge={derived.challenge}
            completedWeeks={state.weeklyChallenge.completedWeeks}
            onComplete={actions.completeWeeklyChallenge}
          />
        )}
      </div>

      <div className="achievements-section" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-line)', paddingBottom: '0.75rem' }}>
          <Award size={20} style={{ color: 'var(--color-canopy)' }} />
          <h3 style={{ margin: 0 }}>Achievements & Badges</h3>
        </div>
        <AchievementsGrid unlockedAchievements={state.unlockedAchievements} />
      </div>
    </div>
  );
}
