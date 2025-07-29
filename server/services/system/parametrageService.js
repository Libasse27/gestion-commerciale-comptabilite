// ==============================================================================
//           Service pour la Gestion des Paramètres et de l'Entreprise
//
// MISE À JOUR : Ce service gère maintenant à la fois les paramètres clé-valeur
// (généraux et fiscaux) ET les informations structurées de l'entreprise.
// Il utilise intensivement le cache Redis pour des performances optimales.
// ==============================================================================

const Parametrage = require('../../models/system/Parametrage');
const ParametreFiscal = require('../../models/fiscal/ParametreFiscal');
const Entreprise = require('../../models/system/Entreprise'); // Import du nouveau modèle
const redisClient = require('../../config/redis');
const { CACHE_TTL } = require('../../utils/constants');

/**
 * Fonction privée pour parser la valeur d'un paramètre en fonction de son type.
 * @private
 */
const _parseValue = (parametre) => {
    // ... (fonction inchangée)
};

// ===============================================
// --- Section: Paramètres Clé-Valeur ---
// ===============================================

async function getParametre(type, cle, valeurParDefaut = null) {
  // ... (fonction inchangée)
}

async function setParametre(type, cle, valeur, userId) {
  // ... (fonction inchangée)
}

async function getAllParametres(type, groupe) {
  // ... (fonction inchangée)
}


// ===============================================
// --- Section: Informations de l'Entreprise ---
// ===============================================

const ENTREPRISE_CACHE_KEY = 'entreprise_info';

/**
 * Récupère les informations de l'entreprise.
 * Utilise une stratégie de cache.
 * @returns {Promise<object | null>}
 */
async function getInformationsEntreprise() {
    // 1. Essayer de lire depuis le cache
    const cachedInfo = await redisClient.get(ENTREPRISE_CACHE_KEY);
    if (cachedInfo) {
        return JSON.parse(cachedInfo);
    }
    
    // 2. Si cache miss, lire depuis la DB
    // `findOne` retourne le premier document trouvé, parfait pour notre singleton
    const entrepriseInfo = await Entreprise.findOne({}).lean();
    
    // 3. Mettre en cache pour 24h si des informations existent
    if (entrepriseInfo) {
        await redisClient.set(ENTREPRISE_CACHE_KEY, JSON.stringify(entrepriseInfo), { EX: 86400 });
    }
    
    return entrepriseInfo;
}

/**
 * Crée ou met à jour les informations de l'entreprise.
 * @param {object} data - Les données de l'entreprise à mettre à jour.
 * @param {string} userId - L'ID de l'utilisateur effectuant la modification.
 * @returns {Promise<mongoose.Document>}
 */
async function updateInformationsEntreprise(data, userId) {
    // `findOneAndUpdate` avec `upsert: true` est parfait : il met à jour le document
    // unique s'il existe, ou le crée lors du tout premier enregistrement.
    const updatedInfo = await Entreprise.findOneAndUpdate(
        { singleton: true }, // Filtre pour trouver l'unique document
        { ...data /*, modifiePar: userId */ }, // TODO: Ajouter un champ `modifiePar` au modèle Entreprise
        { new: true, upsert: true, runValidators: true }
    );
    
    // Invalider le cache pour forcer une relecture depuis la DB au prochain appel
    await redisClient.del(ENTREPRISE_CACHE_KEY);
    
    return updatedInfo;
}


module.exports = {
  getParametre,
  setParametre,
  getAllParametres,
  getInformationsEntreprise,
  updateInformationsEntreprise,
};