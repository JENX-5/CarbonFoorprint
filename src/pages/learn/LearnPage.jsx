import { useState } from "react";
import { useAppState } from "@/state/AppStateContext.jsx";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { BookOpen, CATEGORY_ICONS } from "@/components/icons/index.jsx";
import { Tabs } from "@/components/common/Tabs.jsx";
import { CarbonData as Data } from "@/lib/data.js";

export function LearnPage() {
  const { state, derived } = useAppState();
  useDocumentTitle("Education Hub");

  const [activeTab, setActiveTab] = useState(() => {
    if (state.results && derived.insights) {
      return derived.insights.topCategory;
    }
    return Data.CATEGORY_ORDER[0];
  });

  const tabConfigs = Data.CATEGORY_ORDER.map((cat) => ({
    id: cat,
    label: Data.CATEGORY_LABELS[cat],
    icon: CATEGORY_ICONS[cat],
  }));

  return (
    <div className="learn-page">
      <PageHeader
        icon={BookOpen}
        eyebrow="Knowledge"
        title="Education hub"
        description="Practical tips and actionable guidance to lower your carbon footprint in every major category."
      />

      <div style={{ marginTop: "2rem" }}>
        <p
          className="section__intro"
          style={{
            marginBottom: "1.5rem",
            color: "var(--color-charcoal-soft)",
          }}
        >
          Tips are sorted to prioritize your highest emission category once you
          compute your footprint. Feel free to browse any area below.
        </p>

        <div className="tabs">
          <Tabs
            tabs={tabConfigs}
            activeId={activeTab}
            onChange={setActiveTab}
            idPrefix="learn-tab"
          />

          <div
            className="tabs__panel"
            role="tabpanel"
            id={`learn-tab-panel-${activeTab}`}
            aria-labelledby={`learn-tab-${activeTab}`}
            style={{ marginTop: "1.5rem", display: "grid", gap: "1.25rem" }}
          >
            {Data.SUSTAINABILITY_TIPS[activeTab]?.map((tip, i) => (
              <article
                key={i}
                className="tip-card"
                style={{
                  background: "var(--color-paper)",
                  border: "1px solid var(--color-line)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <h4
                  className="tip-card__title"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "var(--color-canopy-dark)",
                    margin: "0 0 0.5rem 0",
                  }}
                >
                  {tip.title}
                </h4>
                <p
                  className="tip-card__desc"
                  style={{
                    margin: 0,
                    fontSize: "0.92rem",
                    color: "var(--color-charcoal-soft)",
                    lineHeight: "1.5",
                  }}
                >
                  {tip.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
