// ==============================================================================
//           Service pour la Gestion Fiscale
//
// Ce service contient la logique métier pour les calculs et la préparation
// des déclarations fiscales, en particulier la déclaration de TVA.
// ==============================================================================

const Facture = require('../../models/commercial/Facture');
const FactureAchat = require('../../models/commercial/FactureAchat');
const DeclarationFiscale = require('../../models/fiscal/DeclarationFiscale'); // Nom de fichier mis à jour
const AppError = require('../../utils/appError');
const numberUtils = require('../../utils/numberUtils');

/**
 * Calcule les composantes de la déclaration de TVA pour une période donnée (mois/année).
 */
async function calculerDeclarationTVA({ annee, mois }) {
  if (!annee || !mois) {
    throw new AppError('Veuillez fournir une année et un mois.', 400);
  }

  const dateDebut = new Date(annee, mois - 1, 1);
  const dateFin = new Date(annee, mois, 0, 23, 59, 59);

  // --- 1. Calcul de la TVA Collectée (sur les ventes) ---
  const tvaCollecteeResult = await Facture.aggregate([
    { $match: { comptabilise: true, dateEmission: { $gte: dateDebut, $lte: dateFin } } },
    { $group: { _id: null, total: { $sum: '$totalTVA' } } }
  ]);
  const tvaCollectee = tvaCollecteeResult[0]?.total || 0;

  // --- 2. Calcul de la TVA Déductible (sur les achats) ---
  const tvaDeductibleResult = await FactureAchat.aggregate([
    { $match: { comptabilise: true, dateFacture: { $gte: dateDebut, $lte: dateFin } } },
    { $group: { _id: null, total: { $sum: '$totalTVA' } } }
  ]);
  const tvaDeductible = tvaDeductibleResult[0]?.total || 0;

  // --- 3. Récupérer le crédit de TVA de la période précédente ---
  const moisPrecedent = mois === 1 ? 12 : mois - 1;
  const anneePrecedente = mois === 1 ? annee - 1 : annee;
  const periodePrecedente = `${anneePrecedente}-${moisPrecedent.toString().padStart(2, '0')}`;
  
  const declarationPrecedente = await DeclarationFiscale.findOne({ periode: periodePrecedente, statut: 'Déclarée' });
  const creditTvaAnterieur = declarationPrecedente ? declarationPrecedente.creditTvaAReporter : 0;
  
  // --- 4. Calcul final ---
  const tvaDue = tvaCollectee - (tvaDeductible + creditTvaAnterieur);
  
  const tvaAPayer = tvaDue > 0 ? tvaDue : 0;
  const creditTvaAReporter = tvaDue < 0 ? Math.abs(tvaDue) : 0;

  return {
    periode: `${annee}-${mois.toString().padStart(2, '0')}`,
    tvaCollectee: numberUtils.roundTo(tvaCollectee),
    tvaDeductible: numberUtils.roundTo(tvaDeductible),
    creditTvaAnterieur: numberUtils.roundTo(creditTvaAnterieur),
    tvaAPayer: numberUtils.roundTo(tvaAPayer),
    creditTvaAReporter: numberUtils.roundTo(creditTvaAReporter),
  };
}


/**
 * Sauvegarde ou met à jour une déclaration de TVA en tant que brouillon.
 */
async function saveDeclarationTVABrouillon(declarationData, userId) {
    const { periode } = declarationData;
    
    const declaration = await DeclarationFiscale.findOneAndUpdate(
        { periode },
        { ...declarationData, declarePar: userId, statut: 'Brouillon' },
        { new: true, upsert: true, runValidators: true }
    );
    
    return declaration;
}

/**
 * Finalise une déclaration de TVA en la passant au statut "Déclarée".
 * Une déclaration finalisée ne peut plus être modifiée.
 */
async function finaliserDeclarationTVA(declarationId, userId) {
    const declaration = await DeclarationFiscale.findById(declarationId);

    if (!declaration) {
        throw new AppError('Déclaration non trouvée.', 404);
    }
    if (declaration.statut === 'Déclarée') {
        throw new AppError('Cette déclaration a déjà été finalisée.', 400);
    }

    declaration.statut = 'Déclarée';
    declaration.declarePar = userId;
    declaration.dateDeclaration = new Date();

    await declaration.save();
    return declaration;
}


module.exports = {
  calculerDeclarationTVA,
  saveDeclarationTVABrouillon,
  finaliserDeclarationTVA,
};