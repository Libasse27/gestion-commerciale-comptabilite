// ==============================================================================
//           Service de Gestion du Cycle de Vente (Logique Métier)
//
// MISE À JOUR : Ce service délègue maintenant tous les calculs de prix
// au `pricingService` pour une meilleure séparation des préoccupations.
// Son rôle est d'orchestrer le flux de création des documents de vente.
// ==============================================================================

// --- Import des Modèles ---
const Devis = require('../../models/commercial/Devis');
const Commande = require('../../models/commercial/Commande');
const Produit = require('../../models/commercial/Produit');
const Client = require('../../models/commercial/Client');

// --- Import des Utils et Services ---
const AppError = require('../../utils/appError');
const dateUtils = require('../../utils/dateUtils');
const pricingService = require('./pricingService'); // Import du service de pricing
const facturationService = require('./facturationService'); // Pour la création de facture

/**
 * Génère un nouveau numéro de document.
 * @private
 */
const _getNextNumero = async (prefix) => {
    // TODO: Remplacer par une vraie logique de numérotation séquentielle
    return `${prefix}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
}

/**
 * Fonction privée pour préparer les données des lignes pour le pricingService.
 * @private
 */
const _prepareLignesData = async (lignes) => {
  return await Promise.all(lignes.map(async (ligne) => {
    const produit = await Produit.findById(ligne.produitId);
    if (!produit) throw new AppError(`Produit avec l'ID ${ligne.produitId} non trouvé.`, 404);
    
    return {
      produit: produit._id,
      description: ligne.description || produit.nom,
      quantite: ligne.quantite,
      prixUnitaireHT: ligne.prixUnitaire || produit.prixVente,
      remise: ligne.remise,
      tauxTVA: ligne.tauxTVA || produit.tauxTVA,
    };
  }));
};


/**
 * Crée un nouveau devis.
 */
async function createDevis(devisData, userId) {
  const { clientId, lignes, validiteJours = 30 } = devisData;

  const client = await Client.findById(clientId);
  if (!client) throw new AppError('Client non trouvé.', 404);

  // 1. Préparer les données des lignes
  const lignesPourCalcul = await _prepareLignesData(lignes);

  // 2. Déléguer les calculs au pricingService
  const { totalHT, totalTVA, totalTTC, lignesCalculees } = pricingService.calculateDocumentTotals(lignesPourCalcul);

  // 3. Créer le document Devis avec les résultats
  const nouveauDevis = new Devis({
    numero: await _getNextNumero('DEV'), 
    client: clientId,
    dateValidite: dateUtils.addDaysToDate(new Date(), validiteJours),
    lignes: lignesCalculees,
    totalHT,
    totalTVA,
    totalTTC,
    creePar: userId,
  });

  await nouveauDevis.save();
  return nouveauDevis;
}

/**
 * Convertit un devis validé en commande.
 */
async function convertDevisToCommande(devisId, userId) {
  const devis = await Devis.findById(devisId);
  if (!devis) throw new AppError('Devis non trouvé.', 404);
  if (devis.statut !== 'validee') {
    throw new AppError('Seul un devis validé peut être converti en commande.', 400);
  }
  if (devis.commandeAssociee) {
      throw new AppError('Ce devis a déjà été converti en commande.', 400);
  }

  const nouvelleCommande = new Commande({
    numero: await _getNextNumero('CMD'),
    client: devis.client,
    lignes: devis.lignes, // Les calculs sont déjà faits, on recopie
    totalHT: devis.totalHT,
    totalTVA: devis.totalTVA,
    totalTTC: devis.totalTTC,
    devisOrigine: devis._id,
    creePar: userId,
  });

  await nouvelleCommande.save();

  devis.commandeAssociee = nouvelleCommande._id;
  devis.statut = 'converti';
  await devis.save();
  
  // TODO: Interagir avec le service de stock pour réserver les quantités
  // await stockService.reserveProducts(nouvelleCommande.lignes);

  return nouvelleCommande;
}

/**
 * Crée une facture directement en utilisant le facturationService.
 */
async function createFactureDirecte(factureData, userId) {
    // Note: La logique de création de facture a été déplacée vers le facturationService
    // pour une meilleure séparation des préoccupations. Ce service se contente de l'appeler.
    // Cette fonction pourrait même être supprimée si les contrôleurs appellent directement le bon service.
    
    // Pour l'instant, nous la laissons comme un alias pour des raisons de compatibilité.
    return await facturationService.createFacture(factureData, userId);
}


module.exports = {
  createDevis,
  convertDevisToCommande,
  createFactureDirecte, // Gardé comme alias
};