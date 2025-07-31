// ==============================================================================
//                  Hook Personnalisé : usePagination
//
// Ce hook encapsule la logique complexe de calcul d'une plage de pagination.
// Il prend en compte le nombre total d'items, la taille de la page, et le
// nombre de pages "frères" à afficher autour de la page actuelle.
//
// Il renvoie une plage de pagination prête à être rendue, incluant des
// ellipses ("...") lorsque c'est nécessaire.
//
// La logique est basée sur des implémentations robustes et largement utilisées.
// ==============================================================================

import { useMemo } from 'react';
import { UI_SETTINGS } from '../utils/constants';

export const DOTS = '...';

/**
 * Fonction d'aide pour générer une plage de nombres.
 * @param {number} start - Le début de la plage.
 * @param {number} end - La fin de la plage.
 * @returns {number[]} Un tableau de nombres.
 */
const range = (start, end) => {
  let length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};


/**
 * Hook pour calculer et gérer la logique de pagination.
 * @param {object} props
 * @param {number} props.totalCount - Le nombre total d'items dans la liste.
 * @param {number} props.pageSize - Le nombre d'items par page.
 * @param {number} [props.siblingCount=1] - Le nombre de pages à afficher de chaque côté de la page actuelle.
 * @param {number} props.currentPage - La page actuellement active.
 * @returns {Array<number | string>} La plage de pagination à afficher (ex: [1, '...', 4, 5, 6, '...', 10]).
 */
export const usePagination = ({
  totalCount,
  pageSize = UI_SETTINGS.ITEMS_PER_PAGE,
  siblingCount = 1,
  currentPage,
}) => {
  const paginationRange = useMemo(() => {
    const totalPages = Math.ceil(totalCount / pageSize);

    // Le nombre de numéros de page à afficher, incluant la première page,
    // la dernière page, la page actuelle, les frères et les ellipses.
    const totalPageNumbers = siblingCount + 5;

    // Cas 1: Si le nombre de pages est inférieur aux numéros que nous voulons afficher,
    // on renvoie simplement la plage complète [1..totalPages].
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    // Décider si on doit afficher les ellipses à gauche, à droite, des deux côtés ou pas du tout.
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Cas 2: Pas d'ellipses à gauche, mais à droite.
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPages];
    }

    // Cas 3: Pas d'ellipses à droite, mais à gauche.
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Cas 4: Ellipses des deux côtés.
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    // Ce return est pour satisfaire TypeScript, mais ne devrait pas être atteint
    // en raison des conditions ci-dessus.
    return [];

  }, [totalCount, pageSize, siblingCount, currentPage]);

  return paginationRange;
};