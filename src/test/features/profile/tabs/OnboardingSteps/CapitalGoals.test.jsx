import React from 'react';
import { render, screen } from '@testing-library/react';
import CapitalGoals from '../../../../features/profile/tabs/OnboardingSteps/CapitalGoals';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn(selector => selector({
    profile: {
      goals: [
        { id: 1, name: 'Retirement', targetAmount: 1000000, targetYear: 2050, category: 'retirement' }
      ],
    },
    emi: {
      currency: '₹',
    },
  })),
  useDispatch: () => jest.fn(),
}));

// Mock child components
jest.mock('../../../../../src/features/profile/components/GoalForm', () => () => <div data-testid="goal-form">GoalForm</div>, { virtual: true });

describe.skip('CapitalGoals', () => {
  it('renders without crashing', () => {
    render(<CapitalGoals onNext={() => {}} onBack={() => {}} />);
    expect(screen.getByText(/What are your capital goals?/i)).toBeInTheDocument();
    expect(screen.getByTestId('goal-form')).toBeInTheDocument();
  });
});