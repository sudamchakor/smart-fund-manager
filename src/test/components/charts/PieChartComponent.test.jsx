import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PieChartComponent from '../../../components/charts/PieChartComponent';
import * as formatting from '../../../utils/formatting'; // Import the actual formatting functions
import '@testing-library/jest-dom';

// Mock Recharts components to avoid actual chart rendering in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="recharts-responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="recharts-pie-chart">{children}</div>,
  Pie: (props) => <div data-testid="recharts-pie" data-pie-data={JSON.stringify(props.data)} {...props}></div>,
  Cell: (props) => <div data-testid="recharts-cell" {...props}></div>,
  Tooltip: (props) => <div data-testid="recharts-tooltip" {...props}></div>,
}));

// Mock Redux useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));
const mockUseSelector = require('react-redux').useSelector;

// Mock formatCurrency to control its output for testing
jest.spyOn(formatting, 'formatCurrency').mockImplementation((value, currency) => {
  if (typeof value !== 'number' || isNaN(value)) return `${currency}0`;
  return `${currency}${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
});

// Mock DetailRow to simplify testing its calls and output
jest.mock('../../../components/common/DetailRow', () => ({ label, value, indicatorColor }) => (
  <div data-testid={`detail-row-${label.toLowerCase().replace(/\s/g, '-')}`} style={{ color: indicatorColor }}>
    <span>{label}:</span>
    <span>{value}</span>
  </div>
));

const mockStore = configureStore([]);
const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('PieChartComponent', () => {
  const defaultCalculatedValues = {
    schedule: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      date: `Month ${i + 1}`,
      principal: 10000,
      interest: 5000,
      prepayment: 1000,
      taxes: 200,
      homeInsurance: 100,
      maintenance: 50,
      balance: 100000 - (i + 1) * 1000,
    })),
    marginInRs: 50000,
    feesInRs: 10000,
    oneTimeInRs: 5000,
    totalPrincipal: 120000, // 10000 * 12
    totalPrepayments: 12000, // 1000 * 12
    totalInterest: 60000, // 5000 * 12
    taxesYearlyInRs: 2400, // 200 * 12
    homeInsYearlyInRs: 1200, // 100 * 12
    totalPayments: 250000, // Example total
  };

  const defaultExpenses = {
    maintenance: 50, // Monthly maintenance from expenses slice
  };

  const renderComponent = (calculatedValues = defaultCalculatedValues, expenses = defaultExpenses, currency = '₹') => {
    mockUseSelector.mockImplementation((selector) => {
      if (selector.name === 'selectCalculatedValues') return calculatedValues;
      if (selector.name === 'selectExpenses') return expenses;
      if (selector.name === 'selectCurrency') return currency;
      return undefined;
    });
    return render(
      <Provider store={mockStore({})}>
        <ThemeProvider theme={theme}>
          <PieChartComponent />
        </ThemeProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementation for useSelector and formatCurrency for each test
    mockUseSelector.mockImplementation((selector) => selector({
      emi: { currency: '₹' },
    }));
    formatting.formatCurrency.mockImplementation((value, currency) => {
      if (typeof value !== 'number' || isNaN(value)) return `${currency}0`;
      return `${currency}${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    });
  });

  // --- Initial Rendering and No Data State ---
  it('renders "No data available" when schedule is empty or null', () => {
    renderComponent({ schedule: [] });
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.queryByTestId('recharts-pie-chart')).not.toBeInTheDocument();
  });

  it('renders "No data available" when schedule is undefined', () => {
    renderComponent({ schedule: undefined });
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.queryByTestId('recharts-pie-chart')).not.toBeInTheDocument();
  });

  it('renders the PieChart and summary when schedule data is present', () => {
    renderComponent();
    expect(screen.queryByText('No data available')).not.toBeInTheDocument();
    expect(screen.getByTestId('recharts-pie-chart')).toBeInTheDocument();
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('Grand Total')).toBeInTheDocument();
  });

  // --- Chart Data Calculation ---
  it('calculates downPaymentFees correctly', () => {
    const customCalculatedValues = {
      ...defaultCalculatedValues,
      marginInRs: 10000,
      feesInRs: 2000,
      oneTimeInRs: 500,
    };
    renderComponent(customCalculatedValues);
    expect(screen.getByTestId('detail-row-down-payment')).toHaveTextContent('Down Payment:₹12,500');
  });

  it('calculates taxesInsMaint correctly', () => {
    const customCalculatedValues = {
      ...defaultCalculatedValues,
      taxesYearlyInRs: 1200, // 100/month
      homeInsYearlyInRs: 600, // 50/month
      schedule: Array.from({ length: 24 }, (_, i) => ({ ...defaultCalculatedValues.schedule[0] })), // 2 years
    };
    const customExpenses = { maintenance: 25 }; // 25/month
    // Expected: (1200 + 600) * (24/12) + (25 * 24)
    // (1800 * 2) + 600 = 3600 + 600 = 4200
    renderComponent(customCalculatedValues, customExpenses);
    expect(screen.getByTestId('detail-row-taxes/maint')).toHaveTextContent('Taxes/Maint:₹4,200');
  });

  it('passes correct data to Pie component, filtering out zero values', () => {
    const customCalculatedValues = {
      ...defaultCalculatedValues,
      marginInRs: 0, // Should be filtered out
      feesInRs: 0,
      oneTimeInRs: 0,
      totalPrepayments: 0, // Should be filtered out
    };
    renderComponent(customCalculatedValues);
    const pie = screen.getByTestId('recharts-pie');
    const chartData = JSON.parse(pie.dataset.pieData);

    // Initial and Prepay should be filtered out
    expect(chartData.some(d => d.name === 'Initial')).toBe(false);
    expect(chartData.some(d => d.name === 'Prepay')).toBe(false);

    expect(chartData.length).toBe(3); // Principal, Interest, Maint
    expect(chartData[0].name).toBe('Principal');
    expect(chartData[1].name).toBe('Interest');
    expect(chartData[2].name).toBe('Maint');
  });

  // --- Display of Totals ---
  it('displays Total Cost correctly', () => {
    renderComponent();
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('₹2,50,000')).toBeInTheDocument();
  });

  it('displays Grand Total correctly', () => {
    renderComponent();
    expect(screen.getByText('Grand Total')).toBeInTheDocument();
    expect(screen.getByText('₹2,50,000')).toBeInTheDocument();
  });

  // --- DetailRow Props ---
  it('passes correct props to DetailRow components', () => {
    renderComponent();
    const downPaymentRow = screen.getByTestId('detail-row-down-payment');
    expect(downPaymentRow).toHaveTextContent('Down Payment:₹65,000');
    expect(downPaymentRow).toHaveStyle(`color: ${theme.palette.primary.main}`); // Check indicatorColor

    const principalRow = screen.getByTestId('detail-row-principal');
    expect(principalRow).toHaveTextContent('Principal:₹1,20,000');
    expect(principalRow).toHaveStyle(`color: ${theme.palette.success.main}`);

    const interestRow = screen.getByTestId('detail-row-interest');
    expect(interestRow).toHaveTextContent('Interest:₹60,000');
    expect(interestRow).toHaveStyle(`color: ${theme.palette.error.main}`);
  });

  // --- Custom Currency ---
  it('uses custom currency from Redux state for formatting', () => {
    renderComponent(defaultCalculatedValues, defaultExpenses, '$');
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('$2,50,000')).toBeInTheDocument();
    expect(screen.getByTestId('detail-row-down-payment')).toHaveTextContent('Down Payment:$65,000');
  });
});