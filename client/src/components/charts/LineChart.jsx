// ==============================================================================
//           Composant Graphique Linéaire (LineChart)
//
// MISE À JOUR : Ajout du plugin 'Filler' pour permettre le remplissage de
// couleur sous la courbe du graphique (option `fill: true`).
// ==============================================================================

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // <-- 1. Importer le plugin 'Filler'
} from 'chart.js';

// --- Enregistrement des composants Chart.js ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // <-- 2. Enregistrer le plugin ici
);


const LineChart = ({ data, options }) => {
  // ... (le reste du composant est inchangé)
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { /* ... */ },
    scales: { /* ... */ }
  };
  const chartOptions = { ...defaultOptions, ...options };

  return <Line options={chartOptions} data={data} />;
};

export default LineChart;