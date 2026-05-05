import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NotFoundPage from '../../../src/pages/NotFoundPage';
import '@testing-library/jest-dom';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Material-UI Icons
jest.mock('@mui/icons-material/WarningAmber', () => (props) => (
  <svg data-testid="WarningAmberIcon" {...props} />
));
jest.mock('@mui/icons-material/Dashboard', () => (props) => (
  <svg data-testid="DashboardIcon" {...props} />
));

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('NotFoundPage Component', () => {
  // Helper function to render the component with ThemeProvider
  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <NotFoundPage />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Positive Scenarios ---
  it('renders the 404 error code', () => {
    renderComponent();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders the "System Routing Error" message', () => {
    renderComponent();
    expect(screen.getByText('System Routing Error')).toBeInTheDocument();
  });

  it('renders the descriptive error message', () => {
    renderComponent();
    expect(
      screen.getByText(
        /The requested module or routing path could not be located/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders the WarningAmber icon', () => {
    renderComponent();
    expect(screen.getByTestId('WarningAmberIcon')).toBeInTheDocument();
  });

  it('renders the "Return to Command Center" button', () => {
    renderComponent();
    expect(
      screen.getByRole('button', { name: 'Return to Command Center' }),
    ).toBeInTheDocument();
  });

  it('navigates to the home page when the button is clicked', () => {
    renderComponent();
    fireEvent.click(
      screen.getByRole('button', { name: 'Return to Command Center' }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders the DashboardIcon in the button', () => {
    renderComponent();
    expect(screen.getByTestId('DashboardIcon')).toBeInTheDocument();
  });

  it('applies specific typography styles', () => {
    renderComponent();
    expect(screen.getByText('404')).toHaveStyle('font-weight: 900');
    expect(screen.getByText('System Routing Error')).toHaveStyle(
      'font-weight: 800',
    );
    expect(screen.getByText(/The requested module/i)).toHaveStyle(
      'font-weight: 600',
    );
  });
});
