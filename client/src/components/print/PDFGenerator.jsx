// client/src/components/print/PDFGenerator.jsx
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FileEarmarkPdf } from 'react-bootstrap-icons';
import Loader from '../common/Loader';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

const PDFGenerator = ({
  elementIdToPrint,
  filename = 'document',
  children = 'Télécharger en PDF',
  ...buttonProps
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { addNotification } = useNotification();

  const handleGeneratePdf = async () => {
    const input = document.getElementById(elementIdToPrint);
    if (!input) {
      const errorMsg = `L'élément "#${elementIdToPrint}" est introuvable.`;
      addNotification(errorMsg, TOAST_TYPES.ERROR);
      return;
    }

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      const finalImgHeight = pdfWidth / ratio;
      
      let heightLeft = finalImgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalImgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - finalImgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalImgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`${filename}.pdf`);
      addNotification('Le PDF a été généré avec succès.', TOAST_TYPES.SUCCESS);

    } catch (error) {
      const errorMsg = "Erreur lors de la génération du PDF.";
      console.error(errorMsg, error);
      addNotification(errorMsg, TOAST_TYPES.ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleGeneratePdf} disabled={isGenerating} {...buttonProps}>
      {isGenerating ? (
        <Loader size="sm" />
      ) : (
        <>
          <FileEarmarkPdf className="me-2" />
          {children}
        </>
      )}
    </Button>
  );
};

export default PDFGenerator;