import React from 'react';
import { render, screen, waitFor } from '@testing-library/react'; // Added waitFor
import PaymentScheduleTable from '../../../../../src/features/emiCalculator/components/PaymentScheduleTable'; // Corrected path
import { useSelector } from 'react-redux';
import { Provider } from 'react-redux'; // Added Provider
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Added ThemeProvider


// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

const mockStore = configureStore([]);
const theme = createTheme(); // Define theme

describe('PaymentScheduleTable', () => {
  beforeEach(() => {
    useSelector.mockImplementation((selector) => {
      const state = {
        emiCalculator: {
          schedule: [
            { month: 1, principal: 1000, interest: 500, balance: 99000 },
            { month: 2, principal: 1010, interest: 490, balance: 97990 },
          ],
          // Other emiCalculator state can go here if needed by PaymentScheduleTable directly
        },
        emi: { // This 'emi' slice is what selectCalculatedValues expects
          currency: '₹',
          loanDetails: {
            homeValue: 5000000,
            marginAmount: 1000000,
            marginUnit: 'Rs',
            loanInsurance: 0,
            interestRate: 8.5,
            loanTenure: 20,
            tenureUnit: 'years',
            loanFees: 10000,
            feesUnit: 'Rs',
            startDate: new Date().toISOString(),
            yearlyPaymentIncreaseAmount: 0,
            yearlyPaymentIncreaseUnit: '%',
          },
          expenses: [],
          prepayments: {
            monthly: { amount: 0, startDate: new Date().toISOString() },
            yearly: { amount: 0, startDate: new Date().toISOString() },
            quarterly: { amount: 0, startDate: new Date().toISOString() },
            oneTime: { amount: 0, date: new Date().toISOString() },
          },
        },
      };
      return selector(state);
    });
  });

  it('renders without crashing', async () => { // Marked as async
    render(
      <ThemeProvider theme={theme}> {/* Wrap with ThemeProvider */}
        <PaymentScheduleTable />
      </ThemeProvider>
    );
    // The component renders 'Year' instead of 'Month' for the first column header
    expect(screen.getByText(/Year/i)).toBeInTheDocument();
    expect(screen.getByText(/Principal/i)).toBeInTheDocument();
    expect(screen.getByText(/Interest/i)).toBeInTheDocument();
    expect(screen.getByText(/Balance/i)).toBeInTheDocument();
  });
});
