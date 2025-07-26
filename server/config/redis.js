// ==============================================================================
//                   Configuration du Client Redis
//
// Ce module initialise et exporte un client Redis. Redis est une base de
// données en mémoire ultra-rapide utilisée ici principalement pour le Caching.
//
// Le but est de réduire le nombre de requêtes à la base de données principale
// (MongoDB) en stockant temporairement les données fréquemment lues.
//
// Le client est configuré pour se connecter en utilisant une URL fournie
// par les variables d'environnement.
// ==============================================================================

const { createClient } = require('redis');

// Création du client Redis.
// La configuration se fait via l'URL, ce qui est très flexible.
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// --- Gestion des événements de connexion ---

// S'exécute lorsque le client se connecte avec succès au serveur Redis.
redisClient.on('connect', () => {
  console.log('✅ Client Redis connecté avec succès.');
});

// S'exécute en cas d'erreur de connexion ou d'opération.
// C'est crucial pour s'assurer que l'application peut continuer à fonctionner
// (bien que plus lentement) même si le cache est indisponible.
redisClient.on('error', (err) => {
  console.error('❌ Erreur du client Redis:', err);
});

// --- Connexion effective au serveur Redis ---
// La connexion est asynchrone.
const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Impossible de se connecter à Redis au démarrage.', err);
    }
}

// Lancer la connexion.
connectRedis();


// --- Gestion des arrêts propres ---
// Permet de fermer la connexion Redis proprement quand l'application s'arrête.
process.on('SIGINT', async () => {
  await redisClient.quit();
  process.exit(0);
});

module.exports = redisClient;