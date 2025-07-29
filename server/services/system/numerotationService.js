// ==============================================================================
//           Service pour la Gestion de la Numérotation Séquentielle
//
// Ce service fournit une fonction unique, `getNextNumero`, pour générer des
// numéros de documents uniques, formatés et séquentiels en se basant sur
// des configurations stockées dans le modèle `Numerotation`.
//
// Il gère l'atomicité de l'incrémentation et la réinitialisation
// périodique des séquences.
// ==============================================================================

const Numerotation = require('../../models/system/Numerotation');
const AppError = require('../../utils/appError');
const { logger } = require('../../middleware/logger');

/**
 * Génère le prochain numéro de séquence pour un type de document donné.
 *
 * @param {string} typeDocument - La clé du document (ex: 'client', 'facture').
 * @returns {Promise<string>} Le numéro de document formaté.
 */
async function getNextNumero(typeDocument) {
  if (!typeDocument) {
    throw new AppError('Un type de document est requis pour la numérotation.', 500);
  }

  // --- 1. Récupérer la configuration de numérotation ---
  let config = await Numerotation.findOne({ typeDocument });

  if (!config) {
    // Si aucune configuration n'existe, on en crée une par défaut.
    // C'est une sécurité, mais idéalement les configs sont créées via un seeder ou une interface.
    logger.warn(`Aucune configuration de numérotation trouvée pour '${typeDocument}'. Création d'une configuration par défaut.`);
    config = new Numerotation({
      typeDocument,
      prefixe: typeDocument.substring(0, 3).toUpperCase(),
    });
  }

  const now = new Date();
  const anneeActuelle = now.getFullYear();
  const moisActuel = now.getMonth() + 1;
  let sequenceActuelle = config.derniereSequence;

  // --- 2. Gérer la réinitialisation de la séquence (annuelle/mensuelle) ---
  let reset = false;
  if (config.resetSequence === 'Annuelle' && config.derniereAnneeReset !== anneeActuelle) {
    sequenceActuelle = 0;
    config.derniereAnneeReset = anneeActuelle;
    reset = true;
  } else if (config.resetSequence === 'Mensuelle' && (config.derniereAnneeReset !== anneeActuelle || config.dernierMoisReset !== moisActuel)) {
    sequenceActuelle = 0;
    config.derniereAnneeReset = anneeActuelle;
    config.dernierMoisReset = moisActuel;
    reset = true;
  }
  
  // --- 3. Incrémenter la séquence de manière atomique ---
  // Si on reset, on met la séquence à 1. Sinon, on l'incrémente.
  const updateOperation = reset
    ? { $set: { derniereSequence: 1, derniereAnneeReset: config.derniereAnneeReset, dernierMoisReset: config.dernierMoisReset } }
    : { $inc: { derniereSequence: 1 } };
    
  const updatedConfig = await Numerotation.findOneAndUpdate(
      { typeDocument },
      updateOperation,
      { new: true, upsert: true }
  );

  // --- 4. Formater le numéro final ---
  const sequenceFormatee = updatedConfig.derniereSequence
    .toString()
    .padStart(config.longueurSequence, '0');

  let numeroFinal = config.format;
  numeroFinal = numeroFinal.replace('{PREFIX}', config.prefixe);
  numeroFinal = numeroFinal.replace('{AAAA}', anneeActuelle.toString());
  numeroFinal = numeroFinal.replace('{AA}', anneeActuelle.toString().slice(-2));
  numeroFinal = numeroFinal.replace('{MM}', moisActuel.toString().padStart(2, '0'));
  numeroFinal = numeroFinal.replace('{SEQ}', sequenceFormatee);

  return numeroFinal;
}

module.exports = {
  getNextNumero,
};