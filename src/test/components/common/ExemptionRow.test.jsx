import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ExemptionRow from '../../../components/common/ExemptionRow';
import '@testing-library/jest-dom';

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('ExemptionRow Component', () => {
  // Helper function to render the component with ThemeProvider
  const renderComponent = (props) => {
    return render(
      <ThemeProvider theme={theme}>
        <ExemptionRow {...props} />
      </ThemeProvider>
    );
  };

  // --- Positive Scenarios ---
  it('renders with label, produced content, and limited value', () => {
    renderComponent({
      label: 'Test Exemption',
      produced: <span data-testid="produced-value">5000</span>,
      limited: 4000,
    });
    expect(screen.getByText('Test Exemption')).toBeInTheDocument();
    expect(screen.getByTestId('produced-value')).toHaveTextContent('5000');
    expect(screen.getByText('₹4,000')).toBeInTheDocument();
  });

  it('renders with a tooltip when provided', () => {
    renderComponent({
      label: 'Tooltip Exemption',
      produced: <span data-testid="produced-value">1000</span>,
      limited: 1000,
      tooltip: 'This is a helpful tooltip.',
    });
    expect(screen.getByText('Tooltip Exemption')).toBeInTheDocument();
    expect(screen.getByTestId('InfoOutlinedIcon')).toBeInTheDocument();
    fireEvent.mouseOver(screen.getByTestId('InfoOutlinedIcon'));
    expect(screen.getByRole('tooltip')).toHaveTextContent('This is a helpful tooltip.');
  });

  // --- Negative Scenarios / Edge Cases ---
  it('does not render tooltip icon when tooltip is not provided', () => {
    renderComponent({
      label: 'No Tooltip',
      produced: <span data-testid="produced-value">100</span>,
      limited: 100,
      tooltip: null,
    });
    expect(screen.queryByTestId('InfoOutlinedIcon')).not.toBeInTheDocument();
  });

  it('renders with empty label, produced content, and zero limited value', () => {
    renderComponent({
      label: '',
      produced: <span data-testid="produced-value"></span>,
      limited: 0,
    });
    expect(screen.getByText('')).toBeInTheDocument(); // Empty label
    expect(screen.getByTestId('produced-value')).toBeEmptyDOMElement();
    expect(screen.getByText('₹0')).toBeInTheDocument();
  });

  it('handles null/undefined values for produced and limited gracefully', () => {
    renderComponent({
      label: 'Null Values',
      produced: null,
      limited: null,
    });
    expect(screen.getByText('Null Values')).toBeInTheDocument();
    expect(screen.getByText('₹0')).toBeInTheDocument(); // Math.round(null) is 0
  });

  it('handles non-numeric limited value gracefully', () => {
    renderComponent({
      label: 'Invalid Limited',
      produced: <span data-testid="produced-value">100</span>,
      limited: 'abc',
    });
    expect(screen.getByText('Invalid Limited')).toBeInTheDocument();
    expect(screen.getByText('₹NaN')).toBeInTheDocument(); // Math.round('abc') is NaN
  });

  it('renders produced content as a string if not a React element', () => {
    renderComponent({
      label: 'String Produced',
      produced: 'Some string value',
      limited: 1000,
    });
    expect(screen.getByText('Some string value')).toBeInTheDocument();
  });
});