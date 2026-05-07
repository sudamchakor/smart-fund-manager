import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import * as BarChartModule from '../../../components/charts/BarChartComponent';
const BarChartComponent = BarChartModule.default || BarChartModule.BarChartComponent || Object.values(BarChartModule)[0];
import * as formatting from '../../../utils/formatting'; // Import the actual formatting functions
import '@testing-library/jest-dom';
import useMediaQuery from '@mui/material/useMediaQuery';

let mockTooltipProps = { active: false, payload: [], label: '' };

// Mock Recharts components to avoid actual chart rendering in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="recharts-responsive-container">{children}</div>
  ),
  ComposedChart: ({ children, data }) => (
    <div
      data-testid="recharts-composed-chart"
      data-chart-data={JSON.stringify(data)}
    >
      {children}
    </div>
  ),
  Line: ({ dataKey }) => (
    <div data-testid={`recharts-line-${dataKey}`}></div>
  ),
  Bar: ({ dataKey }) => (
    <div data-testid={`recharts-bar-${dataKey}`}></div>
  ),
  XAxis: () => <div data-testid="recharts-xaxis"></div>,
  YAxis: ({ tickFormatter }) => (
    <div 
      data-testid="recharts-yaxis"
      data-formatter-1000={tickFormatter ? tickFormatter(1000) : ''}
      data-formatter-100000={tickFormatter ? tickFormatter(100000) : ''}
      data-formatter-10000000={tickFormatter ? tickFormatter(10000000) : ''}
    ></div>
  ),
  CartesianGrid: () => <div data-testid="recharts-cartesiangrid"></div>,
  Tooltip: ({ content }) => {
    const React = require('react');
    return (
      <div data-testid="recharts-tooltip">
        {content && React.isValidElement(content)
          ? React.cloneElement(content, mockTooltipProps)
          : null}
      </div>
    );
  },
  Legend: () => <div data-testid="recharts-legend"></div>,
}));

// Mock useMediaQuery
jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock Redux useSelector
jest.mock('react-redux', () => {
  const OriginalReactRedux = jest.requireActual('react-redux');
  return {
    __esModule: true,
    ...OriginalReactRedux,
    default: OriginalReactRedux.default || OriginalReactRedux,
    useSelector: jest.fn(),
  };
});
const mockUseSelector = require('react-redux').useSelector;

