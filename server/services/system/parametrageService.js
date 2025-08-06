// server/services/system/parametrageService.js
const Parametrage = require('../../models/system/Parametrage');
const { redisClient } = require('../../config/redis');
const { logger } = require('../../middleware/logger');
const AppError = require('../../utils/appError');

const CACHE_KEY = 'parametres:tous';

/**
 * Helper interne pour convertir la valeur string en son type correct.
 * @private
 */
function _convertValueToType(value, type) {
  if (value === null || value === undefined) return value;
  switch (type) {
    case 'Nombre':
      return Number(value);
    case 'Booleen':
      return String(value).toLowerCase() === 'true';
    case 'JSON':
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    default:
      return value;
  }
}

/**
 * Récupère tous les paramètres et les retourne sous forme d'objet clé-valeur.
 * Utilise une stratégie de cache "cache-aside".
 */
async function getAllParametres() {
  try {
    if (redisClient.isOpen) {
      const cachedData = await redisClient.get(CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    }
  } catch (e) {
    logger.error("Erreur de lecture du cache Redis pour les paramètres.", { error: e.message });
  }

  const parametresFromDB = await Parametrage.find().lean();
  
  const parametresObject = parametresFromDB.reduce((acc, param) => {
    acc[param.cle] = _convertValueToType(param.valeur, param.type);
    return acc;
  }, {});

  try {
    if (redisClient.isOpen) {
      await redisClient.set(CACHE_KEY, JSON.stringify(parametresObject), { EX: 86400 }); // Cache 24h
    }
  } catch (e) {
    logger.error("Erreur d'écriture du cache Redis pour les paramètres.", { error: e.message });
  }

  return parametresObject;
}

/**
 * Met à jour un ou plusieurs paramètres.
 */
async function updateParametres(updates, userId) {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError("Aucun paramètre à mettre à jour fourni.", 400);
  }

  try {
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { cle: update.cle },
        update: { $set: { valeur: String(update.valeur), modifiePar: userId } },
      }
    }));

    await Parametrage.bulkWrite(bulkOps);

    if (redisClient.isOpen) {
      await redisClient.del(CACHE_KEY); // Invalider le cache
    }
    
    logger.info(`${updates.length} paramètre(s) ont été mis à jour par l'utilisateur ${userId}.`);
    
    // Renvoyer les nouveaux paramètres mis à jour
    return getAllParametres();

  } catch (error) {
    logger.error("Erreur lors de la mise à jour des paramètres.", { error: error.message });
    throw error;
  }
}

module.exports = {
  getAllParametres,
  updateParametres,
};