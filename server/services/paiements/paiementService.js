// ==============================================================================
//           Service de Gestion des Paiements (Logique Métier)
//
// Ce service est le point d'entrée unique pour l'enregistrement des transactions
// financières (encaissements et décaissements).
//
// Il orchestre la mise à jour de plusieurs modèles pour garantir la
// cohérence des données : Paiement, Facture, Client/Fournisseur, et
// déclenche la génération des écritures comptables.
// ==============================================================================

// --- Import des Modèles et Services ---
const Paiement = require('../../models/paiements/Paiement');
const Facture = require('../../models/commercial/Facture');
const Client = require('../../models/commercial/Client');
const CompteComptable = require('../../models/comptabilite/CompteComptable');
// const comptaService = require('../comptabilite/comptaService'); // Service futur
const AppError = require('../../utils/appError');
const numberUtils = require('../../utils/numberUtils');
const { logger } = require('../../middleware/logger');

/**
 * Enregistre un encaissement reçu d'un client.
 * @param {object} paiementData
 * @param {string} paiementData.clientId
 * @param {number} paiementData.montant
 * @param {Date} paiementData.datePaiement
 * @param {string} paiementData.modePaiementId
 * @param {string} paiementData.compteTresorerieId
 * @param {Array<{factureId: string, montantImpute: number}>} paiementData.imputations
 * @param {string} userId - ID de l'utilisateur qui enregistre le paiement.
 * @returns {Promise<mongoose.Document>} Le document de paiement créé.
 */
async function enregistrerEncaissementClient(paiementData, userId) {
  const { clientId, montant, datePaiement, modePaiementId, compteTresorerieId, imputations, reference } = paiementData;
  const montantTotal = numberUtils.parseNumber(montant);

  // 1. Validation des données
  if (montantTotal <= 0) {
    throw new AppError('Le montant du paiement doit être positif.', 400);
  }
  const totalImpute = numberUtils.roundTo(imputations.reduce((sum, imp) => sum + imp.montantImpute, 0));
  if (Math.abs(totalImpute - montantTotal) > 0.01) {
    throw new AppError('La somme des montants imputés ne correspond pas au montant total du paiement.', 400);
  }
  
  const client = await Client.findById(clientId);
  if (!client) throw new AppError('Client non trouvé.', 404);

  // --- Début de la Transaction (logique atomique) ---
  // Idéalement, toutes les opérations ci-dessous devraient être dans une transaction MongoDB
  // pour garantir que soit tout réussit, soit tout échoue.

  // 2. Créer l'enregistrement de paiement
  const nouveauPaiement = await Paiement.create({
    reference: reference || `PAY-CLIENT-${Date.now()}`,
    datePaiement,
    montant: montantTotal,
    sens: 'Entrant',
    tiers: clientId,
    tiersModel: 'Client',
    modePaiement: modePaiementId,
    compteTresorerie: compteTresorerieId,
    imputations: imputations.map(imp => ({ facture: imp.factureId, montantImpute: imp.montantImpute })),
    enregistrePar: userId,
  });

  // 3. Mettre à jour chaque facture et le solde du client
  let totalPayeSurFactures = 0;
  for (const imputation of imputations) {
    const facture = await Facture.findById(imputation.factureId);
    if (!facture) throw new AppError(`Facture ${imputation.factureId} non trouvée.`, 404);
    
    facture.montantPaye += numberUtils.parseNumber(imputation.montantImpute);
    // Le hook pre-save de Facture.js mettra à jour le `soldeDu` et le `statut`.
    await facture.save();
    totalPayeSurFactures += numberUtils.parseNumber(imputation.montantImpute);
  }
  
  // Mettre à jour le solde du client (un solde positif signifie qu'il nous doit de l'argent)
  client.solde -= totalPayeSurFactures;
  await client.save();
  
  // 4. Générer l'écriture comptable
  // TODO: Appeler le comptaService
  // await comptaService.genererEcritureEncaissement(nouveauPaiement);
  
  logger.info(`Encaissement de ${montantTotal} enregistré pour le client ${client.nom}.`);

  return nouveauPaiement;
}

// TODO: Créer une fonction symétrique `enregistrerDecaissementFournisseur`

module.exports = {
  enregistrerEncaissementClient,
};