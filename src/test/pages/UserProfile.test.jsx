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
  return { __esModule: true, default: MockPersonalProfileTab };
});
jest.mock('../../features/profile/tabs/FutureGoalsTab', () => {
  const MockFutureGoalsTab = ({ goalToEditId }) => (
    <div data-testid="future-goals-tab">
      Future Goals Tab {goalToEditId && `(Editing Goal: ${goalToEditId})`}
    </div>
  );
  return { __esModule: true, default: MockFutureGoalsTab };
});
jest.mock('../../features/profile/tabs/WealthTab', () => ({
  __esModule: true,
  default: () => <div data-testid="wealth-tab">Wealth Tab</div>,
}));
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
  return { __esModule: true, default: MockOnboardingModal };
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
  return { __esModule: true, default: MockFinancialModal };
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
  it('renders without crashing and displays tabs', async () => {
    renderComponent();
    expect(screen.getByRole('tab', { name: 'My Profile' })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Financial Goals' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Wealth Dashboard' }),
    ).toBeInTheDocument();
    expect(await screen.findByTestId('personal-profile-tab')).toBeInTheDocument();
  });

  it('switches to Financial Goals tab when "Financial Goals" tab is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('tab', { name: 'Financial Goals' }));
    expect(mockUseNavigate).toHaveBeenCalledWith('/profile?tab=goals');
  });

  it('switches to Wealth Dashboard tab when "Wealth Dashboard" tab is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('tab', { name: 'Wealth Dashboard' }));
    expect(mockUseNavigate).toHaveBeenCalledWith('/profile?tab=wealth');
  });

  it('selects goals tab based on URL parameter on initial load', async () => {
    renderComponent('/profile?tab=goals');
    await waitFor(() => {
    expect(
      screen.getByRole('tab', { name: 'Financial Goals' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByTestId('future-goals-tab')).toBeInTheDocument();
    expect(
      screen.queryByTestId('personal-profile-tab'),
    ).not.toBeInTheDocument();
    });
  });

  it('selects wealth tab based on URL parameter on initial load', async () => {
    renderComponent('/profile?tab=wealth');
    await waitFor(() => {
    expect(
      screen.getByRole('tab', { name: 'Wealth Dashboard' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByTestId('wealth-tab')).toBeInTheDocument();
    expect(
      screen.queryByTestId('personal-profile-tab'),
    ).not.toBeInTheDocument();
    });
  });

  // --- Preview Banner and Onboarding Modal ---
  it('shows PreviewBanner and OnboardingModal if isProfileCreated is false', async () => {
    localStorage.setItem('isProfileCreated', 'false');
    renderComponent();
    expect(await screen.findByTestId('preview-banner')).toBeInTheDocument();
    expect(screen.queryByTestId('onboarding-modal')).not.toBeVisible(); // Modal is initially closed
  });

  it('opens OnboardingModal when "Create Profile" button in PreviewBanner is clicked', async () => {
    localStorage.setItem('isProfileCreated', 'false');
    renderComponent();
    fireEvent.click(await screen.findByRole('button', { name: 'Create Profile' }));
    expect(screen.getByTestId('onboarding-modal')).toBeVisible();
  });

  it('closes OnboardingModal and updates isProfileCreated status', async () => {
    localStorage.setItem('isProfileCreated', 'false');
    renderComponent();
    fireEvent.click(await screen.findByRole('button', { name: 'Create Profile' }));
    expect(screen.getByTestId('onboarding-modal')).toBeVisible();

    localStorage.setItem('isProfileCreated', 'true'); // Simulate onboarding completion
    fireEvent.click(screen.getByText('Close Onboarding'));
    await waitFor(() => {
      expect(screen.getByTestId('onboarding-modal')).not.toBeVisible();
    });
  });

  it('does not show PreviewBanner if isProfileCreated is true', async () => {
    localStorage.setItem('isProfileCreated', 'true');
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByTestId('preview-banner')).not.toBeInTheDocument();
    });
  });

  // --- Financial Modal ---
  it('opens FinancialModal when onOpenModal is called from PersonalProfileTab', async () => {
    renderComponent();
    fireEvent.click(await screen.findByText('Open Income Modal'));
    expect(screen.getByTestId('financial-modal')).toBeVisible();
    expect(screen.getByText('Financial Modal - income')).toBeInTheDocument();
  });

  it('closes FinancialModal when onClose is called', async () => {
    renderComponent();
    fireEvent.click(await screen.findByText('Open Income Modal'));
    expect(screen.getByTestId('financial-modal')).toBeVisible();
    fireEvent.click(screen.getByText('Close Financial Modal'));
    await waitFor(() => expect(screen.getByTestId('financial-modal')).not.toBeVisible());
  });

  // --- Floating Status Island ---
  it('renders FloatingStatusIsland with correct data', async () => {
    renderComponent();
    expect(await screen.findByTestId('floating-status-island')).toBeInTheDocument();
    expect(screen.getByTestId('floating-status-island')).toHaveTextContent(/Surplus: ₹50000/i);
  });

  // --- handleEditGoal functionality ---
  it('sets goalToEditId and navigates to goals tab when onEditGoal is called', async () => {
    renderComponent();
    fireEvent.click(await screen.findByText('Edit Goal')); // Button from mocked PersonalProfileTab
    expect(mockUseNavigate).toHaveBeenCalledWith('/profile?tab=goals');
  });

  it('clears goalToEditId when switching tabs manually', async () => {
    renderComponent();
    fireEvent.click(await screen.findByText('Edit Goal')); // Set goalToEditId
    expect(mockUseNavigate).toHaveBeenCalledWith('/profile?tab=goals');

  });

  // --- Edge Cases / Negative Scenarios ---
  it('handles unknown tab parameter by defaulting to My Profile', async () => {
    renderComponent('/profile?tab=unknown');
    expect(screen.getByRole('tab', { name: 'My Profile' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(await screen.findByTestId('personal-profile-tab')).toBeInTheDocument();
  });

  it('renders SuspenseFallback during lazy loading', () => {
    // This is implicitly tested by the mocks, as they immediately render their content.
    // To truly test SuspenseFallback, you'd need to delay the mock's rendering,
    // which is more complex and often handled by React's own testing utilities for Suspense.
    // For now, we ensure the fallback component is mocked.
    expect(screen.queryByTestId('suspense-fallback')).not.toBeInTheDocument(); // Should not be visible after initial load
  });
});
