import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TaxBreakdownChart from '../../../components/tax/TaxBreakdownChart';
import * as formatting from '../../../utils/formatting'; // Import the actual formatting functions
import '@testing-library/jest-dom';

// Mock Recharts components to avoid actual chart rendering in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="recharts-responsive-container">{children}</div>,
  BarChart: ({ children, data }) => <div data-testid="recharts-bar-chart" data-chart-data={JSON.stringify(data)}>{children}</div>,
  Bar: (props) => <div data-testid={`recharts-bar-${props.dataKey}`} {...props}></div>,
  XAxis: (props) => <div data-testid="recharts-xaxis" {...props}></div>,
  YAxis: (props) => <div data-testid="recharts-yaxis" {...props}></div>,
  CartesianGrid: (props) => <div data-testid="recharts-cartesiangrid" {...props}></div>,
  Tooltip: (props) => <div data-testid="recharts-tooltip" {...props}></div>,
  Legend: (props) => <div data-testid="recharts-legend" {...props}></div>,
  PieChart: ({ children }) => <div data-testid="recharts-pie-chart">{children}</div>,
  Pie: (props) => <div data-testid="recharts-pie" data-pie-data={JSON.stringify(props.data)} {...props}></div>,
  Cell: (props) => <div data-testid="recharts-cell" {...props}></div>,
}));

// Mock Redux useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));
const mockUseSelector = require('react-redux').useSelector;

// Mock formatCurrency to control its output for testing
jest.spyOn(formatting, 'formatCurrency').mockImplementation((value, currency) => {
  if (typeof value !== 'number') return `${currency}0`;
  return `${currency}${value.toLocaleString('en-IN')}`;
});

