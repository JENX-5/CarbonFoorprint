import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { CarbonData as Data } from '../../lib/data.js';
import { CATEGORY_ICONS } from '../../components/icons/index.jsx';
import { formatNumber } from '../../lib/format.js';

ChartJS.register(ArcElement, Tooltip);

const CATEGORY_COLORS = {
  transportation: '#1b4332',
  electricity: '#e9c46a',
  diet: '#52796f',
  waste: '#bc6c25',
  water: '#7a857d'
};

export function EmissionsDonut({ byCategoryAnnual }) {
  const total = Data.CATEGORY_ORDER.reduce((sum, key) => sum + byCategoryAnnual[key], 0);

  const chartData = useMemo(() => ({
    labels: Data.CATEGORY_ORDER.map((key) => Data.CATEGORY_LABELS[key]),
    datasets: [{
      data: Data.CATEGORY_ORDER.map((key) => byCategoryAnnual[key]),
      backgroundColor: Data.CATEGORY_ORDER.map((key) => CATEGORY_COLORS[key]),
      borderWidth: 2,
      borderColor: 'var(--color-paper)',
      hoverOffset: 6
    }]
  }), [byCategoryAnnual]);

  const options = {
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(context) {
            const value = context.parsed;
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return ` ${formatNumber(value, 0)} kg CO2e (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="emissions-donut">
      <div className="emissions-donut__chart">
        <Doughnut data={chartData} options={options} />
        <div className="emissions-donut__center">
          <span className="emissions-donut__center-value">{formatNumber(total, 0)}</span>
          <span className="emissions-donut__center-label">kg CO2e / yr</span>
        </div>
      </div>
      <ul className="emissions-legend">
        {Data.CATEGORY_ORDER.map((key) => {
          const Icon = CATEGORY_ICONS[key];
          const value = byCategoryAnnual[key];
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <li key={key} className="emissions-legend__item">
              <span className="emissions-legend__dot" style={{ background: CATEGORY_COLORS[key] }} aria-hidden="true" />
              <Icon size={14} aria-hidden="true" className="emissions-legend__icon" />
              <span className="emissions-legend__label">{Data.CATEGORY_LABELS[key]}</span>
              <span className="emissions-legend__pct">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
