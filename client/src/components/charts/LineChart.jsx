// ==============================================================================
//           Composant Graphique Linéaire (LineChart)
//
// Ce composant encapsule la bibliothèque `react-chartjs-2` pour afficher un
// graphique en courbes.
//
// Il est conçu pour être réutilisable en acceptant les données (`data`) et les
// options de configuration (`options`) via ses props.
//
// Il enregistre automatiquement tous les éléments nécessaires de Chart.js
// pour éviter les erreurs "is not a registered element".
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
} from 'chart.js';

// --- Enregistrement des composants Chart.js ---
// C'est une étape obligatoire depuis Chart.js v3+
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Affiche un graphique en courbes.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {object} props.data - L'objet de données pour le graphique, suivant la structure de Chart.js.
 *        Ex: { labels: ['Jan', 'Fev'], datasets: [{ label: 'Ventes', data: [100, 120] }] }
 * @param {object} [props.options] - L'objet d'options pour personnaliser le graphique.
 */
const LineChart = ({ data, options }) => {
  // Options par défaut pour un graphique propre et responsive
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false, // Important pour contrôler la hauteur
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false, // Le titre sera géré par le composant parent
        text: 'Titre du Graphique',
      },
    },
    scales: {
        x: {
            grid: {
                display: false // Masque la grille verticale
            }
        },
        y: {
            grid: {
                color: '#e9ecef' // Couleur de la grille horizontale
            },
            ticks: {
                // Optionnel: formater les labels de l'axe Y
                callback: function(value) {
                    return value.toLocaleString('fr-SN') + ' F';
                }
            }
        }
    }
  };
  
  // Fusionne les options par défaut avec celles passées en props
  const chartOptions = { ...defaultOptions, ...options };

  return <Line options={chartOptions} data={data} />;
};

export default LineChart;