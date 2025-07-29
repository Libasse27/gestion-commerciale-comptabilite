// ==============================================================================
//           Service pour la Génération de Fichiers Excel (.xlsx)
//
// Ce service utilise la bibliothèque `xlsx` (SheetJS) pour convertir des
// données (généralement des tableaux d'objets JSON) en fichiers Excel
// au format .xlsx.
//
// La génération côté serveur est idéale pour les exports volumineux ou pour
// formater des données avant de les envoyer au client.
// ==============================================================================

const XLSX = require('xlsx');
const { logger } = require('../../middleware/logger');

/**
 * Génère un buffer contenant un fichier Excel à partir d'un tableau de données.
 *
 * @param {Array<object>} data - Le tableau de données à exporter. Chaque objet représente une ligne.
 * @param {string} [sheetName='Données'] - Le nom de la feuille dans le classeur.
 * @returns {Buffer} Un buffer contenant le fichier .xlsx généré.
 */
function generateExcelBuffer(data, sheetName = 'Données') {
  try {
    // 1. Créer une nouvelle feuille de calcul à partir des données JSON.
    //    `json_to_sheet` prend un tableau d'objets et en déduit les en-têtes.
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // 2. Créer un nouveau classeur.
    const workbook = XLSX.utils.book_new();

    // 3. Ajouter la feuille de calcul au classeur.
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // 4. Écrire le classeur dans un buffer en mémoire.
    //    `type: 'buffer'` est la clé pour la génération côté serveur.
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return excelBuffer;
  } catch (error) {
    logger.error("Erreur lors de la génération du buffer Excel.", { error });
    throw new Error("Impossible de générer le fichier Excel.");
  }
}

/**
 * Fonction de haut niveau pour exporter une liste de clients.
 * Elle se charge de formater les données avant d'appeler le générateur.
 * @param {Array<mongoose.Document>} clients - Le tableau de documents Client.
 * @returns {Buffer} Le buffer du fichier Excel.
 */
async function exportClientsToExcel(clients) {
    // 1. Formater les données pour l'export.
    // On sélectionne et on renomme les champs pour un export propre.
    const dataToExport = clients.map(client => ({
        'Code Client': client.codeClient,
        'Nom': client.nom,
        'Email': client.email,
        'Téléphone': client.telephone,
        'Adresse': client.adresse,
        'NINEA': client.ninea,
        'Solde (XOF)': client.solde,
        'Date de Création': client.createdAt.toLocaleDateString('fr-SN'),
    }));

    // 2. Appeler le générateur générique.
    return generateExcelBuffer(dataToExport, 'Clients');
}


module.exports = {
  generateExcelBuffer,
  exportClientsToExcel,
};