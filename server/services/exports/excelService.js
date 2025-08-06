// server/services/exports/excelService.js
const XLSX = require('xlsx');
const { logger } = require('../../middleware/logger');
const { formatDate } = require('../../utils/formatters');

function generateExcelBuffer(data, sheetName = 'Données') {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Auto-ajuster la largeur des colonnes
    const columnWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(key.length, ...data.map(row => row[key]?.toString().length || 0))
    }));
    worksheet['!cols'] = columnWidths;

    return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  } catch (error) {
    logger.error("Erreur lors de la génération du buffer Excel.", { error: error.message });
    throw new Error("Impossible de générer le fichier Excel.");
  }
}

function exportClientsToExcel(clients) {
    const dataToExport = clients.map(client => ({
        'Code Client': client.codeClient,
        'Nom': client.nom,
        'Email': client.email,
        'Téléphone': client.telephone,
        'Adresse': client.adresse,
        'NINEA': client.ninea,
        'Solde (XOF)': client.solde,
        'Date Création': formatDate(client.createdAt),
        'Statut': client.isActive ? 'Actif' : 'Inactif',
    }));
    return generateExcelBuffer(dataToExport, 'Clients');
}

function exportFacturesToExcel(factures) {
    const dataToExport = factures.map(facture => ({
        'Numéro': facture.numero,
        'Client': facture.client.nom, // Requiert que le client soit populé
        'Date Émission': formatDate(facture.dateEmission),
        'Date Échéance': formatDate(facture.dateEcheance),
        'Total HT (XOF)': facture.totalHT,
        'Total TVA (XOF)': facture.totalTVA,
        'Total TTC (XOF)': facture.totalTTC,
        'Payé (XOF)': facture.montantPaye,
        'Solde Dû (XOF)': facture.soldeDu,
        'Statut': facture.statut,
    }));
    return generateExcelBuffer(dataToExport, 'Factures');
}

module.exports = {
  generateExcelBuffer,
  exportClientsToExcel,
  exportFacturesToExcel,
};