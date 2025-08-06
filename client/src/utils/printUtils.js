// client/src/utils/printUtils.js
// ==============================================================================
//                Utilitaire de Gestion de l'Impression (Client)
// ==============================================================================

/**
 * Imprime le contenu d'un élément HTML en l'isolant dans un Iframe caché.
 * Cette méthode assure que les styles sont conservés et que seul l'élément
 * ciblé est imprimé.
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

  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.id = 'print-iframe-temp';

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow.document;

  // Copier les feuilles de style du document parent
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      if (sheet.href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = sheet.href;
        iframeDoc.head.appendChild(link);
      } else if (sheet.cssRules) {
        const style = document.createElement('style');
        style.textContent = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        iframeDoc.head.appendChild(style);
      }
    } catch (e) {
      console.warn('Impossible de copier la feuille de style (peut être due à des restrictions CORS):', e);
    }
  });

  iframeDoc.head.innerHTML += `<title>${pageTitle}</title>`;
  iframeDoc.body.innerHTML = elementToPrint.innerHTML;

  const printAndRemove = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Erreur lors du lancement de l\'impression:', e);
    }

    // Nettoyer après un court délai
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  // Attendre que tout le contenu (surtout les images) soit chargé
  const images = iframeDoc.getElementsByTagName('img');
  if (images.length === 0) {
    // Si pas d'images, imprimer après un court délai pour laisser les styles se charger
    setTimeout(printAndRemove, 250);
  } else {
    let loadedImages = 0;
    const totalImages = images.length;
    
    Array.from(images).forEach(img => {
      const onImageLoad = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
          setTimeout(printAndRemove, 100); // Petit délai supplémentaire
        }
      };
      img.onload = onImageLoad;
      // Gérer les images qui ne se chargent pas
      img.onerror = onImageLoad;
    });
  }
};