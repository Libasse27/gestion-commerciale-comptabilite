// ==============================================================================
//           Composant Utilitaire pour l'Export de Données en Excel
//
// Ce composant fournit un bouton qui, au clic, génère et télécharge un fichier
// Excel (.xlsx) à partir d'un jeu de données fourni.
//
// Il utilise la bibliothèque `xlsx` (SheetJS) pour la création du fichier.
//
// Il est conçu pour être réutilisable : il suffit de lui passer les données,
// les en-têtes et le nom du fichier.
// ==============================================================================

import React from 'react';
import { Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { Download } from 'react-bootstrap-icons';

/**
 * @typedef {object} ExcelColumn
 * @property {string} Header - Le nom de l'en-tête de la colonne dans le fichier Excel.
 * @property {string} accessor - La clé pour accéder à la donnée dans l'objet de données.
 */

/**
 * Un bouton qui exporte un tableau de données en fichier Excel.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {Array<object>} props.data - Le tableau de données à exporter.
 * @param {Array<ExcelColumn>} props.columns - La configuration des colonnes à exporter.
 * @param {string} props.filename - Le nom du fichier à télécharger (sans l'extension .xlsx).
 * @param {string} [props.sheetName='Données'] - Le nom de la feuille dans le classeur Excel.
 * @param {string} [props.buttonText='Exporter en Excel'] - Le texte du bouton.
 * @param {React.ReactNode} [props.icon=<Download />] - L'icône à afficher sur le bouton.
 */
const ExportExcel = ({
  data,
  columns,
  filename,
  sheetName = 'Données',
  buttonText = 'Exporter en Excel',
  icon = <Download className="me-2" />,
  ...buttonProps // Pour passer d'autres props au bouton (variant, size, etc.)
}) => {

  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }

    // 1. Transformer les données pour qu'elles correspondent aux colonnes
    const dataToExport = data.map(row => {
      let newRow = {};
      columns.forEach(col => {
        newRow[col.Header] = row[col.accessor];
      });
      return newRow;
    });

    // 2. Créer une nouvelle feuille de calcul à partir des données JSON
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Créer un nouveau classeur
    const workbook = XLSX.utils.book_new();

    // 4. Ajouter la feuille de calcul au classeur
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 5. Générer le fichier binaire et déclencher le téléchargement
    // Le `bookType: 'xlsx'` est important pour le format .xlsx
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  return (
    <Button onClick={handleExport} {...buttonProps}>
      {icon}
      {buttonText}
    </Button>
  );
};

export default ExportExcel;