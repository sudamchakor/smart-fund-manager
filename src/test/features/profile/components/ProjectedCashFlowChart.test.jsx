import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectedCashFlowChart from '../../../features/profile/components/ProjectedCashFlowChart';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="recharts-responsive-container">{children}</div>
  ),
  ComposedChart: ({ children }) => (
    <div data-testid="recharts-composed-chart">{children}</div>
  ),
  Area: () => <div data-testid="recharts-area"></div>,
  Bar: () => <div data-testid="recharts-bar"></div>,
  Line: () => <div data-testid="recharts-line"></div>,
  XAxis: () => <div data-testid="recharts-xaxis"></div>,
  YAxis: () => <div data-testid="recharts-yaxis"></div>,
  CartesianGrid: () => <div data-testid="recharts-cartesiangrid"></div>,
  Tooltip: () => <div data-testid="recharts-tooltip"></div>,
  Legend: () => <div data-testid="recharts-legend"></div>,
  ReferenceLine: () => <div data-testid="recharts-referenceline"></div>,
}));

describe.skip('ProjectedCashFlowChart', () => {
  it('renders without crashing', () => {
    const mockData = [
      { year: 2023, income: 100000, expenses: 50000, surplus: 50000 },
    ];
    render(<ProjectedCashFlowChart data={mockData} />);
    expect(screen.getByText(/Projected Cash Flow/i)).toBeInTheDocument();
    expect(
      screen.getByTestId('recharts-responsive-container'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('recharts-composed-chart')).toBeInTheDocument();
  });
});
