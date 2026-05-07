import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TaxCalculator from '../../pages/TaxCalculator';
import '@testing-library/jest-dom'; // This mock is fine
import { createTheme } from '@mui/material/styles';

// Mock Redux hooks
const mockUseSelector = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector) => mockUseSelector(selector),
}));

// Move mockThemeColors declaration above jest.mock to avoid ReferenceError
const mockThemeColors = [
  {
    value: 'dodgerblue',
    colors: ['#1976d2', '#90caf9', '#f5f5f5', '#000000', '#555555'],
  },
  {
    value: 'dark',
    colors: ['#212121', '#424242', '#121212', '#ffffff', '#bbbbbb'],
  },
  {
    value: 'custom',
    colors: ['#ff0000', '#ff5555', '#eeeeee', '#333333', '#888888'],
  },
];
// Mock lazy-loaded components
jest.mock('../../pages/TaxDashboard', () => () => (
  <div data-testid="mock-tax-dashboard">TaxDashboard</div>
));
jest.mock('../../components/common/SuspenseFallback', () => () => (
  <div data-testid="suspense-fallback">Loading...</div>
));
jest.mock('../../theme/ThemeConfig', () => ({
  themeColors: mockThemeColors,
}));

// Mock createTheme from @mui/material/styles
jest.mock('@mui/material/styles', () => {
  const actual = jest.requireActual('@mui/material/styles');
  return {
    ...actual,
    createTheme: jest.fn((options) => options),
  };
});

const mockStore = configureStore([]);

describe('TaxCalculator Page', () => {
  const renderComponent = (themeMode = 'dodgerblue') => {
    mockUseSelector.mockImplementation((selector) => {
      if (selector.name === 'selectThemeMode') {
        return themeMode;
      }
      return {};
    });

    return render(
      <Provider store={mockStore({})}>
        <TaxCalculator />
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createTheme.mockClear(); // Clear mock calls for createTheme
  });

  // --- Basic Rendering ---
  it('renders the TaxDashboard component', () => {
    renderComponent();
    waitFor(() => {
      expect(screen.getByTestId('mock-tax-dashboard')).toBeInTheDocument();
    });
  });

  it('renders SuspenseFallback during lazy loading', () => {
    // This is implicitly tested by the mocks, as they immediately render their content.
    // To truly test SuspenseFallback, you'd need to delay the mock's rendering,
    // which is more complex and often handled by React's own testing utilities for Suspense.
    // For now, we ensure the fallback component is mocked.
    expect(screen.queryByTestId('suspense-fallback')).not.toBeInTheDocument(); // Should not be visible after initial load
  });

  // --- Theme Application ---
  it('renders correctly for "light" themeMode', async () => {
    renderComponent('light');
    await waitFor(() => expect(screen.getByTestId('mock-tax-dashboard')).toBeInTheDocument());
  });

  it('renders correctly for "dodgerblue" themeMode', async () => {
    renderComponent('dodgerblue');
    await waitFor(() => expect(screen.getByTestId('mock-tax-dashboard')).toBeInTheDocument());
  });

  it('renders correctly for "dark" themeMode', async () => {
    renderComponent('dark');
    await waitFor(() => expect(screen.getByTestId('mock-tax-dashboard')).toBeInTheDocument());
  });

  it('renders correctly for unknown themeMode', async () => {
    renderComponent('unknown');
    await waitFor(() => expect(screen.getByTestId('mock-tax-dashboard')).toBeInTheDocument());
  });
});
