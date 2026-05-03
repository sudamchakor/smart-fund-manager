import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SettingsPage from '../../../src/pages/SettingsPage';
import '@testing-library/jest-dom';
import {
  setThemeMode,
  setDesignSystem,
  setVisualStyle,
  setCurrency,
  setAutoSave,
} from '../../../src/store/emiSlice'; // Import Redux actions

// Mock Redux hooks
const mockUseSelector = jest.fn();
const mockUseDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useSelector: (selector) => mockUseSelector(selector),
  useDispatch: () => mockUseDispatch,
}));

// Mock child components
jest.mock('../../../src/components/common/PageHeader', () => ({ title, subtitle, icon: Icon }) => (
  <div data-testid="mock-page-header">
    <h1>{title}</h1>
    <p>{subtitle}</p>
    {Icon && <Icon data-testid="mock-header-icon" />}
  </div>
));
jest.mock('../../../src/components/common/ThemeSelector', () => ({ selectedTheme, onThemeChange }) => (
  <div data-testid="mock-theme-selector">
    <span data-testid="selected-theme">{selectedTheme}</span>
    <button onClick={() => onThemeChange(selectedTheme === 'light' ? 'dark' : 'light')}>Change Theme</button>
  </div>
));

// Mock themePresets globally for consistent testing
jest.mock('../../../src/theme/ThemeConfig', () => ({
  themePresets: {
    modern: { name: 'Modern', arch: 'material', style: 'flat' },
    classic: { name: 'Classic', arch: 'classic', style: 'glass' },
  },
  currencyOptions: [
    { value: '₹', label: 'Rupee (₹)' },
    { value: '$', label: 'Dollar ($)' },
    { value: '€', label: 'Euro (€)' },
  ],
}));
const { themePresets, currencyOptions } = require('../../../src/theme/ThemeConfig');


// Mock Material-UI Slide component to render children directly
jest.mock('@mui/material/Slide', () => ({ children, in: isIn, direction }) => (
  isIn ? <div data-testid="mock-slide" data-direction={direction}>{children}</div> : null
));

