import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PageHeader from '../../../components/common/PageHeader';
import SettingsIcon from '@mui/icons-material/Settings'; // Example icon
import '@testing-library/jest-dom';

const theme = createTheme();

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
  it('renders with a title and icon', () => {
    renderComponent({
      title: 'Dashboard',
      icon: SettingsIcon, // FIX: Pass the component type, not a JSX element
    });
    expect(screen.getByRole('heading', { name: 'Dashboard', level: 5 })).toBeInTheDocument();
    expect(screen.getByTestId('page-header-icon')).toBeInTheDocument();
  });

  it('renders with title, subtitle, icon, and action', () => {
    const mockAction = <button>Click Me</button>;
    renderComponent({
      title: 'Profile',
      subtitle: 'User Settings',
      icon: SettingsIcon, // FIX: Pass the component type, not a JSX element
      action: mockAction,
    });
    expect(screen.getByRole('heading', { name: 'Profile', level: 5 })).toBeInTheDocument();
    expect(screen.getByText('User Settings')).toBeInTheDocument();
    expect(screen.getByTestId('page-header-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('renders with an empty title string', () => {
    renderComponent({ title: '' });
    // FIX: Change level from 1 to 5 to match the h5 element rendered by Typography
    // Also, assert that the heading element is present but empty.
    const emptyHeading = screen.getByRole('heading', { level: 5 });
    expect(emptyHeading).toBeInTheDocument();
    expect(emptyHeading).toHaveTextContent(''); // Check text content instead
  });

  it('renders with an empty subtitle string', () => {
    renderComponent({ title: 'Main Title', subtitle: '' });
    expect(screen.getByRole('heading', { name: 'Main Title', level: 5 })).toBeInTheDocument();
    // Assert that no subtitle text is present, assuming it's conditionally rendered.
    expect(screen.queryByText('', { selector: 'h6' })).not.toBeInTheDocument();
  });

  it('renders without an icon when icon prop is not provided', () => {
    renderComponent({ title: 'No Icon Title' });
    expect(screen.getByRole('heading', { name: 'No Icon Title', level: 5 })).toBeInTheDocument();
    expect(screen.queryByTestId('page-header-icon')).not.toBeInTheDocument();
  });

  it('renders without an action when action prop is not provided', () => {
    renderComponent({ title: 'No Action Title' });
    expect(screen.getByRole('heading', { name: 'No Action Title', level: 5 })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Click Me' })).not.toBeInTheDocument();
  });
});