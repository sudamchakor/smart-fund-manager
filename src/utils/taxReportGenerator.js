import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateTaxReportPDF = (
  taxComparison,
  breakEven,
  calculatedSalary,
) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('SmartFund Manager', 14, 22);
  doc.setFontSize(12);
  doc.text('Tax Report', 14, 30);

  // Comparison Table
  const tableData = [
    [
      'Gross Income',
      `₹${taxComparison.oldRegime.grossIncome.toLocaleString('en-IN')}`,
      `₹${taxComparison.newRegime.grossIncome.toLocaleString('en-IN')}`,
    ],
    [
      'Deductions',
      `- ₹${taxComparison.oldRegime.deductions.toLocaleString('en-IN')}`,
      `- ₹${taxComparison.newRegime.deductions.toLocaleString('en-IN')}`,
    ],
    [
      'Taxable Income',
      `₹${taxComparison.oldRegime.taxableIncome.toLocaleString('en-IN')}`,
      `₹${taxComparison.newRegime.taxableIncome.toLocaleString('en-IN')}`,
    ],
    [
      'Tax Liability',
      `₹${taxComparison.oldRegime.tax.toLocaleString('en-IN')}`,
      `₹${taxComparison.newRegime.tax.toLocaleString('en-IN')}`,
    ],
  ];

  doc.autoTable({
    startY: 40,
    head: [['', 'Old Regime', 'New Regime']],
    body: tableData,
  });

  // Recommended Action
  if (breakEven.investmentNeeded > 0) {
    doc.setFontSize(12);
    doc.text('Recommended Action:', 14, doc.autoTable.previous.finalY + 10);
    doc.setFontSize(10);
    doc.text(
      `You could save an additional ₹${breakEven.potentialSavings.toLocaleString(
        'en-IN',
      )} in the Old Regime if you invest ₹${breakEven.investmentNeeded.toLocaleString(
        'en-IN',
      )} more in Section ${breakEven.section}.`,
      14,
      doc.autoTable.previous.finalY + 16,
    );
  }

  // Monthly Breakdown
  const monthlyData = calculatedSalary.months.map((month) => [
    month.month,
    `₹${month.total.toLocaleString('en-IN')}`,
    `- ₹${month.totDed.toLocaleString('en-IN')}`,
    `₹${month.net.toLocaleString('en-IN')}`,
  ]);

  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 26,
    head: [['Month', 'Gross', 'Deductions', 'Take-Home']],
    body: monthlyData,
  });

  doc.save('tax_report.pdf');
};
