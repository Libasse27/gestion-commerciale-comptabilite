// ==============================================================================
//                Utilitaire de Gestion de l'Impression (Client)
//
// Ce module contient des fonctions pour gérer l'impression de sections
// spécifiques d'une page web.
//
// Il permet d'isoler un composant ou une partie du DOM, de lui appliquer
// des styles spécifiques pour l'impression, et de déclencher la boîte de
// dialogue d'impression du navigateur.
// ==============================================================================

/**
 * Crée et ajoute une feuille de style à la volée dans le <head> du document.
 * @param {string} css - La chaîne de caractères contenant les règles CSS.
 * @returns {HTMLStyleElement} L'élément <style> créé.
 */
const addPrintStyles = (css) => {
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  styleElement.id = 'print-styles'; // Un ID pour le retrouver et le supprimer facilement
  styleElement.appendChild(document.createTextNode(css));
  document.head.appendChild(styleElement);
  return styleElement;
};

/**
 * Supprime la feuille de style d'impression après usage.
 */
const removePrintStyles = () => {
  const styleElement = document.getElementById('print-styles');
  if (styleElement) {
    styleElement.parentNode.removeChild(styleElement);
  }
};

/**
 * Déclenche l'impression d'un élément spécifique du DOM.
 * @param {string} elementId - L'ID de l'élément HTML à imprimer.
 * @param {string} [pageTitle='Document'] - Le titre qui apparaîtra dans l'en-tête de la page imprimée.
 */
export const printElement = (elementId, pageTitle = 'Document') => {
  const elementToPrint = document.getElementById(elementId);

  if (!elementToPrint) {
    console.error(`Élément à imprimer non trouvé avec l'ID: ${elementId}`);
    return;
  }

  // CSS pour masquer tout ce qui n'est pas l'élément à imprimer
  const printSpecificCSS = `
    @media print {
      body * {
        visibility: hidden; /* Masque tout par défaut */
      }
      #${elementId}, #${elementId} * {
        visibility: visible; /* Rend visible uniquement l'élément et ses enfants */
      }
      #${elementId} {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      /* Supprimer les marges par défaut du navigateur */
      @page {
        size: auto;
        margin: 0mm;
      }
    }
  `;

  addPrintStyles(printSpecificCSS);
  document.title = pageTitle; // Change le titre du document temporairement

  // Déclenche la boîte de dialogue d'impression
  window.print();

  // Nettoie après l'impression
  removePrintStyles();
};


/**
 * Une autre approche : ouvrir le contenu dans une nouvelle fenêtre pour l'imprimer.
 * C'est souvent plus fiable pour les mises en page complexes.
 * @param {string} elementId - L'ID de l'élément à imprimer.
 * @param {string} [pageTitle='Document'] - Le titre de la nouvelle fenêtre.
 */
export const printInNewWindow = (elementId, pageTitle = 'Document') => {
    const elementToPrint = document.getElementById(elementId);

    if (!elementToPrint) {
        console.error(`Élément à imprimer non trouvé avec l'ID: ${elementId}`);
        return;
    }

    const printWindow = window.open('', '_blank', 'height=600,width=800');
    
    printWindow.document.write('<html><head><title>' + pageTitle + '</title>');
    // Copier les feuilles de style du document principal peut être nécessaire pour le style
    // Array.from(document.styleSheets).forEach(sheet => {
    //     if (sheet.href) {
    //         printWindow.document.write('<link rel="stylesheet" href="' + sheet.href + '">');
    //     }
    // });
    printWindow.document.write('</head><body>');
    printWindow.document.write(elementToPrint.innerHTML);
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.focus(); // Requis pour certains navigateurs

    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
    };
}