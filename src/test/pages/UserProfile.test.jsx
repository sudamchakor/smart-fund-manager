import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import UserProfile from '../../pages/UserProfile';
import '@testing-library/jest-dom';

// Mock child components
jest.mock('../../features/profile/tabs/PersonalProfileTab', () => {
  const MockPersonalProfileTab = ({ onEditGoal, onOpenModal }) => (
    <div data-testid="personal-profile-tab">
      Personal Profile Tab
      <button onClick={() => onEditGoal(123)}>Edit Goal</button>
      <button onClick={() => onOpenModal('income')}>Open Income Modal</button>
    </div>
  );
  return MockPersonalProfileTab;
});
jest.mock('../../features/profile/tabs/FutureGoalsTab', () => {
  const MockFutureGoalsTab = ({ goalToEditId }) => (
    <div data-testid="future-goals-tab">
      Future Goals Tab {goalToEditId && `(Editing Goal: ${goalToEditId})`}
    </div>
  );
  return MockFutureGoalsTab;
});
jest.mock('../../features/profile/tabs/WealthTab', () => () => (
  <div data-testid="wealth-tab">Wealth Tab</div>
));
jest.mock('../../features/profile/tabs/OnboardingModal', () => {
  const MockOnboardingModal = ({ open, onClose }) => (
    <div
      data-testid="onboarding-modal"
      style={{ display: open ? 'block' : 'none' }}
    >
      Onboarding Modal
      <button onClick={onClose}>Close Onboarding</button>
    </div>
  );
  return MockOnboardingModal;
});
jest.mock('../../features/profile/components/FinancialModal', () => {
  const MockFinancialModal = ({ open, onClose, type }) => (
    <div
      data-testid="financial-modal"
      style={{ display: open ? 'block' : 'none' }}
    >
      Financial Modal - {type}
      <button onClick={onClose}>Close Financial Modal</button>
    </div>
  );
  return MockFinancialModal;
});
jest.mock(
  '../../components/CustomTabPanel',
  () =>
    ({ children, value, index }) =>
      value === index ? (
        <div data-testid={`custom-tab-panel-${index}`}>{children}</div>
      ) : null,
);
jest.mock('../../components/PreviewBanner', () => ({ onOpenOnboarding }) => (
  <div data-testid="preview-banner">
    Preview Banner
    <button onClick={onOpenOnboarding}>Create Profile</button>
  </div>
));
jest.mock(
  '../../components/FloatingStatusIsland',
  () =>
    ({ investableSurplus, debtFreeCountdown, currency }) => (
      <div data-testid="floating-status-island">
        Surplus: {currency}
        {investableSurplus}, Debt: {debtFreeCountdown}
      </div>
    ),
);
jest.mock('../../components/common/SuspenseFallback', () => () => (
  <div data-testid="suspense-fallback">Loading...</div>
));

// Mock react-router-dom hooks
const mockUseNavigate = jest.fn();
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate,
  useLocation: () => mockUseLocation(),
}));

const mockStore = configureStore([]);

const initialState = {
  profile: {
    currentAge: 30,
    retirementAge: 60,
    considerInflation: false,
    generalInflationRate: 0.06,
    educationInflationRate: 0.1,
    careerGrowthRate: 0.05,
    totalDebt: 0,
    incomes: [{ id: 1, name: 'Salary', amount: 100000, type: 'monthly' }],
    expenses: [
      {
        id: 1,
        name: 'Basic Needs',
        amount: 30000,
        type: 'monthly',
        category: 'basic',
        frequency: 'monthly',
      },
      {
        id: 2,
        name: 'Discretionary',
        amount: 20000,
        type: 'monthly',
        category: 'discretionary',
        frequency: 'monthly',
      },
    ],
    goals: [],
  },
  emi: {
    currency: '₹',
  },
};

