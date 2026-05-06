import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux'; // This mock is fine
import configureStore from 'redux-mock-store';
import DebtAccelerator from '../../../../features/profile/components/DebtAccelerator.jsx';

const mockStore = configureStore([]);

describe.skip('DebtAccelerator', () => {
  it('renders without crashing', () => {
    const store = mockStore({
      emiCalculator: {
        emi: 1000,
        totalInterest: 50000,
        totalPayment: 150000,
      },
      profile: {
        expectedReturnRate: 0.12,
      },
      emi: {
        currency: '₹',
      },
    });
    render(
      <Provider store={store}>
        <DebtAccelerator />
      </Provider>,
    );
    expect(screen.getByText(/Debt Accelerator/i)).toBeInTheDocument(); // Placeholder
  });
});
