import { useAppState } from "@/state/AppStateContext.jsx";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { KpiStrip } from "@/pages/dashboard/KpiStrip.jsx";
import { EmissionsDonut } from "@/pages/dashboard/EmissionsDonut.jsx";
import { TrendChart } from "@/pages/dashboard/TrendChart.jsx";
import { BenchmarkBar } from "@/pages/dashboard/BenchmarkBar.jsx";
import { ScoreCard } from "@/pages/dashboard/ScoreCard.jsx";
import { TopDriverCard } from "@/pages/dashboard/TopDriverCard.jsx";
import { StreakCard } from "@/components/gamification/StreakCard.jsx";
import { DailyChecklistCard } from "@/components/gamification/DailyChecklistCard.jsx";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { LayoutDashboard } from "@/components/icons/index.jsx";
import { Link } from "react-router-dom";

import { ErrorBoundary } from "@/components/common/ErrorBoundary.jsx";

export function DashboardPage() {
  const { state, derived } = useAppState();
  useDocumentTitle("Dashboard");

  return (
    <div className="dashboard">
      <PageHeader
        icon={LayoutDashboard}
        eyebrow="Overview"
        title="Sustainability dashboard"
        description="Your footprint, broken down, benchmarked, and tracked over time."
        actions={
          <Link to="/calculator" className="button button--ghost button--small">
            Recalculate
          </Link>
        }
      />

      <KpiStrip results={state.results} comparison={derived.comparison} />

      <div className="dashboard-grid">
        <div className="dashboard-grid__main">
          <div className="chart-panel">
            <h3>Emissions breakdown</h3>
            <ErrorBoundary>
              <EmissionsDonut
                byCategoryAnnual={state.results.byCategoryAnnual}
              />
            </ErrorBoundary>
          </div>
          <div className="chart-panel">
            <h3>Footprint over time</h3>
            <ErrorBoundary>
              <TrendChart history={state.history} />
            </ErrorBoundary>
          </div>
          <div className="chart-panel">
            <h3>Where you stand</h3>
            <BenchmarkBar
              annual={state.results.annual}
              ratingClassName={derived.rating.className}
            />
          </div>
        </div>

        <div className="dashboard-grid__side">
          <ScoreCard
            score={derived.score}
            rating={derived.rating}
            level={derived.level}
            levelProgress={derived.levelProgress}
          />
          <TopDriverCard insights={derived.insights} />
          <StreakCard streak={state.streak} />
          <DailyChecklistCard compact />
        </div>
      </div>
    </div>
  );
}
