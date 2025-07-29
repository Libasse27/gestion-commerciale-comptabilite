// ==============================================================================
//           Service pour la Gestion du Catalogue Produits
//
// Ce service encapsule la logique métier pour les opérations sur les produits
// et services.
// ==============================================================================

// --- Import des Modèles et Utils ---
const Produit = require('../../models/commercial/Produit');
const Categorie = require('../../models/commercial/Categorie'); // Pour la validation
const APIFeatures = require('../../utils/apiFeatures');
const AppError = require('../../utils/appError');

/**
 * Crée un nouveau produit ou service.
 * @param {object} produitData - Les données du nouveau produit.
 * @param {string} userId - L'ID de l'utilisateur créateur.
 * @returns {Promise<mongoose.Document>}
 */
async function createProduit(produitData, userId) {
  // Règle métier : si une catégorie est fournie, on vérifie qu'elle existe.
  if (produitData.categorie) {
    const categorieExists = await Categorie.findById(produitData.categorie);
    if (!categorieExists) {
      throw new AppError('La catégorie spécifiée n\'existe pas.', 400);
    }
  }

  const nouveauProduit = await Produit.create({
    ...produitData,
    creePar: userId,
  });

  return nouveauProduit;
}


/**
 * Récupère une liste de produits avec des fonctionnalités avancées.
 * @param {object} query - L'objet `req.query` d'Express.
 * @returns {Promise<Array<mongoose.Document>>}
 */
async function getAllProduits(query) {
  const features = new APIFeatures(Produit.find(), query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const produits = await features.query
    .populate('categorie', 'nom')
    .populate('creePar', 'firstName lastName');

  // TODO: Ajouter le total des documents pour la pagination côté client
  // const total = await Produit.countDocuments(features.query.getFilter());

  return produits;
}


/**
 * Récupère un produit par son ID.
 * @param {string} produitId
 * @returns {Promise<mongoose.Document>}
 */
async function getProduitById(produitId) {
  const produit = await Produit.findById(produitId).populate('categorie', 'nom');
  if (!produit) {
    throw new AppError('Aucun produit trouvé avec cet identifiant.', 404);
  }
  return produit;
}


/**
 * Met à jour un produit.
 * @param {string} produitId - L'ID du produit à mettre à jour.
 * @param {object} updateData - Les données de mise à jour.
 * @returns {Promise<mongoose.Document>}
 */
async function updateProduit(produitId, updateData) {
  // Règle métier : si on change la catégorie, on vérifie qu'elle existe.
  if (updateData.categorie) {
    const categorieExists = await Categorie.findById(updateData.categorie);
    if (!categorieExists) {
      throw new AppError('La nouvelle catégorie spécifiée n\'existe pas.', 400);
    }
  }
  
  const produit = await Produit.findByIdAndUpdate(produitId, updateData, {
    new: true,
    runValidators: true,
  });
  
  if (!produit) {
    throw new AppError('Aucun produit trouvé avec cet identifiant.', 404);
  }
  return produit;
}


/**
 * Supprime (désactive) un produit.
 * @param {string} produitId
 * @returns {Promise<mongoose.Document>}
 */
async function deleteProduit(produitId) {
  // TODO: Vérifier si le produit est utilisé dans des documents (factures, etc.).
  // Si c'est le cas, on devrait empêcher la suppression ou la désactivation.
  
  // On utilise la suppression logique (soft delete)
  const produit = await Produit.findByIdAndUpdate(produitId, { isActive: false });

  if (!produit) {
    throw new AppError('Aucun produit trouvé avec cet identifiant.', 404);
  }
  return produit;
}


module.exports = {
  createProduit,
  getAllProduits,
  getProduitById,
  updateProduit,
  deleteProduit,
};