// server/services/commercial/produitService.js
const Produit = require('../../models/commercial/Produit');
const AppError = require('../../utils/appError');
const APIFeatures = require('../../utils/apiFeatures');

async function createProduit(produitData, userId) {
  const newProduit = await Produit.create({ ...produitData, creePar: userId });
  return newProduit;
}

async function getAllProduits(queryParams) {
  const searchableFields = ['nom', 'reference', 'description'];
  const features = new APIFeatures(Produit.find({ isActive: true }).populate('categorie', 'nom'), queryParams)
    .filter()
    .sort()
    .search(searchableFields)
    .limitFields()
    .paginate();
  
  const produits = await features.query;
  return produits;
}

async function getProduitById(produitId) {
  const produit = await Produit.findById(produitId).populate('categorie', 'nom');
  if (!produit) throw new AppError('Aucun produit trouvé avec cet identifiant.', 404);
  return produit;
}

async function updateProduit(produitId, updateData, userId) {
  const produit = await Produit.findByIdAndUpdate(produitId, { ...updateData, modifiePar: userId }, { new: true, runValidators: true });
  if (!produit) throw new AppError('Aucun produit trouvé avec cet identifiant.', 404);
  return produit;
}

async function deleteProduit(produitId, userId) {
  const produit = await Produit.findByIdAndUpdate(produitId, { isActive: false, modifiePar: userId });
  if (!produit) throw new AppError('Aucun produit trouvé avec cet identifiant.', 404);
  return produit;
}

module.exports = {
  createProduit,
  getAllProduits,
  getProduitById,
  updateProduit,
  deleteProduit,
};