// server/services/comptabilite/grandLivreService.js
const EcritureComptable = require('../../models/comptabilite/EcritureComptable');
const { roundTo } = require('../../utils/numberUtils');

async function getGrandLivrePourCompte(compteId, dateDebut, dateFin) {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    // 1. Calculer le solde de départ (solde à la date de début - 1 jour)
    const soldeDepartResult = await EcritureComptable.aggregate([
        { $match: { statut: 'Validée', date: { $lt: debut } } },
        { $unwind: '$lignes' },
        { $match: { 'lignes.compte': new mongoose.Types.ObjectId(compteId) } },
        { $group: { _id: null, totalDebit: { $sum: '$lignes.debit' }, totalCredit: { $sum: '$lignes.credit' } } }
    ]);
    const soldeDepart = (soldeDepartResult[0]?.totalDebit || 0) - (soldeDepartResult[0]?.totalCredit || 0);

    // 2. Récupérer les mouvements de la période
    const ecritures = await EcritureComptable.find({
        statut: 'Validée',
        date: { $gte: debut, $lte: fin },
        'lignes.compte': compteId
    }).populate('journal', 'code').sort({ date: 1, createdAt: 1 });
    
    // 3. Formater les lignes et calculer le solde progressif
    let soldeProgressif = soldeDepart;
    const lignesGrandLivre = ecritures.flatMap(e =>
        e.lignes
            .filter(l => l.compte.equals(compteId))
            .map(l => {
                const mouvement = l.debit - l.credit;
                soldeProgressif += mouvement;
                return {
                    date: e.date, journal: e.journal.code, numeroPiece: e.numeroPiece,
                    libelle: l.libelle, debit: l.debit, credit: l.credit,
                    soldeProgressif: roundTo(soldeProgressif),
                };
            })
    );
    
    return {
        soldeDepart: roundTo(soldeDepart),
        lignes: lignesGrandLivre,
        soldeFinal: roundTo(soldeProgressif),
    };
}

module.exports = { getGrandLivrePourCompte };