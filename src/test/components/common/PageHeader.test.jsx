import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PageHeader from '../../../components/common/PageHeader';
import { Settings as SettingsIcon } from '@mui/icons-material'; // Example icon
import '@testing-library/jest-dom';

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('PageHeader Component', () => {
  // Helper function to render the component with ThemeProvider
  const renderComponent = (props) => {
    return render(
      <ThemeProvider theme={theme}>
        <PageHeader {...props} />
      </ThemeProvider>,
    );
  };

  // --- Positive Scenarios ---
  it('renders with a title only', () => {
    renderComponent({ title: 'Test Title' });
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('SettingsIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('action-element')).not.toBeInTheDocument();
  });

  it('renders with a title and subtitle', () => {
    renderComponent({ title: 'Test Title', subtitle: 'Test Subtitle' });
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders with a title and icon', () => {
    renderComponent({
      title: 'Test Title',
      icon: <SettingsIcon data-testid="SettingsIcon" />,
    });
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByTestId('SettingsIcon')).toBeInTheDocument();
  });

  it('renders with a title and action element', () => {
    renderComponent({
      title: 'Test Title',
      action: <button data-testid="action-element">Action</button>,
    });
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByTestId('action-element')).toBeInTheDocument();
    // Check alignment when action is present
    const stack = screen.getByText('Test Title').closest('.MuiStack-root');
    expect(stack).toHaveStyle('align-items: center');
  });

  it('renders with title, subtitle, icon, and action', () => {
    renderComponent({
      title: 'Full Title',
      subtitle: 'Full Subtitle',
      icon: <SettingsIcon data-testid="SettingsIcon" />,
      action: <span data-testid="action-element">Full Action</span>,
    });
    expect(screen.getByText('Full Title')).toBeInTheDocument();
    expect(screen.getByText('Full Subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('SettingsIcon')).toBeInTheDocument();
    expect(screen.getByTestId('action-element')).toBeInTheDocument();
  });

  // --- Negative Scenarios / Edge Cases ---
  it('renders with an empty title string', () => {
    renderComponent({ title: '' });
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(); // Empty typography element
  });

  it('renders with an empty subtitle string', () => {
    renderComponent({ title: 'Title', subtitle: '' });
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument(); // Ensure no default text
  });

  it('does not render icon if icon prop is not provided', () => {
    renderComponent({ title: 'No Icon' });
    expect(screen.queryByTestId('SettingsIcon')).not.toBeInTheDocument();
  });

  it('does not render action if action prop is not provided', () => {
    renderComponent({ title: 'No Action' });
    expect(screen.queryByTestId('action-element')).not.toBeInTheDocument();
  });
});
