# ==============================================================================
#            DOCKERFILE POUR LE BACKEND NODE.JS (ENV. DE DÉVELOPPEMENT)
#
# Ce fichier définit les étapes pour construire une image Docker pour notre
# serveur. L'objectif est de créer un environnement léger, rapide et cohérent
# qui se met à jour en temps réel avec notre code local.
# ==============================================================================

# --- ÉTAPE 1: L'IMAGE DE BASE ---
# On part d'une image Node.js officielle.
# `node:18-alpine` est une excellente version :
#   - `18`: Version LTS (Long-Term Support) de Node.js, stable et maintenue.
#   - `alpine`: Basée sur Alpine Linux, une distribution extrêmement légère.
#              Résultat : une image plus petite, plus rapide à télécharger et
#              une surface d'attaque réduite pour la sécurité.
FROM node:18-alpine

# --- ÉTAPE 2: LE RÉPERTOIRE DE TRAVAIL ---
# Définit le répertoire de travail à l'intérieur du conteneur.
# Toutes les commandes suivantes (COPY, RUN, CMD) seront exécutées
# depuis ce chemin. C'est une bonne pratique pour ne pas polluer la racine
# du conteneur et pour utiliser des chemins relatifs.
WORKDIR /app

# --- ÉTAPE 3: COPIE DES FICHIERS DE DÉPENDANCES ---
# On copie d'abord UNIQUEMENT `package.json` et `package-lock.json`.
# C'est l'optimisation la plus importante de ce Dockerfile.
# Voir l'explication sur le cache Docker ci-dessous.
COPY package*.json ./

# --- ÉTAPE 4: INSTALLATION DES DÉPENDANCES ---
# On exécute `npm install` maintenant. Docker met en cache cette couche.
# Tant que `package.json` ne change pas, Docker n'exécutera plus cette
# commande lors des builds suivants, ce qui les rendra quasi instantanés.
RUN npm install

# --- ÉTAPE 5: COPIE DU CODE SOURCE ---
# On copie le reste du code de l'application (routes, controllers, etc.).
# En développement, cette copie est en réalité "masquée" par le volume
# que nous montons dans `docker-compose.yml`. Cela permet à `nodemon`
# de voir les changements sur notre machine hôte et de recharger le serveur.
# Cette ligne reste utile pour la complétude de l'image si on voulait la
# construire sans docker-compose.
COPY . .

# --- ÉTAPE 6: EXPOSITION DU PORT ---
# Informe Docker que le conteneur écoutera sur le port 5000 à l'exécution.
# C'est une forme de documentation entre le créateur de l'image et l'utilisateur.
# Cela ne publie PAS le port sur la machine hôte; c'est le rôle de l'option `-p`
# ou de la section `ports` dans `docker-compose.yml`.
EXPOSE 5000

# --- ÉTAPE 7: COMMANDE DE DÉMARRAGE ---
# La commande par défaut qui sera exécutée au lancement du conteneur.
# On utilise la "forme exec" (tableau de chaînes) qui est la forme préférée.
# Le processus `npm` devient le PID 1 du conteneur, ce qui lui permet de
# recevoir correctement les signaux d'arrêt (SIGINT, SIGTERM) pour notre
# "graceful shutdown".
CMD [ "npm", "run", "dev" ]