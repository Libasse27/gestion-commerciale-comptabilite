// client/src/components/print/PrintButton.jsx
import React from 'react';
import { Button } from 'react-bootstrap';
import { Printer } from 'react-bootstrap-icons';
import { printElementById } from '../../utils/printUtils';

/**
 * Un bouton qui déclenche l'impression d'un élément spécifique.
 */
const PrintButton = ({
  elementIdToPrint,
  pageTitle = 'Document',
  children = 'Imprimer',
  variant = 'secondary', // Une couleur moins intrusive par défaut
  ...buttonProps
}) => {
  const handlePrint = () => {
    if (!elementIdToPrint) {
      console.error("L'ID de l'élément à imprimer (`elementIdToPrint`) est manquant.");
      return;
    }
    printElementById(elementIdToPrint, pageTitle);
  };

  return (
    <Button variant={variant} onClick={handlePrint} {...buttonProps}>
      <Printer className="me-2" />
      {children}
    </Button>
  );
};

export default PrintButton;