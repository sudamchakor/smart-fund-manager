import * as taxReportGenerator from '../../../src/utils/taxReportGenerator';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Mock jsPDF and jspdf-autotable
jest.mock('jspdf', () => {
  const mockAddPage = jest.fn();
  const mockSetFont = jest.fn();
  const mockSetFontSize = jest.fn();
  const mockText = jest.fn();
  const mockSave = jest.fn();
  const mockAutoTable = jest.fn();

  class MockJsPDF {
    constructor() {
      this.addPage = mockAddPage;
      this.setFont = mockSetFont;
      this.setFontSize = mockSetFontSize;
      this.text = mockText;
      this.save = mockSave;
      this.autoTable = mockAutoTable;
    }
  }

  MockJsPDF.mockAddPage = mockAddPage;
  MockJsPDF.mockSetFont = mockSetFont;
  MockJsPDF.mockSetFontSize = mockSetFontSize;
  MockJsPDF.mockText = mockText;
  MockJsPDF.mockSave = mockSave;
  MockJsPDF.mockAutoTable = mockAutoTable;

  return MockJsPDF;
});

// Mock the autoTable plugin directly on the mock JsPDF prototype
// This is necessary because jspdf-autotable extends the prototype
beforeAll(() => {
  jsPDF.prototype.autoTable = jsPDF.mockAutoTable;
});

describe.skip('generateTaxReport', () => {
  const mockTaxData = {
    oldRegime: {
      grossIncome: 1000000,
      deductions: 500000,
      taxableIncome: 500000,
      tax: 0,
    },
    newRegime: {
      grossIncome: 1000000,
      deductions: 50000,
      taxableIncome: 950000,
      tax: 62400,
    },
    optimal: 'Old Regime',
    savings: 62400,
  };

  const mockUserDetails = {
    name: 'John Doe',
    pan: 'ABCDE1234F',
    assessmentYear: '2023-24',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jsPDF.mockAddPage.mockClear();
    jsPDF.mockSetFont.mockClear();
    jsPDF.mockSetFontSize.mockClear();
    jsPDF.mockText.mockClear();
    jsPDF.mockSave.mockClear();
    jsPDF.mockAutoTable.mockClear();
  });

  it('should generate a PDF report with correct title and user details', () => {
    taxReportGenerator.generateTaxReport(mockTaxData, mockUserDetails);

    expect(jsPDF.mockSetFontSize).toHaveBeenCalledWith(18);
    expect(jsPDF.mockText).toHaveBeenCalledWith('Tax Report', 105, 20, {
      align: 'center',
    });
    expect(jsPDF.mockSetFontSize).toHaveBeenCalledWith(12);
    expect(jsPDF.mockText).toHaveBeenCalledWith(
      `Name: ${mockUserDetails.name}`,
      20,
      40,
    );
    expect(jsPDF.mockText).toHaveBeenCalledWith(
      `PAN: ${mockUserDetails.pan}`,
      20,
      47,
    );
    expect(jsPDF.mockText).toHaveBeenCalledWith(
      `Assessment Year: ${mockUserDetails.assessmentYear}`,
      20,
      54,
    );
  });

  it('should generate tables for Old and New Regimes', () => {
    taxReportGenerator.generateTaxReport(mockTaxData, mockUserDetails);

    expect(jsPDF.mockAutoTable).toHaveBeenCalledTimes(2); // One for each regime
    expect(jsPDF.mockText).toHaveBeenCalledWith(
      'Old Tax Regime Summary',
      20,
      70,
    );
    expect(jsPDF.mockText).toHaveBeenCalledWith(
      'New Tax Regime Summary',
      20,
      130,
    );
  });

  it('should include optimal regime and savings in the report', () => {
    taxReportGenerator.generateTaxReport(mockTaxData, mockUserDetails);

    expect(jsPDF.mockText).toHaveBeenCalledWith(
      `Optimal Regime: ${mockTaxData.optimal}`,
      20,
      190,
    );
    expect(jsPDF.mockText).toHaveBeenCalledWith(
      `Tax Savings: ₹${mockTaxData.savings.toLocaleString('en-IN')}`,
      20,
      197,
    );
  });

  it('should save the PDF with a specific filename', () => {
    taxReportGenerator.generateTaxReport(mockTaxData, mockUserDetails);
    expect(jsPDF.mockSave).toHaveBeenCalledWith(
      'Tax_Report_John_Doe_2023-24.pdf',
    );
  });

  it('should handle missing user details gracefully', () => {
    const incompleteUserDetails = { name: 'Jane Doe' };
    taxReportGenerator.generateTaxReport(mockTaxData, incompleteUserDetails);

    expect(jsPDF.mockText).toHaveBeenCalledWith('Name: Jane Doe', 20, 40);
    expect(jsPDF.mockText).toHaveBeenCalledWith('PAN: N/A', 20, 47);
    expect(jsPDF.mockText).toHaveBeenCalledWith('Assessment Year: N/A', 20, 54);
    expect(jsPDF.mockSave).toHaveBeenCalledWith('Tax_Report_Jane_Doe_N_A.pdf');
  });

  it('should handle zero tax scenarios correctly', () => {
    const zeroTaxData = {
      oldRegime: { ...mockTaxData.oldRegime, tax: 0 },
      newRegime: { ...mockTaxData.newRegime, tax: 0 },
      optimal: 'Old Regime',
      savings: 0,
    };
    taxReportGenerator.generateTaxReport(zeroTaxData, mockUserDetails);
    expect(jsPDF.mockText).toHaveBeenCalledWith('Tax Savings: ₹0', 20, 197);
  });
});