// Mock formatCurrency to control its output for testing
jest
  .spyOn(formatting, 'formatCurrency')
  .mockImplementation((value, currency) => {
    if (typeof value !== 'number' || isNaN(value)) return `${currency}0`;
    return `${currency}${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  });

const mockStore = configureStore([]);
const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('BarChartComponent', () => {
  const mockCalculatedValues = {
    schedule: Array.from({ length: 24 }, (_, i) => ({
      month: i + 1,
      date: `Month ${i + 1}`,
      principal: 1000 + i * 10,
      interest: 500 - i * 5,
      prepayment: i % 5 === 0 ? 100 : 0,
      taxes: i % 7 === 0 ? 50 : 0,
      homeInsurance: i % 3 === 0 ? 20 : 0,
      maintenance: i % 4 === 0 ? 30 : 0,
      balance: 100000 - (i + 1) * 1000,
    })),
  };

  const renderComponent = (
    calculatedValues = mockCalculatedValues,
    currency = '₹',
  ) => {
    mockUseSelector.mockImplementation((selector) => {
      try {
        const state = {
          emi: { calculatedValues, currency },
          emiCalculator: { calculatedValues, currency },
        };
        const val = selector(state);
        if (val !== undefined) return val;
      } catch (e) {}

      const selectorStr = selector ? selector.toString().toLowerCase() : '';
      if (selectorStr.includes('currency')) return currency;
      
      return calculatedValues;
    });
    return render(
      <Provider store={mockStore({})}>
        <ThemeProvider theme={theme}>
          <BarChartComponent />
        </ThemeProvider>
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTooltipProps = { active: false, payload: [], label: '' };
    useMediaQuery.mockReturnValue(false); // Default to desktop
    formatting.formatCurrency.mockClear(); // Clear calls for each test
    formatting.formatCurrency.mockImplementation((value, currency) => {
      if (typeof value !== 'number' || isNaN(value)) return `${currency}0`;
      return `${currency}${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    });
  });

  // --- Initial Rendering and Skeleton ---
  it('renders Skeleton when schedule is empty or null', () => {
    renderComponent({ schedule: [] });
    expect(screen.queryByTestId('recharts-responsive-container')).not.toBeInTheDocument();
  });

  it('renders Skeleton when schedule is undefined', () => {
    renderComponent({ schedule: undefined });
    expect(screen.queryByTestId('recharts-responsive-container')).not.toBeInTheDocument();
  });

  it('renders the chart when schedule data is present', () => {
    renderComponent();
    expect(screen.getByTestId('recharts-responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-composed-chart')).toBeInTheDocument();
  });

  // --- Data Transformation (useMemo) ---
  it('transforms schedule data into grouped data for the chart (desktop)', () => {
    renderComponent();
    const chartData = JSON.parse(
      screen.getByTestId('recharts-composed-chart').dataset.chartData,
    );
    // 24 months, maxBars=15 (desktop), chunkSize = ceil(24/15) = 2
    expect(chartData.length).toBe(12); // 24 months / 2 = 12 chunks
    expect(chartData[0].label).toBe('Month 1 - Month 2');
    expect(chartData[0].principal).toBe(
      mockCalculatedValues.schedule[0].principal +
        mockCalculatedValues.schedule[1].principal,
    );
    expect(chartData[chartData.length - 1].label).toBe('Month 23 - Month 24');
  });

  it('transforms schedule data with chunkSize > 12 (e.g., 36 months, desktop)', () => {
    const longSchedule = Array.from({ length: 36 }, (_, i) => ({
      ...mockCalculatedValues.schedule[0],
      date: `Month ${i + 1}`,
    }));
    renderComponent({ schedule: longSchedule });
    const chartData = JSON.parse(
      screen.getByTestId('recharts-composed-chart').dataset.chartData,
    );
    // 36 months, maxBars=15 (desktop), chunkSize = ceil(36/15) = 3.
    // Since 3 is not > 12, it remains 3.
    expect(chartData.length).toBe(12); // 36 months / 3 = 12 chunks
    expect(chartData[0].label).toBe('Month 1 - Month 3');
  });

  it('transforms schedule data with chunkSize > 12 and rounds up to nearest multiple of 12 (e.g., 150 months, desktop)', () => {
    const veryLongSchedule = Array.from({ length: 150 }, (_, i) => ({
      ...mockCalculatedValues.schedule[0],
      date: `Month ${i + 1}`,
    }));
    renderComponent({ schedule: veryLongSchedule });
    const chartData = JSON.parse(
      screen.getByTestId('recharts-composed-chart').dataset.chartData,
    );
    // 150 months, maxBars=15 (desktop), chunkSize = ceil(150/15) = 10.
    // Since 10 is not > 12, it remains 10.
    expect(chartData.length).toBe(15); // 150 months / 10 = 15 chunks
    expect(chartData[0].label).toBe('Month 1 - Month 10');
  });

  it('transforms schedule data with chunkSize > 12 and rounds up to nearest multiple of 12 (e.g., 200 months, desktop)', () => {
    const veryLongSchedule = Array.from({ length: 200 }, (_, i) => ({
      ...mockCalculatedValues.schedule[0],
      date: `Month ${i + 1}`,
    }));
    renderComponent({ schedule: veryLongSchedule });
    const chartData = JSON.parse(
      screen.getByTestId('recharts-composed-chart').dataset.chartData,
    );
    // 200 months, maxBars=15 (desktop), chunkSize = ceil(200/15) = 14.
    // Since 14 > 12, it becomes ceil(14/12)*12 = 2*12 = 24.
    expect(chartData.length).toBe(Math.ceil(200 / 24)); // 200 months / 24 = 9 chunks
    expect(chartData[0].label).toBe('Month 1 - Month 24');
  });

  it('handles single month schedule data', () => {
    const singleMonthSchedule = [
      {
        month: 1,
        date: 'Jan 2023',
        principal: 1000,
        interest: 500,
        prepayment: 0,
        taxes: 0,
        homeInsurance: 0,
        maintenance: 0,
        balance: 99000,
      },
    ];
    renderComponent({ schedule: singleMonthSchedule });
    const chartData = JSON.parse(
      screen.getByTestId('recharts-composed-chart').dataset.chartData,
    );
    expect(chartData.length).toBe(1);
    expect(chartData[0].label).toBe('Jan 2023');
  });

  // --- Responsiveness (useMediaQuery) ---
  it('adjusts maxBars for mobile view', () => {
    useMediaQuery.mockImplementation((query) =>
      query === theme.breakpoints.down('sm')
    ); // Simulate mobile
    renderComponent();
    const chartData = JSON.parse(
      screen.getByTestId('recharts-composed-chart').dataset.chartData,
    );
    // 24 months, maxBars=6 (mobile), chunkSize = ceil(24/6) = 4
    expect(chartData.length).toBe(6); // 24 months / 4 = 6 chunks
    expect(chartData[0].label).toBe('Month 1 - Month 4');
  });

  it('adjusts maxBars for tablet view', () => {
    useMediaQuery.mockImplementation((query) =>
      query === theme.breakpoints.down('md')
    ); // Simulate tablet
    renderComponent();
    const chartData = JSON.parse(
      screen.getByTestId('recharts-composed-chart').dataset.chartData,
    );
    // 24 months, maxBars=10 (tablet), chunkSize = ceil(24/10) = 3
    expect(chartData.length).toBe(8); // 24 months / 3 = 8 chunks
    expect(chartData[0].label).toBe('Month 1 - Month 3');
  });

  // --- YAxis Formatting ---
  it('formats YAxis values correctly for thousands', () => {
    renderComponent();
    const yAxis = screen.getAllByTestId('recharts-yaxis')[0];
    expect(yAxis).toHaveAttribute('data-formatter-1000', '₹1k');
  });

  it('formats YAxis values correctly for lakhs', () => {
    renderComponent();
    const yAxis = screen.getAllByTestId('recharts-yaxis')[0];
    expect(yAxis).toHaveAttribute('data-formatter-100000', '₹1.0L');
  });

  it('formats YAxis values correctly for crores', () => {
    renderComponent();
    const yAxis = screen.getAllByTestId('recharts-yaxis')[0];
    expect(yAxis).toHaveAttribute('data-formatter-10000000', '₹1.0Cr');
  });

  // --- CustomTooltip ---
  it('CustomTooltip does not render when not active', () => {
    renderComponent();
    const tooltipWrapper = screen.getByTestId('recharts-tooltip');
    expect(tooltipWrapper).toBeEmptyDOMElement();
  });

  it('CustomTooltip renders correctly when active with payload', () => {
    mockTooltipProps = {
      active: true,
      payload: [
        { name: 'Principal', value: 10000, color: 'green' },
        { name: 'Interest', value: 5000, color: 'red' },
      ],
      label: 'Month 1 - Month 2',
    };
    renderComponent();
    const tooltipWrapper = screen.getByTestId('recharts-tooltip');
    expect(tooltipWrapper).not.toBeEmptyDOMElement();
    expect(screen.getByText('Month 1 - Month 2')).toBeInTheDocument();
    expect(screen.getByText('Principal')).toBeInTheDocument();
    expect(screen.getByText('₹10,000')).toBeInTheDocument();
    expect(screen.getByText('Interest')).toBeInTheDocument();
    expect(screen.getByText('₹5,000')).toBeInTheDocument();
  });

  it('CustomTooltip handles empty payload when active', () => {
    mockTooltipProps = {
      active: true,
      payload: [],
      label: 'Month 1 - Month 2',
    };
    renderComponent();
    const tooltipWrapper = screen.getByTestId('recharts-tooltip');
    expect(tooltipWrapper).toBeEmptyDOMElement();
  });

  // --- Bar and Line elements ---
  it('renders all Bar and Line elements with correct dataKeys', () => {
    renderComponent();
    expect(screen.getByTestId('recharts-bar-principal')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-interest')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-prepayment')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-taxes')).toBeInTheDocument();
    expect(
      screen.getByTestId('recharts-bar-homeInsurance'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-maintenance')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-line-balance')).toBeInTheDocument();
  });
});
