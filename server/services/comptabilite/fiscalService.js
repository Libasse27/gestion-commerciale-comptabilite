const EcritureComptable = require('../../models/comptabilite/EcritureComptable');
const DeclarationTVA = require('../../models/fiscal/DeclarationFiscale');
// Note: Le service parametrage est dans system, pas comptabilite
const parametrageService = require('../system/parametrageService'); 
const AppError = require('../../utils/appError');
const { roundTo } = require('../../utils/numberUtils');
const mongoose = require('mongoose');

async function calculerDeclarationTVA({ annee, mois }) {
  if (!annee || !mois) throw new AppError('Veuillez fournir une année et un mois.', 400);

  const dateDebut = new Date(Date.UTC(annee, mois - 1, 1));
  const dateFin = new Date(Date.UTC(annee, mois, 0)); // Le jour 0 du mois suivant donne le dernier jour du mois courant

  const params = await parametrageService.getAllParametres(); // Récupère tous les paramètres
  if (!params.COMPTE_TVA_COLLECTEE_ID || !params.COMPTE_TVA_DEDUCTIBLE_ID) {
    throw new AppError("Les comptes de TVA par défaut ne sont pas configurés.", 500);
  }
  const compteTvaCollecteeId = new mongoose.Types.ObjectId(params.COMPTE_TVA_COLLECTEE_ID);
  const compteTvaDeductibleId = new mongoose.Types.ObjectId(params.COMPTE_TVA_DEDUCTIBLE_ID);

  const tvaResults = await EcritureComptable.aggregate([
    { $match: { statut: 'Validée', date: { $gte: dateDebut, $lte: dateFin } } },
    { $unwind: '$lignes' },
    { $match: { 'lignes.compte': { $in: [compteTvaCollecteeId, compteTvaDeductibleId] } } },
    { $group: { _id: '$lignes.compte', totalDebit: { $sum: '$lignes.debit' }, totalCredit: { $sum: '$lignes.credit' } } }
  ]);

  const tvaCollecteeData = tvaResults.find(r => r._id.equals(compteTvaCollecteeId));
  const tvaDeductibleData = tvaResults.find(r => r._id.equals(compteTvaDeductibleId));

  const tvaCollectee = tvaCollecteeData ? tvaCollecteeData.totalCredit - tvaCollecteeData.totalDebit : 0;
  const tvaDeductible = tvaDeductibleData ? tvaDeductibleData.totalDebit - tvaDeductibleData.totalCredit : 0;

  const moisPrecedent = mois === 1 ? 12 : mois - 1;
  const anneePrecedente = mois === 1 ? annee - 1 : annee;
  const periodePrecedente = `${anneePrecedente}-${String(moisPrecedent).padStart(2, '0')}`;
  
  const declarationPrecedente = await DeclarationTVA.findOne({ periode: periodePrecedente, statut: 'Déclarée' }).lean();
  const creditTvaAnterieur = declarationPrecedente?.creditTvaAReporter || 0;
  
  return {
    periode: `${annee}-${String(mois).padStart(2, '0')}`,
    tvaCollectee: roundTo(tvaCollectee, 0),
    tvaDeductible: roundTo(tvaDeductible, 0),
    creditTvaAnterieur: roundTo(creditTvaAnterieur, 0),
  };
}

async function saveDeclarationTVABrouillon(declarationData, userId) {
    const { periode } = declarationData;
    const declaration = await DeclarationTVA.findOneAndUpdate(
        { periode },
        { ...declarationData, declarePar: userId, statut: 'Brouillon' },
        { new: true, upsert: true, runValidators: true }
    );
    return declaration;
}

async function finaliserDeclarationTVA(declarationId, userId) {
    const declaration = await DeclarationTVA.findById(declarationId);
    if (!declaration) throw new AppError('Déclaration non trouvée.', 404);
    if (declaration.statut === 'Déclarée') throw new AppError('Cette déclaration a déjà été finalisée.', 400);

    declaration.statut = 'Déclarée';
    declaration.declarePar = userId;
    declaration.dateDeclaration = new Date();
    await declaration.save();
    return declaration;
}

module.exports = { calculerDeclarationTVA, saveDeclarationTVABrouillon, finaliserDeclarationTVA };