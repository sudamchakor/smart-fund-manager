import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PrivacyPolicy from '../../pages/PrivacyPolicy';
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

describe('PrivacyPolicy Component', () => {
  // Helper function to render the component with ThemeProvider
  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <PrivacyPolicy />
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
    expect(screen.getByText('Data Privacy Protocol')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Information collection, usage policies, and system security measures.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-header-icon')).toBeInTheDocument(); // SecurityIcon
  });

  // --- Introduction ---
  it('renders the introductory paragraph', () => {
    renderComponent();
    expect(
      screen.getByText(
        /This Privacy Policy describes Our policies and procedures/i,
      ),
    ).toBeInTheDocument();
  });

  // --- Interpretation and Definitions Section ---
  it('renders "Interpretation and Definitions" section and its sub-sections', () => {
    renderComponent();
    expect(
      screen.getByText('Interpretation and Definitions'),
    ).toBeInTheDocument();
    expect(screen.getByText('Interpretation')).toBeInTheDocument();
    expect(
      screen.getByText(/The words of which the initial letter is capitalized/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Definitions')).toBeInTheDocument();
  });

  it('renders all definition list items', () => {
    renderComponent();
    expect(
      screen.getByText(/means a unique account created for You/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /\(referred to as either "the Company", "We", "Us" or "Our" in this Agreement\) refers to Your Website\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /are small files that are placed on Your computer/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/refers to: India/i)).toBeInTheDocument();
    expect(
      screen.getByText(/means any device that can access the Service/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /is any information that relates to an identified or identifiable individual\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/refers to the Website\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /means any natural or legal person who processes the data on behalf of the Company\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/refers to data collected automatically/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        const hasText = (node) =>
          node.textContent.includes('Website refers to') &&
          node.textContent.includes('accessible from');
        const nodeHasText = hasText(element);
        const childrenDontHaveText = Array.from(element.children).every(
          (child) => !hasText(child)
        );
        return nodeHasText && childrenDontHaveText;
      })
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(
        /means the individual accessing or using the Service/i,
      )[0],
    ).toBeInTheDocument();
  });

  it('renders the website link in definitions', () => {
    renderComponent();
    const websiteLink = screen.getByRole('link', {
      name: 'https://yourwebsite.com/',
    });
    expect(websiteLink).toBeInTheDocument();
    expect(websiteLink).toHaveAttribute('href', '#'); // Mocked to '#'
  });

  // --- Collecting and Using Your Personal Data Section ---
  it('renders "Collecting and Using Your Personal Data" section and its sub-sections', () => {
    renderComponent();
    expect(
      screen.getByText('Collecting and Using Your Personal Data'),
    ).toBeInTheDocument();
    expect(screen.getByText('Types of Data Collected')).toBeInTheDocument();
    expect(screen.getAllByText('Personal Data')[0]).toBeInTheDocument();
    expect(
      screen.getByText(
        /While using Our Service, We may ask You to provide Us/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Usage Data')[0]).toBeInTheDocument();
    expect(
      screen.getByText(
        /Usage Data is collected automatically when using the Service./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tracking Technologies and Cookies'),
    ).toBeInTheDocument();
  });

  it('renders all personal data list items', () => {
    renderComponent();
    expect(screen.getByText('Email address')).toBeInTheDocument();
    expect(screen.getByText('First name and last name')).toBeInTheDocument();
    expect(screen.getByText('Phone number')).toBeInTheDocument();
    expect(
      screen.getByText('Address, State, Province, ZIP/Postal code, City'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Usage Data')[0]).toBeInTheDocument();
  });

  it('renders all tracking technologies list items', () => {
    renderComponent();
    expect(screen.getByText('Cookies or Browser Cookies.')).toBeInTheDocument();
    expect(screen.getByText('Flash Cookies.')).toBeInTheDocument();
    expect(screen.getAllByText('Usage Data')[0]).toBeInTheDocument();
  });

  // --- Disclosure of Your Personal Data Section ---
  it('renders "Disclosure of Your Personal Data" section and its sub-sections', () => {
    renderComponent();
    expect(
      screen.getByText('Disclosure of Your Personal Data'),
    ).toBeInTheDocument();
    expect(screen.getByText('Business Transactions')).toBeInTheDocument();
    expect(
      screen.getByText(
        /If the Company is involved in a merger, acquisition or asset sale/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Law enforcement')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Under certain circumstances, the Company may be required to disclose Your Personal Data/i,
      ),
    ).toBeInTheDocument();
  });

  // --- Security of Your Personal Data Section ---
  it('renders "Security of Your Personal Data" section', () => {
    renderComponent();
    expect(
      screen.getByText('Security of Your Personal Data'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The security of Your Personal Data is important to Us/i,
      ),
    ).toBeInTheDocument();
  });

  // --- Contact Us Section ---
  it('renders "Contact Us" section and its details', () => {
    renderComponent();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(
      screen.getByText(
        /If you have any questions regarding this security protocol/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('By email:')).toBeInTheDocument();
    expect(screen.getByText('support@yourwebsite.com')).toBeInTheDocument();
    expect(
      screen.getByText('By visiting this page on our website:'),
    ).toBeInTheDocument();
    const contactLink = screen.getByRole('link', {
      name: 'https://yourwebsite.com/contact',
    });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '#'); // Mocked to '#'
  });
});
