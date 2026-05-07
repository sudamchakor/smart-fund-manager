import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Calculator from '../../pages/Calculator';
import '@testing-library/jest-dom';

// Mock child components
jest.mock('../../features/emiCalculator/components/HomeLoanForm', () => () => (
  <div data-testid="home-loan-form">HomeLoanForm</div>
));
jest.mock(
  '../../features/emiCalculator/components/PrepaymentsForm',
  () => () => <div data-testid="prepayments-form">PrepaymentsForm</div>,
);
jest.mock(
  '../../features/emiCalculator/components/PaymentScheduleTable',
  () => () => (
    <div data-testid="payment-schedule-table">PaymentScheduleTable</div>
  ),
);
jest.mock(
  '../../features/emiCalculator/components/TotalMonthlyPayment',
  () => () => (
    <div data-testid="total-monthly-payment">TotalMonthlyPayment</div>
  ),
);
jest.mock('../../components/charts/PieChartComponent', () => () => (
  <div data-testid="pie-chart-component">PieChartComponent</div>
));
jest.mock('../../components/charts/BarChartComponent', () => () => (
  <div data-testid="bar-chart-component">BarChartComponent</div>
));

// Mock Redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));
const mockUseSelector = require('react-redux').useSelector;

const mockStore = configureStore([]);
const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('Calculator Page', () => {
  const defaultCalculatedValues = {
    loanAmount: 100000,
    interestRate: 10,
    loanTenure: 120,
    prepayments: [],
    emi: 1000,
    totalInterest: 50000,
    totalPayment: 150000,
    schedule: [
      { month: 1, date: 'Jan 2023' },
      { month: 2, date: 'Feb 2023' },
      { month: 120, date: 'Dec 2032' },
    ],
  };

  const renderComponent = (calculatedValues = defaultCalculatedValues) => {
    mockUseSelector.mockImplementation((selector) => {
      const dummyState = {
        emi: {
          currency: '₹',
          loanDetails: {
            homeValue: 1000000,
            marginUnit: '%',
            marginAmount: 20,
            loanTenure: 120,
            interestRate: 10,
          },
          expenses: [],
          prepayments: [],
        },
      };

      let result;
      try {
        result = selector(dummyState);
      } catch (e) {}

      if (result && typeof result === 'object' && 'loanAmount' in result && 'totalInterest' in result) {
        return calculatedValues;
      }

      return result !== undefined ? result : '₹';
    });

    return render(
      <Provider store={mockStore({})}>
        <ThemeProvider theme={theme}>
          <Calculator />
        </ThemeProvider>
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Basic Rendering ---
  it('renders the main title', () => {
    renderComponent();
    expect(screen.getByText('Home Loan')).toBeInTheDocument();
    expect(screen.getByText('EMI Calculator')).toBeInTheDocument();
  });

  it('renders all child components', () => {
    renderComponent();
    expect(screen.getByTestId('home-loan-form')).toBeInTheDocument();
    expect(screen.getByTestId('prepayments-form')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart-component')).toBeInTheDocument();
    expect(screen.getByTestId('total-monthly-payment')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart-component')).toBeInTheDocument();
    expect(screen.getByTestId('payment-schedule-table')).toBeInTheDocument();
  });

  // --- Section Headers ---
  it('renders section headers with correct titles and icons', () => {
    renderComponent();
    expect(screen.getByText('Prepayment Plan')).toBeInTheDocument();
    expect(screen.getByText('Payment Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Monthly Commitment')).toBeInTheDocument();
    expect(screen.getByText('Loan Progression')).toBeInTheDocument();
    expect(
      screen.getByText('Amortization Schedule (Jan 2023 - Dec 2032)'),
    ).toBeInTheDocument();
  });

  it('displays correct start and end month/year in Amortization Schedule header', () => {
    renderComponent();
    expect(
      screen.getByText('Amortization Schedule (Jan 2023 - Dec 2032)'),
    ).toBeInTheDocument();
  });

  it('handles empty schedule for Amortization Schedule header', () => {
    renderComponent({ ...defaultCalculatedValues, schedule: [] });
    expect(screen.getByText('Amortization Schedule ( - )')).toBeInTheDocument();
  });

  // --- StyledPaper ---
  it('wraps sections in StyledPaper components', () => {
    renderComponent();
    // Check if HomeLoanForm is inside a Paper-like element
    const homeLoanForm = screen.getByTestId('home-loan-form');
    expect(homeLoanForm.closest('.MuiPaper-root')).toBeInTheDocument();
  });

  // --- Styling (visual checks, not directly testable with JSDOM) ---
  it('applies background gradient styling to the main Box', () => {
    renderComponent();
    const mainBox = screen.getByText('Home Loan').closest('.MuiBox-root');
    expect(mainBox).toHaveStyle(
      `background: linear-gradient(180deg, ${theme.palette.primary.main}1a 0%, ${theme.palette.background.default} 100%)`,
    );
  });
});
