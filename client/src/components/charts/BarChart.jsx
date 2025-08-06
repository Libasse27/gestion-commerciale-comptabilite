// client/src/components/charts/BarChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
);

const BarChart = ({ data, options }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
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
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return new Intl.NumberFormat('fr-FR', { notation: 'compact', compactDisplay: 'short' }).format(value);
              }
            }
        },
    },
    indexAxis: 'x',
  };

  const chartOptions = { ...defaultOptions, ...options };

  return <Bar options={chartOptions} data={data} />;
};

export default BarChart;