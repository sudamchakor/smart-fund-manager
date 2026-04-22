import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import UserProfile from './UserProfile';
import '@testing-library/jest-dom';

// Mock child components
jest.mock('../features/profile/tabs/PersonalProfileTab', () => {
  const MockPersonalProfileTab = ({ onEditGoal }) => (
    <div data-testid="personal-profile-tab">
      Personal Profile Tab
      <button onClick={() => onEditGoal(123)}>Edit Goal</button>
    </div>
  );
  return MockPersonalProfileTab;
});
jest.mock('../features/profile/tabs/FutureGoalsTab', () => {
  const MockFutureGoalsTab = ({ goalToEditId }) => (
    <div data-testid="future-goals-tab">
      Future Goals Tab {goalToEditId && `(Editing Goal: ${goalToEditId})`}
    </div>
  );
  return MockFutureGoalsTab;
});
jest.mock('../features/profile/tabs/Settings', () => () => <div data-testid="settings-tab">Settings Tab</div>);
jest.mock('../features/profile/tabs/OnboardingModal', () => {
  const MockOnboardingModal = ({ open, onClose }) => (
    <div data-testid="onboarding-modal" style={{ display: open ? 'block' : 'none' }}>
      Onboarding Modal
      <button onClick={onClose}>Close Onboarding</button>
    </div>
  );
  return MockOnboardingModal;
});

const mockStore = configureStore([]);

const initialState = {
  profile: {
    currentAge: 30,
    retirementAge: 60,
    considerInflation: false,
    generalInflationRate: 0.06,
    educationInflationRate: 0.10,
    careerGrowthRate: 0.05,
    totalDebt: 0,
    incomes: [{ id: 1, name: "Salary", amount: 100000, type: 'monthly' }],
    expenses: [
      { id: 1, name: "Basic Needs", amount: 30000, type: 'monthly', category: 'basic', frequency: 'monthly' },
      { id: 2, name: "Discretionary", amount: 20000, type: 'monthly', category: 'discretionary', frequency: 'monthly' },
    ],
    goals: [],
  },
  emi: {
    currency: '₹',
  }
};

