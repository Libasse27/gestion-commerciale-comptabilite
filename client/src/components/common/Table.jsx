// ==============================================================================
//                Composant de Tableau de Données Générique
//
// Ce composant est conçu pour afficher des données tabulaires de manière
// cohérente et réutilisable à travers l'application.
//
// Il est piloté par deux props principales : `data` et `columns`.
//   - `data`: Un tableau d'objets représentant les lignes.
//   - `columns`: Un tableau de configuration pour chaque colonne.
//
// Il gère automatiquement les états de chargement et les cas où il n'y a
// pas de données à afficher.
// ==============================================================================

import React from 'react';
import { Table as BootstrapTable } from 'react-bootstrap';
import Loader from './Loader';

/**
 * Affiche un tableau de données générique et configurable.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {Array<object>} props.data - Le tableau de données à afficher.
 * @param {Array<{Header: string, accessor: string, Cell?: function}>} props.columns - La configuration des colonnes.
 *   - Header: Le titre de l'en-tête de la colonne.
 *   - accessor: La clé de l'objet de données à afficher dans la cellule.
 *   - Cell: (Optionnel) Une fonction de rendu personnalisée pour la cellule. `({ row }) => ...`
 * @param {boolean} [props.isLoading=false] - Si true, affiche un indicateur de chargement.
 * @param {string} [props.emptyMessage='Aucune donnée à afficher.'] - Le message à afficher si les données sont vides.
 * @param {boolean} [props.striped=true] - Applique le style de lignes zébrées.
 * @param {boolean} [props.bordered=true] - Applique des bordures au tableau.
 * @param {boolean} [props.hover=true] - Met en surbrillance les lignes au survol.
 * @param {boolean} [props.responsive=true] - Rend le tableau responsive sur les petits écrans.
 */
const Table = ({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'Aucune donnée à afficher.',
  striped = true,
  bordered = true,
  hover = true,
  responsive = true,
}) => {

  const renderCellContent = (row, column) => {
    // Si une fonction de rendu personnalisée `Cell` est fournie, on l'utilise.
    if (column.Cell) {
      return column.Cell({ row });
    }
    // Sinon, on affiche simplement la valeur via l'accessor.
    return row[column.accessor];
  };

  return (
    <div className="table-container">
      <BootstrapTable
        striped={striped}
        bordered={bordered}
        hover={hover}
        responsive={responsive}
        className="align-middle" // Centre verticalement le contenu des cellules
      >
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.Header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            // --- État de Chargement ---
            <tr>
              <td colSpan={columns.length} className="text-center">
                <Loader centered text="Chargement des données..." />
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            // --- Affichage des Données ---
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {renderCellContent(row, column)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            // --- État Vide ---
            <tr>
              <td colSpan={columns.length} className="text-center text-muted py-4">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </BootstrapTable>
    </div>
  );
};

export default Table;