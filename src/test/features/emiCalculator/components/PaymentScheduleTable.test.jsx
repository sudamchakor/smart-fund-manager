import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentScheduleTable from '../../../../../src/features/emiCalculator/components/PaymentScheduleTable';
import { useSelector } from 'react-redux';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

describe('PaymentScheduleTable', () => {
  beforeEach(() => {
    useSelector.mockImplementation(selector => {
      const state = {
        emiCalculator: {
          schedule: [
            { month: 1, principal: 1000, interest: 500, balance: 99000 },
            { month: 2, principal: 1010, interest: 490, balance: 97990 },
          ],
          loanDetails: {
            homeValue: 5000000,
            marginAmount: 1000000,
            marginUnit: "Rs",
            loanInsurance: 0,
            interestRate: 8.5,
            loanTenure: 20,
            tenureUnit: "years",
            loanFees: 10000,
            feesUnit: "Rs",
            startDate: new Date().toISOString(),
            yearlyPaymentIncreaseAmount: 0,
            yearlyPaymentIncreaseUnit: "%",
          },
          expenses: [],
          prepayments: {
            monthly: { amount: 0, startDate: new Date().toISOString() },
            yearly: { amount: 0, startDate: new Date().toISOString() },
            quarterly: { amount: 0, startDate: new Date().toISOString() },
            oneTime: { amount: 0, date: new Date().toISOString() },
          },
        },
        emi: {
          currency: '₹',
          loanDetails: {
            homeValue: 5000000,
            marginAmount: 1000000,
            marginUnit: "Rs",
            interestRate: 8.5,
            loanTenure: 20,
          },
          expenses: [],
        },
      };
      return selector(state);
    });
  });

  it('renders without crashing', () => {
    render(<PaymentScheduleTable />);
    expect(screen.getByText(/Payment Schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/Month/i)).toBeInTheDocument();
    expect(screen.getByText(/Principal/i)).toBeInTheDocument();
    expect(screen.getByText(/Interest/i)).toBeInTheDocument();
    expect(screen.getByText(/Balance/i)).toBeInTheDocument();
  });
});