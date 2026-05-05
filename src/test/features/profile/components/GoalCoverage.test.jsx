import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import GoalCoverage from '../../../features/profile/components/GoalCoverage';

const mockStore = configureStore([]);

describe.skip('GoalCoverage', () => {
  it('renders without crashing', () => {
    const store = mockStore({
      profile: {
        goals: [],
      },
      emi: {
        currency: '₹',
      },
    });
    render(
      <Provider store={store}>
        <GoalCoverage />
      </Provider>,
    );
    expect(screen.getByText(/Goal Coverage/i)).toBeInTheDocument(); // Placeholder
  });
});
