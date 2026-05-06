import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react'; // Import fireEvent
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SipCalculatorForm from '../../../../../src/features/investment/tabs/SipCalculatorForm';
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

describe('SipCalculatorForm', () => {
  const defaultSharedState = {
    monthlyInvestment: 10000,
    expectedReturnRate: 12,
    timePeriod: 10,
  };

  const renderComponent = (
    sharedState = defaultSharedState,
    currency = '₹', // Default currency
    onCalculate = jest.fn(), // Mock onCalculate by default,
    onSharedStateChange = jest.fn(), // Add onSharedStateChange as a direct parameter
  ) => {
    const store = mockStore({ emi: { currency } });
    return render(
      <Provider store={store}><ThemeProvider theme={theme}><SipCalculatorForm sharedState={sharedState} onSharedStateChange={onSharedStateChange} onCalculate={onCalculate} /></ThemeProvider></Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Monthly Investment')).toBeInTheDocument();
    expect(screen.getByText('Expected Returns (p.a)')).toBeInTheDocument(); // Corrected text
    expect(screen.getByText('Duration (Years)')).toBeInTheDocument(); // Corrected text
  });

  it('renders InputSliders with correct props and initial values', () => { // Corrected test ID for Expected Return Rate
    renderComponent();
    // Monthly Investment
    expect(
      screen.getByTestId('mock-investment-slider-Monthly-Investment'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-field-Monthly-Investment')).toHaveValue(
      10000,
    );
    expect(
      screen.getByTestId('adornment-Monthly-Investment'),
    ).toHaveTextContent('₹');

    // Expected Return Rate
    expect(
      screen.getByTestId('mock-investment-slider-Expected-Returns-(p.a)'),
    ).toBeInTheDocument(); // This will now correctly match
    expect(screen.getByTestId('input-field-Expected-Returns-(p.a)')).toHaveValue( // Corrected test ID
      12,
    );
    expect(
      screen.getByTestId('adornment-Expected-Returns-(p.a)'), // Corrected test ID
    ).toHaveTextContent('%');

    // Time Period
    expect(
      screen.getByTestId('mock-investment-slider-Duration-(Years)'), // Corrected test ID
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-field-Duration-(Years)')).toHaveValue(10); // Corrected test ID
    expect(screen.getByTestId('adornment-Duration-(Years)')).toHaveTextContent( // Corrected test ID
      'Yr', // Changed 'YRS' to 'Yr'
    );
  });

  it('calls onSharedStateChange when monthly investment changes', () => {
    const mockOnSharedStateChange = jest.fn(); // Define mock here
    renderComponent(defaultSharedState, '₹', jest.fn(), mockOnSharedStateChange); // Pass it directly
    const input = screen.getByTestId('input-field-Monthly-Investment');
    fireEvent.change(input, { target: { value: '15000' } });
    expect(mockOnSharedStateChange).toHaveBeenCalledWith(
      'monthlyInvestment',
      15000,
    );
  });

  it('calls onSharedStateChange when expected return rate changes', () => {
    const mockOnSharedStateChange = jest.fn(); // Define mock here
    renderComponent(defaultSharedState, '₹', jest.fn(), mockOnSharedStateChange); // Pass it directly
    const input = screen.getByTestId('input-field-Expected-Returns-(p.a)'); // Corrected test ID
    fireEvent.change(input, { target: { value: '15' } });
    expect(mockOnSharedStateChange).toHaveBeenCalledWith(
      'expectedReturnRate',
      15,
    );
  });

  it('calls onSharedStateChange when time period changes', () => {
    const mockOnSharedStateChange = jest.fn(); // Define mock here
    renderComponent(defaultSharedState, '₹', jest.fn(), mockOnSharedStateChange); // Pass it directly
    const input = screen.getByTestId('input-field-Duration-(Years)'); // Corrected test ID
    fireEvent.change(input, { target: { value: '15' } });
    expect(mockOnSharedStateChange).toHaveBeenCalledWith('timePeriod', 15);
  });

  it('uses the currency from Redux state', () => {
    renderComponent(defaultSharedState, '$');
    expect(
      screen.getByTestId('adornment-Monthly-Investment'),
    ).toHaveTextContent('$');
  });

  it('calls onCalculate when relevant values change (e.g., on initial render or input change)', () => {
    const mockOnCalculate = jest.fn();
    renderComponent(defaultSharedState, '₹', mockOnCalculate);
    // Since calculateSip is called in a useEffect, it should be called on initial render.
    // If it's called on input change, you'd simulate that here.
    expect(mockOnCalculate).toHaveBeenCalled();
    // You can add more specific assertions about the arguments if needed
    // expect(mockOnCalculate).toHaveBeenCalledWith(expect.any(Object));
  });
});
