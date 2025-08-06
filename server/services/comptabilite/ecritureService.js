// server/services/comptabilite/ecritureService.js
const mongoose = require('mongoose');
const EcritureComptable = require('../../models/comptabilite/EcritureComptable');
const ExerciceComptable = require('../../models/comptabilite/ExerciceComptable');
const Journal = require('../../models/comptabilite/Journal');
const AppError = require('../../utils/appError');
const { logger } = require('../../middleware/logger');

async function createEcritureManuelle(data, userId) {
  const { journalId, date, libelle, lignes } = data;
  const dateEcriture = new Date(date);

  const exercice = await ExerciceComptable.findOne({ dateDebut: { $lte: dateEcriture }, dateFin: { $gte: dateEcriture } });
  if (!exercice) throw new AppError(`Aucun exercice comptable trouvé pour cette date.`, 400);
  if (exercice.statut === 'Clôturé') throw new AppError(`L'exercice ${exercice.annee} est clôturé.`, 403);

  const nouvelleEcriture = await EcritureComptable.create({
    exercice: exercice._id,
    journal: journalId,
    date: dateEcriture,
    libelle,
    lignes,
    creePar: userId,
  });
  return nouvelleEcriture;
}

async function genererEcritureVente(facture, userId, options = {}) {
  const { session } = options;

  // Simplification : on suppose que les comptes et journaux existent.
  // Une version de prod irait les chercher dynamiquement dans les paramètres.
  const journalVentes = await Journal.findOne({ code: 'VE' }).session(session).lean();
  const compteClient = await mongoose.model('CompteComptable').findOne({ numero: '4111' }).session(session).lean();
  const compteVente = await mongoose.model('CompteComptable').findOne({ numero: '7011' }).session(session).lean();
  const compteTVA = await mongoose.model('CompteComptable').findOne({ numero: '4431' }).session(session).lean();

  if (!journalVentes || !compteClient || !compteVente || !compteTVA) {
      throw new AppError("Configuration comptable de base introuvable (Journal VE, Comptes 4111, 7011, 4431).", 500);
  }

  const exercice = await ExerciceComptable.findOne({ dateDebut: { $lte: facture.dateEmission }, dateFin: { $gte: facture.dateEmission } }).session(session);
  if (!exercice) throw new AppError('Exercice comptable introuvable pour la date de la facture.', 400);

  const lignes = [
    { compte: compteClient._id, libelle: `Facture ${facture.numero} - ${facture.client.nom}`, debit: facture.totalTTC, credit: 0 },
    { compte: compteVente._id, libelle: `Vente sur facture ${facture.numero}`, debit: 0, credit: facture.totalHT },
  ];
  if (facture.totalTVA > 0) {
    lignes.push({ compte: compteTVA._id, libelle: `TVA sur facture ${facture.numero}`, debit: 0, credit: facture.totalTVA });
  }

  const [nouvelleEcriture] = await EcritureComptable.create([{
    exercice: exercice._id,
    journal: journalVentes._id,
    date: facture.dateEmission,
    libelle: `Comptabilisation facture ${facture.numero}`,
    numeroPiece: facture.numero,
    lignes,
    sourceDocumentId: facture._id,
    sourceDocumentModel: 'Facture',
    statut: 'Validée',
    creePar: userId,
    validePar: userId,
  }], { session });
  
  logger.info(`Écriture comptable générée pour la facture ${facture.numero}.`);
  return nouvelleEcriture;
}

async function validerEcriture(ecritureId, userId) {
    const ecriture = await EcritureComptable.findById(ecritureId);
    if (!ecriture) throw new AppError('Écriture non trouvée.', 404);
    if (ecriture.statut === 'Validée') throw new AppError('Cette écriture est déjà validée.', 400);

    const exercice = await ExerciceComptable.findById(ecriture.exercice).lean();
    if (exercice.statut === 'Clôturé') {
        throw new AppError(`L'exercice ${exercice.annee} est clôturé.`, 403);
    }

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