import { formatNumber } from '../../lib/format.js';
import { useCountUp } from '../../hooks/useCountUp.js';
import { TrendingDown, TrendingUp } from '../../components/icons/index.jsx';

function KpiCard({ label, value, decimals = 0, unit, hint }) {
  const animated = useCountUp(value);
  return (
    <article className="kpi-card">
      <h3>{label}</h3>
      <p className="kpi-card__value">{formatNumber(animated, decimals)}</p>
      {unit ? <p className="kpi-card__unit">{unit}</p> : null}
      {hint ? <p className="kpi-card__hint">{hint}</p> : null}
    </article>
  );
}

export function KpiStrip({ results, comparison }) {
  return (
    <div className="kpi-grid">
      <KpiCard label="Daily footprint" value={results.daily} decimals={1} unit="kg CO2e" />
      <KpiCard label="Monthly footprint" value={results.monthly} decimals={0} unit="kg CO2e" />
      <KpiCard label="Annual footprint" value={results.annual} decimals={0} unit="kg CO2e" />
      <article className="kpi-card kpi-card--comparison">
        <h3>Vs. global average</h3>
        <p className={`kpi-card__value kpi-card__value--small ${comparison.below ? 'kpi-card__value--good' : 'kpi-card__value--bad'}`}>
          {comparison.below ? <TrendingDown size={20} aria-hidden="true" /> : <TrendingUp size={20} aria-hidden="true" />}
          {comparison.percent}%
        </p>
        <p className="kpi-card__hint">{comparison.below ? 'below' : 'above'} the global average</p>
      </article>
    </div>
  );
}
