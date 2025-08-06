// server/seeds/demoData.js
const { logger } = require('../middleware/logger');
const Client = require('../models/commercial/Client');
const Produit = require('../models/commercial/Produit');
const Facture = require('../models/commercial/Facture');
const Paiement = require('../models/paiements/Paiement');
const User = require('../models/auth/User');
const CompteComptable = require('../models/comptabilite/CompteComptable');
const ModePaiement = require('../models/paiements/ModePaiement');

const demoClientsData = [
  { nom: 'Senelec Demo', email: 'contact@senelec-demo.sn', telephone: '338393031', adresse: '28 Rue Vincens, Dakar', isDemo: true },
  { nom: 'Sonatel Demo', email: 'serviceclient@sonatel-demo.sn', telephone: '338391201', adresse: '6 Rue Wagane Diouf, Dakar', isDemo: true },
];
const demoProduitsData = [
  { nom: 'Ordi Portable HP Demo', reference: 'HP-DEMO-840', prixVenteHT: 750000, type: 'Produit', isDemo: true },
  { nom: 'Conseil (Heure) Demo', reference: 'SERV-DEMO-H', prixVenteHT: 50000, type: 'Service', isDemo: true },
];
const demoModesPaiement = [
    { nom: 'Virement Bancaire', type: 'Tresorerie' }, { nom: 'Chèque', type: 'Tresorerie' }, { nom: 'Wave', type: 'Tresorerie' },
];

const waitForEntity = async (model, query) => {
  const entity = await model.findOne(query).lean();
  if (!entity) throw new Error(`Entité requise introuvable: ${model.modelName} avec query ${JSON.stringify(query)}.`);
  return entity;
};

async function cleanDemoData() {
  logger.info('Nettoyage des anciennes données de démo...');
  await Promise.all([
    Facture.deleteMany({ creePar: { $exists: true } }), // Simplifié pour le nettoyage
    Paiement.deleteMany({ enregistrePar: { $exists: true } }),
    Client.deleteMany({ isDemo: true }),
    Produit.deleteMany({ isDemo: true }),
  ]);
}

async function seedBaseEntities(userId) {
  const createOrUpdate = (model, data, uniqueKey) => 
    model.bulkWrite(data.map(item => ({
      updateOne: { filter: { [uniqueKey]: item[uniqueKey] }, update: { $set: { ...item, creePar: userId } }, upsert: true }
    })));
  await Promise.all([
    createOrUpdate(Client, demoClientsData, 'email'),
    createOrUpdate(Produit, demoProduitsData, 'reference'),
    ModePaiement.bulkWrite(demoModesPaiement.map(item => ({ updateOne: { filter: { nom: item.nom }, update: { $set: item }, upsert: true } })))
  ]);
}

async function seedInvoicesAndPayments(userId) {
  const senelec = await waitForEntity(Client, { email: 'contact@senelec-demo.sn' });
  const ordinateur = await waitForEntity(Produit, { reference: 'HP-DEMO-840' });
  const conseil = await waitForEntity(Produit, { reference: 'SERV-DEMO-H' });
  const virement = await waitForEntity(ModePaiement, { nom: 'Virement Bancaire' });
  const compteBanque = await waitForEntity(CompteComptable, { numero: '5210' });

  const factureSenelecData = {
    client: senelec._id, dateEmission: new Date('2025-07-01'), dateEcheance: new Date('2025-07-15'),
    lignes: [{ produit: ordinateur._id, description: ordinateur.nom, quantite: 2, prixUnitaireHT: ordinateur.prixVenteHT, totalHT: 1500000, totalTTC: 1770000 }],
    totalHT: 1500000, totalTVA: 270000, totalTTC: 1770000, montantPaye: 1770000, creePar: userId,
  };
  const factureSenelec = await Facture.create(factureSenelecData);

  await Paiement.create({
      datePaiement: new Date('2025-07-10'), montant: factureSenelec.totalTTC, sens: 'Entrant',
      tiers: senelec._id, tiersModel: 'Client', modePaiement: virement._id, compteTresorerie: compteBanque._id,
      imputations: [{ facture: factureSenelec._id, factureModel: 'Facture', montantImpute: factureSenelec.totalTTC }],
      enregistrePar: userId,
  });
}

const seedDemoData = async () => {
  try {
    const user = await waitForEntity(User, { email: 'commercial@erp.sn' });
    await cleanDemoData();
    await seedBaseEntities(user._id);
    await seedInvoicesAndPayments(user._id);
    logger.info('🎉 Données de démonstration créées avec succès.');
  } catch (error) {
    logger.error('❌ Erreur durant le seeding de démo :', error);
    throw error;
  }
};

module.exports = seedDemoData;