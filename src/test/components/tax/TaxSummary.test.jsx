import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TaxSummary from '../../../components/tax/TaxSummary';
import * as taxReportGenerator from '../../../utils/taxReportGenerator';
import '@testing-library/jest-dom';
import useMediaQuery from '@mui/material/useMediaQuery';

// Mock Material-UI's useMediaQuery hook
jest.mock('@mui/material/useMediaQuery');

// Mock generateTaxReportPDF
jest.mock('../../../utils/taxReportGenerator', () => ({
  generateTaxReportPDF: jest.fn(),
}));

// Mock DetailRow to simplify testing
jest.mock('../../../components/common/DetailRow', () => ({ label, value }) => (
  <div data-testid={`detail-row-${label.toLowerCase().replace(/\s/g, '-')}`}>
    <span>{label}:</span>
    <span>{value}</span>
  </div>
));

const mockStore = configureStore([]);
const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('TaxSummary Component', () => {
  let store;
  const defaultTaxComparison = {
    oldRegime: {
      grossIncome: 1000000,
      deductions: 500000,
      taxableIncome: 500000,
      tax: 12500,
    },
    newRegime: {
      grossIncome: 1000000,
      deductions: 50000,
      taxableIncome: 950000,
      tax: 62400,
    },
    optimal: 'Old Regime',
    savings: 49900, // 62400 - 12500
  };
  const defaultDeclarations = {}; // Not directly used in rendering TaxSummary, but passed to PDF
  const defaultOnQuickFill = jest.fn();
  const defaultBreakEven = {
    investmentNeeded: 0,
    potentialSavings: 0,
    section: '',
  };
  const defaultCalculatedSalary = {}; // Not directly used in rendering TaxSummary, but passed to PDF
  const defaultHraBreakdown = {
    eligibleHra: 0,
  };

  const renderComponent = (props) => {
    store = mockStore({
      emi: { currency: '₹' },
    });
    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TaxSummary {...props} />
        </ThemeProvider>
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useMediaQuery.mockReturnValue(false); // Default to desktop
  });

  // --- Basic Rendering ---
  it('renders without crashing with minimal props', () => {
    renderComponent({
      taxComparison: defaultTaxComparison,
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: defaultBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: defaultHraBreakdown,
    });
    expect(screen.getByText('System Output')).toBeInTheDocument();
    expect(screen.getByText('Recommended Regime')).toBeInTheDocument();
    expect(screen.getByText('Old Tax Regime')).toBeInTheDocument(); // Optimal regime
    expect(screen.getByText('Export Report')).toBeInTheDocument();
  });

  it('displays correct optimal regime and savings', () => {
    renderComponent({
      taxComparison: defaultTaxComparison,
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: defaultBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: defaultHraBreakdown,
    });
    expect(screen.getByText(defaultTaxComparison.optimal)).toBeInTheDocument();
    expect(
      screen.getByText(/Saves ₹49,900 in liabilities./i),
    ).toBeInTheDocument();
  });

  // --- HRA Breakdown Alert ---
  it('shows HRA alert when eligibleHra is greater than 0', () => {
    renderComponent({
      taxComparison: defaultTaxComparison,
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: defaultBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: { eligibleHra: 50000 },
    });
    expect(
      screen.getByText(/Potential HRA deduction of ₹50,000 calculated./i),
    ).toBeInTheDocument();
  });

  it('does not show HRA alert when eligibleHra is 0', () => {
    renderComponent({
      taxComparison: defaultTaxComparison,
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: defaultBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: { eligibleHra: 0 },
    });
    expect(
      screen.queryByText(/Potential HRA deduction/i),
    ).not.toBeInTheDocument();
  });

  // --- Tax Optimizer Alert (Break-Even) ---
  it('shows Tax Optimizer alert when investmentNeeded is greater than 0', () => {
    const customBreakEven = {
      investmentNeeded: 10000,
      potentialSavings: 2000,
      section: '80C',
    };
    renderComponent({
      taxComparison: defaultTaxComparison,
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: customBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: defaultHraBreakdown,
    });
    expect(
      screen.getByText(/You could save an additional ₹2,000/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/if you invest ₹10,000 more in Section 80C./i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Quick-Fill/i }),
    ).toBeInTheDocument();
  });

  it('calls onQuickFill when Quick-Fill button is clicked', () => {
    const customBreakEven = {
      investmentNeeded: 10000,
      potentialSavings: 2000,
      section: '80C',
    };
    renderComponent({
      taxComparison: defaultTaxComparison,
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: customBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: defaultHraBreakdown,
    });
    fireEvent.click(screen.getByRole('button', { name: /Quick-Fill/i }));
    expect(defaultOnQuickFill).toHaveBeenCalledWith('80C', 10000);
  });

  it('does not show Tax Optimizer alert when investmentNeeded is 0', () => {
    renderComponent({
      taxComparison: defaultTaxComparison,
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: defaultBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: defaultHraBreakdown,
    });
    expect(screen.queryByText(/Tax Optimizer/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Quick-Fill/i }),
    ).not.toBeInTheDocument();
  });

  // --- Tab Switching ---
  it('renders Old Regime view by default', () => {
    renderComponent({
      taxComparison: defaultTaxComparison,
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: defaultBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: defaultHraBreakdown,
    });
    expect(screen.getByTestId('detail-row-gross-income')).toHaveTextContent(
      'Gross Income:₹10,00,000',
    );
    expect(screen.getByTestId('detail-row-deductions')).toHaveTextContent(
      'Deductions:- ₹5,00,000',
    );
    expect(screen.getByTestId('detail-row-taxable-income')).toHaveTextContent(
      'Taxable Income:₹5,00,000',
    );
    expect(screen.getByText('Tax Liability')).toBeInTheDocument();
    expect(screen.getByText('₹12,500')).toBeInTheDocument();
  });

  it('switches to New Regime view when New Regime tab is clicked', () => {
    renderComponent({
      taxComparison: defaultTaxComparison,
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: defaultBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: defaultHraBreakdown,
    });
    fireEvent.click(screen.getByRole('tab', { name: /New Regime/i }));
    expect(screen.getByTestId('detail-row-gross-income')).toHaveTextContent(
      'Gross Income:₹10,00,000',
    );
    expect(screen.getByTestId('detail-row-deductions')).toHaveTextContent(
      'Deductions:- ₹50,000',
    );
    expect(screen.getByTestId('detail-row-taxable-income')).toHaveTextContent(
      'Taxable Income:₹9,50,000',
    );
    expect(screen.getByText('Tax Liability')).toBeInTheDocument();
    expect(screen.getByText('₹62,400')).toBeInTheDocument();
  });

  // --- Tax Liability Color based on Optimal Regime ---
  it('shows optimal regime tax liability in success color', () => {
    renderComponent({
      taxComparison: defaultTaxComparison, // Optimal is Old Regime
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: defaultBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: defaultHraBreakdown,
    });
    const oldRegimeTax = screen.getByText('₹12,500');
    expect(oldRegimeTax).toHaveStyle(`color: ${theme.palette.success.main}`);

    fireEvent.click(screen.getByRole('tab', { name: /New Regime/i }));
    const newRegimeTax = screen.getByText('₹62,400');
    expect(newRegimeTax).toHaveStyle(`color: ${theme.palette.error.main}`); // Not optimal, so error color
  });

  it('shows non-optimal regime tax liability in error color', () => {
    const newOptimalTaxComparison = {
      ...defaultTaxComparison,
      optimal: 'New Regime',
      oldRegime: { ...defaultTaxComparison.oldRegime, tax: 100000 },
      newRegime: { ...defaultTaxComparison.newRegime, tax: 50000 },
      savings: 50000,
    };
    renderComponent({
      taxComparison: newOptimalTaxComparison, // Optimal is New Regime
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: defaultBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: defaultHraBreakdown,
    });
    const oldRegimeTax = screen.getByText('₹1,00,000');
    expect(oldRegimeTax).toHaveStyle(`color: ${theme.palette.error.main}`);

    fireEvent.click(screen.getByRole('tab', { name: /New Regime/i }));
    const newRegimeTax = screen.getByText('₹50,000');
    expect(newRegimeTax).toHaveStyle(`color: ${theme.palette.success.main}`);
  });

  // --- Export Report ---
  it('calls generateTaxReportPDF with correct arguments when Export Report button is clicked', () => {
    renderComponent({
      taxComparison: defaultTaxComparison,
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: defaultBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: defaultHraBreakdown,
    });
    fireEvent.click(screen.getByRole('button', { name: /Export Report/i }));
    expect(taxReportGenerator.generateTaxReportPDF).toHaveBeenCalledWith(
      defaultTaxComparison,
      defaultBreakEven,
      defaultCalculatedSalary,
    );
  });

  // --- Currency Selector ---
  it('uses the currency from Redux state', () => {
    store = mockStore({
      emi: { currency: '$' },
    });
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <TaxSummary
            taxComparison={defaultTaxComparison}
            declarations={defaultDeclarations}
            onQuickFill={defaultOnQuickFill}
            breakEven={defaultBreakEven}
            calculatedSalary={defaultCalculatedSalary}
            hraBreakdown={defaultHraBreakdown}
          />
        </ThemeProvider>
      </Provider>,
    );
    expect(
      screen.getByText(/Saves \$49,900 in liabilities./i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('detail-row-gross-income')).toHaveTextContent(
      'Gross Income:$1,000,000',
    );
  });

  // --- Mobile Responsiveness ---
  it('applies sticky positioning on desktop', () => {
    useMediaQuery.mockReturnValue(false); // Desktop
    renderComponent({
      taxComparison: defaultTaxComparison,
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: defaultBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: defaultHraBreakdown,
    });
    expect(screen.getByText('System Output').closest('div')).toHaveStyle(
      'position: sticky',
    );
  });

  it('applies static positioning on mobile', () => {
    useMediaQuery.mockReturnValue(true); // Mobile
    renderComponent({
      taxComparison: defaultTaxComparison,
      declarations: defaultDeclarations,
      onQuickFill: defaultOnQuickFill,
      breakEven: defaultBreakEven,
      calculatedSalary: defaultCalculatedSalary,
      hraBreakdown: defaultHraBreakdown,
    });
    expect(screen.getByText('System Output').closest('div')).toHaveStyle(
      'position: static',
    );
  });
});
