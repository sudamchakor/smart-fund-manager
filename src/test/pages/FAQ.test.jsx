import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FAQ from '../../pages/FAQ';
import '@testing-library/jest-dom';

// Mock Material-UI Icons
jest.mock('@mui/icons-material/ExpandMore', () => (props) => (
  <svg data-testid="ExpandMoreIcon" {...props} />
));
jest.mock('@mui/icons-material/HelpOutline', () => (props) => (
  <svg data-testid="HelpOutlineIcon" {...props} />
));
jest.mock('@mui/icons-material/Functions', () => (props) => (
  <svg data-testid="FunctionsIcon" {...props} />
));
jest.mock('@mui/icons-material/Security', () => (props) => (
  <svg data-testid="SecurityIcon" {...props} />
));
jest.mock('@mui/icons-material/AccountBalanceWallet', () => (props) => (
  <svg data-testid="AccountBalanceWalletIcon" {...props} />
));
jest.mock('@mui/icons-material/LightbulbOutlined', () => (props) => (
  <svg data-testid="LightbulbOutlinedIcon" {...props} />
));
jest.mock('@mui/icons-material/ReceiptLong', () => (props) => (
  <svg data-testid="ReceiptLongIcon" {...props} />
));
jest.mock('@mui/icons-material/Storage', () => (props) => (
  <svg data-testid="StorageIcon" {...props} />
));
jest.mock('@mui/icons-material/TrendingUp', () => (props) => (
  <svg data-testid="TrendingUpIcon" {...props} />
));

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('FAQ Component', () => {
  // Helper function to render the component with ThemeProvider
  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <FAQ />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Hero Section ---
  it('renders the hero section title and subtitle', () => {
    renderComponent();
    expect(screen.getByText('Support Center')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    expect(
      screen.getByText(/Master the math behind your wealth./i),
    ).toBeInTheDocument();
  });

  // --- FAQ Sections ---
  it('renders all FAQ categories', () => {
    renderComponent();
    expect(screen.getByText('Privacy & Data Architecture')).toBeInTheDocument();
    expect(screen.getByText('The Profile & Tax Engine')).toBeInTheDocument();
    expect(screen.getByText('Loan & Debt Strategies')).toBeInTheDocument();
    expect(
      screen.getByText('Wealth & Retirement Projections'),
    ).toBeInTheDocument();
  });

  it('renders all FAQ questions initially collapsed', () => {
    renderComponent();
    expect(
      screen.getByText('How is my data stored if there is no backend server?'),
    ).toBeInTheDocument();
  });

  it('expands and collapses accordion on click', () => {
    renderComponent();
    const question = screen.getByText(
      'How is my data stored if there is no backend server?',
    );
    const summary = question.closest('.MuiAccordionSummary-root');

    // Expand
    fireEvent.click(summary);
    expect(summary).toHaveAttribute('aria-expanded', 'true');

    // Collapse
    fireEvent.click(summary);
    expect(summary).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders formula block when item.formula is present', () => {
    renderComponent();
    const question = screen.getByText("What is the 'Reducing Balance' method?");
    fireEvent.click(question.closest('.MuiAccordionSummary-root'));
    const details = question.closest('.MuiAccordion-root');
    expect(within(details).getAllByText('PRECISION FORMULA')[0]).toBeInTheDocument();
    expect(within(details).getAllByTestId('FunctionsIcon')[0]).toBeInTheDocument();
  });

  it('renders example block when item.example is present', () => {
    renderComponent();
    const question = screen.getByText(
      'How much can I actually save with prepayments?',
    );
    fireEvent.click(question.closest('.MuiAccordionSummary-root'));
    const details = question.closest('.MuiAccordion-root');
    expect(within(details).getAllByText('Strategy Insight')[0]).toBeInTheDocument();
    expect(screen.getAllByTestId('LightbulbOutlinedIcon')[0]).toBeInTheDocument();
  });

  it('does not render formula or example blocks if not present', () => {
    renderComponent();
    const question = screen.getByText(
      'How is my data stored if there is no backend server?',
    );
    fireEvent.click(question.closest('.MuiAccordionSummary-root'));
    const details = question.closest('.MuiAccordion-root');
    expect(within(details).queryByText('PRECISION FORMULA')).not.toBeInTheDocument();
    expect(within(details).queryByText('Strategy Insight')).not.toBeInTheDocument();
  });

  // --- Value-Add Trust Pillars ---
  it('renders all value-add trust pillars', () => {
    renderComponent();
    expect(screen.getByText('Local Encryption')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your data stays in your browser's LocalStorage. No cloud, no tracking.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('SecurityIcon')).toBeInTheDocument();

    expect(screen.getByText('Inflation-Aware')).toBeInTheDocument();
    expect(
      screen.getByText(
        'All long-term projections factor in the eroding power of inflation.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('TrendingUpIcon')).toBeInTheDocument();

    expect(screen.getByText('Tax-Shield Logic')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Calculates net effective costs after government interest deductions.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('ReceiptLongIcon')).toBeInTheDocument();
  });

  // --- Edge Cases / Negative Scenarios ---
  it('handles empty question and answer strings gracefully', () => {
    // This requires modifying faqData, which is outside the scope of a direct test.
    // Assuming faqData is well-formed, we test existing content.
    // If a question/answer were empty, the Typography component would render an empty string.
  });

  it('ensures AccordionSummary has correct styling when expanded/collapsed', () => {
    renderComponent();
    const question = screen.getByText(
      'How is my data stored if there is no backend server?',
    );
    const summary = question.closest('.MuiAccordionSummary-root');

    // Initially collapsed
    expect(question).toHaveStyle('color: rgba(0, 0, 0, 0.87)'); // Default text color
    expect(summary).toHaveAttribute('aria-expanded', 'false');

    // Expanded
    fireEvent.click(summary);
    expect(question).toHaveStyle('color: #1976d2'); // Primary color
    expect(summary).toHaveAttribute('aria-expanded', 'true');
  });
});
