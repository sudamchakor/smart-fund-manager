import React from 'react';
import { render, screen } from '@testing-library/react';
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
    currency = '₹',
  ) => {
    const store = mockStore({
      emi: { currency },
    });
    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SipCalculatorForm
            sharedState={sharedState}
            onSharedStateChange={jest.fn()}
          />
        </ThemeProvider>
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Monthly Investment')).toBeInTheDocument();
    expect(screen.getByText('Expected Return Rate')).toBeInTheDocument();
    expect(screen.getByText('Time Period')).toBeInTheDocument();
  });

  it('renders InputSliders with correct props and initial values', () => {
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
      screen.getByTestId('mock-investment-slider-Expected-Return-Rate'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-field-Expected-Return-Rate')).toHaveValue(
      12,
    );
    expect(
      screen.getByTestId('adornment-Expected-Return-Rate'),
    ).toHaveTextContent('%');

    // Time Period
    expect(
      screen.getByTestId('mock-investment-slider-Time-Period'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-field-Time-Period')).toHaveValue(10);
    expect(screen.getByTestId('adornment-Time-Period')).toHaveTextContent(
      'YRS',
    );
  });

  it('calls onSharedStateChange when monthly investment changes', () => {
    const mockOnSharedStateChange = jest.fn();
    renderComponent({
      ...defaultSharedState,
      onSharedStateChange: mockOnSharedStateChange,
    });
    const input = screen.getByTestId('input-field-Monthly-Investment');
    fireEvent.change(input, { target: { value: '15000' } });
    expect(mockOnSharedStateChange).toHaveBeenCalledWith(
      'monthlyInvestment',
      15000,
    );
  });

  it('calls onSharedStateChange when expected return rate changes', () => {
    const mockOnSharedStateChange = jest.fn();
    renderComponent({
      ...defaultSharedState,
      onSharedStateChange: mockOnSharedStateChange,
    });
    const input = screen.getByTestId('input-field-Expected-Return-Rate');
    fireEvent.change(input, { target: { value: '15' } });
    expect(mockOnSharedStateChange).toHaveBeenCalledWith(
      'expectedReturnRate',
      15,
    );
  });

  it('calls onSharedStateChange when time period changes', () => {
    const mockOnSharedStateChange = jest.fn();
    renderComponent({
      ...defaultSharedState,
      onSharedStateChange: mockOnSharedStateChange,
    });
    const input = screen.getByTestId('input-field-Time-Period');
    fireEvent.change(input, { target: { value: '15' } });
    expect(mockOnSharedStateChange).toHaveBeenCalledWith('timePeriod', 15);
  });

  it('uses the currency from Redux state', () => {
    renderComponent(defaultSharedState, '$');
    expect(
      screen.getByTestId('adornment-Monthly-Investment'),
    ).toHaveTextContent('$');
  });
});
