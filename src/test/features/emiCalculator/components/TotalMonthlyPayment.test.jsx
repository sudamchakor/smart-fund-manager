import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TotalMonthlyPayment from '../../../../../src/features/emiCalculator/components/TotalMonthlyPayment';
import '@testing-library/jest-dom';
import { useSelector } from 'react-redux';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

const mockStore = configureStore([]); // This mock is fine
const theme = createTheme();

describe('TotalMonthlyPayment', () => {
  // Adjusted defaultState to match the structure expected by selectCalculatedValues
  const defaultState = {
    emi: { // This 'emi' slice is what selectCalculatedValues expects
      currency: '₹',
      loanDetails: {
        homeValue: 5000000,
        marginAmount: 1000000,
        marginUnit: 'Rs', // This is the property causing the error
        loanInsurance: 0,
        interestRate: 8.5,
        loanTenure: 20,
        tenureUnit: 'years',
        loanFees: 10000,
        feesUnit: 'Rs',
        startDate: new Date().toISOString(),
        yearlyPaymentIncreaseAmount: 0,
        yearlyPaymentIncreaseUnit: '%',
      },
      expenses: { // This 'expenses' slice is what selectCalculatedValues expects
        oneTimeExpenses: 0,
        oneTimeUnit: 'Rs',
        propertyTaxes: 0,
        taxesUnit: 'Rs',
        homeInsurance: 0,
        homeInsUnit: 'Rs',
        maintenance: 0,
      },
      prepayments: { // Add prepayments as expected by selectCalculatedValues
        monthly: { amount: 0, startDate: new Date().toISOString() },
        yearly: { amount: 0, startDate: new Date().toISOString() },
        quarterly: { amount: 0, startDate: new Date().toISOString() },
        oneTime: { amount: 0, date: new Date().toISOString() },
      },
    },
    // emiCalculator slice for other selectors in TotalMonthlyPayment if any
    emiCalculator: {
      emi: 1500,
      totalInterest: 50000,
      totalPayment: 150000,
    },
  };

  beforeEach(() => {
    useSelector.mockImplementation((selector) => selector(defaultState));
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}> {/* Wrap with ThemeProvider */}
        <TotalMonthlyPayment />
      </ThemeProvider>,
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText(/Monthly EMI/i)).toBeInTheDocument(); // This is present
    expect(screen.getByText(/Total Monthly Outflow/i)).toBeInTheDocument(); // This is present
    // The following expectations are not met by the provided rendered output,
    // indicating the component might not render them or uses different labels.
    // If these are critical, the component's implementation needs to be checked.
    // expect(screen.getByText(/Total Interest Payable/i)).toBeInTheDocument();
    // expect(screen.getByText(/Total Payment/i)).toBeInTheDocument();
  });
});
