// ==============================================================================
//           Composant Bouton d'Impression
//
// Ce composant simple fournit un bouton standardisé pour déclencher
// l'impression d'un élément spécifique de la page.
//
// Il utilise la fonction `printElement` de notre module `printUtils`
// pour isoler et imprimer une section du DOM.
// ==============================================================================

import React from 'react';
import { Button } from 'react-bootstrap';
import { PrinterFill } from 'react-bootstrap-icons';
import { printElement } from '../../utils/printUtils';

/**
 * Un bouton qui déclenche la boîte de dialogue d'impression du navigateur
 * pour un élément spécifique.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} props.elementIdToPrint - L'ID de l'élément du DOM à imprimer.
 * @param {string} [props.pageTitle='Document'] - Le titre qui apparaîtra dans l'en-tête de la page imprimée.
 * @param {string} [props.buttonText='Imprimer'] - Le texte du bouton.
 * @param {React.ReactNode} [props.icon=<PrinterFill />] - L'icône à afficher sur le bouton.
 */
const PrintButton = ({
  elementIdToPrint,
  pageTitle = 'Document',
  buttonText = 'Imprimer',
  icon = <PrinterFill className="me-2" />,
  ...buttonProps // Pour passer d'autres props (variant, size, etc.)
}) => {
  const handlePrint = () => {
    if (!elementIdToPrint) {
      console.error("L'ID de l'élément à imprimer (`elementIdToPrint`) est manquant.");
      return;
    }
    printElement(elementIdToPrint, pageTitle);
  };

  return (
    <Button onClick={handlePrint} {...buttonProps}>
      {icon}
      {buttonText}
    </Button>
  );
};

export default PrintButton;