describe('UserProfile', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
    localStorage.clear();
    jest.clearAllMocks();
  });

  const renderComponent = (route = '/profile') => {
    window.history.pushState({}, 'Test page', route);
    return render(
      <Provider store={store}>
        <Router>
          <UserProfile />
        </Router>
      </Provider>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Personal Profile')).toBeInTheDocument();
    expect(screen.getByText('Future Goals')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByTestId('personal-profile-tab')).toBeInTheDocument();
  });

  it('displays the "Your profile is not created" alert if isProfileCreated is false', () => {
    localStorage.setItem("isProfileCreated", "false");
    renderComponent();
    expect(screen.getByText(/Your profile is not created/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create profile/i })).toBeInTheDocument();
  });

  it('does not display the "Your profile is not created" alert if isProfileCreated is true', () => {
    localStorage.setItem("isProfileCreated", "true");
    renderComponent();
    expect(screen.queryByText(/Your profile is not created/i)).not.toBeInTheDocument();
  });

  it('opens the OnboardingModal when "create profile" link is clicked', () => {
    localStorage.setItem("isProfileCreated", "false");
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /create profile/i }));
    expect(screen.getByTestId('onboarding-modal')).toBeVisible();
  });

  it('closes the OnboardingModal and updates profile status', () => {
    localStorage.setItem("isProfileCreated", "false");
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /create profile/i }));
    expect(screen.getByTestId('onboarding-modal')).toBeVisible();

    localStorage.setItem("isProfileCreated", "true"); // Simulate onboarding completion
    fireEvent.click(screen.getByText('Close Onboarding')); // Click the mock close button
    expect(screen.getByTestId('onboarding-modal')).not.toBeVisible();
    expect(screen.queryByText(/Your profile is not created/i)).not.toBeInTheDocument();
  });

  it('switches to Future Goals tab when "Future Goals" tab is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('tab', { name: /Future Goals/i }));
    expect(screen.getByTestId('future-goals-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('personal-profile-tab')).not.toBeInTheDocument();
  });

  it('switches to Settings tab when "Settings" tab is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('tab', { name: /Settings/i }));
    expect(screen.getByTestId('settings-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('personal-profile-tab')).not.toBeInTheDocument();
  });

  it('navigates to the correct tab based on URL parameter', () => {
    renderComponent('/profile?tab=goals');
    expect(screen.getByTestId('future-goals-tab')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Future Goals/i })).toHaveAttribute('aria-selected', 'true');

    renderComponent('/profile?tab=settings');
    expect(screen.getByTestId('settings-tab')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Settings/i })).toHaveAttribute('aria-selected', 'true');

    renderComponent('/profile?tab=personal'); // Explicitly personal
    expect(screen.getByTestId('personal-profile-tab')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Personal Profile/i })).toHaveAttribute('aria-selected', 'true');

    renderComponent('/profile'); // Default to personal
    expect(screen.getByTestId('personal-profile-tab')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Personal Profile/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('handles onEditGoal from PersonalProfileTab and switches to FutureGoalsTab with goalToEditId', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Edit Goal')); // This button is in the mocked PersonalProfileTab
    expect(screen.getByTestId('future-goals-tab')).toBeInTheDocument();
    expect(screen.getByText('Future Goals Tab (Editing Goal: 123)')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Future Goals/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('clears goalToEditId when switching tabs manually', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Edit Goal')); // Set goalToEditId
    expect(screen.getByText('Future Goals Tab (Editing Goal: 123)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Personal Profile/i })); // Switch back
    fireEvent.click(screen.getByRole('tab', { name: /Future Goals/i })); // Switch to goals again
    expect(screen.getByText('Future Goals Tab')).not.toHaveTextContent('(Editing Goal: 123)');
  });

  it('displays current surplus and debt-free countdown', () => {
    store = mockStore({
      profile: {
        ...initialState.profile,
        incomes: [{ id: 1, name: "Salary", amount: 100000, type: 'monthly' }],
        expenses: [{ id: 1, name: "Rent", amount: 40000, type: 'monthly', category: 'basic', frequency: 'monthly' }],
        goals: [{
          id: 1, name: "Retirement", targetAmount: 1000000, targetYear: 2050, category: 'retirement',
          investmentPlans: [{ id: 1, type: 'sip', monthlyContribution: 10000 }]
        }]
      },
      emi: {
        currency: '₹',
      }
    });
    renderComponent();

    // Expected surplus: 100000 (income) - 40000 (expense) - 10000 (goal contribution) = 50000
    expect(screen.getByText(/Current Surplus:.*₹50,000 \/ month/i)).toBeInTheDocument();
    // Debt-Free Countdown: 0 debt, so "Debt-Free!"
    expect(screen.getByText(/Debt-Free Countdown:.*Debt-Free!/i)).toBeInTheDocument();
  });

  it('highlights surplus in red if negative', () => {
    store = mockStore({
      profile: {
        ...initialState.profile,
        incomes: [{ id: 1, name: "Salary", amount: 50000, type: 'monthly' }],
        expenses: [{ id: 1, name: "Rent", amount: 60000, type: 'monthly', category: 'basic', frequency: 'monthly' }],
        goals: []
      },
      emi: {
        currency: '₹',
      }
    });
    renderComponent();
    // Surplus: 50000 - 60000 = -10000
    const surplusText = screen.getByText(/Current Surplus:/i).closest('div');
    expect(surplusText).toHaveStyle('background-color: #b71c1c');
  });

  it('displays correct debt-free countdown when debt exists and surplus is positive', () => {
    store = mockStore({
      profile: {
        ...initialState.profile,
        totalDebt: 120000, // 120k debt
        incomes: [{ id: 1, name: "Salary", amount: 100000, type: 'monthly' }],
        expenses: [{ id: 1, name: "Rent", amount: 40000, type: 'monthly', category: 'basic', frequency: 'monthly' }],
        goals: [{
          id: 1, name: "Retirement", targetAmount: 1000000, targetYear: 2050, category: 'retirement',
          investmentPlans: [{ id: 1, type: 'sip', monthlyContribution: 10000 }]
        }]
      },
      emi: {
        currency: '₹',
      }
    });
    renderComponent();
    // Surplus: 100000 - 40000 - 10000 = 50000
    // Debt: 120000
    // Months to pay off: 120000 / 50000 = 2.4 months. Rounded to 2 months.
    expect(screen.getByText(/Debt-Free Countdown:.*2 months/i)).toBeInTheDocument();
  });
});
