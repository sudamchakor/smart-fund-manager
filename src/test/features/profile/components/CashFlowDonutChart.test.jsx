import React from 'react';
import { render, screen } from '@testing-library/react';
import CashFlowDonutChart from '../../../features/profile/components/CashFlowDonutChart';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="recharts-responsive-container">{children}</div>
  ),
  PieChart: ({ children }) => (
    <div data-testid="recharts-pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="recharts-pie"></div>,
  Cell: () => <div data-testid="recharts-cell"></div>,
  Tooltip: () => <div data-testid="recharts-tooltip"></div>,
}));

describe.skip('CashFlowDonutChart', () => {
  it('renders without crashing', () => {
    const mockData = [
      { name: 'Income', value: 1000 },
      { name: 'Expenses', value: 500 },
    ];
    render(<CashFlowDonutChart data={mockData} />);
    expect(
      screen.getByTestId('recharts-responsive-container'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('recharts-pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-pie')).toBeInTheDocument();
  });
});
