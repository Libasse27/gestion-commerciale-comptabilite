// server/seeds/numerotations.js
const Numerotation = require('../models/system/Numerotation');
const { logger } = require('../middleware/logger');

const defaultNumerotations = [
  { typeDocument: 'facture_vente', format: 'FV-{AAAA}-{SEQ}', prefixe: 'FV', longueurSequence: 5, resetSequence: 'Annuelle' },
  { typeDocument: 'facture_achat', format: 'FA-{AAAA}{MM}-{SEQ}', prefixe: 'FA', longueurSequence: 5, resetSequence: 'Annuelle' },
  { typeDocument: 'devis', format: 'DV-{AAAA}{MM}-{SEQ}', prefixe: 'DV', longueurSequence: 4, resetSequence: 'Annuelle' },
  { typeDocument: 'bon_livraison', format: 'BL-{AAAA}-{SEQ}', prefixe: 'BL', longueurSequence: 5, resetSequence: 'Annuelle' },
  { typeDocument: 'commande', format: 'BC-{AAAA}-{SEQ}', prefixe: 'BC', longueurSequence: 5, resetSequence: 'Annuelle' },
  { typeDocument: 'inventaire', format: 'INV-{AAAA}-{SEQ}', prefixe: 'INV', longueurSequence: 4, resetSequence: 'Annuelle' },
  { typeDocument: 'ecriture_comptable', format: 'EC-{AA}{MM}-{SEQ}', prefixe: 'EC', longueurSequence: 6, resetSequence: 'Mensuelle' },
  { typeDocument: 'client', format: 'CLT-{SEQ}', prefixe: 'CLT', longueurSequence: 6, resetSequence: null },
  { typeDocument: 'fournisseur', format: 'FRS-{SEQ}', prefixe: 'FRS', longueurSequence: 5, resetSequence: null },
  { typeDocument: 'produit', format: 'PROD-{SEQ}', prefixe: 'PROD', longueurSequence: 6, resetSequence: null },
];

const seedNumerotations = async (clean = true) => {
  if (clean) {
    await Numerotation.deleteMany({});
    logger.info('Collection "Numerotation" nettoyée.');
  }

  try {
    if (defaultNumerotations.length === 0) return;

    const operations = defaultNumerotations.map(config => ({
      updateOne: {
        filter: { typeDocument: config.typeDocument },
        update: { $set: config },
        upsert: true,
      },
    }));

    const result = await Numerotation.bulkWrite(operations);
    
    logger.info('Traitement des configurations de numérotation terminé.');
    logger.info(`✅ ${result.upsertedCount} nouvelle(s) configuration(s) créée(s).`);
    if (!clean) {
      logger.info(`🔄 ${result.modifiedCount} configuration(s) existante(s) mise(s) à jour.`);
    }

  } catch (error) {
    logger.error('❌ Erreur lors de l\'amorçage des numérotations :', error);
    throw error;
  }
};

module.exports = seedNumerotations;