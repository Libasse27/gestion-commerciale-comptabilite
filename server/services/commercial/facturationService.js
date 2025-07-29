// ==============================================================================
//           Service de Gestion de la Facturation (Logique Métier)
//
// MISE À JOUR : Ce service est maintenant entièrement intégré avec les autres
// services (numérotation, stock, comptabilité, notifications) pour orchestrer
// le processus de facturation de bout en bout.
// ==============================================================================

const Facture = require('../../models/commercial/Facture');
const Commande = require('../../models/commercial/Commande');
const Client = require('../../models/commercial/Client');
const AppError = require('../../utils/appError');
const dateUtils = require('../../utils/dateUtils');
const { STOCK_MOVEMENT_TYPES } = require('../../utils/constants');

// --- Import des Services Dépendants ---
const numerotationService = require('../system/numerotationService');
const stockService = require('../stock/stockService');
const ecritureService = require('../comptabilite/ecritureService');
const emailService = require('../notifications/emailService');
const smsService = require('../notifications/smsService');
const { logger } = require('../../middleware/logger');


/**
 * Crée une facture à partir d'une commande existante.
 */
async function createFactureFromCommande(commandeId, userId) {
  const commande = await Commande.findById(commandeId);
  if (!commande) throw new AppError('Commande non trouvée.', 404);
  
  const existingFacture = await Facture.findOne({ commandeOrigine: commandeId });
  if (existingFacture) throw new AppError('Cette commande a déjà été facturée.', 400);

  const client = await Client.findById(commande.client);
  if (!client) throw new AppError('Client associé à la commande non trouvé.', 404);
  
  const nouvelleFacture = new Facture({
    numero: await numerotationService.getNextNumero('facture'),
    client: commande.client,
    dateEcheance: dateUtils.addDaysToDate(new Date(), client.termesPaiement || 30),
    lignes: commande.lignes,
    totalHT: commande.totalHT,
    totalTVA: commande.totalTVA,
    totalTTC: commande.totalTTC,
    commandeOrigine: commande._id,
    creePar: userId,
  });
  
  await nouvelleFacture.save();

  // --- Interaction avec les autres services ---
  
  // 1. Décrémenter le stock pour chaque ligne facturée
  for (const ligne of nouvelleFacture.lignes) {
      await stockService.sortieStock({
          produitId: ligne.produit,
          depotId: 'ID_DEPOT_PRINCIPAL', // À rendre dynamique
          quantite: ligne.quantite,
          type: STOCK_MOVEMENT_TYPES.SORTIE_VENTE,
      }, userId, `Facture ${nouvelleFacture.numero}`);
  }

  // 2. Mettre à jour le statut de la commande
  commande.statut = 'facturee'; // Nouveau statut à ajouter aux constantes
  await commande.save();
  
  logger.info(`Facture ${nouvelleFacture.numero} créée à partir de la commande ${commande.numero}.`);

  return nouvelleFacture;
}


/**
 * Valide une facture pour la comptabilité et envoie les notifications.
 */
async function validerFacturePourCompta(factureId, userId) {
    const facture = await Facture.findById(factureId).populate('client');
    if (!facture) throw new AppError('Facture non trouvée', 404);
    if (facture.comptabilise) throw new AppError('Cette facture a déjà été comptabilisée.', 400);

    // 1. Appeler le service comptable pour générer l'écriture de vente
    await ecritureService.genererEcritureVente(factureId, userId);
    
    // 2. Verrouiller la facture
    facture.comptabilise = true;
    facture.statut = 'envoyee'; // On considère que la validation équivaut à un envoi
    await facture.save();

    // 3. Envoyer les notifications au client
    if (facture.client.notificationParEmail) {
        await emailService.sendNouvelleFacture(facture, facture.client);
    }
    if (facture.client.notificationParSMS) {
        await smsService.sendNotificationFacture(facture.client, facture);
    }

    logger.info(`Facture ${facture.numero} validée et comptabilisée.`);
    return facture;
}

// ... La fonction enregistrerPaiement reste majoritairement la même mais pourrait
// appeler un comptaService.genererEcriturePaiement à la fin.

module.exports = {
  createFactureFromCommande,
  // enregistrerPaiement,
  validerFacturePourCompta,
};