import { Link } from 'react-router-dom';
import { CarbonData as Data } from '../../lib/data.js';
import { CATEGORY_ICONS, ArrowRight } from '../../components/icons/index.jsx';
import { formatNumber } from '../../lib/format.js';

export function TopDriverCard({ insights }) {
  const Icon = CATEGORY_ICONS[insights.topCategory];
  const topSaving = insights.recommendations[0];

  return (
    <div className="panel top-driver-card">
      <p className="top-driver-card__eyebrow">Biggest driver</p>
      <div className="top-driver-card__main">
        <span className="top-driver-card__icon" aria-hidden="true"><Icon size={22} /></span>
        <div>
          <p className="top-driver-card__category">{Data.CATEGORY_LABELS[insights.topCategory]}</p>
          <p className="top-driver-card__share">{Math.round(insights.topShare)}% of your annual footprint</p>
        </div>
      </div>
      {topSaving ? (
        <p className="top-driver-card__hint">
          Top opportunity: save ~{formatNumber(topSaving.savingsKg, 0)} kg CO2e/year in {Data.CATEGORY_LABELS[topSaving.category].toLowerCase()}.
        </p>
      ) : null}
      <Link to="/insights" className="top-driver-card__link">
        See all recommendations <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}