const mockStore = configureStore([]);
const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('SettingsPage Component', () => {
  const initialGlobalSettings = {
    themeMode: 'light',
    designSystem: 'material',
    visualStyle: 'flat',
    currency: '₹',
    autoSave: true,
  };

  const renderComponent = (globalSettings = initialGlobalSettings) => {
    mockUseSelector.mockImplementation((selector) => {
      // Simulate the selector behavior for globalSettings
      return selector({ emi: globalSettings });
    });
    return render(
      <Provider store={mockStore({ emi: globalSettings })}>
        <ThemeProvider theme={theme}>
          <SettingsPage />
        </ThemeProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mockUseSelector to default behavior for each test
    mockUseSelector.mockImplementation((selector) => selector({ emi: initialGlobalSettings }));
    mockUseDispatch.mockReturnValue(jest.fn()); // Ensure useDispatch returns a mock function
  });

  // --- Initial Rendering ---
  it('renders PageHeader with correct props', () => {
    renderComponent();
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Configure your workspace environment.')).toBeInTheDocument();
    expect(screen.getByTestId('mock-header-icon')).toBeInTheDocument(); // SettingsIcon
  });

  it('renders Appearance section with Layout Style and Color Theme', () => {
    renderComponent();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Layout Style')).toBeInTheDocument();
    expect(screen.getByText('Color Theme')).toBeInTheDocument();
    expect(screen.getByTestId('mock-theme-selector')).toBeInTheDocument();
  });

  it('renders Preferences section with Currency and Cloud Sync', () => {
    renderComponent();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Currency')).toBeInTheDocument();
    expect(screen.getByText('Cloud Sync')).toBeInTheDocument();
  });

  it('Layout Style select shows correct initial value and options', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: 'Modern' })).toBeInTheDocument(); // Default 'modern' preset
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Modern' })); // Open select
    expect(screen.getByText('Classic')).toBeInTheDocument(); // Option from themePresets
  });

  it('ThemeSelector receives correct initial themeMode', () => {
    renderComponent();
    expect(screen.getByTestId('selected-theme')).toHaveTextContent('light');
  });

  it('Currency select shows correct initial value and options', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: 'Rupee (₹)' })).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Rupee (₹)' })); // Open select
    expect(screen.getByText('Dollar ($)')).toBeInTheDocument();
    expect(screen.getByText('Euro (€)')).toBeInTheDocument();
  });

  it('Cloud Sync switch shows correct initial checked state', () => {
    renderComponent();
    expect(screen.getByRole('checkbox', { name: 'Cloud Sync' })).toBeChecked();
  });

  it('action bar (Save/Discard) is not visible initially', () => {
    renderComponent();
    expect(screen.queryByTestId('mock-slide')).not.toBeInTheDocument();
  });

  // --- Layout Style Interaction ---
  it('dispatches setDesignSystem and setVisualStyle when Layout Style changes', () => {
    const dispatch = mockUseDispatch();
    renderComponent();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Modern' })); // Open select
    fireEvent.click(screen.getByText('Classic')); // Select 'Classic'
    expect(dispatch).toHaveBeenCalledWith(setDesignSystem('classic'));
    expect(dispatch).toHaveBeenCalledWith(setVisualStyle('glass'));
  });

  // --- Color Theme Interaction ---
  it('dispatches setThemeMode when ThemeSelector changes theme', () => {
    const dispatch = mockUseDispatch();
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Change Theme' })); // Button from mock-theme-selector
    expect(dispatch).toHaveBeenCalledWith(setThemeMode('dark'));
  });

  // --- Currency Interaction ---
  it('dispatches setCurrency when Currency select changes', () => {
    const dispatch = mockUseDispatch();
    renderComponent();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Rupee (₹)' })); // Open select
    fireEvent.click(screen.getByText('Dollar ($)')); // Select '$'
    expect(dispatch).toHaveBeenCalledWith(setCurrency('$'));
  });

  // --- Cloud Sync Interaction ---
  it('dispatches setAutoSave when Cloud Sync switch is toggled', () => {
    const dispatch = mockUseDispatch();
    renderComponent();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Cloud Sync' }));
    expect(dispatch).toHaveBeenCalledWith(setAutoSave(false)); // Toggling from true to false
  });

  // --- Save/Discard Action Bar ---
  it('action bar becomes visible when settings are dirty', () => {
    const { rerender } = renderComponent();
    // Simulate a change in settings to make it dirty
    mockUseSelector.mockImplementation((selector) => selector({
      emi: { ...initialGlobalSettings, themeMode: 'dark' }
    }));
    rerender(
      <Provider store={mockStore({ emi: { ...initialGlobalSettings, themeMode: 'dark' } })}>
        <ThemeProvider theme={theme}>
          <SettingsPage />
        </ThemeProvider>
      </Provider>
    );
    expect(screen.getByTestId('mock-slide')).toBeInTheDocument();
    expect(screen.getByText('Unsaved Preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls handleSave and hides action bar when Save button is clicked, dispatching current settings', async () => {
    const dispatch = mockUseDispatch();
    const { rerender } = renderComponent();
    const changedSettings = { ...initialGlobalSettings, themeMode: 'dark', currency: '$' };
    mockUseSelector.mockImplementation((selector) => selector({ emi: changedSettings }));
    rerender(
      <Provider store={mockStore({ emi: changedSettings })}>
        <ThemeProvider theme={theme}>
          <SettingsPage />
        </ThemeProvider>
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(dispatch).toHaveBeenCalledWith(setThemeMode(changedSettings.themeMode));
    expect(dispatch).toHaveBeenCalledWith(setDesignSystem(changedSettings.designSystem));
    expect(dispatch).toHaveBeenCalledWith(setVisualStyle(changedSettings.visualStyle));
    expect(dispatch).toHaveBeenCalledWith(setCurrency(changedSettings.currency));
    expect(dispatch).toHaveBeenCalledWith(setAutoSave(changedSettings.autoSave));
    expect(screen.queryByTestId('mock-slide')).not.toBeInTheDocument();
  });

  it('calls handleDiscard and hides action bar when Discard button is clicked, dispatching original settings', async () => {
    const dispatch = mockUseDispatch();
    const { rerender } = renderComponent();
    // Simulate a change in settings to make it dirty
    mockUseSelector.mockImplementation((selector) => selector({
      emi: { ...initialGlobalSettings, themeMode: 'dark', currency: '$' }
    }));
    rerender(
      <Provider store={mockStore({ emi: { ...initialGlobalSettings, themeMode: 'dark', currency: '$' } })}>
        <ThemeProvider theme={theme}>
          <SettingsPage />
        </ThemeProvider>
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));
    // Expect dispatch to be called with original settings
    expect(dispatch).toHaveBeenCalledWith(setThemeMode(initialGlobalSettings.themeMode));
    expect(dispatch).toHaveBeenCalledWith(setDesignSystem(initialGlobalSettings.designSystem));
    expect(dispatch).toHaveBeenCalledWith(setVisualStyle(initialGlobalSettings.visualStyle));
    expect(dispatch).toHaveBeenCalledWith(setCurrency(initialGlobalSettings.currency));
    expect(dispatch).toHaveBeenCalledWith(setAutoSave(initialGlobalSettings.autoSave));
    expect(screen.queryByTestId('mock-slide')).not.toBeInTheDocument();
  });

  // --- useEffect cleanup (unmount behavior) ---
  it('reverts settings to original state on unmount if not saved and dirty', () => {
    const dispatch = mockUseDispatch();
    const { rerender, unmount } = renderComponent();
    // Simulate a change in settings
    mockUseSelector.mockImplementation((selector) => selector({
      emi: { ...initialGlobalSettings, themeMode: 'dark' }
    }));
    rerender(
      <Provider store={mockStore({ emi: { ...initialGlobalSettings, themeMode: 'dark' } })}>
        <ThemeProvider theme={theme}>
          <SettingsPage />
        </ThemeProvider>
      </Provider>
    );
    // Unmount the component without clicking save
    unmount();
    // Expect dispatch to be called with original settings
    expect(dispatch).toHaveBeenCalledWith(setThemeMode(initialGlobalSettings.themeMode));
    expect(dispatch).toHaveBeenCalledWith(setDesignSystem(initialGlobalSettings.designSystem));
    expect(dispatch).toHaveBeenCalledWith(setVisualStyle(initialGlobalSettings.visualStyle));
    expect(dispatch).toHaveBeenCalledWith(setCurrency(initialGlobalSettings.currency));
    expect(dispatch).toHaveBeenCalledWith(setAutoSave(initialGlobalSettings.autoSave));
  });

  it('does not revert settings on unmount if not dirty', () => {
    const dispatch = mockUseDispatch();
    const { unmount } = renderComponent(); // Render with initial settings (not dirty)
    unmount();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not revert settings on unmount if saved', async () => {
    const dispatch = mockUseDispatch();
    const { rerender, unmount } = renderComponent();
    // Simulate a change in settings
    mockUseSelector.mockImplementation((selector) => selector({
      emi: { ...initialGlobalSettings, themeMode: 'dark' }
    }));
    rerender(
      <Provider store={mockStore({ emi: { ...initialGlobalSettings, themeMode: 'dark' } })}>
        <ThemeProvider theme={theme}>
          <SettingsPage />
        </ThemeProvider>
      </Provider>
    );
    // Click save
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    // Clear mocks to ensure no new dispatches from unmount
    dispatch.mockClear();
    // Unmount the component
    unmount();
    // Expect no dispatch calls for reverting
    expect(dispatch).not.toHaveBeenCalled();
  });

  // --- Edge Cases ---
  it('handles empty themePresets gracefully', () => {
    // Temporarily mock themePresets to be empty for this specific test
    jest.doMock('../../../src/theme/ThemeConfig', () => ({
      themePresets: {},
      currencyOptions: [], // Also mock currencyOptions to be empty
    }));
    // Re-import the component to get the updated mock
    const MockedSettingsPage = require('../../../src/pages/SettingsPage').default;
    render(
      <Provider store={mockStore({ emi: initialGlobalSettings })}>
        <ThemeProvider theme={theme}>
          <MockedSettingsPage />
        </ThemeProvider>
      </Provider>
    );
    expect(screen.queryByRole('option')).not.toBeInTheDocument(); // No options in Layout Style select
    expect(screen.queryByRole('button', { name: 'Modern' })).not.toBeInTheDocument(); // No default selected
    expect(screen.queryByRole('button', { name: 'Rupee (₹)' })).not.toBeInTheDocument(); // No default selected
    jest.dontMock('../../../src/theme/ThemeConfig'); // Clean up mock
  });

  it('handles globalSettings with null/undefined values gracefully', () => {
    const nullSettings = {
      themeMode: null,
      designSystem: null,
      visualStyle: null,
      currency: null,
      autoSave: null,
    };
    renderComponent(nullSettings);
    // Should render without crashing, selects might show empty or default values
    expect(screen.getByText('Settings')).toBeInTheDocument();
    // Default currency should be displayed if null
    expect(screen.getByRole('button', { name: 'Rupee (₹)' })).toBeInTheDocument();
    // autoSave: null should result in unchecked
    expect(screen.getByRole('checkbox', { name: 'Cloud Sync' })).not.toBeChecked();
  });
});