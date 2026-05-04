import React from 'react';
import { render, screen } from '@testing-library/react';
import AssetAllocationChart from '../../../features/profile/components/AssetAllocationChart';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="recharts-responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="recharts-pie-chart">{children}</div>,
  Pie: () => <div data-testid="recharts-pie"></div>,
  Cell: () => <div data-testid="recharts-cell"></div>,
  Tooltip: () => <div data-testid="recharts-tooltip"></div>,
  Legend: () => <div data-testid="recharts-legend"></div>,
}));

describe.skip('AssetAllocationChart', () => {
  it('renders without crashing', () => {
    const mockData = [{ name: 'Stocks', value: 50 }, { name: 'Bonds', value: 30 }];
    render(<AssetAllocationChart data={mockData} />);
    expect(screen.getByText(/Asset Allocation/i)).toBeInTheDocument();
    expect(screen.getByTestId('recharts-responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-pie-chart')).toBeInTheDocument();
  });
});