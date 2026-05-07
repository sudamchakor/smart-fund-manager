import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ContactUs from '../../pages/ContactUs';
import '@testing-library/jest-dom';

// Mock Material-UI Icons
jest.mock('@mui/icons-material/SupportAgent', () => (props) => (
  <svg data-testid="SupportIcon" {...props} />
));
jest.mock('@mui/icons-material/Send', () => (props) => (
  <svg data-testid="SendIcon" {...props} />
));
jest.mock('@mui/icons-material/EmailOutlined', () => (props) => (
  <svg data-testid="EmailIcon" {...props} />
));
jest.mock('@mui/icons-material/LocationOnOutlined', () => (props) => (
  <svg data-testid="LocationIcon" {...props} />
));
jest.mock('@mui/icons-material/PhoneOutlined', () => (props) => (
  <svg data-testid="PhoneIcon" {...props} />
));
jest.mock('@mui/icons-material/AccessTimeOutlined', () => (props) => (
  <svg data-testid="TimeIcon" {...props} />
));

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('ContactUs Component', () => {
  // Store original window.location.href and restore after tests
  const originalWindowLocation = window.location;

  // Helper function to render the component with ThemeProvider
  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <ContactUs />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location.href for mailto link testing
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalWindowLocation,
    });
  });

  // --- Header Section ---
  it('renders the header section with title and description', () => {
    renderComponent();
    expect(screen.getByText('Support Channels')).toBeInTheDocument();
    expect(screen.getByText('Transmission Payload *')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Establish a direct connection with the SmartFund Manager/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('SupportIcon')).toBeInTheDocument();
  });

  // --- Transmission Form (Left Column) ---
  it('renders the transmission form fields', () => {
    renderComponent();
    expect(screen.getByText('Initialize Transmission')).toBeInTheDocument();
    const textboxes = screen.getAllByRole('textbox');
    expect(textboxes.length).toBeGreaterThanOrEqual(4);
    expect(
      screen.getByRole('button', { name: 'Execute Transmission' }),
    ).toBeInTheDocument();
  });

  it('updates form data on input change', () => {
    renderComponent();
    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { value: 'John Doe' } });
    fireEvent.change(textboxes[1], { target: { value: 'john@example.com' } });
    fireEvent.change(textboxes[2], { target: { value: 'Test Subject' } });
    fireEvent.change(textboxes[3], { target: { value: 'Hello World' } });

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Subject')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello World')).toBeInTheDocument();
  });

  it('disables "Execute Transmission" button when required fields are empty', () => {
    renderComponent();
    const submitButton = screen.getByRole('button', {
      name: 'Execute Transmission',
    });
    expect(submitButton).toBeDisabled();

    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { value: 'John Doe' } });
    fireEvent.change(textboxes[1], { target: { value: 'john@example.com' } });
    fireEvent.change(textboxes[3], { target: { value: 'Hello World' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('constructs and navigates to mailto link with all fields filled', () => {
    renderComponent();
    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { value: 'John Doe' } });
    fireEvent.change(textboxes[1], { target: { value: 'john@example.com' } });
    fireEvent.change(textboxes[2], { target: { value: 'Test Subject' } });
    fireEvent.change(textboxes[3], { target: { value: 'Hello World' } });

    fireEvent.click(
      screen.getByRole('button', { name: 'Execute Transmission' }),
    );

    const expectedHref =
      'mailto:chakorsudam@gmail.com?subject=Test%20Subject&body=Assessee%20Name%3A%20John%20Doe%0AReturn%20Email%3A%20john%40example.com%0A%0ATransmission%20Payload%3A%0AHello%20World';
    expect(window.location.href).toBe(expectedHref);
  });

  it('constructs mailto link with default subject if subject field is empty', () => {
    renderComponent();
    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { value: 'John Doe' } });
    fireEvent.change(textboxes[1], { target: { value: 'john@example.com' } });
    fireEvent.change(textboxes[3], { target: { value: 'Hello World' } });

    fireEvent.click(
      screen.getByRole('button', { name: 'Execute Transmission' }),
    );

    const expectedHref =
      'mailto:chakorsudam@gmail.com?subject=SmartFund%20Manager%20System%20Inquiry&body=Assessee%20Name%3A%20John%20Doe%0AReturn%20Email%3A%20john%40example.com%0A%0ATransmission%20Payload%3A%0AHello%20World';
    expect(window.location.href).toBe(expectedHref);
  });

  // --- Contact Vectors (Right Column) ---
  it('renders the contact vectors section', () => {
    renderComponent();
    expect(screen.getByText('System Directory')).toBeInTheDocument();
    expect(screen.getByTestId('LocationIcon')).toBeInTheDocument();

    expect(screen.getByText('Voice Protocol')).toBeInTheDocument();
    expect(screen.getByText('(123) 456-7890')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '(123) 456-7890' }),
    ).toHaveAttribute('href', 'tel:+1234567890');

    expect(screen.getByText('Direct Routing')).toBeInTheDocument();
    expect(screen.getByText('chakorsudam@gmail.com')).toBeInTheDocument();
    expect(screen.getByTestId('EmailIcon')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'chakorsudam@gmail.com' }),
    ).toHaveAttribute('href', 'mailto:chakorsudam@gmail.com');

    expect(screen.getByTestId('TimeIcon')).toBeInTheDocument();
  });
});
