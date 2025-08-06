// client/src/utils/downloadUtils.js
// ==============================================================================
//                  Utilitaire de Téléchargement de Fichiers (Client)
// ==============================================================================

/**
 * Déclenche le téléchargement d'un fichier dans le navigateur.
 * @private
 */
function triggerDownload(filename, blob) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Télécharge un contenu textuel (ex: CSV, JSON) sous forme de fichier.
 * @param {string} filename - Le nom du fichier (ex: "donnees.csv").
 * @param {string} content - Le contenu textuel du fichier.
 * @param {string} [mimeType='text/csv;charset=utf-8;'] - Le type MIME.
 */
export const downloadTextFile = (filename, content, mimeType = 'text/csv;charset=utf-8;') => {
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // BOM pour compatibilité Excel
  const blob = new Blob([bom, content], { type: mimeType });
  triggerDownload(filename, blob);
};

/**
 * Télécharge un fichier binaire reçu depuis une API (ex: PDF, XLSX).
 * @param {string} filename - Le nom de fichier suggéré.
 * @param {Blob} blob - Le Blob reçu de la réponse de l'API.
 */
export const downloadBlob = (filename, blob) => {
  triggerDownload(filename, blob);
};

/**
 * Crée un contenu CSV à partir de données structurées.
 * @param {Array<string>} headers - Les en-têtes de colonnes.
 * @param {Array<object>} data - Le tableau d'objets.
 * @param {Array<string>} accessors - Les clés pour accéder aux données.
 * @returns {string} Le contenu CSV.
 */
export const createCsvContent = (headers, data, accessors) => {
    const headerRow = headers.join(',');
    const dataRows = data.map(row => {
        return accessors.map(key => {
            let value = key.split('.').reduce((o, i) => (o ? o[i] : ''), row); // Gère les clés imbriquées (ex: 'client.nom')
            if (value === null || value === undefined) value = '';

            if (typeof value === 'string') {
                const escapedValue = value.replace(/"/g, '""');
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