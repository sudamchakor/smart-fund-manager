import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingModal from '../../../../features/profile/tabs/OnboardingModal.jsx'; // Corrected path
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock child components
jest.mock(
  '../../../../features/profile/tabs/OnboardingSteps/SystemParameters.jsx',
  () =>
    ({ onNext }) => (
      <div data-testid="system-parameters">
        System Parameters
        <button onClick={onNext}>Next</button>
      </div>
    ),
);
jest.mock('../../../../features/profile/tabs/OnboardingSteps/IncomeStreams.jsx',
  () =>
    ({ onNext, onBack }) => (
      <div data-testid="income-streams">
        Income Streams
        <button onClick={onNext}>Next</button>
        <button onClick={onBack}>Back</button>
      </div>
    ),
);jest.mock('../../../../features/profile/tabs/OnboardingSteps/FixedLiabilities.jsx',
  () =>
    ({ onNext, onBack }) => (
      <div data-testid="fixed-liabilities">
        Fixed Liabilities
        <button onClick={onNext}>Next</button>
        <button onClick={onBack}>Back</button>
      </div>
    ),
);jest.mock('../../../../features/profile/tabs/OnboardingSteps/CapitalGoals.jsx',
  () =>
    ({ onNext, onBack }) => (
      <div data-testid="capital-goals">
        Capital Goals
        <button onClick={onNext}>Next</button>
        <button onClick={onBack}>Back</button>
      </div>
    ),
);

const mockStore = configureStore([]);
const store = mockStore({
  profile: {
    incomes: [],
    expenses: [],
    goals: [],
    currentAge: 30,
    retirementAge: 60,
    careerGrowthRate: { type: 'percentage', value: 0.05 },
    generalInflationRate: 0.06,
    educationInflationRate: 0.08, // Added missing property
  },
});

describe('OnboardingModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders SystemParameters as the initial step', () => {
    render(
      <Provider store={store}>
        <OnboardingModal open={true} onClose={mockOnClose} />
      </Provider>,
    );
    expect(screen.getByTestId('system-parameters')).toBeInTheDocument();
    expect(screen.queryByTestId('income-streams')).not.toBeInTheDocument();
  });

  it('navigates to IncomeStreams when "Next" is clicked on SystemParameters', () => {
    render(
      <Provider store={store}>
        <OnboardingModal open={true} onClose={mockOnClose} />
      </Provider>,
    );
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByTestId('income-streams')).toBeInTheDocument();
    expect(screen.queryByTestId('system-parameters')).not.toBeInTheDocument();
  });

  it('navigates back to SystemParameters when "Back" is clicked on IncomeStreams', () => {
    render(
      <Provider store={store}>
        <OnboardingModal open={true} onClose={mockOnClose} />
      </Provider>,
    );
    fireEvent.click(screen.getByText('Next')); // Go to IncomeStreams
    fireEvent.click(screen.getByText('Back')); // Go back to SystemParameters
    expect(screen.getByTestId('system-parameters')).toBeInTheDocument();
    expect(screen.queryByTestId('income-streams')).not.toBeInTheDocument();
  });

  it('calls onClose when "Next" is clicked on the final step (CapitalGoals)', () => {
    render(
      <Provider store={store}>
        <OnboardingModal open={true} onClose={mockOnClose} />
      </Provider>,
    );
    fireEvent.click(screen.getByText('Next')); // SystemParameters -> IncomeStreams
    fireEvent.click(screen.getByText('Next')); // IncomeStreams -> FixedLiabilities
    fireEvent.click(screen.getByText('Next')); // FixedLiabilities -> CapitalGoals
    fireEvent.click(screen.getByText('Next')); // CapitalGoals -> Finish
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
