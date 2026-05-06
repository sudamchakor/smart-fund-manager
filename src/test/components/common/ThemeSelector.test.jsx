import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ThemeSelector from '../../../components/common/ThemeSelector';
import '@testing-library/jest-dom';

// 1. Mock the theme configuration
jest.mock('../../../theme/ThemeConfig', () => ({
  themeColors: [
    {
      name: 'Default',
      value: 'default',
      colors: ['#1976d2', '#90caf9', '#e3f2fd'],
    },
    { 
      name: 'Dark', 
      value: 'dark', 
      colors: ['#212121', '#424242', '#616161'] 
    },
  ],
}));

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    divider: '#cccccc',
  },
});

/**
 * Utility to match JSDOM's computed color format
 */
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
};

describe('ThemeSelector Component', () => {
  const onThemeChangeMock = jest.fn();
  
  const defaultProps = {
    selectedTheme: 'default',
    onThemeChange: onThemeChangeMock,
    disabled: false,
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <ThemeSelector {...defaultProps} {...props} />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all theme options by their display names', () => {
    renderComponent();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('applies the correct border color to the selected theme', () => {
    renderComponent({ selectedTheme: 'dark' });

    // Target the interactive element (the CardActionArea is a button)
    const darkCard = screen.getByRole('button', { name: /dark/i }).closest('.MuiCard-root');
    const defaultCard = screen.getByRole('button', { name: /default/i }).closest('.MuiCard-root');

    // Note: If the border is on a wrapper DIV, apply the border style 
    // to the Button/ActionArea in your component style to make it testable here.
    expect(darkCard).toHaveStyle(`border-color: ${hexToRgb(theme.palette.primary.main)}`);
    expect(defaultCard).not.toHaveStyle(`border-color: ${hexToRgb(theme.palette.primary.main)}`);
  });

  it('calls onThemeChange when an option is clicked', () => {
    renderComponent();
    const darkOption = screen.getByRole('button', { name: /dark/i });
    
    fireEvent.click(darkOption);
    expect(onThemeChangeMock).toHaveBeenCalledWith('dark');
  });

  it('renders color preview boxes with correct background colors', () => {
    renderComponent();

    // Use 'within' to scope the search to the specific card button
    const defaultCard = screen.getByRole('button', { name: /default/i });
    
    // Instead of querySelector, we use getAllByTestId 
    // (Requires data-testid="color-box" in your component)
    const colorBoxes = within(defaultCard).getAllByTestId('color-box');
    
    expect(colorBoxes[0]).toHaveStyle(`background-color: ${hexToRgb('#1976d2')}`);
    expect(colorBoxes[1]).toHaveStyle(`background-color: ${hexToRgb('#90caf9')}`);
  });

  it('disables all theme options when the disabled prop is true', () => {
    renderComponent({ disabled: true });
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('does not highlight any card if selectedTheme does not match', () => {
    renderComponent({ selectedTheme: 'non-existent' });
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn.closest('.MuiCard-root')).not.toHaveStyle(`border-color: ${hexToRgb(theme.palette.primary.main)}`);
    });
  });
});