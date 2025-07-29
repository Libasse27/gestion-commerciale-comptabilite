// ==============================================================================
//           Service de Gestion des Écritures Comptables
//
// Ce service est le seul point d'entrée pour la création et la validation
// des écritures comptables. Il garantit le respect des règles comptables
// fondamentales (partie double, rattachement à un exercice ouvert).
//
// Il contient également la logique pour générer automatiquement des écritures
// à partir de documents commerciaux (factures de vente, d'achat, etc.).
// ==============================================================================

// --- Import des Modèles et Utils ---
const EcritureComptable = require('../../models/comptabilite/EcritureComptable');
const CompteComptable = require('../../models/comptabilite/CompteComptable');
const ExerciceComptable = require('../../models/comptabilite/ExerciceComptable');
const Facture = require('../../models/commercial/Facture');
const AppError = require('../../utils/appError');
const numberUtils = require('../../utils/numberUtils');
const { logger } = require('../../middleware/logger');

/**
 * Génère un nouveau numéro de pièce.
 * @private
 */
const _getNextNumero = async (prefix) => {
    // TODO: Remplacer par une vraie logique de numérotation séquentielle
    return `${prefix}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
}


/**
 * Crée une écriture comptable manuelle.
 * @param {object} data - Données de l'écriture.
 * @param {string} userId - ID de l'utilisateur.
 * @returns {Promise<mongoose.Document>} L'écriture créée.
 */
async function createEcritureManuelle(data, userId) {
  const { journalId, date, libelle, lignes } = data;

  // 1. Valider que l'exercice comptable correspondant à la date est ouvert
  const exercice = await ExerciceComptable.findOne({
    dateDebut: { $lte: date },
    dateFin: { $gte: date },
  });

  if (!exercice) {
    throw new AppError(`Aucun exercice comptable trouvé pour la date ${new Date(date).toLocaleDateString()}.`, 400);
  }
  if (exercice.statut === 'Clôturé') {
    throw new AppError(`L'exercice ${exercice.annee} est clôturé. Aucune écriture ne peut y être ajoutée.`, 400);
  }

  // 2. Créer l'écriture (les validations du modèle vérifieront l'équilibre)
  const nouvelleEcriture = new EcritureComptable({
    numeroPiece: await _getNextNumero('OD'), // Opérations Diverses
    exercice: exercice._id,
    journal: journalId,
    date,
    libelle,
    lignes,
    creePar: userId,
  });

  // Le hook pre-validate du modèle calculera les totaux et vérifiera l'équilibre
  await nouvelleEcriture.save();

  return nouvelleEcriture;
}

/**
 * Génère et sauvegarde l'écriture comptable pour une facture de vente.
 * @param {string} factureId - L'ID de la facture à comptabiliser.
 * @param {string} userId - L'ID de l'utilisateur qui valide la facture.
 * @returns {Promise<mongoose.Document>} L'écriture de vente créée.
 */
async function genererEcritureVente(factureId, userId) {
  const facture = await Facture.findById(factureId).populate('client');
  if (!facture) throw new AppError('Facture non trouvée.', 404);
  
  // TODO: Récupérer les comptes depuis une table de paramétrage
  const compteClient = '411000'; // Compte Clients par défaut
  const compteVente = '701000'; // Compte Ventes de Marchandises par défaut
  const compteTVA = '443000';   // Compte TVA Facturée par défaut
  
  // TODO: Récupérer le journal des Ventes
  const journalVentesId = 'ID_DU_JOURNAL_DE_VENTE';
  
  const dateEcriture = facture.dateEmission;

  const exercice = await ExerciceComptable.findOne({ dateDebut: { $lte: dateEcriture }, dateFin: { $gte: dateEcriture } });
  if (!exercice || exercice.statut === 'Clôturé') {
    throw new AppError(`Impossible de comptabiliser la facture dans un exercice inexistant ou clôturé.`, 400);
  }

  // Construction des lignes de l'écriture
  const lignes = [
    // 1. Débit du compte client pour le montant TTC
    {
      compte: (await CompteComptable.findOne({ numero: compteClient }))._id,
      libelle: `Facture ${facture.numero} - ${facture.client.nom}`,
      debit: facture.totalTTC,
    },
    // 2. Crédit du compte de vente pour le montant HT
    {
      compte: (await CompteComptable.findOne({ numero: compteVente }))._id,
      libelle: `Vente / Facture ${facture.numero}`,
      credit: facture.totalHT,
    },
  ];
  
  // 3. Crédit du compte de TVA, s'il y en a
  if (facture.totalTVA > 0) {
    lignes.push({
      compte: (await CompteComptable.findOne({ numero: compteTVA }))._id,
      libelle: `TVA collectée / Facture ${facture.numero}`,
      credit: facture.totalTVA,
    });
  }

  const nouvelleEcriture = new EcritureComptable({
    numeroPiece: `FAC-${facture.numero}`,
    exercice: exercice._id,
    journal: journalVentesId,
    date: dateEcriture,
    libelle: `Comptabilisation facture de vente N° ${facture.numero}`,
    lignes,
    sourceDocumentId: facture._id,
    sourceDocumentModel: 'Facture',
    statut: 'Validée', // L'écriture est directement validée
    creePar: userId,
    validePar: userId,
  });
  
  await nouvelleEcriture.save();
  logger.info(`Écriture comptable générée pour la facture ${facture.numero}.`);

  return nouvelleEcriture;
}

/**
 * Valide une écriture comptable (passage de 'Brouillard' à 'Validée').
 * @param {string} ecritureId - L'ID de l'écriture.
 * @param {string} userId - L'ID de l'utilisateur.
 * @returns {Promise<mongoose.Document>} L'écriture validée.
 */
async function validerEcriture(ecritureId, userId) {
    const ecriture = await EcritureComptable.findById(ecritureId);
    if (!ecriture) throw new AppError('Écriture non trouvée.', 404);
    if (ecriture.statut === 'Validée') throw new AppError('Cette écriture est déjà validée.', 400);

    ecriture.statut = 'Validée';
    ecriture.validePar = userId;
    await ecriture.save();

    return ecriture;
}

module.exports = {
  createEcritureManuelle,
  genererEcritureVente,
  validerEcriture,
};