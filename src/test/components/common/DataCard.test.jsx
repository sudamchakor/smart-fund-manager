import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import DataCard from '../../../components/common/DataCard';
import { AcUnit as AcUnitIcon } from '@mui/icons-material'; // Example icon
import '@testing-library/jest-dom';

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('DataCard Component', () => {
  // Helper function to render the component with ThemeProvider
  const renderComponent = (props) => {
    return render(
      <ThemeProvider theme={theme}>
        <DataCard {...props} />
      </ThemeProvider>,
    );
  };

  // --- Positive Scenarios ---
  it('renders with a title and children', () => {
    renderComponent({
      title: 'Test Title',
      children: <div data-testid="child-content">Some content</div>,
    });
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders with an icon and applies colorToken styling', () => {
    const customColor = '#FF0000'; // Red
    renderComponent({
      title: 'Icon Card',
      icon: <AcUnitIcon data-testid="test-icon" />,
      colorToken: customColor,
      children: <div>Content</div>,
    });

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    const iconWrapper = screen.getByTestId('test-icon').closest('div');
    expect(iconWrapper).toHaveStyle(
      `background-color: ${alpha(customColor, 0.1)}`,
    );
    expect(iconWrapper).toHaveStyle(`color: ${customColor}`);
  });

  it('applies default primary color if colorToken is not provided', () => {
    renderComponent({
      title: 'Default Color Card',
      icon: <AcUnitIcon data-testid="test-icon" />,
      children: <div>Content</div>,
    });

    const iconWrapper = screen.getByTestId('test-icon').closest('div');
    expect(iconWrapper).toHaveStyle(
      `background-color: ${alpha(theme.palette.primary.main, 0.1)}`,
    );
    expect(iconWrapper).toHaveStyle(`color: ${theme.palette.primary.main}`);
  });

  it('applies default primary color if colorToken is "primary.main"', () => {
    renderComponent({
      title: 'Primary Color Card',
      icon: <AcUnitIcon data-testid="test-icon" />,
      colorToken: 'primary.main',
      children: <div>Content</div>,
    });

    const iconWrapper = screen.getByTestId('test-icon').closest('div');
    expect(iconWrapper).toHaveStyle(
      `background-color: ${alpha(theme.palette.primary.main, 0.1)}`,
    );
    expect(iconWrapper).toHaveStyle(`color: ${theme.palette.primary.main}`);
  });

  it('applies custom sx prop styles', () => {
    renderComponent({
      title: 'Custom Style Card',
      children: <div>Content</div>,
      sx: { backgroundColor: 'blue', border: '2px solid green' },
    });

    const card = screen.getByTestId('data-card-root'); // Use the new data-testid
    expect(card).toHaveStyle('background-color: blue');
    expect(card).toHaveStyle('border: 2px solid green');
  });

  // --- Negative Scenarios / Edge Cases ---
  it('renders correctly when no title is provided', () => {
    renderComponent({
      children: (
        <div data-testid="child-content">Some content without title</div>
      ),
    });
    expect(screen.queryByRole('heading')).not.toBeInTheDocument(); // No title heading
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders correctly when no icon is provided', () => {
    renderComponent({
      title: 'No Icon Card',
      children: <div>Content</div>,
    });
    expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    expect(screen.getByText('No Icon Card')).toBeInTheDocument();
  });

  it('renders correctly when no children are provided', () => {
    renderComponent({
      title: 'Empty Card',
    });
    expect(screen.getByText('Empty Card')).toBeInTheDocument();
    // No specific child content to assert, but the component should not crash
  });

  it('renders with empty props (minimal rendering)', () => {
    renderComponent({});
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    // Should render the basic Box structure
    const card = screen.getByTestId('data-card-root'); // Use the new data-testid
    expect(card).toBeInTheDocument();
  });
});
