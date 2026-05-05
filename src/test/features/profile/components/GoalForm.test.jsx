import React from 'react';
import { render, screen } from '@testing-library/react';
import GoalForm from '../../../features/profile/components/GoalForm';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) =>
    selector({
      emi: {
        currency: '₹',
      },
    }),
  ),
  useDispatch: () => jest.fn(),
}));

// Mock the custom hook
jest.mock('../../../features/profile/components/useGoalForm', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    goal: {
      name: '',
      targetAmount: '',
      targetYear: '',
      category: '',
      priority: '',
      investmentPlans: [],
    },
    handleChange: jest.fn(),
    handleInvestmentPlanChange: jest.fn(),
    addInvestmentPlan: jest.fn(),
    removeInvestmentPlan: jest.fn(),
    handleSubmit: jest.fn(),
    errors: {},
    isEditMode: false,
  })),
}));

describe.skip('GoalForm', () => {
  it('renders without crashing', () => {
    render(<GoalForm />);
    expect(screen.getByText(/Goal Name/i)).toBeInTheDocument(); // Assuming Goal Name is a field
  });
});
