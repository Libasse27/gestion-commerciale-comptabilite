// server/seeds/planComptable.js
const CompteComptable = require('../models/comptabilite/CompteComptable');
const { logger } = require('../middleware/logger');

function determinerType(compte) {
  if (compte.estTresorerie) return 'Tresorerie';
  if (compte.estTiers) return 'Tiers';
  if ([1, 2, 3, 4, 5].includes(compte.classe)) return 'Bilan';
  if ([6, 7, 8].includes(compte.classe)) return 'Resultat'; // Classe 8 incluse
  return 'Autre';
}

function determinerSens(classe) {
    if ([2, 3, 5, 6, 8].includes(classe)) return 'Debit'; // Classe 8 incluse
    if ([1, 4, 7].includes(classe)) return 'Credit';
    return 'Debit';
}

const planComptableData = [
  { numero: '1010', libelle: 'Capital social', classe: 1 },
  { numero: '1310', libelle: 'Subventions d\'équipement', classe: 1 },
  { numero: '2110', libelle: 'Terrains', classe: 2 },
  { numero: '2411', libelle: 'Matériel et outillage', classe: 2 },
  { numero: '2441', libelle: 'Matériel de transport', classe: 2 },
  { numero: '2812', libelle: 'Amortissements des brevets, licences', classe: 2 },
  { numero: '3110', libelle: 'Marchandises', classe: 3 },
  { numero: '3810', libelle: 'Stocks en voie d\'acheminement', classe: 3 },
  { numero: '4011', libelle: 'Fournisseurs', classe: 4, estTiers: true, estLettrable: true },
  { numero: '4081', libelle: 'Fournisseurs - Factures non parvenues', classe: 4, estTiers: true },
  { numero: '4111', libelle: 'Clients', classe: 4, estTiers: true, estLettrable: true },
  { numero: '4181', libelle: 'Clients - Factures à établir', classe: 4, estTiers: true },
  { numero: '4431', libelle: 'État, TVA facturée', classe: 4 },
  { numero: '4452', libelle: 'État, TVA récupérable sur immobilisations', classe: 4 },
  { numero: '4456', libelle: 'État, TVA récupérable sur charges', classe: 4 },
  { numero: '4457', libelle: 'État, Crédit de TVA à reporter', classe: 4 },
  { numero: '5210', libelle: 'Banques locales', classe: 5, estTresorerie: true },
  { numero: '5710', libelle: 'Caisse', classe: 5, estTresorerie: true },
  { numero: '5850', libelle: 'Virements de fonds', classe: 5, estTresorerie: true },
  { numero: '5541', libelle: 'Orange Money', classe: 5, estTresorerie: true },
  { numero: '5542', libelle: 'Wave', classe: 5, estTresorerie: true },
  { numero: '6011', libelle: 'Achats de marchandises', classe: 6 },
  { numero: '6270', libelle: 'Frais de télécommunications', classe: 6 },
  { numero: '6311', libelle: 'Salaires et appointements', classe: 6 },
  { numero: '6400', libelle: 'Impôts et taxes', classe: 6 },
  { numero: '7011', libelle: 'Ventes de marchandises', classe: 7 },
  { numero: '7061', libelle: 'Prestations de services', classe: 7 },
].map(compte => ({
  ...compte,
  type: determinerType(compte),
  sens: determinerSens(compte.classe),
}));

const seedPlanComptable = async (clean = true) => {
  if (clean) {
    await CompteComptable.deleteMany({});
    logger.info('Collection "CompteComptable" nettoyée.');
  }

  try {
    await CompteComptable.insertMany(planComptableData, { ordered: false });
    logger.info(`✅ ${planComptableData.length} comptes comptables ont été insérés.`);
  } catch (error) {
    if (error.code === 11000) {
        logger.warn('Certains comptes comptables existaient déjà. Opération terminée.');
    } else {
        logger.error('❌ Échec du seeding du plan comptable :', error);
        throw error;
    }
  }
};

module.exports = seedPlanComptable;