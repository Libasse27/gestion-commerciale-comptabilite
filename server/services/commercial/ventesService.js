// server/services/commercial/ventesService.js
const Devis = require('../../models/commercial/Devis');
const Commande = require('../../models/commercial/Commande');
const Produit = require('../../models/commercial/Produit');
const Client = require('../../models/commercial/Client');
const AppError = require('../../utils/appError');
const dateUtils = require('../../utils/dateUtils');
const pricingService = require('./pricingService');
const facturationService = require('./facturationService');
const { DOCUMENT_STATUS } = require('../../utils/constants');

async function _prepareLignesData(lignes) {
  if (!lignes || !Array.isArray(lignes) || lignes.length === 0) {
    throw new AppError('Le document doit contenir au moins une ligne.', 400);
  }
  
  return Promise.all(lignes.map(async (ligne) => {
    const produit = await Produit.findById(ligne.produitId).lean();
    if (!produit) throw new AppError(`Produit avec l'ID ${ligne.produitId} non trouvé.`, 404);
    
    return {
      produit: produit._id,
      description: ligne.description || produit.nom,
      quantite: ligne.quantite,
      prixUnitaireHT: ligne.prixUnitaireHT ?? produit.prixVenteHT,
      tauxRemise: ligne.tauxRemise ?? 0,
      tauxTVA: ligne.tauxTVA ?? produit.tauxTVA,
    };
  }));
}

async function createDevis(devisData, userId) {
  const { clientId, lignes, validiteJours = 30, notes } = devisData;

  const client = await Client.findById(clientId).lean();
  if (!client) throw new AppError('Client non trouvé.', 404);

  const lignesPourCalcul = await _prepareLignesData(lignes);
  const { totalHT, totalTVA, totalTTC, lignesCalculees } = pricingService.calculateDocumentTotals(lignesPourCalcul);

  const nouveauDevis = await Devis.create({
    client: clientId,
    dateValidite: dateUtils.addDaysToDate(new Date(), validiteJours),
    lignes: lignesCalculees.map(l => ({...l, prixUnitaireHT: l.prixUnitaire, tauxRemise: l.remise.taux})),
    totalHT, totalTVA, totalTTC,
    creePar: userId, notes,
  });

  return nouveauDevis;
}

async function convertDevisToCommande(devisId, userId) {
  const devis = await Devis.findById(devisId);
  if (!devis) throw new AppError('Devis non trouvé.', 404);
  if (devis.statut !== DOCUMENT_STATUS.VALIDE) {
    throw new AppError('Seul un devis validé peut être converti en commande.', 400);
  }
  if (devis.commandeAssociee) {
      throw new AppError('Ce devis a déjà été converti en commande.', 409); // 409 Conflict
  }

  const nouvelleCommande = await Commande.create({
    client: devis.client,
    lignes: devis.lignes,
    totalHT: devis.totalHT, totalTVA: devis.totalTVA, totalTTC: devis.totalTTC,
    devisOrigine: devis._id, creePar: userId,
  });

  devis.commandeAssociee = nouvelleCommande._id;
  devis.statut = DOCUMENT_STATUS.VALIDE; // Mettre à jour le statut du devis
  await devis.save();
  
  return nouvelleCommande;
}

async function createFactureDirecte(factureData, userId) {
    return facturationService.createFacture(factureData, userId);
}

module.exports = {
  createDevis,
  convertDevisToCommande,
  createFactureDirecte,
};