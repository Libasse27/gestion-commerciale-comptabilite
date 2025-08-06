// server/services/system/numerotationService.js
const Numerotation = require('../../models/system/Numerotation');
const AppError = require('../../utils/appError');
const { logger } = require('../../middleware/logger');

/**
 * Génère le prochain numéro pour un type de document donné.
 * @param {string} typeDocument - La clé du document (ex: 'facture_vente').
 * @returns {Promise<string>} Le numéro de document formaté.
 */
async function getNextNumero(typeDocument) {
  if (!typeDocument) {
    throw new AppError('Un type de document est requis pour la numérotation.', 500);
  }

  const now = new Date();
  const anneeActuelle = now.getFullYear();
  const moisActuel = now.getMonth() + 1;

  const config = await Numerotation.findOne({ typeDocument });

  if (!config) {
    logger.error(`Configuration de numérotation introuvable pour le type: ${typeDocument}`);
    throw new AppError(`Configuration de numérotation introuvable. Veuillez contacter un administrateur.`, 500);
  }

  let doitReset = false;
  if (config.resetSequence === 'Annuelle' && config.derniereAnneeReset !== anneeActuelle) {
    doitReset = true;
  } else if (config.resetSequence === 'Mensuelle' && (config.derniereAnneeReset !== anneeActuelle || config.dernierMoisReset !== moisActuel)) {
    doitReset = true;
  }

  const updateOperation = doitReset
    ? { $set: { derniereSequence: 1, derniereAnneeReset: anneeActuelle, dernierMoisReset: moisActuel } }
    : { $inc: { derniereSequence: 1 } };

  const updatedConfig = await Numerotation.findOneAndUpdate(
    { typeDocument },
    updateOperation,
    { new: true }
  );

  if (!updatedConfig) {
      throw new AppError(`Impossible de mettre à jour la séquence pour le document de type '${typeDocument}'.`, 500);
  }

  const sequence = updatedConfig.derniereSequence;
  const sequencePadding = updatedConfig.longueurSequence || 4;
  const sequenceFormatee = String(sequence).padStart(sequencePadding, '0');

  let numeroFinal = updatedConfig.format
    .replace(/{PREFIX}/g, updatedConfig.prefixe)
    .replace(/{AAAA}/g, anneeActuelle.toString())
    .replace(/{AA}/g, anneeActuelle.toString().slice(-2))
    .replace(/{MM}/g, String(moisActuel).padStart(2, '0'))
    .replace(/{SEQ}/g, sequenceFormatee);

  return numeroFinal;
}

module.exports = {
  getNextNumero,
};