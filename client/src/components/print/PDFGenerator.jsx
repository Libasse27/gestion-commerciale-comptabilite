// ==============================================================================
//           Composant Utilitaire pour la Génération de PDF
//
// Ce composant fournit un bouton qui, au clic, génère un document PDF à partir
// d'un élément HTML spécifié.
//
// Il utilise une combinaison de :
//   - `html2canvas`: Pour "capturer" le contenu d'un <div> sous forme d'image.
//   - `jsPDF`: Pour créer le document PDF et y insérer l'image capturée.
//
// Cette approche est excellente car elle permet de designer les documents
// (factures, devis) directement en HTML/CSS.
// ==============================================================================

import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileEarmarkPdfFill } from 'react-bootstrap-icons';
import Loader from '../common/Loader';

/**
 * Un bouton qui génère un PDF à partir du contenu d'un élément HTML.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} props.elementIdToPrint - L'ID de l'élément du DOM à capturer pour le PDF.
 * @param {string} props.filename - Le nom du fichier PDF à télécharger (sans l'extension .pdf).
 * @param {string} [props.buttonText='Télécharger en PDF'] - Le texte du bouton.
 * @param {React.ReactNode} [props.icon=<FileEarmarkPdfFill />] - L'icône à afficher sur le bouton.
 */
const PDFGenerator = ({
  elementIdToPrint,
  filename,
  buttonText = 'Télécharger en PDF',
  icon = <FileEarmarkPdfFill className="me-2" />,
  ...buttonProps
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePdf = async () => {
    const input = document.getElementById(elementIdToPrint);
    if (!input) {
      console.error(`L'élément avec l'ID "${elementIdToPrint}" n'a pas été trouvé.`);
      return;
    }

    setIsGenerating(true);

    try {
      // Utiliser html2canvas pour capturer l'élément
      const canvas = await html2canvas(input, {
        scale: 2, // Augmente la résolution de l'image pour une meilleure qualité
        useCORS: true, // Important si vous avez des images provenant d'autres domaines
      });

      const imgData = canvas.toDataURL('image/png');
      
      // --- Création du PDF avec jsPDF ---
      // Dimensions d'une page A4 en millimètres : 210mm x 297mm
      const pdf = new jsPDF({
        orientation: 'p', // 'p' pour portrait, 'l' pour landscape
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculer le ratio pour que l'image s'adapte à la largeur du PDF
      const ratio = canvasWidth / canvasHeight;
      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / ratio;
      
      // Ajouter l'image au PDF
      // Si l'image est plus haute que la page, elle sera coupée.
      // Pour des documents de plusieurs pages, la logique est plus complexe.
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Télécharger le PDF
      pdf.save(`${filename}.pdf`);

    } catch (error) {
      console.error("Erreur lors de la génération du PDF :", error);
      alert("Une erreur est survenue lors de la création du PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleGeneratePdf} disabled={isGenerating} {...buttonProps}>
      {isGenerating ? (
        <Loader size="sm" showText={false} variant="light" />
      ) : (
        <>
          {icon}
          {buttonText}
        </>
      )}
    </Button>
  );
};

export default PDFGenerator;