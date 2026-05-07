import React from 'react';
import { render, screen } from '@testing-library/react';
import CapitalGoals from '../../../../../features/profile/tabs/OnboardingSteps/CapitalGoals.jsx'; // Corrected path

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) => {
    try {
      return selector({
        profile: {
          goalsList: [ // Ensure this is always an array
            {
              id: 1,
              name: 'Retirement',
              targetAmount: 1000000,
              targetYear: 2050,
              category: 'retirement',
            },
          ],
          goals: [],
        },
        emi: {
          currency: '₹',
        },
      });
    } catch (e) {
      return undefined;
    }
  }),
  useDispatch: () => jest.fn(),
}));

// Mock child components
jest.mock('../../../../../src/features/profile/components/GoalForm.jsx', // Corrected path
  () => () => <div data-testid="goal-form">GoalForm</div>,
  { virtual: true },
);

describe('CapitalGoals', () => {
  it('renders without crashing', () => {
    const mockGoal = { name: '', targetAmount: '', targetYear: '', category: '' };
    const mockSetGoal = jest.fn();
    render(
      <CapitalGoals
        onNext={() => {}}
        onBack={() => {}}
        goal={mockGoal}
        setGoal={mockSetGoal}
        goalsList={[]} // Provide an empty array as a default
        setGoalsList={jest.fn()} // Provide a mock function
      />
    );
    expect(
      screen.getByText(/What are your capital goals?/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('goal-form')).toBeInTheDocument();
  });
});
