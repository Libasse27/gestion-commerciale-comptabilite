// server/seeds/parametres.js
const Parametrage = require('../models/system/Parametrage');
const { logger } = require('../middleware/logger');

const defaultSettings = [
  { cle: 'ENTREPRISE_NOM', valeur: 'Mon Entreprise S.A.R.L', description: 'Le nom légal de votre entreprise', type: 'Texte', groupe: 'Entreprise' },
  { cle: 'ENTREPRISE_ADRESSE', valeur: '123 Avenue de l\'Indépendance, Dakar, Sénégal', description: 'Adresse complète du siège social', type: 'TexteLong', groupe: 'Entreprise' },
  { cle: 'ENTREPRISE_EMAIL', valeur: 'contact@mon-entreprise.sn', description: 'Email de contact principal', type: 'Texte', groupe: 'Entreprise' },
  { cle: 'ENTREPRISE_TELEPHONE', valeur: '+221 33 800 00 00', description: 'Numéro de téléphone principal', type: 'Texte', groupe: 'Entreprise' },
  { cle: 'ENTREPRISE_NINEA', valeur: '001234567', description: 'Votre numéro NINEA', type: 'Texte', groupe: 'Entreprise' },
  { cle: 'ENTREPRISE_RCCM', valeur: 'SN.DKR.2024.A.12345', description: 'Votre numéro de Registre du Commerce (RCCM)', type: 'Texte', groupe: 'Entreprise' },
  { cle: 'ENTREPRISE_LOGO_URL', valeur: '', description: 'URL de votre logo', type: 'URL', groupe: 'Entreprise' },
  { cle: 'TVA_TAUX_DEFAUT', valeur: '18', description: 'Taux de TVA par défaut en % (ex: 18)', type: 'Nombre', groupe: 'Fiscalite' },
  { cle: 'DEVISE_DEFAUT', valeur: 'XOF', description: 'Code de la devise par défaut (ex: XOF)', type: 'Texte', groupe: 'Fiscalite' },
  { cle: 'FACTURE_PIED_DE_PAGE', valeur: 'Merci de votre confiance.', description: 'Texte affiché en bas des factures', type: 'Texte', groupe: 'Ventes' },
  { cle: 'DEVIS_VALIDITE_JOURS', valeur: '30', description: 'Durée de validité par défaut des devis (en jours)', type: 'Nombre', groupe: 'Ventes' },
];

const seedParametres = async (clean = true) => {
  if (clean) {
    await Parametrage.deleteMany({});
    logger.info('Collection "Parametrage" nettoyée.');
  }

  try {
    if (defaultSettings.length === 0) return;

    const operations = defaultSettings.map(setting => ({
      updateOne: {
        filter: { cle: setting.cle },
        update: { $set: setting },
        upsert: true,
      },
    }));

    const result = await Parametrage.bulkWrite(operations);
    
    logger.info('Traitement des paramètres système terminé.');
    logger.info(`✅ ${result.upsertedCount} nouveau(x) paramètre(s) créé(s).`);
    if (!clean) {
      logger.info(`🔄 ${result.modifiedCount} paramètre(s) existant(s) mis à jour.`);
    }

  } catch (error) {
    logger.error('❌ Erreur lors de l\'amorçage des paramètres système :', error);
    throw error;
  }
};

module.exports = seedParametres;