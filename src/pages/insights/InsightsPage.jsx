import { useAppState } from "@/state/AppStateContext.jsx";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { Sparkles, CATEGORY_ICONS } from "@/components/icons/index.jsx";
import { EmptyState } from "@/components/common/EmptyState.jsx";
import { CarbonData as Data } from "@/lib/data.js";
import { formatNumber } from "@/lib/format.js";

/**
 * InsightsPage component rendering tailored sustainability tips and drivers.
 * @component
 */
export function InsightsPage() {
  const { state, derived } = useAppState();
  useDocumentTitle("AI Insights");

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

  const { topCategory, topShare, recommendations, totalPotentialSavings } =
    derived.insights;
  const CategoryIcon = CATEGORY_ICONS[topCategory];

  return (
    <div className="insights-page">
      <PageHeader
        icon={Sparkles}
        eyebrow="Recommendations"
        title="AI insights engine"
        description="Get personalized, data-backed suggestions to reduce your carbon footprint."
      />

      <div className="insights insights--margin-top">
        <div className="insight-card insight-card--primary">
          <h3 className="insight-card__title">Highest emission source</h3>
          <p className="insight-card__headline">
            {CategoryIcon && (
              <CategoryIcon size={24} className="insight-card__category-icon" />
            )}
            {Data.CATEGORY_LABELS[topCategory]}
          </p>
          <p className="insight-card__sub-text">
            {Data.CATEGORY_LABELS[topCategory]} makes up about{" "}
            <strong>{Math.round(topShare)}%</strong> of your annual footprint.
          </p>
        </div>

        <div className="insight-card">
          <h3 className="insight-card__title insight-card__title--recommendations">
            Personalized recommendations
          </h3>
          <ul className="recommendation-list">
            {recommendations.map((rec, i) => {
              const Icon = CATEGORY_ICONS[rec.category];
              return (
                <li key={i} className="recommendation-item">
                  <div className="recommendation-item__icon-wrap">
                    <Icon size={18} />
                  </div>
                  <div>
                    <span className="recommendation-item__category">
                      {Data.CATEGORY_LABELS[rec.category]}
                    </span>
                    <p className="recommendation-item__text">{rec.text}</p>
                    <p className="recommendation-item__savings">
                      Saves approx.{" "}
                      <strong className="recommendation-item__savings-value">
                        {formatNumber(rec.savingsKg, 0)} kg CO2e / yr
                      </strong>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="insight-card insight-card--accent">
          <h3 className="insight-card__title insight-card__title--accent">
            Potential annual impact
          </h3>
          <p className="insight-card__headline insight-card__headline--accent">
            {formatNumber(totalPotentialSavings, 0)} kg CO2e saved / yr
          </p>
          <p className="insight-card__sub-text insight-card__sub-text--accent">
            If you implement all recommended improvements, you would reduce your
            footprint by {formatNumber(totalPotentialSavings / 1000, 1)} metric
            tonnes of CO2e annually.
          </p>
        </div>
      </div>
    </div>
  );
}
