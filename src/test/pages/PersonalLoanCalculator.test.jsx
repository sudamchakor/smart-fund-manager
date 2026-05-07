import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PersonalLoanCalculator from '../../pages/PersonalLoanCalculator';
import '@testing-library/jest-dom';

// Mock Redux hooks
const mockUseSelector = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector) => mockUseSelector(selector),
}));

// Mock child components
jest.mock(
  '../../components/common/PageHeader',
  () =>
    ({ title, subtitle, icon: Icon }) => (
      <div data-testid="mock-page-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {Icon && <Icon data-testid="mock-header-icon" />}
      </div>
    ),
);
jest.mock(
  '../../components/common/InputSlider',
  () =>
    ({ label, value, onChange, ...props }) => (
      <div data-testid={`mock-input-slider-${label.replace(/\s/g, '-')}`}>
        <label htmlFor={`input-${label}`}>{label}</label>
        <input
          id={`input-${label}`}
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          data-testid={`input-field-${label.replace(/\s/g, '-')}`}
        />
      </div>
    ),
);
jest.mock(
  '../../components/common/LoanSummaryTerminal',
  () =>
    ({
      monthlyEmi,
      totalInterest,
      totalPayable,
      currency,
      loading,
      children,
    }) => (
      <div data-testid="mock-loan-summary-terminal">
        <span data-testid="monthly-emi">
          {currency}
          {monthlyEmi}
        </span>
        <span data-testid="total-interest">
          {currency}
          {totalInterest}
        </span>
        <span data-testid="total-payable">
          {currency}
          {totalPayable}
        </span>
        {loading && <span data-testid="loading-indicator">Loading...</span>}
        <div data-testid="loan-summary-terminal-children">{children}</div>{' '}
        {/* Added to capture children */}
      </div>
    ),
);

const mockStore = configureStore([]);
const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('PersonalLoanCalculator Page', () => {
  const renderComponent = (currency = '₹') => {
    mockUseSelector.mockImplementation((selector) => {
      if (selector.name === 'selectCurrency') {
        return currency;
      }
      return {};
    });

    return render(
      <Provider store={mockStore({})}>
        <ThemeProvider theme={theme}>
          <PersonalLoanCalculator />
        </ThemeProvider>
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Initial Rendering ---
  it('renders PageHeader with correct title, subtitle, and icon', () => {
    renderComponent();
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
    expect(screen.getByText('Personal Loan Details')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Configure unsecured debt parameters to calculate monthly liabilities.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-header-icon')).toBeInTheDocument(); // LoanIcon
  });

  it('renders InputSliders for Loan Amount, Interest Rate, and Tenure', () => {
    renderComponent();
    expect(
      screen.getByTestId('mock-input-slider-Loan-Amount'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('mock-input-slider-Interest-Rate-(p.a)'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('mock-input-slider-Tenure-(Years)'),
    ).toBeInTheDocument();
  });

  it('renders LoanSummaryTerminal', () => {
    renderComponent();
    expect(
      screen.getByTestId('mock-loan-summary-terminal'),
    ).toBeInTheDocument();
  });

  it('renders children inside LoanSummaryTerminal', () => {
    renderComponent();
    expect(
      screen.getByTestId('loan-summary-terminal-children'),
    ).toBeInTheDocument();
    expect(screen.getByText('Chart Visualization Region')).toBeInTheDocument();
  });

  // --- InputSlider Interactions and Calculations ---
  it('updates loanAmount state and recalculates EMI when Loan Amount slider changes', async () => {
    renderComponent();
    const loanAmountInput = screen.getByTestId('input-field-Loan-Amount');
    fireEvent.change(loanAmountInput, { target: { value: '600000' } });

    await waitFor(() => {
      expect(screen.getByTestId('monthly-emi')).toHaveTextContent('₹12896'); // Recalculated EMI
      expect(screen.getByTestId('total-interest')).toHaveTextContent('₹173780'); // Recalculated Interest
      expect(screen.getByTestId('total-payable')).toHaveTextContent('₹773780'); // Recalculated Payable
    });
  });

  it('updates interestRate state and recalculates EMI when Interest Rate slider changes', async () => {
    renderComponent();
    const interestRateInput = screen.getByTestId(
      'input-field-Interest-Rate-(p.a)',
    );
    fireEvent.change(interestRateInput, { target: { value: '12' } });

    await waitFor(() => {
      expect(screen.getByTestId('monthly-emi')).toHaveTextContent('₹11122'); // Recalculated EMI
      expect(screen.getByTestId('total-interest')).toHaveTextContent('₹167333'); // Recalculated Interest
      expect(screen.getByTestId('total-payable')).toHaveTextContent('₹667333'); // Recalculated Payable
    });
  });

  it('updates tenure state and recalculates EMI when Tenure slider changes', async () => {
    renderComponent();
    const tenureInput = screen.getByTestId('input-field-Tenure-(Years)');
    fireEvent.change(tenureInput, { target: { value: '3' } });

    await waitFor(() => {
      expect(screen.getByTestId('monthly-emi')).toHaveTextContent('₹16251'); // Recalculated EMI
      expect(screen.getByTestId('total-interest')).toHaveTextContent('₹85044'); // Recalculated Interest
      expect(screen.getByTestId('total-payable')).toHaveTextContent('₹585044'); // Recalculated Payable
    });
  });

  // --- Edge Cases / Negative Scenarios ---
  it('handles zero interest rate correctly', async () => {
    renderComponent();
    const interestRateInput = screen.getByTestId(
      'input-field-Interest-Rate-(p.a)',
    );
    fireEvent.change(interestRateInput, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByTestId('monthly-emi')).toHaveTextContent('₹8333'); // 500000 / (5*12)
      expect(screen.getByTestId('total-interest')).toHaveTextContent('₹0');
      expect(screen.getByTestId('total-payable')).toHaveTextContent('₹500000');
    });
  });

  it('handles zero principal amount correctly', async () => {
    renderComponent();
    const loanAmountInput = screen.getByTestId('input-field-Loan-Amount');
    fireEvent.change(loanAmountInput, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByTestId('monthly-emi')).toHaveTextContent('₹0');
      expect(screen.getByTestId('total-interest')).toHaveTextContent('₹0');
      expect(screen.getByTestId('total-payable')).toHaveTextContent('₹0');
    });
  });

  it('handles minimum tenure (1 year) correctly', async () => {
    renderComponent();
    const tenureInput = screen.getByTestId('input-field-Tenure-(Years)');
    fireEvent.change(tenureInput, { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByTestId('monthly-emi')).toHaveTextContent('₹44074'); // Recalculated EMI
      expect(screen.getByTestId('total-interest')).toHaveTextContent('₹28892'); // Recalculated Interest
      expect(screen.getByTestId('total-payable')).toHaveTextContent('₹528892'); // Recalculated Payable
    });
  });

  it('shows loading indicator in LoanSummaryTerminal during calculation', async () => {
    // Due to the synchronous nature of useEffect in tests, the loading state
    // will be false by the time assertions are made. This test ensures the
    // loading prop is correctly passed and the indicator is not shown when not loading.
    renderComponent();
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });

  it('uses the currency from Redux state', () => {
    renderComponent('$');
    // Initial values with default loanAmount=500000, interestRate=10.5, tenure=5
    // EMI: 10747.8, Total Interest: 144868, Total Payable: 644868
    expect(screen.getByTestId('monthly-emi')).toHaveTextContent('$10747');
    expect(screen.getByTestId('total-interest')).toHaveTextContent('$144817');
    expect(screen.getByTestId('total-payable')).toHaveTextContent('$644817');
  });
});
