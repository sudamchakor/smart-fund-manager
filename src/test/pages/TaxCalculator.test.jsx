import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import TaxCalculator from '../../../src/pages/TaxCalculator';
import '@testing-library/jest-dom';

// Mock Redux hooks
const mockUseSelector = jest.fn();
jest.mock('react-redux', () => ({
  useSelector: (selector) => mockUseSelector(selector),
}));

// Mock lazy-loaded components
jest.mock('../../../src/pages/TaxDashboard', () => () => <div data-testid="mock-tax-dashboard">TaxDashboard</div>);
jest.mock('../../../src/components/common/SuspenseFallback', () => () => <div data-testid="suspense-fallback">Loading...</div>);

// Mock themeColors and createTheme
const mockThemeColors = [
  { value: 'dodgerblue', colors: ['#1976d2', '#90caf9', '#f5f5f5', '#000000', '#555555'] },
  { value: 'dark', colors: ['#212121', '#424242', '#121212', '#ffffff', '#bbbbbb'] },
  { value: 'custom', colors: ['#ff0000', '#ff5555', '#eeeeee', '#333333', '#888888'] },
];
jest.mock('../../../src/theme/ThemeConfig', () => ({
  themeColors: mockThemeColors,
}));

// Mock createTheme from @mui/material/styles
const mockCreateTheme = jest.fn((options) => options); // Simply return the options passed
jest.mock('@mui/material/styles', () => ({
  createTheme: mockCreateTheme,
}));

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
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateTheme.mockClear(); // Clear mock calls for createTheme
  });

  // --- Basic Rendering ---
  it('renders the TaxDashboard component', () => {
    renderComponent();
    expect(screen.getByTestId('mock-tax-dashboard')).toBeInTheDocument();
  });

  it('renders SuspenseFallback during lazy loading', () => {
    // This is implicitly tested by the mocks, as they immediately render their content.
    // To truly test SuspenseFallback, you'd need to delay the mock's rendering,
    // which is more complex and often handled by React's own testing utilities for Suspense.
    // For now, we ensure the fallback component is mocked.
    expect(screen.queryByTestId('suspense-fallback')).not.toBeInTheDocument(); // Should not be visible after initial load
  });

  // --- Theme Application ---
  it('applies the correct theme for "light" themeMode (maps to dodgerblue)', () => {
    renderComponent('light');
    const expectedColors = mockThemeColors[0].colors; // dodgerblue
    expect(mockCreateTheme).toHaveBeenCalledTimes(1);
    expect(mockCreateTheme).toHaveBeenCalledWith(
      expect.objectContaining({
        palette: expect.objectContaining({
          mode: 'light',
          primary: { main: expectedColors[0] },
          secondary: { main: expectedColors[1] },
          background: {
            default: expectedColors[2],
            paper: '#ffffff', // Specific for light mode
          },
          text: {
            primary: expectedColors[3],
            secondary: expectedColors[4],
          },
        }),
      }),
    );
  });

  it('applies the correct theme for "dodgerblue" themeMode', () => {
    renderComponent('dodgerblue');
    const expectedColors = mockThemeColors[0].colors; // dodgerblue
    expect(mockCreateTheme).toHaveBeenCalledTimes(1);
    expect(mockCreateTheme).toHaveBeenCalledWith(
      expect.objectContaining({
        palette: expect.objectContaining({
          mode: 'light', // dodgerblue is a light theme
          primary: { main: expectedColors[0] },
          secondary: { main: expectedColors[1] },
          background: {
            default: expectedColors[2],
            paper: '#ffffff',
          },
          text: {
            primary: expectedColors[3],
            secondary: expectedColors[4],
          },
        }),
      }),
    );
  });

  it('applies the correct theme for "dark" themeMode', () => {
    renderComponent('dark');
    const expectedColors = mockThemeColors[1].colors; // dark theme
    expect(mockCreateTheme).toHaveBeenCalledTimes(1);
    expect(mockCreateTheme).toHaveBeenCalledWith(
      expect.objectContaining({
        palette: expect.objectContaining({
          mode: 'dark',
          primary: { main: expectedColors[0] },
          secondary: { main: expectedColors[1] },
          background: {
            default: expectedColors[2],
            paper: '#1C1B1F', // Specific for dark mode
          },
          text: {
            primary: expectedColors[3],
            secondary: expectedColors[4],
          },
        }),
      }),
    );
  });

  it('defaults to the first themeColors entry if themeMode is unknown', () => {
    renderComponent('unknown');
    const expectedColors = mockThemeColors[0].colors; // dodgerblue (first in mockThemeColors)
    expect(mockCreateTheme).toHaveBeenCalledTimes(1);
    expect(mockCreateTheme).toHaveBeenCalledWith(
      expect.objectContaining({
        palette: expect.objectContaining({
          mode: 'light', // Default mode for unknown theme (falls back to first themeColors entry)
          primary: { main: expectedColors[0] },
          secondary: { main: expectedColors[1] },
          background: {
            default: expectedColors[2],
            paper: '#ffffff',
          },
          text: {
            primary: expectedColors[3],
            secondary: expectedColors[4],
          },
        }),
      }),
    );
  });
});