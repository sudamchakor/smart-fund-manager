import React, { lazy, Suspense } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from '../../pages/Home';
import '@testing-library/jest-dom';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock OnboardingModal (lazy loaded)
jest.mock('../../features/profile/tabs/OnboardingModal', () => {
  const React = require('react');
  return ({ open, onClose }) =>
    open
      ? React.createElement(
          'div',
          { 'data-testid': 'mock-onboarding-modal' },
          React.createElement(
            'button',
            { onClick: onClose },
            'Close Onboarding',
          ),
        )
      : null;
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const theme = createTheme(); // Create a basic theme for ThemeProvider

jest.mock('../../pages/Home', () => {
  const React = require('react');
  const actual = jest.requireActual('../../pages/Home');
  // Define mockSystemModules INSIDE the factory function to avoid hoisting issues
  const mockSystemModules = [
    {
      title: 'User Profile',
      description: 'Desc 1',
      icon: React.createElement('div', { 'data-testid': 'icon-user-profile' }),
      path: '/profile',
      colorToken: 'secondary',
    },
    {
      title: 'EMI Calculator',
      description: 'Desc 2',
      icon: React.createElement('div', {
        'data-testid': 'icon-emi-calculator',
      }),
      path: '/calculator',
      colorToken: 'primary',
    },
    {
      title: 'Credit Card EMI',
      description: 'Desc 3',
      icon: React.createElement('div', {
        'data-testid': 'icon-credit-card-emi',
      }),
      path: '/credit-card-emi',
      colorToken: 'success',
    },
    {
      title: 'Investment Strategy',
      description: 'Desc 4',
      icon: React.createElement('div', {
        'data-testid': 'icon-investment-strategy',
      }),
      path: '/investment/sip',
      colorToken: 'info',
    },
    {
      title: 'Personal Loan',
      description: 'Desc 5',
      icon: React.createElement('div', { 'data-testid': 'icon-personal-loan' }),
      path: '/personal-loan',
      colorToken: 'warning',
    },
    {
      title: 'Tax Optimization',
      description: 'Desc 6',
      icon: React.createElement('div', {
        'data-testid': 'icon-tax-optimization',
      }),
      path: '/tax-calculator',
      colorToken: 'error',
    },
  ];
  return {
    ...actual,
    systemModules: mockSystemModules, // Use our mock array
  };
});

describe('Home Component', () => {
  // Helper function to render the component with ThemeProvider and Router
  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <Router>
          <Home />
        </Router>
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear(); // Clear localStorage before each test
  });

  // --- Hero Section ---
  it('renders the hero section with title and description', () => {
    renderComponent();
    expect(screen.getByText('SmartFund')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Your centralized financial command center for precision planning and capital growth.',
      ),
    ).toBeInTheDocument();
  });

  it('navigates to /profile when "Get Started" button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Get Started/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  // --- System Modules Grid ---
  it('renders all system modules', () => {
    renderComponent();
    // Access the mocked systemModules from the Home module itself
    const { systemModules: mockedSystemModules } = require('../../pages/Home');
    mockedSystemModules.forEach((module) => {
      expect(screen.getByText(module.title)).toBeInTheDocument();
      expect(screen.getByText(module.description)).toBeInTheDocument();
      expect(
        screen.getByTestId(
          `icon-${module.title.toLowerCase().replace(/\s/g, '-')}`,
        ),
      ).toBeInTheDocument();
    });
  });

  it('navigates to the correct path when each module card is clicked', () => {
    renderComponent();
    const { systemModules: mockedSystemModules } = require('../../pages/Home');
    mockedSystemModules.forEach((module) => {
      fireEvent.click(screen.getByText(module.title).closest('button'));
      expect(mockNavigate).toHaveBeenCalledWith(module.path);
    });
    expect(mockNavigate).toHaveBeenCalledTimes(mockedSystemModules.length);
  });

  // --- Onboarding Modal ---
  it('shows OnboardingModal if "hasOnboarded" is not in localStorage', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('mock-onboarding-modal')).toBeInTheDocument();
    });
  });

  it('does not show OnboardingModal if "hasOnboarded" is true in localStorage', () => {
    localStorage.setItem('hasOnboarded', 'true');
    renderComponent();
    expect(
      screen.queryByTestId('mock-onboarding-modal'),
    ).not.toBeInTheDocument();
  });

  it('closes OnboardingModal and sets "hasOnboarded" in localStorage when onClose is called', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('mock-onboarding-modal')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Close Onboarding'));
    await waitFor(() => {
      expect(
        screen.queryByTestId('mock-onboarding-modal'),
      ).not.toBeInTheDocument();
    });
    expect(localStorage.getItem('hasOnboarded')).toBe('true');
  });

  // --- Edge Cases / Negative Scenarios ---
  it('handles empty module list gracefully (no modules rendered)', () => {
    // Temporarily override the mockSystemModules for this test
    jest.doMock('../../pages/Home', () => {
      const actual = jest.requireActual('../../pages/Home');
      return {
        ...actual,
        systemModules: [], // Empty array
      };
    });
    // Re-render the component with the empty mock
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <Router>
          <Home />
        </Router>
      </ThemeProvider>,
    );

    expect(screen.queryByText('User Profile')).not.toBeInTheDocument();
    // Check that no module cards are rendered, only the "Get Started" button in the hero section
    expect(
      screen.queryAllByRole('button', { name: /System Module/i }),
    ).toHaveLength(0);

    // Restore original mock for subsequent tests
    jest.dontMock('../../pages/Home');
    // Re-import Home to get the original mockSystemModules back
    const OriginalHome = require('../../pages/Home').default;
    rerender(
      <ThemeProvider theme={theme}>
        <Router>
          <OriginalHome />
        </Router>
      </ThemeProvider>,
    );
  });

  it('ensures module cards have correct styling and hover effects (visual check, not directly testable with JSDOM)', () => {
    // Direct testing of :hover pseudo-classes and keyframe animations with JSDOM is not straightforward.
    // We can assert that the `sx` prop contains the responsive styles and animation properties.
    renderComponent();
    const userProfileCard = screen.getByText('User Profile').closest('button');
    expect(userProfileCard).toHaveStyle('border: 1px solid');
    expect(userProfileCard).toHaveStyle('transition: all 0.3s ease');
    // Check for animation properties (this is a simplified check, actual keyframe animation is harder to test)
    expect(userProfileCard).toHaveStyle('animation-delay: 0ms'); // First item has 0ms delay
  });
});
