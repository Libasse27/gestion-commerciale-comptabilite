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
 * L'approche la plus fiable : ouvrir le contenu dans un Iframe caché.
 * Cela permet de copier les styles du document principal tout en isolant
 * le contenu à imprimer. C'est un bon compromis entre les deux méthodes.
 *
 * @param {string} elementId - L'ID de l'élément HTML à imprimer.
 * @param {string} [pageTitle='Document'] - Le titre qui apparaîtra dans l'en-tête de la page imprimée.
 */
export const printElementById = (elementId, pageTitle = 'Document') => {
  const elementToPrint = document.getElementById(elementId);

  if (!elementToPrint) {
    console.error(`Élément à imprimer non trouvé avec l'ID: ${elementId}`);
    return;
  }

  // 1. Créer un Iframe caché
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.id = 'print-iframe';

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow.document;

  // 2. Copier les feuilles de style du document parent vers l'Iframe
  // C'est crucial pour que les styles Bootstrap, de thème, etc., s'appliquent.
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      if (sheet.cssRules) { // Pour les styles en ligne
        const style = document.createElement('style');
        style.textContent = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        iframeDoc.head.appendChild(style);
      } else if (sheet.href) { // Pour les feuilles de style externes
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = sheet.href;
        iframeDoc.head.appendChild(link);
      }
    } catch (e) {
      console.warn('Impossible de copier la feuille de style :', e);
    }
  });

  // 3. Définir le titre et copier le contenu HTML
  iframeDoc.head.innerHTML += `<title>${pageTitle}</title>`;
  iframeDoc.body.innerHTML = elementToPrint.innerHTML;

  // 4. Attendre que tout soit chargé (images, etc.) puis imprimer
  const printAndRemove = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Erreur lors de l\'impression:', e);
    }

    // Nettoyer en supprimant l'Iframe après un court délai
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 500);
  };

  // Gérer le chargement des images avant l'impression
  const images = iframeDoc.getElementsByTagName('img');
  let loadedImages = 0;
  if (images.length === 0) {
    printAndRemove();
  } else {
    Array.from(images).forEach(img => {
      img.onload = () => {
        loadedImages++;
        if (loadedImages === images.length) {
          printAndRemove();
        }
      };
      // Si une image ne se charge pas, on lance l'impression quand même après un timeout
      img.onerror = () => {
          loadedImages++;
          if (loadedImages === images.length) {
              printAndRemove();
          }
      };
    });
  }
};