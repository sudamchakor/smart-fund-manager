import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SwpCalculatorForm from '../../../../../src/features/investment/tabs/SwpCalculatorForm';
import '@testing-library/jest-dom';

// Mock child components
jest.mock(
  '../../../../../src/components/common/InvestmentSlider',
  () =>
    ({
      label,
      value,
      onChange,
      min,
      max,
      step,
      adornment,
      adornmentPosition,
    }) => (
      <div data-testid={`mock-investment-slider-${label.replace(/\s/g, '-')}`}>
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
      </div>
    ),
);

const mockStore = configureStore([]);
const theme = createTheme();

describe('SwpCalculatorForm', () => {
  const defaultSharedState = {
    totalInvestment: 1000000,
    withdrawalPerMonth: 10000,
    expectedReturnRate: 12,
    timePeriod: 10,
  };

  const renderComponent = (
    sharedState = defaultSharedState,
    currency = '₹',
    onCalculate = jest.fn(), // Ensure onCalculate is a mock function
    onSharedStateChange = jest.fn(),
  ) => {
    const store = mockStore({ emi: { currency } });
    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SwpCalculatorForm
            sharedState={sharedState}
            onSharedStateChange={onSharedStateChange}
            onCalculate={onCalculate || jest.fn()} // Ensure it's always a function
          />
        </ThemeProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Total Investment')).toBeInTheDocument();
    expect(screen.getByText('Withdrawal Per Month')).toBeInTheDocument();
    expect(screen.getByText('Expected Returns (p.a)')).toBeInTheDocument();
    expect(screen.getByText('Duration (Years)')).toBeInTheDocument();
  });

  it('renders InvestmentSliders with correct props and initial values', () => {
    renderComponent();
    // Total Investment
    expect(
      screen.getByTestId('mock-investment-slider-Total-Investment'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-field-Total-Investment')).toHaveValue(
      1000000,
    );
    expect(
      screen.getByTestId('adornment-Total-Investment'),
    ).toHaveTextContent('₹');

    // Withdrawal Per Month
    expect(
      screen.getByTestId('mock-investment-slider-Withdrawal-Per-Month'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-field-Withdrawal-Per-Month')).toHaveValue(
      10000,
    );
    expect(
      screen.getByTestId('adornment-Withdrawal-Per-Month'),
    ).toHaveTextContent('₹');

    // Expected Return Rate
    expect(
      screen.getByTestId('mock-investment-slider-Expected-Returns-(p.a)'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-field-Expected-Returns-(p.a)')).toHaveValue(
      12,
    );
    expect(
      screen.getByTestId('adornment-Expected-Returns-(p.a)'),
    ).toHaveTextContent('%');

    // Time Period
    expect(
      screen.getByTestId('mock-investment-slider-Duration-(Years)'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-field-Duration-(Years)')).toHaveValue(10);
    expect(screen.getByTestId('adornment-Duration-(Years)')).toHaveTextContent(
      'Yr',
    );
  });

  it('calls onSharedStateChange when total investment changes', () => {
    const mockOnSharedStateChange = jest.fn();
    renderComponent(defaultSharedState, '₹', jest.fn(), mockOnSharedStateChange);
    const input = screen.getByTestId('input-field-Total-Investment');
    fireEvent.change(input, { target: { value: '1500000' } });
    expect(mockOnSharedStateChange).toHaveBeenCalledWith(
      'totalInvestment',
      1500000,
    );
  });

  it('calls onSharedStateChange when expected return rate changes', () => {
    const mockOnSharedStateChange = jest.fn();
    renderComponent(defaultSharedState, '₹', jest.fn(), mockOnSharedStateChange);
    const input = screen.getByTestId('input-field-Expected-Returns-(p.a)');
    fireEvent.change(input, { target: { value: '15' } });
    expect(mockOnSharedStateChange).toHaveBeenCalledWith(
      'expectedReturnRate',
      15,
    );
  });

  it('calls onSharedStateChange when withdrawal rate changes', () => {
    const mockOnSharedStateChange = jest.fn();
    renderComponent(defaultSharedState, '₹', jest.fn(), mockOnSharedStateChange);
    const input = screen.getByTestId('input-field-Withdrawal-Per-Month');
    fireEvent.change(input, { target: { value: '12000' } });
    expect(mockOnSharedStateChange).toHaveBeenCalledWith(
      'withdrawalPerMonth',
      12000,
    );
  });

  it('calls onSharedStateChange when time period changes', () => {
    const mockOnSharedStateChange = jest.fn();
    renderComponent(defaultSharedState, '₹', jest.fn(), mockOnSharedStateChange);
    const input = screen.getByTestId('input-field-Duration-(Years)');
    fireEvent.change(input, { target: { value: '15' } });
    expect(mockOnSharedStateChange).toHaveBeenCalledWith('timePeriod', 15);
  });

  it('uses the currency from Redux state', () => {
    renderComponent(defaultSharedState, '$');
    expect(
      screen.getByTestId('adornment-Total-Investment'),
    ).toHaveTextContent('$');
  });

  it('calls onCalculate when relevant values change (e.g., on initial render or input change)', () => {
    const mockOnCalculate = jest.fn();
    renderComponent(defaultSharedState, '₹', mockOnCalculate);
    expect(mockOnCalculate).toHaveBeenCalled();
  });
});