// client/src/components/charts/LineChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

const LineChart = ({ data, options }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => {
            // Formatter en k (kilo) ou M (million)
            return new Intl.NumberFormat('fr-FR', { notation: 'compact', compactDisplay: 'short' }).format(value);
          }
        }
      }
    },
    elements: { line: { tension: 0.3 } },
  };

  const chartOptions = { ...defaultOptions, ...options };

  return <Line options={chartOptions} data={data} />;
};

export default LineChart;