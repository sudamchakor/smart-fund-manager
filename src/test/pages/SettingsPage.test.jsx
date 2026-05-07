import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as reactRedux from 'react-redux';
import SettingsPage from '../../pages/SettingsPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  setThemeMode,
  setDesignSystem,
  setVisualStyle,
  setCurrency,
  setAutoSave,
} from '../../store/emiSlice';

// Mock the Redux hooks
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock the Redux actions
jest.mock('../store/emiSlice', () => ({
  setThemeMode: jest.fn((payload) => ({ type: 'setThemeMode', payload })),
  setDesignSystem: jest.fn((payload) => ({ type: 'setDesignSystem', payload })),
  setVisualStyle: jest.fn((payload) => ({ type: 'setVisualStyle', payload })),
  setCurrency: jest.fn((payload) => ({ type: 'setCurrency', payload })),
  setAutoSave: jest.fn((payload) => ({ type: 'setAutoSave', payload })),
}));

// Mock theme configurations to ensure stable test environment
jest.mock('../theme/ThemeConfig', () => ({
  themePresets: {
    custom: { name: 'Custom Style', arch: 'custom', style: 'custom' },
    preset1: { name: 'Modern Preset', arch: 'arch1', style: 'style1' },
  },
}));

// Mock internal sub-components to isolate the SettingsPage logic
jest.mock('../components/common/ThemeSelector', () => () => (
  <div data-testid="theme-selector">Theme Selector Mock</div>
));
jest.mock('../components/common/PageHeader', () => ({ title }) => (
  <div data-testid="page-header">{title}</div>
));

describe('SettingsPage Component', () => {
  let mockDispatch;
  let initialEmiState;

  beforeEach(() => {
    mockDispatch = jest.fn();
    reactRedux.useDispatch.mockReturnValue(mockDispatch);

    initialEmiState = {
      themeMode: 'light',
      designSystem: 'custom',
      visualStyle: 'custom',
      currency: '₹',
      autoSave: false,
    };

    reactRedux.useSelector.mockImplementation((selector) =>
      selector({ emi: initialEmiState })
    );

    jest.clearAllMocks();
  });

  const renderWithTheme = () => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <SettingsPage />
      </ThemeProvider>
    );
  };

  test('renders all settings sections and header correctly', () => {
    renderWithTheme();
    
    expect(screen.getByTestId('page-header')).toHaveTextContent('Settings');
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Layout Style')).toBeInTheDocument();
    expect(screen.getByText('Color Theme')).toBeInTheDocument();
    expect(screen.getByText('Currency')).toBeInTheDocument();
    expect(screen.getByText('Cloud Sync')).toBeInTheDocument();
  });

  test('dispatches setDesignSystem and setVisualStyle on layout style change', () => {
    renderWithTheme();
    
    const comboboxes = screen.getAllByRole('combobox');
    // The first combobox should be Layout Style
    fireEvent.mouseDown(comboboxes[0]);
    fireEvent.click(screen.getByText('Modern Preset'));

    expect(mockDispatch).toHaveBeenCalledWith(setDesignSystem('arch1'));
    expect(mockDispatch).toHaveBeenCalledWith(setVisualStyle('style1'));
  });

  test('dispatches setCurrency on currency select change', () => {
    renderWithTheme();
    
    const comboboxes = screen.getAllByRole('combobox');
    // The second combobox should be Currency
    fireEvent.mouseDown(comboboxes[1]);
    fireEvent.click(screen.getByText('Dollar ($)'));

    expect(mockDispatch).toHaveBeenCalledWith(setCurrency('$'));
  });

  test('dispatches setAutoSave on cloud sync switch toggle', () => {
    renderWithTheme();
    
    const cloudSyncSwitch = screen.getByRole('checkbox');
    fireEvent.click(cloudSyncSwitch);
    
    expect(mockDispatch).toHaveBeenCalledWith(setAutoSave(true));
  });

  test('displays unsaved preview bar and handles discard action', () => {
    const { rerender } = renderWithTheme();

    // Simulate the Redux state updating due to user interaction (makes it dirty)
    reactRedux.useSelector.mockImplementation((selector) =>
      selector({ emi: { ...initialEmiState, currency: '$' } })
    );

    rerender(
      <ThemeProvider theme={createTheme()}>
        <SettingsPage />
      </ThemeProvider>
    );

    // The action bar should now reveal itself
    const discardBtn = screen.getByText('Discard');
    expect(discardBtn).toBeInTheDocument();
    
    // Click Discard
    fireEvent.click(discardBtn);
    
    // Should revert back to the original state references
    expect(mockDispatch).toHaveBeenCalledWith(setThemeMode('light'));
    expect(mockDispatch).toHaveBeenCalledWith(setDesignSystem('custom'));
    expect(mockDispatch).toHaveBeenCalledWith(setVisualStyle('custom'));
  });

  test('dispatches original settings on unmount if changes were not saved', () => {
    const { unmount } = renderWithTheme();
    unmount();
    
    expect(mockDispatch).toHaveBeenCalledWith(setThemeMode('light'));
    expect(mockDispatch).toHaveBeenCalledWith(setCurrency('₹'));
  });
});