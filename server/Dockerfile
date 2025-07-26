# Dockerfile pour le serveur Node.js (Développement)

# Étape 1: Utiliser une image Node.js officielle comme base
FROM node:18-alpine

# Étape 2: Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3: Copier les fichiers de dépendances
COPY package.json ./
# Si vous utilisez un package-lock.json
# COPY package-lock.json ./

# Étape 4: Installer les dépendances
# On le fait avant de copier le reste du code pour profiter du cache Docker
RUN npm install

# Étape 5: Copier le reste du code de l'application
# Le code sera en fait monté via un volume dans docker-compose,
# cette ligne est surtout utile pour la complétude de l'image.
COPY . .

# Étape 6: Exposer le port que l'application va utiliser
EXPOSE 5000

# Étape 7: La commande pour démarrer l'application en mode développement
# nodemon va surveiller les changements de fichiers et redémarrer le serveur
CMD [ "npm", "run", "dev" ]