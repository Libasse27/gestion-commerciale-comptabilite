// client/src/components/common/Pagination.jsx
import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';
import { usePagination, DOTS } from '../../hooks/usePagination';

/**
 * Affiche une barre de pagination complète et interactive.
 */
const Pagination = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  siblingCount = 1,
  className = '',
}) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    pageSize,
    siblingCount,
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => onPageChange(currentPage + 1);
  const onPrevious = () => onPageChange(currentPage - 1);
  const lastPage = paginationRange[paginationRange.length - 1];

  return (
    <nav aria-label="Pagination" className={className}>
      <BootstrapPagination className="justify-content-center">
        <BootstrapPagination.Prev
          onClick={onPrevious}
          disabled={currentPage === 1}
        />
        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === DOTS) {
            return <BootstrapPagination.Ellipsis key={`dots-${index}`} disabled />;
          }
          return (
            <BootstrapPagination.Item
              key={pageNumber}
              active={pageNumber === currentPage}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </BootstrapPagination.Item>
          );
        })}
        <BootstrapPagination.Next
          onClick={onNext}
          disabled={currentPage === lastPage}
        />
      </BootstrapPagination>
    </nav>
  );
};

export default Pagination;