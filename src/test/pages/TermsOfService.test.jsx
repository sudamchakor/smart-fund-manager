import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TermsOfService from '../../pages/TermsOfService';
import '@testing-library/jest-dom';

// Mock child components
jest.mock(
  '../../components/common/PageHeader',
  () =>
    ({ title, subtitle, icon: Icon }) => (
      <div data-testid="mock-page-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {Icon && <Icon data-testid="mock-header-icon" />}
      </div>
    ),
);

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('TermsOfService Component', () => {
  // Helper function to render the component with ThemeProvider
  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <TermsOfService />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- PageHeader ---
  it('renders PageHeader with correct title, subtitle, and icon', () => {
    renderComponent();
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Operational guidelines and legal agreements for system usage.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-header-icon')).toBeInTheDocument(); // GavelIcon
  });

  // --- Section 1: System Introduction ---
  it('renders "1. System Introduction" section', () => {
    renderComponent();
    expect(screen.getByText('1. System Introduction')).toBeInTheDocument();
    expect(
      screen.getByText(/These Terms of Service/i, { exact: false }),
    ).toBeInTheDocument();
  });

  // --- Section 2: Permitted System Usage ---
  it('renders "2. Permitted System Usage" section', () => {
    renderComponent();
    expect(screen.getByText('2. Permitted System Usage')).toBeInTheDocument();
    expect(
      screen.getByText(/SmartFund Manager provides precision algorithms/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not constitute certified financial advice/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /You agree not to use the platform for any unlawful purpose/i,
      ),
    ).toBeInTheDocument();
  });

  // --- Section 3: Mathematical Accuracy & Liability ---
  it('renders "3. Mathematical Accuracy & Liability" section', () => {
    renderComponent();
    expect(
      screen.getByText('3. Mathematical Accuracy & Liability'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /While our calculation engines are designed to provide accurate/i,
      ),
    ).toBeInTheDocument();
  });

  // --- Section 4: Intellectual Property ---
  it('renders "4. Intellectual Property" section', () => {
    renderComponent();
    expect(screen.getByText('4. Intellectual Property')).toBeInTheDocument();
    expect(
      screen.getByText(/All algorithms, codebase, UI\/UX designs, trademarks/i),
    ).toBeInTheDocument();
  });

  // --- Section 5: Limitation of Liability ---
  it('renders "5. Limitation of Liability" section', () => {
    renderComponent();
    expect(screen.getByText('5. Limitation of Liability')).toBeInTheDocument();
    expect(
      screen.getByText(/To the fullest extent permitted by applicable law/i),
    ).toBeInTheDocument();
  });

  // --- Section 6: Protocol Revisions ---
  it('renders "6. Protocol Revisions" section', () => {
    renderComponent();
    expect(screen.getByText('6. Protocol Revisions')).toBeInTheDocument();
    expect(
      screen.getByText(
        /We reserve the right to modify or replace these Terms/i,
      ),
    ).toBeInTheDocument();
  });

  // --- Section 7: Governing Law ---
  it('renders "7. Governing Law" section', () => {
    renderComponent();
    expect(screen.getByText('7. Governing Law')).toBeInTheDocument();
    expect(
      screen.getByText(
        /These Terms shall be governed and construed in accordance/i,
      ),
    ).toBeInTheDocument();
  });

  // --- Section 8: Contact & Support ---
  it('renders "8. Contact & Support" section', () => {
    renderComponent();
    expect(screen.getByText('8. Contact & Support')).toBeInTheDocument();
    expect(
      screen.getByText(
        /If you require clarification on any of the terms outlined above/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('support@smartfundmanager.com'),
    ).toBeInTheDocument();
  });
});
