// server/seeds/modesPaiement.js
const ModePaiement = require('../models/paiements/ModePaiement');
const CompteComptable = require('../models/comptabilite/CompteComptable');
const { logger } = require('../middleware/logger');

const seedModesPaiement = async (clean = true) => {
  if (clean) await ModePaiement.deleteMany({});
  
  try {
    const compteCaisse = await CompteComptable.findOne({ numero: '5710' }).lean();
    const compteBanque = await CompteComptable.findOne({ numero: '5210' }).lean();
    const compteWave = await CompteComptable.findOne({ numero: '5542' }).lean();
    const compteOM = await CompteComptable.findOne({ numero: '5541' }).lean();

    const modesData = [
      { nom: 'Espèces', type: 'Tresorerie', compteComptableAssocie: compteCaisse?._id },
      { nom: 'Virement Bancaire', type: 'Tresorerie', compteComptableAssocie: compteBanque?._id },
      { nom: 'Chèque', type: 'Tresorerie', compteComptableAssocie: compteBanque?._id },
      { nom: 'Wave', type: 'Tresorerie', compteComptableAssocie: compteWave?._id },
      { nom: 'Orange Money', type: 'Tresorerie', compteComptableAssocie: compteOM?._id },
    ];

    for (const data of modesData) {
        await ModePaiement.findOneAndUpdate({ nom: data.nom }, data, { upsert: true });
    }
    
    logger.info(`✅ ${modesData.length} modes de paiement de base ont été initialisés.`);
  } catch (error) {
    logger.error("❌ Erreur lors de l'amorçage des modes de paiement :", error);
    throw error;
  }
};

module.exports = seedModesPaiement;