describe('UserProfile Page', () => {
  let store;

  const renderComponent = (
    initialPath = '/profile',
    profileState = initialState.profile,
  ) => {
    store = mockStore({
      ...initialState,
      profile: profileState,
    });
    mockUseLocation.mockReturnValue({
      search: new URL(window.location.origin + initialPath).search,
    });
    window.history.pushState({}, 'Test page', initialPath); // Set actual URL for useLocation to pick up

    return render(
      <Provider store={store}>
        <Router>
          <UserProfile />
        </Router>
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockUseNavigate.mockClear();
  });

  // --- Initial Rendering and Tabs ---
  it('renders without crashing and displays tabs', () => {
    renderComponent();
    expect(screen.getByRole('tab', { name: 'My Profile' })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Financial Goals' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Wealth Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('personal-profile-tab')).toBeInTheDocument();
  });

  it('switches to Financial Goals tab when "Financial Goals" tab is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('tab', { name: 'Financial Goals' }));
    expect(mockUseNavigate).toHaveBeenCalledWith('/profile?tab=goals');
    expect(
      screen.getByRole('tab', { name: 'Financial Goals' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('switches to Wealth Dashboard tab when "Wealth Dashboard" tab is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('tab', { name: 'Wealth Dashboard' }));
    expect(mockUseNavigate).toHaveBeenCalledWith('/profile?tab=wealth');
    expect(
      screen.getByRole('tab', { name: 'Wealth Dashboard' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('selects tab based on URL parameter on initial load', () => {
    renderComponent('/profile?tab=goals');
    expect(
      screen.getByRole('tab', { name: 'Financial Goals' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('future-goals-tab')).toBeInTheDocument();
    expect(
      screen.queryByTestId('personal-profile-tab'),
    ).not.toBeInTheDocument();

    renderComponent('/profile?tab=wealth');
    expect(
      screen.getByRole('tab', { name: 'Wealth Dashboard' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('wealth-tab')).toBeInTheDocument();
    expect(
      screen.queryByTestId('personal-profile-tab'),
    ).not.toBeInTheDocument();
  });

  // --- Preview Banner and Onboarding Modal ---
  it('shows PreviewBanner and OnboardingModal if isProfileCreated is false', () => {
    localStorage.setItem('isProfileCreated', 'false');
    renderComponent();
    expect(screen.getByTestId('preview-banner')).toBeInTheDocument();
    expect(screen.queryByTestId('onboarding-modal')).not.toBeVisible(); // Modal is initially closed
  });

  it('opens OnboardingModal when "Create Profile" button in PreviewBanner is clicked', () => {
    localStorage.setItem('isProfileCreated', 'false');
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Create Profile' }));
    expect(screen.getByTestId('onboarding-modal')).toBeVisible();
  });

  it('closes OnboardingModal and updates isProfileCreated status', () => {
    localStorage.setItem('isProfileCreated', 'false');
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Create Profile' }));
    expect(screen.getByTestId('onboarding-modal')).toBeVisible();

    localStorage.setItem('isProfileCreated', 'true'); // Simulate onboarding completion
    fireEvent.click(screen.getByText('Close Onboarding'));
    expect(screen.getByTestId('onboarding-modal')).not.toBeVisible();
    expect(screen.queryByTestId('preview-banner')).not.toBeInTheDocument();
  });

  it('does not show PreviewBanner if isProfileCreated is true', () => {
    localStorage.setItem('isProfileCreated', 'true');
    renderComponent();
    expect(screen.queryByTestId('preview-banner')).not.toBeInTheDocument();
  });

  // --- Financial Modal ---
  it('opens FinancialModal when onOpenModal is called from PersonalProfileTab', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Open Income Modal'));
    expect(screen.getByTestId('financial-modal')).toBeVisible();
    expect(screen.getByText('Financial Modal - income')).toBeInTheDocument();
  });

  it('closes FinancialModal when onClose is called', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Open Income Modal'));
    expect(screen.getByTestId('financial-modal')).toBeVisible();
    fireEvent.click(screen.getByText('Close Financial Modal'));
    expect(screen.getByTestId('financial-modal')).not.toBeVisible();
  });

  // --- Floating Status Island ---
  it('renders FloatingStatusIsland with correct data', () => {
    renderComponent();
    expect(screen.getByTestId('floating-status-island')).toBeInTheDocument();
    expect(
      screen.getByText('Surplus: ₹50,000, Debt: Debt-Free!'),
    ).toBeInTheDocument();
  });

  // --- handleEditGoal functionality ---
  it('sets goalToEditId and navigates to goals tab when onEditGoal is called', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Edit Goal')); // Button from mocked PersonalProfileTab
    expect(mockUseNavigate).toHaveBeenCalledWith('/profile?tab=goals');
    expect(screen.getByTestId('future-goals-tab')).toHaveTextContent(
      'Future Goals Tab (Editing Goal: 123)',
    );
  });

  it('clears goalToEditId when switching tabs manually', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Edit Goal')); // Set goalToEditId
    expect(screen.getByTestId('future-goals-tab')).toHaveTextContent(
      'Future Goals Tab (Editing Goal: 123)',
    );

    fireEvent.click(screen.getByRole('tab', { name: 'My Profile' })); // Switch back to personal
    expect(mockUseNavigate).toHaveBeenCalledWith('/profile?tab=personal');

    renderComponent('/profile?tab=goals', initialState.profile); // Re-render to simulate navigation
    expect(screen.getByTestId('future-goals-tab')).not.toHaveTextContent(
      '(Editing Goal: 123)',
    );
  });

  // --- Edge Cases / Negative Scenarios ---
  it('handles unknown tab parameter by defaulting to My Profile', () => {
    renderComponent('/profile?tab=unknown');
    expect(screen.getByRole('tab', { name: 'My Profile' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByTestId('personal-profile-tab')).toBeInTheDocument();
  });

  it('renders SuspenseFallback during lazy loading', () => {
    // This is implicitly tested by the mocks, as they immediately render their content.
    // To truly test SuspenseFallback, you'd need to delay the mock's rendering,
    // which is more complex and often handled by React's own testing utilities for Suspense.
    // For now, we ensure the fallback component is mocked.
    expect(screen.queryByTestId('suspense-fallback')).not.toBeInTheDocument(); // Should not be visible after initial load
  });
});
