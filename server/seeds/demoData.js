const mongoose = require('mongoose');
const dotenv = require('dotenv');

// --- Chargement des dépendances et modèles ---
dotenv.config({ path: './server/.env' });
const Client = require('../models/commercial/Client');
const Fournisseur = require('../models/commercial/Fournisseur');
const Produit = require('../models/commercial/Produit');
const Facture = require('../models/commercial/Facture');
const Paiement = require('../models/paiements/Paiement');
const User = require('../models/auth/User');
const CompteComptable = require('../models/comptabilite/CompteComptable');

// --- Données de Démonstration ---
const demoClients = [
  { nom: 'Senelec', email: 'contact@senelec.sn', telephone: '338393030', adresse: '28 Rue Vincens, Dakar' },
  { nom: 'Sonatel', email: 'serviceclient@orange-sonatel.com', telephone: '338391200', adresse: '6 Rue Wagane Diouf, Dakar' },
];
const demoFournisseurs = [
  { nom: 'CFAO Technologies', email: 'info@cfao.com', telephone: '338496969', adresse: 'Km 2.5, Boulevard du Centenaire, Dakar' },
];
const demoProduits = [
  { nom: 'Ordinateur Portable HP EliteBook', reference: 'HP-ELITE-840', prixVente: 750000, type: 'BIEN_STOCKABLE' },
  { nom: 'Prestation de Conseil en Informatique (Heure)', reference: 'SERV-CONS-H', prixVente: 50000, type: 'SERVICE' },
  { nom: 'Licence Logiciel de Comptabilité (Annuel)', reference: 'LIC-COMPTA-AN', prixVente: 250000, type: 'SERVICE' },
];

/**
 * Fonction principale du seeder de démo.
 */
const seedDemoData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie pour le seeder de démo.');
    console.log('🧹 Nettoyage des anciennes données de démo...');
    await Promise.all([
      Facture.deleteMany({ isDemo: true }),
      Paiement.deleteMany({ isDemo: true }),
      Client.deleteMany({ isDemo: true }),
      Fournisseur.deleteMany({ isDemo: true }),
      Produit.deleteMany({ isDemo: true }),
    ]);
    console.log('-> Nettoyage terminé.');

    console.log('⏳ Récupération de l\'utilisateur de référence...');
    const demoUser = await User.findOne({ email: 'commercial@erp.sn' });
    if (!demoUser) throw new Error('Utilisateur "commercial@erp.sn" non trouvé. Lancez le seeder des utilisateurs.');
    console.log(`-> Utilisateur de référence trouvé : ${demoUser.email}`);

    console.log('⏳ Création des entités de base de démo...');
    const createdClients = [];
    for (const client of demoClients) {
      const result = await Client.updateOne(
        { email: client.email },
        { ...client, isDemo: true, creePar: demoUser._id },
        { upsert: true }
      );
      if (result.upsertedId) {
        createdClients.push({ _id: result.upsertedId, ...client });
      } else {
        const existingClient = await Client.findOne({ email: client.email });
        createdClients.push(existingClient);
      }
    }

    const createdFournisseurs = [];
    for (const fournisseur of demoFournisseurs) {
      const result = await Fournisseur.updateOne(
        { email: fournisseur.email },
        { ...fournisseur, isDemo: true, creePar: demoUser._id },
        { upsert: true }
      );
      if (result.upsertedId) {
        createdFournisseurs.push({ _id: result.upsertedId, ...fournisseur });
      } else {
        const existingFournisseur = await Fournisseur.findOne({ email: fournisseur.email });
        createdFournisseurs.push(existingFournisseur);
      }
    }

    const createdProduits = [];
    for (const produit of demoProduits) {
      const result = await Produit.updateOne(
        { reference: produit.reference },
        { ...produit, isDemo: true, creePar: demoUser._id },
        { upsert: true }
      );
      if (result.upsertedId) {
        createdProduits.push({ _id: result.upsertedId, ...produit });
      } else {
        const existingProduit = await Produit.findOne({ reference: produit.reference });
        createdProduits.push(existingProduit);
      }
    }

    console.log(`-> ${createdClients.length} clients, ${createdFournisseurs.length} fournisseurs, ${createdProduits.length} produits créés.`);
    console.log('⏳ Création des factures de vente de démo...');
    const clientSenelec = createdClients.find(client => client.email === 'contact@senelec.sn');
    const clientSonatel = createdClients.find(client => client.email === 'serviceclient@orange-sonatel.com');
    const produitOrdinateur = createdProduits.find(p => p.reference === 'HP-ELITE-840');
    const produitConseil = createdProduits.find(p => p.reference === 'SERV-CONS-H');

    const invoicesToCreate = [
      {
        numero: 'FACT-DEMO-001', client: clientSenelec._id,
        dateEmission: new Date('2025-06-15'), dateEcheance: new Date('2025-07-15'),
        lignes: [
          { produit: produitOrdinateur._id, quantite: 2, prixUnitaire: 750000, tva: 18 },
          { produit: produitConseil._id, quantite: 10, prixUnitaire: 50000, tva: 18 },
        ],
        statut: 'payee', isDemo: true, creePar: demoUser._id,
      },
      {
        numero: 'FACT-DEMO-002', client: clientSonatel._id,
        dateEmission: new Date('2025-07-01'), dateEcheance: new Date('2025-07-31'),
        lignes: [{ produit: produitConseil._id, quantite: 20, prixUnitaire: 50000, tva: 18 }],
        statut: 'envoyee', isDemo: true, creePar: demoUser._id,
      }
    ];

    for (const invoice of invoicesToCreate) {
      invoice.totalHT = invoice.lignes.reduce((sum, line) => sum + line.quantite * line.prixUnitaire, 0);
      invoice.totalTTC = invoice.lignes.reduce((sum, line) => {
        const ht = line.quantite * line.prixUnitaire;
        return sum + ht * (1 + (line.tva / 100));
      }, 0);
    }

    const createdInvoices = await Facture.insertMany(invoicesToCreate);
    console.log(`-> ${createdInvoices.length} factures créées.`);

    console.log('⏳ Création des paiements de démo...');
    const compteBanque = await CompteComptable.findOne({ numeroCompte: '5210' });
    if (!compteBanque) throw new Error('Compte "Banques locales" non trouvé. Lancez le seeder du plan comptable.');

    const paidInvoice = createdInvoices.find(inv => inv.statut === 'payee');
    if (paidInvoice) {
      const paymentsToCreate = [
        {
          facture: paidInvoice._id, client: paidInvoice.client, montant: paidInvoice.totalTTC,
          modePaiement: 'Virement Bancaire', compteCredite: compteBanque._id,
          datePaiement: new Date('2025-07-10'), isDemo: true, creePar: demoUser._id,
        }
      ];
      await Paiement.insertMany(paymentsToCreate);
      console.log(`-> ${paymentsToCreate.length} paiements créés.`);
    }

    console.log('\n🎉 Seeding des données de démo terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du seeding des données de démo :', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion à MongoDB fermée.');
  }
};

seedDemoData();
