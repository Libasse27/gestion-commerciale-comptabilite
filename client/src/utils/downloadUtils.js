// ==============================================================================
//                  Utilitaire de Téléchargement de Fichiers (Client)
//
// Ce module contient des fonctions d'aide pour déclencher le téléchargement de
// fichiers depuis le navigateur.
//
// Il gère différents scénarios :
//   - Télécharger des données textuelles (ex: CSV) créées à la volée.
//   - Télécharger un fichier binaire (Blob) reçu d'une API (ex: PDF, Excel).
// ==============================================================================

/**
 * Déclenche le téléchargement d'un fichier dans le navigateur.
 * C'est la fonction de base utilisée par les autres helpers.
 * @param {string} filename - Le nom du fichier à télécharger (ex: "rapport.csv").
 * @param {Blob} blob - L'objet Blob contenant les données du fichier.
 */
function triggerDownload(filename, blob) {
  // Crée une URL temporaire pour le Blob
  const url = window.URL.createObjectURL(blob);
  
  // Crée un lien d'ancrage (<a>) invisible
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  
  // Ajoute le lien au corps du document, le clique, puis le supprime
  document.body.appendChild(link);
  link.click();
  
  // Nettoie en supprimant le lien et en révoquant l'URL de l'objet
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
}


/**
 * Télécharge un contenu textuel (ex: CSV, JSON) sous forme de fichier.
 * @param {string} filename - Le nom du fichier (ex: "donnees.csv").
 * @param {string} content - Le contenu textuel du fichier.
 * @param {string} [mimeType='text/csv;charset=utf-8;'] - Le type MIME du contenu.
 */
export const downloadTextFile = (filename, content, mimeType = 'text/csv;charset=utf-8;') => {
  // Ajoute le BOM (Byte Order Mark) pour une meilleure compatibilité des CSV avec Excel
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, content], { type: mimeType });
  triggerDownload(filename, blob);
};

/**
 * Télécharge un fichier binaire reçu depuis une API (ex: PDF, XLSX).
 * La réponse de l'API doit être de type 'blob'.
 * @param {string} filename - Le nom de fichier suggéré.
 * @param {Blob} blob - Le Blob reçu de la réponse de l'API.
 */
export const downloadBlob = (filename, blob) => {
  triggerDownload(filename, blob);
};

/**
 * Crée un contenu CSV simple à partir d'un tableau de données, d'en-têtes et d'accesseurs.
 * @param {Array<string>} headers - Les en-têtes de colonnes (ex: ['ID', 'Nom du Client']).
 * @param {Array<object>} data - Le tableau d'objets (ex: [{ id: 1, name: 'Client A' }]).
 * @param {Array<string>} accessors - Les clés pour accéder aux données dans les objets (ex: ['id', 'name']).
 * @returns {string} Le contenu CSV sous forme de chaîne de caractères.
 */
export const createCsvContent = (headers, data, accessors) => {
    const headerRow = headers.join(',');
    const dataRows = data.map(row => {
        return accessors.map(key => {
            let value = row[key];
            if (value === null || value === undefined) {
                value = '';
            }
            if (typeof value === 'string') {
                // Échapper les guillemets en les doublant
                const escapedValue = value.replace(/"/g, '""');
                // Entourer de guillemets si la valeur contient une virgule, un saut de ligne ou des guillemets
                if (escapedValue.includes(',') || escapedValue.includes('\n') || escapedValue.includes('"')) {
                    return `"${escapedValue}"`;
                }
                return escapedValue;
            }
            return value;
        }).join(',');
    });
    return [headerRow, ...dataRows].join('\n');
}