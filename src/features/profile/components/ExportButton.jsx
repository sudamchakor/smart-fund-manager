import React, { useRef } from 'react';
import { Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import WealthSummary from './WealthSummary';

const ExportButton = (props) => {
  // You can pass any necessary data to WealthSummary from your Redux store or parent component
  const { profileData, goalData } = props;
  const reportComponentRef = useRef(null);

  const handleExportPdf = () => {
    const input = reportComponentRef.current;
    if (!input) {
      console.error("The component to be exported is not available.");
      return;
    }

    html2canvas(input, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // For images from other origins
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Maintain aspect ratio
      const ratio = canvasWidth / canvasHeight;
      let width = pdfWidth;
      let height = width / ratio;

      // If height is bigger than a page, scale it down to fit.
      if (height > pdfHeight) {
        height = pdfHeight;
        width = height * ratio;
      }

      const x = (pdfWidth - width) / 2; // Center the content horizontally

      pdf.addImage(imgData, 'PNG', x, 0, width, height);
      pdf.save('wealth-summary.pdf');
    });
  };

  return (
    <>
      {/* This component is rendered off-screen only for the purpose of PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
        <WealthSummary ref={reportComponentRef} profile={profileData} goals={goalData} />
      </div>

      <Button variant="contained" color="primary" startIcon={<PictureAsPdfIcon />} onClick={handleExportPdf}>
        Export Summary
      </Button>
    </>
  );
};

export default ExportButton;