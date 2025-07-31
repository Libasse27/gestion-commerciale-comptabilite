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
// La configuration via l'URL (ex: redis://localhost:6379) est flexible et standard.
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
// (bien que plus lentement) même si le service de cache est indisponible.
redisClient.on('error', (err) => {
  console.error('❌ Erreur du client Redis:', err);
});

// --- Connexion effective au serveur Redis ---
// La connexion est asynchrone.
const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        // Si Redis n'est pas disponible au démarrage, l'application ne doit pas planter.
        console.error('Impossible de se connecter à Redis au démarrage. L\'application fonctionnera sans cache.', err);
    }
}

// Lancer la connexion.
connectRedis();


// --- Gestion des arrêts propres ---
// Permet de fermer la connexion Redis proprement quand l'application s'arrête (Ctrl+C).
process.on('SIGINT', async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  process.exit(0);
});

module.exports = redisClient;