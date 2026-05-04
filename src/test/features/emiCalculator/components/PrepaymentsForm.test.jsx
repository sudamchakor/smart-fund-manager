import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PrepaymentsForm from '../../../../../src/features/emiCalculator/components/PrepaymentsForm';
import '@testing-library/jest-dom';
import { useSelector, useDispatch } from 'react-redux';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

// Mock child components
jest.mock('../../../../../src/components/common/AmountInputWithDate', () => ({
  title,
  icon,
  iconColor,
  amountValue,
  onAmountChange,
  dateLabel,
  dateValue,
  onDateChange,
  currency,
}) => (
  <div data-testid={`mock-amount-input-with-date-${title}`}>
    <span>{title}</span>
    <input
      data-testid={`amount-input-${title}`}
      value={amountValue}
      onChange={onAmountChange}
    />
    <input
      data-testid={`date-input-${title}`}
      value={dateValue}
      onChange={onDateChange}
    />
  </div>
));

const mockStore = configureStore([]);
const theme = createTheme();

describe.skip('PrepaymentsForm', () => {
  const mockDispatch = jest.fn();
  const defaultState = {
    emi: {
      currency: '₹',
    },
    emiCalculator: {
      prepayments: {
        monthly: { amount: 0, startDate: '2023-01-01T00:00:00.000Z' },
        yearly: { amount: 0, startDate: '2023-01-01T00:00:00.000Z' },
        quarterly: { amount: 0, startDate: '2023-01-01T00:00:00.000Z' },
        oneTime: { amount: 0, date: '2023-01-01T00:00:00.000Z' },
      },
      loanTenure: 120, // 10 years
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockImplementation(selector => selector(defaultState));
  });

  const renderComponent = () => {
    return render(
      <Provider store={mockStore(defaultState)}>
        <ThemeProvider theme={theme}>
          <PrepaymentsForm />
        </ThemeProvider>
      </Provider>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText(/Prepayments/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-amount-input-with-date-Monthly Prepayment')).toBeInTheDocument();
    expect(screen.getByTestId('mock-amount-input-with-date-Yearly Prepayment')).toBeInTheDocument();
    expect(screen.getByTestId('mock-amount-input-with-date-Quarterly Prepayment')).toBeInTheDocument();
    expect(screen.getByTestId('mock-amount-input-with-date-One-Time Prepayment')).toBeInTheDocument();
  });
});