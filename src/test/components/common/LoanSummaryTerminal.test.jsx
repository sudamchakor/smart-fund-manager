import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoanSummaryTerminal from '../../../components/common/LoanSummaryTerminal';
import '@testing-library/jest-dom';

const theme = createTheme(); // Create a basic theme for ThemeProvider

/**
 * Utility to match JSDOM's computed color format
 */
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
};

describe('LoanSummaryTerminal Component', () => {
  const defaultProps = {
    monthlyEmi: 15000,
    totalInterest: 100000,
    totalPayable: 1600000,
    currency: '₹',
    title: 'Loan Summary',
    interestColor: 'primary.main',
    loading: false,
    children: <div data-testid="test-children">Test Children</div>,
  };

  // Helper function to render the component with ThemeProvider
  const renderComponent = (props) => {
    return render(
      <ThemeProvider theme={theme}>
        <LoanSummaryTerminal {...defaultProps} {...props} />
      </ThemeProvider>,
    );
  };

  // --- Positive Scenarios ---
  it('renders with default title and financial figures', () => {
    renderComponent();
    expect(screen.getByText('Loan Summary')).toBeInTheDocument();
    expect(screen.getByText('Monthly EMI')).toBeInTheDocument();
    expect(screen.getByText(/₹\s*15,000/)).toBeInTheDocument(); // Account for space
    expect(screen.getByText('Total Interest Burden')).toBeInTheDocument();
    expect(screen.getByText(/₹\s*1,00,000/)).toBeInTheDocument(); // Account for space
    expect(screen.getByText('Total Amount Payable')).toBeInTheDocument();
    expect(screen.getByText(/₹\s*16,00,000/)).toBeInTheDocument(); // Account for space
  });

  it('renders with a custom title', () => {
    renderComponent({ title: 'EMI Details' });
    expect(screen.getByText('EMI Details')).toBeInTheDocument();
    expect(screen.queryByText('Loan Summary')).not.toBeInTheDocument();
  });

  it('renders with a custom currency symbol', () => {
    renderComponent({ currency: '$' });
    expect(screen.getByText(/\$\s*15,000/)).toBeInTheDocument(); // Account for space
    expect(screen.getByText(/\$\s*1,00,000/)).toBeInTheDocument(); // Account for space
    expect(screen.getByText(/\$\s*16,00,000/)).toBeInTheDocument(); // Account for space
  });

  it('applies custom interestColor to Total Interest Burden', () => {
    renderComponent({ interestColor: 'error.main' });
    const totalInterestElement = screen.getByText(/₹\s*1,00,000/); // Account for space
    expect(totalInterestElement).toHaveStyle(`color: ${hexToRgb(theme.palette.error.main)}`);
  });

  it('renders children correctly', () => {
    renderComponent();
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
  });

  it('shows loading indicator when loading is true', () => {
    renderComponent({ loading: true });
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  // --- Negative Scenarios / Edge Cases ---
  it('handles zero values for financial figures gracefully', () => {
    renderComponent({
      monthlyEmi: 0,
      totalInterest: 0,
      totalPayable: 0,
    });
    expect(screen.getAllByText(/₹\s*0/)).toHaveLength(3); // Account for space
  });

  it('handles null/undefined values for financial figures gracefully (renders 0)', () => {
    renderComponent({
      monthlyEmi: null,
      totalInterest: undefined,
      totalPayable: null,
    });
    expect(screen.getAllByText(/₹\s*0/)).toHaveLength(3); // Account for space
  });

  it('handles empty string for title gracefully (renders empty)', () => {
    renderComponent({ title: '' });
    expect(screen.getByText('Monthly EMI')).toBeInTheDocument(); // Other elements still render
    expect(screen.queryByText('Loan Summary')).not.toBeInTheDocument();
  });

  it('does not show loading indicator when loading is false', () => {
    renderComponent({ loading: false });
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });
});
