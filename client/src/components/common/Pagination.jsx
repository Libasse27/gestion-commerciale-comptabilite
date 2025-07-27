// ==============================================================================
//                Composant de Pagination Générique
//
// Ce composant affiche une barre de pagination et gère la logique de navigation
// entre les pages. Il est conçu pour être simple à utiliser et à contrôler
// depuis un composant parent.
//
// Il calcule dynamiquement les numéros de page à afficher pour éviter de
// surcharger l'interface lorsqu'il y a un grand nombre de pages.
//
// Il s'appuie sur le composant `Pagination` de `react-bootstrap`.
// ==============================================================================

import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';

/**
 * Affiche une barre de pagination.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {number} props.currentPage - Le numéro de la page actuellement affichée (base 1).
 * @param {number} props.totalPages - Le nombre total de pages disponibles.
 * @param {function(number): void} props.onPageChange - La fonction de callback appelée avec le nouveau numéro de page lorsqu'une page est cliquée.
 * @param {number} [props.maxVisiblePages=5] - Le nombre maximum de boutons de page à afficher en même temps.
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}) => {
  // Ne rien afficher si il n'y a qu'une seule page ou aucune
  if (totalPages <= 1) {
    return null;
  }

  /**
   * Calcule les numéros de page à afficher autour de la page actuelle.
   * @returns {Array<number|string>} Un tableau de numéros de page ou de '...' (ellipsis).
   */
  const getPageNumbers = () => {
    const pageNumbers = [];
    const half = Math.floor(maxVisiblePages / 2);

    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    // Ellipsis au début
    if (start > 1) {
      pageNumbers.push(1);
      if (start > 2) {
        pageNumbers.push('...');
      }
    }

    // Numéros de page
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    // Ellipsis à la fin
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="d-flex justify-content-center">
      <BootstrapPagination>
        {/* Bouton 'Précédent' */}
        <BootstrapPagination.Prev
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />

        {/* Numéros de page */}
        {pageNumbers.map((page, index) => {
          if (typeof page === 'string') {
            // Affiche les '...' (ellipsis)
            return <BootstrapPagination.Ellipsis key={`ellipsis-${index}`} disabled />;
          }
          return (
            <BootstrapPagination.Item
              key={page}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </BootstrapPagination.Item>
          );
        })}

        {/* Bouton 'Suivant' */}
        <BootstrapPagination.Next
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </BootstrapPagination>
    </div>
  );
};

export default Pagination;