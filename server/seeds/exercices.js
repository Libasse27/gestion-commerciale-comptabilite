// server/seeds/exercices.js
// ==============================================================================
//           Seeder pour l'Exercice Comptable Initial
//
// Ce script s'assure qu'un exercice comptable est ouvert pour l'année en cours,
// ce qui est une condition nécessaire pour pouvoir enregistrer des écritures.
// ==============================================================================

const ExerciceComptable = require('../models/comptabilite/ExerciceComptable');
const { logger } = require('../middleware/logger');

/**
 * Amorçage de l'exercice comptable de l'année en cours.
 *
 * @param {boolean} [clean=true] - Si vrai, nettoie la collection avant l'amorçage.
 */
const seedExercices = async (clean = true) => {
  if (clean) {
    await ExerciceComptable.deleteMany({});
    logger.info('Collection "ExercicesComptables" nettoyée.');
  }

  try {
    const currentYear = new Date().getFullYear();
    const existingExercice = await ExerciceComptable.findOne({ annee: currentYear });

    if (!existingExercice) {
      // Le Z à la fin des dates indique le fuseau horaire UTC,
      // ce qui est une bonne pratique pour éviter les problèmes de fuseaux horaires.
      await ExerciceComptable.create({
        annee: currentYear,
        dateDebut: new Date(`${currentYear}-01-01T00:00:00.000Z`),
        dateFin: new Date(`${currentYear}-12-31T23:59:59.999Z`),
        statut: 'Ouvert',
      });
      logger.info(`✅ Exercice comptable pour l'année ${currentYear} créé et ouvert.`);
    } else {
      logger.info(`L'exercice comptable pour l'année ${currentYear} existe déjà, aucune action requise.`);
    }
  } catch (error) {
    logger.error("❌ Erreur lors de l'amorçage de l'exercice comptable :", error);
    throw error;
  }
};

module.exports = seedExercices;