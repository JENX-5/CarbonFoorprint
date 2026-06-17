import React from 'react';
import { useAppState } from '../../state/AppStateContext.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Sparkles, CATEGORY_ICONS } from '../../components/icons/index.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { CarbonData as Data } from '../../lib/data.js';
import { formatNumber } from '../../lib/format.js';

export function InsightsPage() {
  const { state, derived } = useAppState();
  useDocumentTitle('AI Insights');

  if (!state.results || !derived.insights) {
    return (
      <div className="insights-page-empty">
        <PageHeader
          icon={Sparkles}
          eyebrow="Recommendations"
          title="AI insights engine"
          description="Get personalized, data-backed suggestions to reduce your carbon footprint."
        />
        <EmptyState />
      </div>
    );
  }

  const { topCategory, topShare, recommendations, totalPotentialSavings } = derived.insights;

  return (
    <div className="insights-page">
      <PageHeader
        icon={Sparkles}
        eyebrow="Recommendations"
        title="AI insights engine"
        description="Get personalized, data-backed suggestions to reduce your carbon footprint."
      />

      <div className="insights" style={{ marginTop: '2rem' }}>
        <div className="insight-card insight-card--primary">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-charcoal-soft)', margin: '0 0 0.5rem 0' }}>
            Highest emission source
          </h3>
          <p className="insight-card__headline">
            {React.createElement(CATEGORY_ICONS[topCategory], {
              size: 24,
              style: { display: 'inline', marginRight: '8px', verticalAlign: 'middle' }
            })}
            {Data.CATEGORY_LABELS[topCategory]}
          </p>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-charcoal-soft)' }}>
            {Data.CATEGORY_LABELS[topCategory]} makes up about <strong>{Math.round(topShare)}%</strong> of your annual footprint.
          </p>
        </div>

        <div className="insight-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-charcoal-soft)', margin: '0 0 1rem 0' }}>
            Personalized recommendations
          </h3>
          <ul className="recommendation-list">
            {recommendations.map((rec, i) => {
              const Icon = CATEGORY_ICONS[rec.category];
              return (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'var(--color-mist)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-line)'
                  }}
                >
                  <div
                    style={{
                      background: 'var(--color-paper)',
                      padding: '8px',
                      borderRadius: '50%',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      color: 'var(--color-canopy)'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-moss)', letterSpacing: '0.05em' }}>
                      {Data.CATEGORY_LABELS[rec.category]}
                    </span>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                      {rec.text}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-moss)', fontWeight: 500 }}>
                      Saves approx. <strong style={{ color: 'var(--color-clay)' }}>{formatNumber(rec.savingsKg, 0)} kg CO2e / yr</strong>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="insight-card insight-card--accent" style={{ background: 'var(--color-good-bg)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-canopy-dark)', margin: '0 0 0.5rem 0' }}>
            Potential annual impact
          </h3>
          <p className="insight-card__headline" style={{ color: 'var(--color-canopy-dark)' }}>
            {formatNumber(totalPotentialSavings, 0)} kg CO2e saved / yr
          </p>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--color-canopy-dark)', opacity: 0.85 }}>
            If you implement all recommended improvements, you would reduce your footprint by {formatNumber(totalPotentialSavings / 1000, 1)} metric tonnes of CO2e annually.
          </p>
        </div>
      </div>
    </div>
  );
}
