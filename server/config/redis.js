// server/config/redis.js
// ==============================================================================
//                   Configuration du Client Redis
//
// Ce module initialise et exporte un client Redis. Redis est une base de
// données en mémoire ultra-rapide utilisée ici principalement pour le Caching.
//
// L'application est conçue pour être résiliente et continuer à fonctionner
// même si la connexion à Redis est perdue.
// ==============================================================================

const { createClient } = require('redis');
const { logger } = require('../middleware/logger');

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('connect', () => {
  logger.info('✅ Client Redis connecté avec succès.');
});

redisClient.on('error', (err) => {
  logger.error('❌ Erreur du client Redis. L\'application fonctionnera sans cache.', { error: err });
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error('Impossible de se connecter à Redis au démarrage. L\'application fonctionnera sans cache.', { error: err });
  }
};

module.exports = {
    redisClient,
    connectRedis
};