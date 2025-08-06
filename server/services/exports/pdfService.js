const puppeteer = require('puppeteer');
const path = require('path');
const ejs = require('ejs');
const parametrageService = require('../system/parametrageService');
const { formatCurrency, formatDate } = require('../../utils/formatters');
const { logger } = require('../../middleware/logger');

async function generatePdfFromTemplate(templateName, data) {
  let browser = null;
  try {
    const templatePath = path.join(__dirname, `../../templates/pdf/${templateName}.ejs`);
    const htmlContent = await ejs.renderFile(templatePath, {
        ...data,
        formatCurrency,
        formatDate,
    });

    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
    });

    return pdfBuffer;
  } catch (error) {
    logger.error(`Erreur génération PDF pour '${templateName}'.`, { error: error.message });
    throw new Error('Impossible de générer le document PDF.');
  } finally {
    if (browser) await browser.close();
  }
}

async function genererPdfFacture(facture) {
    await facture.populate(['client', 'lignes.produit']);
    const entrepriseParams = await parametrageService.getAllParametres();
    const entreprise = Object.keys(entrepriseParams)
        .filter(k => k.startsWith('ENTREPRISE_'))
        .reduce((obj, key) => {
            obj[key.replace('ENTREPRISE_', '').toLowerCase()] = entrepriseParams[key];
            return obj;
        }, {});
    
    const data = {
        facture: facture.toObject(),
        client: facture.client.toObject(),
        lignes: facture.lignes.map(l => l.toObject()),
        entreprise,
    };
    
    return generatePdfFromTemplate('facture', data);
}

module.exports = {
  generatePdfFromTemplate,
  genererPdfFacture,
};