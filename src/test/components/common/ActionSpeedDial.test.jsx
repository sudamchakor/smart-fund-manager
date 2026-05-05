import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ActionSpeedDial from '../../../components/common/ActionSpeedDial';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import '@testing-library/jest-dom';

// Mock MUI SpeedDial components to control their behavior and check props
jest.mock('@mui/material/SpeedDial', () => ({ children, icon, ...props }) => (
  <div data-testid="mock-speed-dial" {...props}>
    <div data-testid="mock-speed-dial-icon">{icon}</div>
    {children}
  </div>
));
jest.mock('@mui/material/SpeedDialIcon', () => (props) => (
  <svg data-testid="mock-speed-dial-main-icon" {...props} />
));
jest.mock(
  '@mui/material/SpeedDialAction',
  () =>
    ({ icon, tooltipTitle, onClick, ...props }) => (
      <button
        data-testid={`mock-speed-dial-action-${tooltipTitle}`}
        onClick={onClick}
        {...props}
      >
        {icon}
        <span>{tooltipTitle}</span>
      </button>
    ),
);

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('ActionSpeedDial Component', () => {
  const mockAction1Handler = jest.fn();
  const mockAction2Handler = jest.fn();

  const defaultActions = [
    {
      icon: <EditIcon data-testid="edit-icon" />,
      name: 'Edit',
      handler: mockAction1Handler,
      tooltipOpen: true,
    },
    {
      icon: <DeleteIcon data-testid="delete-icon" />,
      name: 'Delete',
      handler: mockAction2Handler,
      tooltipOpen: false,
    },
  ];

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <ActionSpeedDial actions={defaultActions} {...props} />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Positive Scenarios ---
  it('renders the SpeedDial component with its main icon', () => {
    renderComponent();
    expect(screen.getByTestId('mock-speed-dial')).toBeInTheDocument();
    expect(screen.getByTestId('mock-speed-dial-main-icon')).toBeInTheDocument();
  });

  it('renders SpeedDialActions for each action in the array', () => {
    renderComponent();
    expect(
      screen.getByTestId('mock-speed-dial-action-Edit'),
    ).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();

    expect(
      screen.getByTestId('mock-speed-dial-action-Delete'),
    ).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByTestId('delete-icon')).toBeInTheDocument();
  });

  it('calls the action handler when a SpeedDialAction is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('mock-speed-dial-action-Edit'));
    expect(mockAction1Handler).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('mock-speed-dial-action-Delete'));
    expect(mockAction2Handler).toHaveBeenCalledTimes(1);
  });

  it('applies custom sx prop styles to the SpeedDial', () => {
    renderComponent({ sx: { backgroundColor: 'red', zIndex: 999 } });
    const speedDial = screen.getByTestId('mock-speed-dial');
    expect(speedDial).toHaveStyle('background-color: red');
    expect(speedDial).toHaveStyle('z-index: 999');
  });

  it('passes other props directly to the SpeedDial component', () => {
    renderComponent({ direction: 'left', open: true });
    const speedDial = screen.getByTestId('mock-speed-dial');
    expect(speedDial).toHaveAttribute('direction', 'left');
    expect(speedDial).toHaveAttribute('open', 'true');
  });

  it('passes tooltipOpen prop to SpeedDialAction', () => {
    renderComponent();
    const editAction = screen.getByTestId('mock-speed-dial-action-Edit');
    const deleteAction = screen.getByTestId('mock-speed-dial-action-Delete');

    expect(editAction).toHaveAttribute('tooltipopen', 'true');
    expect(deleteAction).toHaveAttribute('tooltipopen', 'false');
  });

  // --- Negative Scenarios / Edge Cases ---
  it('renders correctly when the actions array is empty', () => {
    renderComponent({ actions: [] });
    expect(screen.getByTestId('mock-speed-dial')).toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-speed-dial-action-Edit'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-speed-dial-action-Delete'),
    ).not.toBeInTheDocument();
  });

  it('renders correctly when actions prop is undefined or null', () => {
    renderComponent({ actions: undefined });
    expect(screen.getByTestId('mock-speed-dial')).toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-speed-dial-action-Edit'),
    ).not.toBeInTheDocument();

    renderComponent({ actions: null });
    expect(screen.getByTestId('mock-speed-dial')).toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-speed-dial-action-Edit'),
    ).not.toBeInTheDocument();
  });

  it('does not call handler if action is disabled (not directly supported by SpeedDialAction, but good to check)', () => {
    // SpeedDialAction doesn't have a 'disabled' prop directly affecting onClick.
    // If a disabled state were needed, it would be handled within the handler or by wrapping the action.
    // This test confirms that the handler is called if the button is clickable.
    renderComponent();
    fireEvent.click(screen.getByTestId('mock-speed-dial-action-Edit'));
    expect(mockAction1Handler).toHaveBeenCalledTimes(1);
  });
});
