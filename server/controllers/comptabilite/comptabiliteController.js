'use strict';
// server/controllers/comptabilite/comptabiliteController.js

// ==============================================================================
//           Contrôleur pour la Comptabilité
// ==============================================================================
const CompteComptable = require('../../models/comptabilite/CompteComptable');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');
const grandLivreService = require('../../services/comptabilite/grandLivreService');
const mongoose = require('mongoose');

// --- Plan Comptable ---
exports.getPlanComptable = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(CompteComptable.find(), req.query).sort();
  const comptes = await features.query;
  res.status(200).json({ status: 'success', results: comptes.length, data: { comptes } });
});

exports.createCompteComptable = asyncHandler(async (req, res, next) => {
  const nouveauCompte = await CompteComptable.create(req.body);
  res.status(201).json({ status: 'success', data: { compte: nouveauCompte } });
});

exports.updateCompteComptable = asyncHandler(async (req, res, next) => {
    const compte = await CompteComptable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if(!compte) return next(new AppError('Aucun compte trouvé avec cet ID.', 404));
    res.status(200).json({ status: 'success', data: { compte } });
});

// --- Consultations ---
exports.getGrandLivreCompte = asyncHandler(async (req, res, next) => {
    const { compteId } = req.params;
    const { dateDebut, dateFin } = req.query;
    if (!dateDebut || !dateFin) {
        return next(new AppError('Veuillez fournir une période (dateDebut et dateFin).', 400));
    }
    
    const compte = await CompteComptable.findById(compteId).lean();
    if (!compte) return next(new AppError('Compte comptable non trouvé.', 404));

    const grandLivreData = await grandLivreService.getGrandLivrePourCompte(compteId, dateDebut, dateFin);
    
    res.status(200).json({
        status: 'success',
        data: {
            compte,
            periode: { dateDebut, dateFin },
            ...grandLivreData
        }
    });
});