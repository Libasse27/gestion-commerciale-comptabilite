// ==============================================================================
//           Composant Graphique en Secteurs (PieChart)
//
// Ce composant encapsule `react-chartjs-2` pour afficher un graphique en
// secteurs (camembert) ou en anneau (doughnut).
//
// Il enregistre l'élément `ArcElement` de Chart.js, qui est nécessaire pour
// ce type de graphique.
// ==============================================================================

import React from 'react';
// On peut utiliser `Pie` ou `Doughnut` pour des styles légèrement différents
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement, // Élément spécifique pour les graphiques en secteurs/anneaux
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// --- Enregistrement des composants Chart.js ---
ChartJS.register(
  ArcElement, // On enregistre ArcElement
  Title,
  Tooltip,
  Legend
);

/**
 * Affiche un graphique en secteurs.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {object} props.data - L'objet de données pour le graphique.
 * @param {object} [props.options] - L'objet d'options pour personnaliser le graphique.
 * @param {('pie'|'doughnut')} [props.type='pie'] - Le type de graphique à afficher.
 */
const PieChart = ({ data, options, type = 'pie' }) => {
  // Options par défaut pour un graphique en secteurs
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right', // La légende est souvent mieux à droite ou en bas pour les "camemberts"
      },
      title: {
        display: false,
        text: 'Titre du Graphique en Secteurs',
      },
      // Optionnel: pour afficher les pourcentages directement sur le graphique
      // `chartjs-plugin-datalabels` est une excellente librairie pour ça.
    },
  };

  const chartOptions = { ...defaultOptions, ...options };

  // On utilise le composant `Pie` qui peut aussi servir pour les doughnuts.
  // La différence se fait souvent dans les options (ex: `cutout`)
  // Pour plus de clarté sémantique, on pourrait importer et utiliser <Doughnut>
  return <Pie options={chartOptions} data={data} />;
};

export default PieChart;