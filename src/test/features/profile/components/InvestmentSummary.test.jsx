import React from 'react';
import { render, screen } from '@testing-library/react';
import InvestmentSummary from '../../../../features/profile/components/InvestmentSummary.jsx'; // Corrected path

describe.skip('InvestmentSummary Component', () => {
  const mockPlans = [
    {
      investedAmount: 50000,
      estimatedReturns: 20000,
      totalValue: 70000,
      timePeriod: 5,
    },
    {
      investedAmount: 100000,
      estimatedReturns: 80000,
      totalValue: 180000,
      timePeriod: 10,
    },
  ];

  it('calculates and displays aggregated totals correctly', () => {
    // Total Invested: 150000
    // Total Returns: 100000
    // Total Value: 250000
    // Max Time Period: 10
    render(<InvestmentSummary plans={mockPlans} targetAmount={250000} />);

    expect(screen.getByText('₹1,50,000')).toBeInTheDocument();
    expect(screen.getByText('₹1,00,000')).toBeInTheDocument();
    expect(screen.getByText('₹2,50,000')).toBeInTheDocument();
    expect(screen.getByText('10 years')).toBeInTheDocument();
  });

  it('displays a warning when totalValue does not match the targetAmount', () => {
    render(<InvestmentSummary plans={mockPlans} targetAmount={300000} />);

    const warningMessage = screen.getByText(
      /Warning: The total projected value does not match the target amount./i,
    );
    expect(warningMessage).toBeInTheDocument();
  });

  it('does not display a warning when totalValue matches targetAmount', () => {
    render(<InvestmentSummary plans={mockPlans} targetAmount={250000} />);

    const warningMessage = screen.queryByText(/Warning:/i);
    expect(warningMessage).not.toBeInTheDocument();
  });

  it('handles empty plans gracefully', () => {
    render(<InvestmentSummary plans={[]} targetAmount={0} />);

    expect(screen.getAllByText('₹0').length).toBe(3); // Invested, Returns, Total Value
    expect(screen.getByText('0 years')).toBeInTheDocument();
    expect(screen.queryByText(/Warning:/i)).not.toBeInTheDocument();
  });
});