const mockStore = configureStore([]);
const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('TaxBreakdownChart Component', () => {
  const defaultTaxComparison = {
    oldRegime: { tax: 100000 },
    newRegime: { tax: 50000 },
  };
  const defaultCalculatedSalary = {
    annual: {
      totalIncome: 1200000, // 12 Lakhs
      pf: 72000, // 6000/month * 12
    },
  };

  const renderComponent = (props) => {
    mockUseSelector.mockImplementation((selector) => selector({
      emi: { currency: '₹' },
    }));
    return render(
      <Provider store={mockStore({})}>
        <ThemeProvider theme={theme}>
          <TaxBreakdownChart {...props} />
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
      if (typeof value !== 'number') return `${currency}0`;
      return `${currency}${value.toLocaleString('en-IN')}`;
    });
  });

  // --- Basic Rendering ---
  it('renders without crashing and displays main titles', () => {
    renderComponent({
      taxComparison: defaultTaxComparison,
      calculatedSalary: defaultCalculatedSalary,
    });
    expect(screen.getByText('Tax Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Regime Comparison')).toBeInTheDocument();
    expect(screen.getByText('Gross Income Composition')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-pie-chart')).toBeInTheDocument();
  });

  // --- BarChart Data ---
  it('passes correct data to BarChart', () => {
    renderComponent({
      taxComparison: defaultTaxComparison,
      calculatedSalary: defaultCalculatedSalary,
    });
    const barChart = screen.getByTestId('recharts-bar-chart');
    const expectedBarData = [
      {
        name: "Old Regime",
        "Basic Tax": defaultTaxComparison.oldRegime.tax,
        "Education Cess": defaultTaxComparison.oldRegime.tax * 0.04,
        Surcharge: 0,
      },
      {
        name: "New Regime",
        "Basic Tax": defaultTaxComparison.newRegime.tax,
        "Education Cess": defaultTaxComparison.newRegime.tax * 0.04,
        Surcharge: 0,
      },
    ];
    expect(JSON.parse(barChart.dataset.chartData)).toEqual(expectedBarData);
    expect(screen.getByTestId('recharts-bar-Basic Tax')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-Education Cess')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-Surcharge')).toBeInTheDocument();
  });

  // --- PieChart Data ---
  it('passes correct data to PieChart', () => {
    renderComponent({
      taxComparison: defaultTaxComparison,
      calculatedSalary: defaultCalculatedSalary,
    });
    const pieChart = screen.getByTestId('recharts-pie');

    // totalTax = 100000 (old) + 50000 (new) = 150000
    // takeHomePay = 1200000 (totalIncome) - 150000 (totalTax) - 72000 (pf) = 978000
    const expectedPieData = [
      { name: "Take Home Pay", value: 978000 },
      { name: "Total Tax", value: 150000 },
      { name: "Forced Savings (PF)", value: 72000 },
    ];
    expect(JSON.parse(pieChart.dataset.pieData)).toEqual(expectedPieData);
  });

  // --- Edge Cases: Zero Values ---
  it('handles zero tax values in BarChart data', () => {
    const zeroTaxComparison = {
      oldRegime: { tax: 0 },
      newRegime: { tax: 0 },
    };
    renderComponent({
      taxComparison: zeroTaxComparison,
      calculatedSalary: defaultCalculatedSalary,
    });
    const barChart = screen.getByTestId('recharts-bar-chart');
    const expectedBarData = [
      { name: "Old Regime", "Basic Tax": 0, "Education Cess": 0, Surcharge: 0 },
      { name: "New Regime", "Basic Tax": 0, "Education Cess": 0, Surcharge: 0 },
    ];
    expect(JSON.parse(barChart.dataset.chartData)).toEqual(expectedBarData);
  });

  it('handles zero values in PieChart data', () => {
    const zeroTaxComparison = {
      oldRegime: { tax: 0 },
      newRegime: { tax: 0 },
    };
    const zeroCalculatedSalary = {
      annual: {
        totalIncome: 0,
        pf: 0,
      },
    };
    renderComponent({
      taxComparison: zeroTaxComparison,
      calculatedSalary: zeroCalculatedSalary,
    });
    const pieChart = screen.getByTestId('recharts-pie');
    const expectedPieData = [
      { name: "Take Home Pay", value: 0 },
      { name: "Total Tax", value: 0 },
      { name: "Forced Savings (PF)", value: 0 },
    ];
    expect(JSON.parse(pieChart.dataset.pieData)).toEqual(expectedPieData);
  });

  // --- Custom Currency ---
  it('uses custom currency from Redux state for formatting', () => {
    mockUseSelector.mockImplementation((selector) => selector({
      emi: { currency: '$' },
    }));
    renderComponent({
      taxComparison: defaultTaxComparison,
      calculatedSalary: defaultCalculatedSalary,
    });
    // Verify that formatCurrency was called with '$'
    expect(formatting.formatCurrency).toHaveBeenCalledWith(expect.any(Number), '$');
    // Check YAxis tickFormatter prop
    const yAxis = screen.getByTestId('recharts-yaxis');
    expect(yAxis.getAttribute('tickformatter')).toBeDefined(); // Check if prop exists
    // Check Tooltip formatter prop
    const tooltip = screen.getByTestId('recharts-tooltip');
    expect(tooltip.getAttribute('formatter')).toBeDefined(); // Check if prop exists
  });

  // --- Missing Props ---
  it('handles missing taxComparison gracefully (defaults to 0)', () => {
    const missingTaxComparison = {
      oldRegime: {},
      newRegime: {},
    };
    renderComponent({
      taxComparison: missingTaxComparison,
      calculatedSalary: defaultCalculatedSalary,
    });
    const barChart = screen.getByTestId('recharts-bar-chart');
    const expectedBarData = [
      { name: "Old Regime", "Basic Tax": 0, "Education Cess": 0, Surcharge: 0 },
      { name: "New Regime", "Basic Tax": 0, "Education Cess": 0, Surcharge: 0 },
    ];
    expect(JSON.parse(barChart.dataset.chartData)).toEqual(expectedBarData);

    const pieChart = screen.getByTestId('recharts-pie');
    const expectedPieData = [
      { name: "Take Home Pay", value: defaultCalculatedSalary.annual.totalIncome - defaultCalculatedSalary.annual.pf },
      { name: "Total Tax", value: 0 },
      { name: "Forced Savings (PF)", value: defaultCalculatedSalary.annual.pf },
    ];
    expect(JSON.parse(pieChart.dataset.pieData)).toEqual(expectedPieData);
  });

  it('handles missing calculatedSalary gracefully (defaults to 0)', () => {
    const missingCalculatedSalary = {
      annual: {},
    };
    renderComponent({
      taxComparison: defaultTaxComparison,
      calculatedSalary: missingCalculatedSalary,
    });
    const pieChart = screen.getByTestId('recharts-pie');
    const expectedPieData = [
      { name: "Take Home Pay", value: -(defaultTaxComparison.oldRegime.tax + defaultTaxComparison.newRegime.tax) },
      { name: "Total Tax", value: defaultTaxComparison.oldRegime.tax + defaultTaxComparison.newRegime.tax },
      { name: "Forced Savings (PF)", value: 0 },
    ];
    expect(JSON.parse(pieChart.dataset.pieData)).toEqual(expectedPieData);
  });
});