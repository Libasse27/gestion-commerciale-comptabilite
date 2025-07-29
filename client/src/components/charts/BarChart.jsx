// ==============================================================================
//           Composant Graphique en Barres (BarChart)
//
// Ce composant encapsule la bibliothèque `react-chartjs-2` pour afficher un
// graphique en barres.
//
// Comme le LineChart, il est réutilisable et est piloté par les props
// `data` et `options`.
//
// Il enregistre tous les éléments nécessaires de Chart.js pour un graphique
// en barres.
// ==============================================================================

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement, // Élément spécifique pour les graphiques en barres
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// --- Enregistrement des composants Chart.js ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement, // On enregistre BarElement
  Title,
  Tooltip,
  Legend
);

/**
 * Affiche un graphique en barres.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {object} props.data - L'objet de données pour le graphique.
 * @param {object} [props.options] - L'objet d'options pour personnaliser le graphique.
 */
const BarChart = ({ data, options }) => {
  // Options par défaut pour un graphique en barres
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: 'Titre du Graphique en Barres',
      },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
        },
        y: {
            beginAtZero: true, // L'axe Y commence toujours à 0
        },
    },
    indexAxis: 'x', // 'x' pour des barres verticales, 'y' pour des barres horizontales
  };

  const chartOptions = { ...defaultOptions, ...options };

  return <Bar options={chartOptions} data={data} />;
};

export default BarChart;