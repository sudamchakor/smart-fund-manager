import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles'; // Import alpha
import VisualCard from '../../../components/settings/VisualCard';
import '@testing-library/jest-dom';

// Mock Material-UI Icons
jest.mock('@mui/icons-material/CheckCircle', () => (props) => (
  <svg data-testid="CheckIcon" {...props} />
));

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    divider: '#cccccc',
    background: { paper: '#ffffff' },
  },
  shape: {
    borderRadius: 4, // Example value for borderRadius
  },
});

describe('VisualCard Component', () => {
  const defaultProps = {
    label: 'Test Label',
    value: 'testValue',
    active: 'someOtherValue',
    onClick: jest.fn(),
    colors: ['#FF0000', '#00FF00', '#0000FF'],
    subtext: 'This is a test subtext.',
  };

  // Helper function to render the component with ThemeProvider
  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <VisualCard {...defaultProps} {...props} />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Positive Scenarios ---
  it('renders label and subtext', () => {
    renderComponent();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('This is a test subtext.')).toBeInTheDocument();
  });

  it('renders the color box with the first color', () => {
    renderComponent();
    // Getting the box inside the card that uses colors[0].
    // Given the structure, we can query the button and find the inner box.
    const card = screen.getByRole('button');
    // The structure has two Box components, the inner one has the color.
    const innerBox = card.querySelector('.MuiBox-root .MuiBox-root');
    expect(innerBox).toHaveStyle('background-color: #FF0000');
  });

  it('calls onClick with its value when clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onClick).toHaveBeenCalledWith('testValue');
  });

  it('shows CheckIcon and applies selected styling when active', () => {
    renderComponent({ active: 'testValue' });
    expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
    const card = screen.getByRole('button');
    expect(card).toHaveStyle(`border-color: ${theme.palette.primary.main}`);
    expect(card).toHaveStyle(
      `background-color: ${alpha(theme.palette.primary.main, 0.03)}`,
    );
    expect(screen.getByText('Test Label')).toHaveStyle(
      `color: ${theme.palette.primary.main}`,
    );
  });

  // --- Negative Scenarios / Edge Cases ---
  it('does not show CheckIcon and applies non-selected styling when not active', () => {
    renderComponent({ active: 'someOtherValue' });
    expect(screen.queryByTestId('CheckIcon')).not.toBeInTheDocument();
    const card = screen.getByRole('button');
    expect(card).toHaveStyle(
      `border-color: ${alpha(theme.palette.divider, 0.08)}`,
    );
    expect(card).toHaveStyle('background-color: #ffffff'); // theme.palette.background.paper
    expect(screen.getByText('Test Label')).toHaveStyle(
      `color: ${theme.palette.text.primary}`,
    );
  });

  it('renders with empty label and subtext strings', () => {
    renderComponent({ label: '', subtext: '' });
    expect(screen.getByRole('button')).toBeInTheDocument(); // Card itself
    expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    expect(
      screen.queryByText('This is a test subtext.'),
    ).not.toBeInTheDocument();
  });

  it('handles empty colors array gracefully (renders default background)', () => {
    renderComponent({ colors: [] });
    const card = screen.getByRole('button');
    const innerBox = card.querySelector('.MuiBox-root .MuiBox-root');
    expect(innerBox).toHaveStyle('background-color: transparent'); 
  });

  it('handles null/undefined colors array gracefully', () => {
    renderComponent({ colors: null });
    const card = screen.getByRole('button');
    const innerBox = card.querySelector('.MuiBox-root .MuiBox-root');
    expect(innerBox).toHaveStyle('background-color: transparent');
  });

  it('handles null/undefined label and subtext gracefully', () => {
    renderComponent({ label: null, subtext: undefined });
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    expect(
      screen.queryByText('This is a test subtext.'),
    ).not.toBeInTheDocument();
  });
});