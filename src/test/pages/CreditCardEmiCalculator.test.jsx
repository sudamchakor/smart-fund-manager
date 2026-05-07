import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CreditCardEMICalculator from '../../pages/CreditCardEmiCalculator';
import '@testing-library/jest-dom';

// Mock Redux hooks (useSelector is not used by the component, but kept for consistency if it were to be added)
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
    ({
      label,
      value,
      onChange,
      adornment,
      adornmentPosition,
      min,
      max,
      step,
      ...props
    }) => (
      <div data-testid={`mock-input-slider-${label.replace(/\s/g, '-')}`}>
        <label htmlFor={`input-${label}`}>{label}</label>
        <input
          id={`input-${label}`}
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          data-testid={`input-field-${label.replace(/\s/g, '-')}`}
        />
        <span data-testid={`adornment-${label.replace(/\s/g, '-')}`}>
          {adornment}
        </span>
        <span data-testid={`adornment-position-${label.replace(/\s/g, '-')}`}>
          {adornmentPosition}
        </span>
        <span data-testid={`min-${label.replace(/\s/g, '-')}`}>{min}</span>
        <span data-testid={`max-${label.replace(/\s/g, '-')}`}>{max}</span>
        <span data-testid={`step-${label.replace(/\s/g, '-')}`}>{step}</span>
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
      interestColor,
      loading,
      children,
    }) => (
      <div data-testid="mock-loan-summary-terminal">
        <span data-testid="monthly-emi">₹{monthlyEmi}</span>{' '}
        {/* Hardcoded currency as per component */}
        <span data-testid="total-interest">₹{totalInterest}</span>
        <span data-testid="total-payable">₹{totalPayable}</span>
        <span data-testid="interest-color">{interestColor}</span>
        {loading && <span data-testid="loading-indicator">Loading...</span>}
        {children}
      </div>
    ),
);

const mockStore = configureStore([]);
const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('CreditCardEMICalculator Page', () => {
  const renderComponent = () => {
    // Removed currency parameter as it's not used by the component
    // mockUseSelector is not used by the component, so no need to mock its return value here.
    return render(
      <Provider store={mockStore({})}>
        <ThemeProvider theme={theme}>
          <CreditCardEMICalculator />
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
    expect(screen.getByText('Credit Card EMI Calculator')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Simulate the exact cost and monthly liability of converting card purchases to EMI.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-header-icon')).toBeInTheDocument(); // CreditCardIcon
  });

  it('renders InputSliders with correct props', () => {
    renderComponent();
    // Principal Amount Slider
    expect(
      screen.getByTestId('mock-input-slider-Principal-Amount'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-field-Principal-Amount')).toHaveValue(
      500000,
    );
    expect(screen.getByTestId('adornment-Principal-Amount')).toHaveTextContent(
      '₹',
    );
    expect(
      screen.getByTestId('adornment-position-Principal-Amount'),
    ).toHaveTextContent('start');
    expect(screen.getByTestId('min-Principal-Amount')).toHaveTextContent(
      '10000',
    );
    expect(screen.getByTestId('max-Principal-Amount')).toHaveTextContent(
      '2000000',
    );
    expect(screen.getByTestId('step-Principal-Amount')).toHaveTextContent(
      '5000',
    );

    // Interest Rate Slider
    expect(
      screen.getByTestId('mock-input-slider-Interest-Rate-(P.A.)'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-field-Interest-Rate-(P.A.)')).toHaveValue(
      10.5,
    );
    expect(
      screen.getByTestId('adornment-Interest-Rate-(P.A.)'),
    ).toHaveTextContent('%');
    expect(
      screen.getByTestId('adornment-position-Interest-Rate-(P.A.)'),
    ).toHaveTextContent('end');
    expect(screen.getByTestId('min-Interest-Rate-(P.A.)')).toHaveTextContent(
      '1',
    );
    expect(screen.getByTestId('max-Interest-Rate-(P.A.)')).toHaveTextContent(
      '30',
    );
    expect(screen.getByTestId('step-Interest-Rate-(P.A.)')).toHaveTextContent(
      '0.1',
    );

    // Tenure Slider
    expect(
      screen.getByTestId('mock-input-slider-Tenure-(Years)'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-field-Tenure-(Years)')).toHaveValue(5);
    expect(screen.getByTestId('adornment-Tenure-(Years)')).toHaveTextContent(
      'YRS',
    );
    expect(
      screen.getByTestId('adornment-position-Tenure-(Years)'),
    ).toHaveTextContent('end');
    expect(screen.getByTestId('min-Tenure-(Years)')).toHaveTextContent('1');
    expect(screen.getByTestId('max-Tenure-(Years)')).toHaveTextContent('30');
    expect(screen.getByTestId('step-Tenure-(Years)')).toHaveTextContent('1');
  });

  it('renders LoanSummaryTerminal with correct interestColor', () => {
    renderComponent();
    expect(
      screen.getByTestId('mock-loan-summary-terminal'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('interest-color')).toHaveTextContent(
      'error.main',
    );
  });

  // --- InputSlider Interactions and Calculations ---
  it('updates amount state and recalculates EMI when Principal Amount slider changes', async () => {
    renderComponent();
    const amountInput = screen.getByTestId('input-field-Principal-Amount');
    fireEvent.change(amountInput, { target: { value: '600000' } });

    await waitFor(() => {
      expect(screen.getByTestId('monthly-emi')).toHaveTextContent('₹12896'); // Recalculated EMI
      expect(screen.getByTestId('total-interest')).toHaveTextContent('₹173780'); // Recalculated Interest
      expect(screen.getByTestId('total-payable')).toHaveTextContent('₹773780'); // Recalculated Payable
    });
  });

  it('updates interest state and recalculates EMI when Interest Rate slider changes', async () => {
    renderComponent();
    const interestInput = screen.getByTestId(
      'input-field-Interest-Rate-(P.A.)',
    );
    fireEvent.change(interestInput, { target: { value: '12' } });

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
    const interestInput = screen.getByTestId(
      'input-field-Interest-Rate-(P.A.)',
    );
    fireEvent.change(interestInput, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByTestId('monthly-emi')).toHaveTextContent('₹8333'); // 500000 / (5*12)
      expect(screen.getByTestId('total-interest')).toHaveTextContent('₹0');
      expect(screen.getByTestId('total-payable')).toHaveTextContent('₹500000');
    });
  });

  it('handles zero principal amount correctly', async () => {
    renderComponent();
    const amountInput = screen.getByTestId('input-field-Principal-Amount');
    fireEvent.change(amountInput, { target: { value: '0' } });

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

  it('does not show loading indicator in LoanSummaryTerminal as component does not use it', async () => {
    renderComponent();
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });
});
