import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function TrendChart({ history = [] }) {
  const isDark = document.documentElement.classList.contains('dark') || 
                 (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';

  // Format dates nicely
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
    } catch (e) {
      return 'Unknown';
    }
  };

  const chartData = {
    labels: history.map((entry) => formatDate(entry.date)),
    datasets: [
      {
        label: 'Annual Footprint',
        data: history.map((entry) => entry.annual),
        borderColor: '#1b4332',
        backgroundColor: 'rgba(27, 67, 50, 0.12)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#1b4332',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? '#1a1f1c' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#1b4332',
        bodyColor: isDark ? '#e0e0e0' : '#4a534d',
        borderColor: '#1b4332',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: (context) => ` ${context.raw.toLocaleString()} kg CO2e / yr`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: textColor,
          font: {
            size: 10,
            family: 'system-ui, sans-serif'
          },
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          font: {
            size: 10,
            family: 'system-ui, sans-serif'
          },
          callback: (value) => `${value} kg`
        }
      }
    }
  };

  if (!history || history.length < 2) {
    return (
      <div className="empty-state" style={{ height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', gap: '0.5rem' }}>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-charcoal)' }}>Waiting for more data...</p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-charcoal-soft)', textAlign: 'center' }}>
          Your baseline footprint is recorded. Recalculate or apply a scenario in the simulator to see your carbon trend over time.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '250px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
