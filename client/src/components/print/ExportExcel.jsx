// client/src/components/print/ExportExcel.jsx
import React from 'react';
import { Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { FileEarmarkExcel } from 'react-bootstrap-icons';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

const ExportExcel = ({
  data,
  columns,
  filename,
  sheetName = 'Données',
  children = 'Exporter Excel',
  ...buttonProps
}) => {

  const { addNotification } = useNotification();

  const handleExport = () => {
    if (!data || data.length === 0) {
      addNotification("Aucune donnée à exporter.", TOAST_TYPES.WARNING);
      return;
    }

    try {
      const dataToExport = data.map(row => {
        let newRow = {};
        columns.forEach(col => {
          const value = col.accessor.split('.').reduce((o, i) => (o ? o[i] : ''), row);
          newRow[col.Header] = value;
        });
        return newRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
        console.error("Erreur lors de l'export Excel :", error);
        addNotification("Une erreur est survenue lors de l'exportation.", TOAST_TYPES.ERROR);
    }
  };

  return (
    <Button onClick={handleExport} {...buttonProps}>
      <FileEarmarkExcel className="me-2" />
      {children}
    </Button>
  );
};

export default ExportExcel;