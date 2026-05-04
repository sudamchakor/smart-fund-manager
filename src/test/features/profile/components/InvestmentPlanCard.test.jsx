import React from 'react';
import { render, screen } from '@testing-library/react';
import InvestmentPlanCard from '../../../features/profile/components/InvestmentPlanCard';

describe.skip('InvestmentPlanCard', () => {
  const mockPlan = {
    name: 'Test Plan',
    fullSummary: 'This is a test summary.',
    isSafe: true,
  };

  it('renders without crashing', () => {
    render(<InvestmentPlanCard plan={mockPlan} />);
    expect(screen.getByText(/Test Plan/i)).toBeInTheDocument();
    expect(screen.getByText(/This is a test summary./i)).toBeInTheDocument();
    expect(screen.getByText('(Considered Safe)')).toBeInTheDocument();
  });

  it('does not render "(Considered Safe)" badge if not safe', () => {
    const unsafePlan = { ...mockPlan, isSafe: false };
    render(<InvestmentPlanCard plan={unsafePlan} />);
    expect(screen.queryByText('(Considered Safe)')).not.toBeInTheDocument();
  });
});