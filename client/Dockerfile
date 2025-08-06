# ==============================================================================
#            DOCKERFILE POUR LE FRONTEND REACT (ENV. DE DÉVELOPPEMENT)
#
# Ce fichier construit l'image Docker pour notre client React avec Vite.
# L'objectif est identique à celui du serveur : un environnement léger,
# rapide, et qui reflète en direct les changements de notre code.
# ==============================================================================

# --- ÉTAPE 1: L'IMAGE DE BASE ---
# On reste cohérent avec le serveur en utilisant `node:18-alpine`.
FROM node:18-alpine

# --- ÉTAPE 2: LE RÉPERTOIRE DE TRAVAIL ---
# On définit le répertoire de travail dans le conteneur.
WORKDIR /app

# --- ÉTAPE 3: COPIE DES FICHIERS DE DÉPENDANCES ---
# On copie `package.json` (et `package-lock.json` s'il existe) pour
# profiter du mécanisme de cache de Docker.
COPY package*.json ./

# --- ÉTAPE 4: INSTALLATION DES DÉPENDANCES ---
# L'option `--legacy-peer-deps` est utilisée ici.
# Elle demande à NPM d'ignorer les conflits de "peer dependencies",
# ce qui peut être nécessaire avec certaines combinaisons de paquets.
# C'est une solution de contournement acceptable en développement.
RUN npm install --legacy-peer-deps

# --- ÉTAPE 5: COPIE DU CODE SOURCE ---
# Comme pour le serveur, cette copie sera "remplacée" en développement
# par le volume monté depuis notre machine locale via docker-compose.
COPY . .

# --- ÉTAPE 6: EXPOSITION DU PORT (MISE À JOUR) ---
# Le serveur de développement de Vite s'exécute par défaut sur le port 5173.
# Il est crucial d'exposer le bon port pour la cohérence et la clarté.
# L'ancien create-react-app utilisait le port 3000.
EXPOSE 3000

# --- ÉTAPE 7: COMMANDE DE DÉMARRAGE (MISE À JOUR CRITIQUE) ---
# Par défaut, le serveur de Vite n'est accessible que depuis `localhost`.
# À l'intérieur d'un conteneur, cela signifie qu'il n'est pas accessible
# de l'extérieur. L'ajout de l'argument `--host` lui demande d'écouter
# sur toutes les interfaces réseau (0.0.0.0), le rendant ainsi accessible
# depuis notre machine hôte via le port mappé dans docker-compose.
# Le `--` est utilisé pour passer l'argument `--host` directement au script `vite`.
CMD [ "npm", "run", "dev", "--", "--host" ]