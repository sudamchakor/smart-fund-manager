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

const mockStore = configureStore([]);
const theme = createTheme();

describe('TotalMonthlyPayment', () => {
  const defaultState = {
    emi: {
      currency: '₹',
    },
    emiCalculator: {
      emi: 1500,
      totalInterest: 50000,
      totalPayment: 150000,
      loanDetails: {
        homeValue: 5000000,
        marginAmount: 1000000,
        marginUnit: 'Rs',
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
      expenses: {
        oneTimeExpenses: 0,
        oneTimeUnit: 'Rs',
        propertyTaxes: 0,
        taxesUnit: 'Rs',
        homeInsurance: 0,
        homeInsUnit: 'Rs',
        maintenance: 0,
      },
    },
  };

  beforeEach(() => {
    useSelector.mockImplementation((selector) => selector(defaultState));
  });

  const renderComponent = () => {
    return render(
      <Provider store={mockStore(defaultState)}>
        <ThemeProvider theme={theme}>
          <TotalMonthlyPayment />
        </ThemeProvider>
      </Provider>,
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText(/Monthly EMI/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Interest Payable/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Payment/i)).toBeInTheDocument();
  });
});
