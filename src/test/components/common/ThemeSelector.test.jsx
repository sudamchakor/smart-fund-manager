import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import ThemeSelector from '../../../components/common/ThemeSelector';
import '@testing-library/jest-dom';

// Mock the themeColors import
jest.mock('../../../theme/ThemeConfig', () => ({
  themeColors: [
    {
      name: 'Default',
      value: 'default',
      colors: ['#1976d2', '#90caf9', '#e3f2fd'],
    },
    { name: 'Dark', value: 'dark', colors: ['#212121', '#424242', '#616161'] },
    {
      name: 'Custom',
      value: 'custom',
      colors: ['#ff0000', '#00ff00', '#0000ff'],
    },
  ],
}));

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    divider: '#cccccc',
    background: { paper: '#ffffff' },
  },
});

describe('ThemeSelector Component', () => {
  const defaultProps = {
    selectedTheme: 'default',
    onThemeChange: jest.fn(),
    disabled: false,
  };

  // Helper function to render the component with ThemeProvider
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

  // --- Positive Scenarios ---
  it('renders all theme options from themeColors', () => {
    renderComponent();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('highlights the selected theme option', () => {
    renderComponent({ selectedTheme: 'dark' });
    const defaultCard = screen.getByText('Default').closest('.MuiCard-root');
    const darkCard = screen.getByText('Dark').closest('.MuiCard-root');
    const customCard = screen.getByText('Custom').closest('.MuiCard-root');

    expect(defaultCard).toHaveStyle(
      `border-color: ${alpha(theme.palette.divider, 0.2)}`,
    );
    expect(darkCard).toHaveStyle(`border-color: ${theme.palette.primary.main}`);
    expect(customCard).toHaveStyle(
      `border-color: ${alpha(theme.palette.divider, 0.2)}`,
    );
  });

  it('calls onThemeChange with the correct value when a theme is selected', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Dark'));
    expect(defaultProps.onThemeChange).toHaveBeenCalledWith('dark');
  });

  it('renders color boxes for each theme option', () => {
    renderComponent();
    const defaultCard = screen.getByText('Default').closest('.MuiCard-root');
    expect(defaultCard.querySelectorAll('.MuiBox-root')[0]).toHaveStyle(
      'background-color: #1976d2',
    );
    expect(defaultCard.querySelectorAll('.MuiBox-root')[1]).toHaveStyle(
      'background-color: #90caf9',
    );
  });

  // --- Negative Scenarios / Edge Cases ---
  it('does not call onThemeChange when a theme is clicked and the component is disabled', () => {
    renderComponent({ disabled: true });
    fireEvent.click(screen.getByText('Dark'));
    expect(defaultProps.onThemeChange).not.toHaveBeenCalled();
  });

  it('handles an empty themeColors array gracefully', () => {
    jest.doMock('../../../theme/ThemeConfig', () => ({
      themeColors: [],
    }));
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ThemeSelector {...defaultProps} />
      </ThemeProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('handles selectedTheme not matching any option', () => {
    renderComponent({ selectedTheme: 'nonexistent' });
    const defaultCard = screen.getByText('Default').closest('.MuiCard-root');
    expect(defaultCard).toHaveStyle(
      `border-color: ${alpha(theme.palette.divider, 0.2)}`,
    );
    // No card should be highlighted with primary color
    expect(
      screen.queryByText('Default').closest('.MuiCard-root'),
    ).not.toHaveStyle(`border-color: ${theme.palette.primary.main}`);
    expect(screen.queryByText('Dark').closest('.MuiCard-root')).not.toHaveStyle(
      `border-color: ${theme.palette.primary.main}`,
    );
    expect(
      screen.queryByText('Custom').closest('.MuiCard-root'),
    ).not.toHaveStyle(`border-color: ${theme.palette.primary.main}`);
  });

  it('renders with disabled styling when disabled prop is true', () => {
    renderComponent({ disabled: true });
    const defaultCardActionArea = screen
      .getByText('Default')
      .closest('.MuiCardActionArea-root');
    expect(defaultCardActionArea).toBeDisabled();
  });
});
