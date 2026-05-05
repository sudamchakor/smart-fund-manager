import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChartTooltip from '../../../components/common/ChartTooltip';
import '@testing-library/jest-dom';

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('ChartTooltip Component', () => {
  // Helper function to render the component with ThemeProvider
  const renderComponent = (props) => {
    return render(
      <ThemeProvider theme={theme}>
        <ChartTooltip {...props} />
      </ThemeProvider>,
    );
  };

  // --- Positive Scenarios ---
  it('renders correctly when active with payload data', () => {
    const payload = [{ name: 'Value 1', value: 100, color: 'red' }];
    renderComponent({ active: true, payload, label: '25' });

    expect(screen.getByText('AGE: 25')).toBeInTheDocument();
    expect(screen.getByText('Value 1')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('100')).toHaveStyle('color: red');
  });

  it('renders with multiple items in the payload', () => {
    const payload = [
      { name: 'Value 1', value: 100, color: 'red' },
      { name: 'Value 2', value: 200, color: 'blue' },
    ];
    renderComponent({ active: true, payload, label: '30' });

    expect(screen.getByText('AGE: 30')).toBeInTheDocument();
    expect(screen.getByText('Value 1')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Value 2')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('applies custom valueFormatter when provided', () => {
    const payload = [{ name: 'Amount', value: 12345, color: 'green' }];
    const valueFormatter = (value) => `₹${value.toLocaleString()}`;
    renderComponent({ active: true, payload, label: '40', valueFormatter });

    expect(screen.getByText('AGE: 40')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('₹12,345')).toBeInTheDocument();
  });

  // --- Negative Scenarios / Edge Cases ---
  it('does not render when active is false', () => {
    const payload = [{ name: 'Value 1', value: 100, color: 'red' }];
    renderComponent({ active: false, payload, label: '25' });

    expect(screen.queryByText('AGE: 25')).not.toBeInTheDocument();
    expect(screen.queryByText('Value 1')).not.toBeInTheDocument();
  });

  it('does not render when payload is empty', () => {
    renderComponent({ active: true, payload: [], label: '25' });

    expect(screen.queryByText('AGE: 25')).not.toBeInTheDocument(); // The whole tooltip should not render
  });

  it('does not render when payload is null', () => {
    renderComponent({ active: true, payload: null, label: '25' });

    expect(screen.queryByText('AGE: 25')).not.toBeInTheDocument();
  });

  it('does not render when payload is undefined', () => {
    renderComponent({ active: true, payload: undefined, label: '25' });

    expect(screen.queryByText('AGE: 25')).not.toBeInTheDocument();
  });

  it('handles null label gracefully', () => {
    const payload = [{ name: 'Value 1', value: 100, color: 'red' }];
    renderComponent({ active: true, payload, label: null });

    expect(screen.getByText(/AGE:/)).toBeInTheDocument(); // Label will be rendered as "AGE: null" or "AGE: "
    expect(screen.getByText('Value 1')).toBeInTheDocument();
  });

  it('handles undefined label gracefully', () => {
    const payload = [{ name: 'Value 1', value: 100, color: 'red' }];
    renderComponent({ active: true, payload, label: undefined });

    expect(screen.getByText(/AGE:/)).toBeInTheDocument(); // Label will be rendered as "AGE: undefined" or "AGE: "
    expect(screen.getByText('Value 1')).toBeInTheDocument();
  });

  it('renders raw value if valueFormatter is not provided', () => {
    const payload = [{ name: 'Raw Value', value: 54321, color: 'purple' }];
    renderComponent({
      active: true,
      payload,
      label: '50',
      valueFormatter: undefined,
    });

    expect(screen.getByText('AGE: 50')).toBeInTheDocument();
    expect(screen.getByText('Raw Value')).toBeInTheDocument();
    expect(screen.getByText('54321')).toBeInTheDocument();
  });
});
