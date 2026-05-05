import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import SectionHeader from '../../../components/common/SectionHeader';
import { Settings as SettingsIcon } from '@mui/icons-material'; // Example icon
import '@testing-library/jest-dom';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    text: { primary: '#000000', secondary: '#555555' },
    divider: '#cccccc',
  },
});

describe('SectionHeader Component', () => {
  // Helper function to render the component with ThemeProvider
  const renderComponent = (props) => {
    return render(
      <ThemeProvider theme={theme}>
        <SectionHeader {...props} />
      </ThemeProvider>,
    );
  };

  // --- Positive Scenarios ---
  it('renders with a title only', () => {
    renderComponent({ title: 'Test Section Header' });
    expect(screen.getByText('Test Section Header')).toBeInTheDocument();
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('SettingsIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('action-element')).not.toBeInTheDocument();
  });

  it('renders with a title and subtitle', () => {
    renderComponent({
      title: 'Test Section Header',
      subtitle: 'Test Subtitle',
    });
    expect(screen.getByText('Test Section Header')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders with a title and icon', () => {
    renderComponent({
      title: 'Test Section Header',
      icon: <SettingsIcon data-testid="SettingsIcon" />,
    });
    expect(screen.getByText('Test Section Header')).toBeInTheDocument();
    expect(screen.getByTestId('SettingsIcon')).toBeInTheDocument();
    // Check default icon color (primary)
    const iconWrapper = screen
      .getByTestId('SettingsIcon')
      .closest('.MuiBox-root');
    expect(iconWrapper).toHaveStyle(
      `background-color: ${alpha(theme.palette.primary.main, 0.1)}`,
    );
    expect(iconWrapper).toHaveStyle(`color: ${theme.palette.primary.main}`);
  });

  it('renders with a title, icon, and custom color', () => {
    renderComponent({
      title: 'Test Section Header',
      icon: <SettingsIcon data-testid="SettingsIcon" />,
      color: 'secondary',
    });
    expect(screen.getByText('Test Section Header')).toBeInTheDocument();
    expect(screen.getByTestId('SettingsIcon')).toBeInTheDocument();
    // Check custom icon color (secondary)
    const iconWrapper = screen
      .getByTestId('SettingsIcon')
      .closest('.MuiBox-root');
    expect(iconWrapper).toHaveStyle(
      `background-color: ${alpha(theme.palette.secondary.main, 0.1)}`,
    );
    expect(iconWrapper).toHaveStyle(`color: ${theme.palette.secondary.main}`);
  });

  it('renders with a title and action element', () => {
    renderComponent({
      title: 'Test Section Header',
      action: <button data-testid="action-element">Action</button>,
    });
    expect(screen.getByText('Test Section Header')).toBeInTheDocument();
    expect(screen.getByTestId('action-element')).toBeInTheDocument();
  });

  it('renders with title, subtitle, icon, and action', () => {
    renderComponent({
      title: 'Full Section Header',
      subtitle: 'Comprehensive Test',
      icon: <SettingsIcon data-testid="SettingsIcon" />,
      color: 'primary',
      action: <span data-testid="action-element">Full Action</span>,
    });
    expect(screen.getByText('Full Section Header')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive Test')).toBeInTheDocument();
    expect(screen.getByTestId('SettingsIcon')).toBeInTheDocument();
    expect(screen.getByTestId('action-element')).toBeInTheDocument();
  });

  // --- Negative Scenarios / Edge Cases ---
  it('renders with an empty title string', () => {
    renderComponent({ title: '' });
    expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument(); // Empty typography element
  });

  it('renders with an empty subtitle string', () => {
    renderComponent({ title: 'Title', subtitle: '' });
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument(); // Ensure no default text
  });

  it('does not render icon box if icon prop is not provided', () => {
    renderComponent({ title: 'No Icon' });
    expect(screen.queryByTestId('SettingsIcon')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument(); // No SVG icon
  });

  it('does not render action box if action prop is not provided', () => {
    renderComponent({ title: 'No Action' });
    expect(screen.queryByTestId('action-element')).not.toBeInTheDocument();
  });

  it('aligns items to center when no subtitle is provided', () => {
    renderComponent({ title: 'No Subtitle' });
    const stack = screen.getByText('No Subtitle').closest('.MuiStack-root');
    expect(stack).toHaveStyle('align-items: center');
  });

  it('aligns items to flex-start when subtitle is provided', () => {
    renderComponent({ title: 'With Subtitle', subtitle: 'Subtitle' });
    const stack = screen.getByText('With Subtitle').closest('.MuiStack-root');
    expect(stack).toHaveStyle('align-items: flex-start');
  });
});
