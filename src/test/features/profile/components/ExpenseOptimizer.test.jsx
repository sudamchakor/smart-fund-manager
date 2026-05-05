import React from 'react';
import { render, screen } from '@testing-library/react';
import ExpenseOptimizer from '../../../features/profile/components/ExpenseOptimizer';

describe.skip('ExpenseOptimizer', () => {
  it('renders without crashing', () => {
    render(<ExpenseOptimizer />);
    expect(screen.getByText(/Expense Optimizer/i)).toBeInTheDocument(); // Placeholder
  });
});
