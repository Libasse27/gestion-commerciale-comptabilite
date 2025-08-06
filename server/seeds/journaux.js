// server/seeds/journaux.js
// ==============================================================================
//           Seeder pour les Journaux Comptables de Base
//
// Ce script initialise les journaux comptables essentiels (Ventes, Achats,
// Banque, etc.) et les lie à leurs comptes de contrepartie par défaut
// lorsque c'est applicable.
// ==============================================================================

const Journal = require('../models/comptabilite/Journal');
const CompteComptable = require('../models/comptabilite/CompteComptable');
const { logger } = require('../middleware/logger');

/**
 * Amorçage des journaux comptables par défaut.
 *
 * @param {boolean} [clean=true] - Si vrai, nettoie la collection avant l'amorçage.
 */
const seedJournaux = async (clean = true) => {
  if (clean) {
    await Journal.deleteMany({});
    logger.info('Collection "Journaux" nettoyée.');
  }

  try {
    // 1. Récupérer les comptes de contrepartie nécessaires depuis le plan comptable
    const compteBanque = await CompteComptable.findOne({ numero: '5210' }).lean();
    const compteCaisse = await CompteComptable.findOne({ numero: '5710' }).lean();

    if (!compteBanque || !compteCaisse) {
      throw new Error("Les comptes de trésorerie de base (5210, 5710) n'ont pas été trouvés. Veuillez d'abord amorcer le plan comptable.");
    }

    // 2. Définir les journaux par défaut
    const journauxData = [
      { code: 'AC', libelle: 'Journal des Achats', type: 'Achat' },
      { code: 'VE', libelle: 'Journal des Ventes', type: 'Vente' },
      { code: 'BQ', libelle: 'Journal de Banque', type: 'Tresorerie', compteContrepartie: compteBanque._id },
      { code: 'CA', libelle: 'Journal de Caisse', type: 'Tresorerie', compteContrepartie: compteCaisse._id },
      { code: 'OD', libelle: 'Journal des Opérations Diverses', type: 'Operations Diverses' },
    ];

    // 3. Utiliser "upsert" pour créer ou mettre à jour chaque journal
    for (const data of journauxData) {
        await Journal.findOneAndUpdate(
            { code: data.code }, // Filtre basé sur le code unique
            data,
            { upsert: true, runValidators: true }
        );
    }
    
    logger.info(`✅ ${journauxData.length} journaux comptables de base ont été initialisés.`);

  } catch (error) {
    logger.error("❌ Erreur lors de l'amorçage des journaux comptables :", error);
    throw error;
  }
};

module.exports = seedJournaux;