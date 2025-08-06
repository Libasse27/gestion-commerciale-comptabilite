// client/src/components/common/Table.jsx
import React from 'react';
import { Table as BootstrapTable } from 'react-bootstrap';
import Loader from './Loader';

/**
 * Affiche un tableau de données générique et configurable.
 * @param {{
 *  data: Array<object>,
 *  columns: Array<{Header: string, accessor: string, Cell?: ({ row, value }) => React.ReactNode}>,
 *  isLoading?: boolean,
 *  emptyMessage?: string,
 * }} props
 */
const Table = ({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'Aucune donnée à afficher.',
}) => {

  const renderCellContent = (row, column) => {
    const value = column.accessor.split('.').reduce((o, i) => (o ? o[i] : null), row);
    if (column.Cell) {
      return column.Cell({ row, value });
    }
    return value === null || value === undefined ? '' : String(value);
  };

  return (
    <div className="table-responsive">
      <BootstrapTable striped bordered hover responsive className="align-middle">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.Header}>{column.Header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length}>
                <Loader centered showText text="Chargement..." />
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={row._id || row.id || rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {renderCellContent(row, column)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted p-5">
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