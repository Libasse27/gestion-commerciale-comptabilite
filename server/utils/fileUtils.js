// ==============================================================================
//           Utilitaire de Manipulation du Système de Fichiers (File System)
//
// Ce module contient des fonctions d'aide pour interagir avec le système de
// fichiers de manière asynchrone et sécurisée. Il utilise l'API `fs/promises`
// de Node.js pour éviter le "callback hell" et écrire un code plus propre.
//
// Fonctions incluses :
// - Vérifier l'existence d'un fichier/dossier.
// - Créer un dossier (récursivement).
// - Supprimer un fichier en toute sécurité.
// - Lire le contenu d'un fichier.
// - Écrire du contenu dans un fichier.
// ==============================================================================

const fs = require('fs/promises');
const path = require('path');

/**
 * Vérifie si un chemin (fichier ou dossier) existe.
 * @param {string} filePath - Le chemin complet du fichier ou dossier.
 * @returns {Promise<boolean>} `true` si le chemin existe, sinon `false`.
 */
const pathExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Crée un dossier si celui-ci n'existe pas déjà.
 * L'option `recursive: true` permet de créer des dossiers parents si nécessaire.
 * @param {string} dirPath - Le chemin du dossier à créer.
 * @returns {Promise<void>}
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    // console.log(`Dossier assuré d'exister: ${dirPath}`);
  } catch (error) {
    console.error(`Erreur lors de la création du dossier ${dirPath}:`, error);
    throw error; // Propage l'erreur pour la gérer plus haut
  }
};

/**
 * Supprime un fichier en toute sécurité.
 * Ne lève pas d'erreur si le fichier n'existe pas.
 * @param {string} filePath - Le chemin complet du fichier à supprimer.
 * @returns {Promise<void>}
 */
const safeDeleteFile = async (filePath) => {
  try {
    // La vérification de l'existence n'est pas nécessaire avec l'option force de fs.rm
    // await fs.unlink(filePath); est aussi une option mais échoue si le fichier n'existe pas.
    // fs.rm est plus moderne et flexible.
    await fs.rm(filePath, { force: true });
    // console.log(`Fichier supprimé: ${filePath}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression du fichier ${filePath}:`, error);
  }
};

/**
 * Lit le contenu d'un fichier en UTF-8.
 * @param {string} filePath - Le chemin complet du fichier à lire.
 * @returns {Promise<string | null>} Le contenu du fichier, ou null si une erreur se produit.
 */
const readFileContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, { encoding: 'utf-8' });
    return content;
  } catch (error) {
    // Si l'erreur est que le fichier n'existe pas, c'est une information, pas une erreur critique.
    if (error.code === 'ENOENT') {
      return null;
    }
    console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
    return null;
  }
};

/**
 * Écrit du contenu dans un fichier, en créant le dossier parent si nécessaire.
 * Écrase le fichier s'il existe déjà.
 * @param {string} filePath - Le chemin complet du fichier où écrire.
 * @param {string | Buffer} content - Le contenu à écrire.
 * @returns {Promise<void>}
 */
const writeFileContent = async (filePath, content) => {
  try {
    const dir = path.dirname(filePath);
    await ensureDirectoryExists(dir);
    await fs.writeFile(filePath, content, { encoding: 'utf-8' });
    // console.log(`Contenu écrit dans le fichier: ${filePath}`);
  } catch (error) {
    console.error(`Erreur lors de l'écriture dans le fichier ${filePath}:`, error);
    throw error;
  }
};


module.exports = {
  pathExists,
  ensureDirectoryExists,
  safeDeleteFile,
  readFileContent,
  writeFileContent,
};