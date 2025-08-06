// client/src/components/charts/PieChart.jsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

/**
 * Affiche un graphique en anneau (Doughnut).
 */
const PieChart = ({ data, options }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20 },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            if (value !== null) {
              return `${label}: ${formatCurrency(value)}`;
            }
            return label;
          }
        }
      },
    },
    cutout: '60%',
  };

  const chartOptions = { ...defaultOptions, ...options };

  return <Doughnut options={chartOptions} data={data} />;
};

export default PieChart;