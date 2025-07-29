// ==============================================================================
//           Service de Gestion des Inventaires (Logique Métier)
//
// Ce service encapsule toute la logique métier liée au processus d'inventaire
// physique des stocks.
//
// Il orchestre la création, la modification et la validation des inventaires,
// et interagit avec le `stockService` pour appliquer les ajustements de stock
// nécessaires une fois qu'un inventaire est validé.
// ==============================================================================

// --- Import des Modèles et Services ---
const Inventaire = require('../../models/stock/Inventaire');
const Stock = require('../../models/stock/Stock');
const Depot = require('../../models/stock/Depot');
const stockService = require('./stockService');
const { STOCK_MOVEMENT_TYPES } = require('../../utils/constants');
const AppError = require('../../utils/appError');
const { logger } = require('../../middleware/logger');


/**
 * Génère un nouveau numéro d'inventaire.
 * @private
 */
const _getNextNumero = async (prefix) => {
    // TODO: Remplacer par une vraie logique de numérotation séquentielle
    return `${prefix}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
}


/**
 * Démarre un nouvel inventaire pour un dépôt donné.
 * @param {string} depotId - L'ID du dépôt où l'inventaire a lieu.
 * @param {string} userId - L'ID de l'utilisateur qui démarre l'inventaire.
 * @returns {Promise<mongoose.Document>} Le nouveau document d'inventaire créé.
 */
async function startInventaire(depotId, userId) {
  const depot = await Depot.findById(depotId);
  if (!depot) throw new AppError('Dépôt non trouvé.', 404);
  
  // Vérifier s'il n'y a pas déjà un inventaire "En cours" pour ce dépôt
  const inventaireEnCours = await Inventaire.findOne({ depot: depotId, statut: 'En cours' });
  if (inventaireEnCours) {
      throw new AppError(`Un inventaire (N°${inventaireEnCours.numero}) est déjà en cours pour ce dépôt.`, 400);
  }

  const nouvelInventaire = await Inventaire.create({
    numero: await _getNextNumero('INV'),
    depot: depotId,
    realisePar: userId,
  });

  return nouvelInventaire;
}


/**
 * Ajoute ou met à jour une ligne de comptage dans un inventaire en cours.
 * @param {string} inventaireId - L'ID de l'inventaire.
 * @param {object} lineData - Données de la ligne.
 * @param {string} lineData.produitId - L'ID du produit compté.
 * @param {number} lineData.quantitePhysique - La quantité réellement comptée.
 * @returns {Promise<mongoose.Document>} L'inventaire mis à jour.
 */
async function addOrUpdateInventaireLine(inventaireId, lineData) {
  const { produitId, quantitePhysique } = lineData;
  
  const inventaire = await Inventaire.findById(inventaireId);
  if (!inventaire) throw new AppError('Inventaire non trouvé.', 404);
  if (inventaire.statut !== 'En cours') {
      throw new AppError('Seul un inventaire "En cours" peut être modifié.', 400);
  }

  // Récupérer la quantité théorique depuis le modèle Stock
  const stockActuel = await Stock.findOne({ produit: produitId, depot: inventaire.depot });
  const quantiteTheorique = stockActuel ? stockActuel.quantite : 0;

  // Chercher si une ligne existe déjà pour ce produit
  const existingLineIndex = inventaire.lignes.findIndex(
      line => line.produit.toString() === produitId
  );
  
  const ecart = quantitePhysique - quantiteTheorique;
  
  if (existingLineIndex > -1) {
    // Mettre à jour la ligne existante
    inventaire.lignes[existingLineIndex].quantitePhysique = quantitePhysique;
    inventaire.lignes[existingLineIndex].ecart = ecart;
  } else {
    // Ajouter une nouvelle ligne
    inventaire.lignes.push({
      produit: produitId,
      quantiteTheorique,
      quantitePhysique,
      ecart,
    });
  }
  
  await inventaire.save();
  return inventaire;
}


/**
 * Valide un inventaire et applique les ajustements de stock.
 * @param {string} inventaireId - L'ID de l'inventaire à valider.
 * @param {string} userId - L'ID de l'utilisateur qui valide.
 * @returns {Promise<mongoose.Document>} L'inventaire validé.
 */
async function validateInventaire(inventaireId, userId) {
  const inventaire = await Inventaire.findById(inventaireId).populate('lignes.produit', 'nom');
  if (!inventaire) throw new AppError('Inventaire non trouvé.', 404);
  if (inventaire.statut !== 'En cours') {
      throw new AppError('Seul un inventaire "En cours" peut être validé.', 400);
  }

  logger.info(`Validation de l'inventaire N°${inventaire.numero}...`);

  // Appliquer les ajustements pour chaque ligne ayant un écart
  for (const ligne of inventaire.lignes) {
    if (ligne.ecart !== 0) {
      const referenceDocument = `Inventaire ${inventaire.numero}`;
      
      if (ligne.ecart > 0) { // Boni de stock -> Entrée
        await stockService.entreeStock({
          produitId: ligne.produit._id,
          depotId: inventaire.depot,
          quantite: ligne.ecart,
          type: STOCK_MOVEMENT_TYPES.AJUSTEMENT_POSITIF,
        }, userId, referenceDocument);
        logger.info(`Ajustement positif de ${ligne.ecart} pour le produit "${ligne.produit.nom}".`);
        
      } else { // Mali de stock -> Sortie
        await stockService.sortieStock({
          produitId: ligne.produit._id,
          depotId: inventaire.depot,
          quantite: Math.abs(ligne.ecart),
          type: STOCK_MOVEMENT_TYPES.AJUSTEMENT_NEGATIF,
        }, userId, referenceDocument);
        logger.info(`Ajustement négatif de ${Math.abs(ligne.ecart)} pour le produit "${ligne.produit.nom}".`);
      }
    }
  }

  // Mettre à jour le statut de l'inventaire
  inventaire.statut = 'Validé';
  inventaire.validePar = userId;
  inventaire.dateValidation = new Date();
  await inventaire.save();
  
  logger.info(`Inventaire N°${inventaire.numero} validé avec succès.`);

  return inventaire;
}


module.exports = {
  startInventaire,
  addOrUpdateInventaireLine,
  validateInventaire,
};