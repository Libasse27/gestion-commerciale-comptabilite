# Dockerfile pour le client React (Développement)

# Étape 1: Utiliser une image Node.js officielle
FROM node:18-alpine

# Étape 2: Définir le répertoire de travail
WORKDIR /app

# Étape 3: Copier les fichiers de dépendances
COPY package.json ./

# Étape 4: Installer les dépendances
RUN npm install --legacy-peer-deps

# Étape 5: Copier le reste du code source
# Comme pour le serveur, sera surchargé par un volume pour le développement
COPY . .

# Étape 6: Exposer le port du serveur de développement Vite/React
EXPOSE 3000

# Étape 7: Commande pour lancer le serveur de développement
CMD [ "npm", "run", "dev" ]