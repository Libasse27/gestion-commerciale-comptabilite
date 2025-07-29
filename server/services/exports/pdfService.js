// ==============================================================================
//           Service pour la Génération de Documents PDF
//
// Ce service utilise Puppeteer pour contrôler un navigateur headless (Chromium)
// afin de convertir du HTML en PDF.
//
// Cette approche garantit un rendu pixel-perfect et une grande flexibilité
// car les documents sont designés en HTML/CSS via des templates EJS.
// ==============================================================================

const puppeteer = require('puppeteer');
const path = require('path');
const ejs = require('ejs');
const parametrageService = require('../system/parametrageService');
const { formatCurrency, formatDateFr } = require('../../utils/formatters');
const { logger } = require('../../middleware/logger');

/**
 * Génère un document PDF à partir d'un template EJS et de données.
 * @param {string} templateName - Le nom du fichier de template (sans .ejs) dans /templates/pdf.
 * @param {object} data - L'objet de données à injecter dans le template.
 * @returns {Promise<Buffer>} Un buffer contenant le PDF généré.
 */
async function generatePdfFromTemplate(templateName, data) {
  let browser = null;
  try {
    // 1. Rendre le template HTML avec les données
    const templatePath = path.join(__dirname, `../../templates/pdf/${templateName}.ejs`);
    // On ajoute des helpers au template pour le formatage
    const htmlContent = await ejs.renderFile(templatePath, {
        ...data,
        formatCurrency,
        formatDateFr
    });

    // 2. Lancer Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Requis pour les environnements Linux/Docker
    });
    const page = await browser.newPage();

    // 3. Charger le HTML dans la page
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // 4. Générer le PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '22mm'
      }
    });

    return pdfBuffer;
  } catch (error) {
    logger.error('Erreur lors de la génération du PDF.', { error });
    throw new Error('Impossible de générer le document PDF.');
  } finally {
    // 5. S'assurer que le navigateur est bien fermé
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Fonction de haut niveau pour générer spécifiquement une facture PDF.
 * @param {object} facture - Le document Mongoose de la facture.
 * @returns {Promise<Buffer>}
 */
async function genererPdfFacture(facture) {
    // 1. Récupérer les informations nécessaires
    const client = await facture.populate('client');
    const entreprise = await parametrageService.getInformationsEntreprise();
    
    const data = {
        facture,
        client: facture.client,
        entreprise: entreprise || { nom: 'Mon Entreprise' }, // Fallback
        dateEmission: formatDateFr(facture.dateEmission),
        dateEcheance: formatDateFr(facture.dateEcheance),
    };
    
    // 2. Appeler le générateur générique
    return await generatePdfFromTemplate('facture', data);
}


module.exports = {
  genererPdfFacture,
};