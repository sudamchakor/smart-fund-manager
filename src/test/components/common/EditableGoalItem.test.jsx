import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import EditableGoalItem from '../../../components/common/EditableGoalItem';
import * as profileSlice from '../../../store/profileSlice';
import * as formatting from '../../../utils/formatting';
import '@testing-library/jest-dom';

// Mock Material-UI Icons
jest.mock('@mui/icons-material/Delete', () => (props) => (
  <svg data-testid="DeleteIcon" {...props} />
));
jest.mock('@mui/icons-material/Edit', () => (props) => (
  <svg data-testid="EditIcon" {...props} />
));
jest.mock('@mui/icons-material/Info', () => (props) => (
  <svg data-testid="InfoIcon" {...props} />
));
jest.mock('@mui/icons-material/Calculate', () => (props) => (
  <svg data-testid="CalculateIcon" {...props} />
));

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
const mockUseDispatch = require('react-redux').useDispatch;

// Mock profileSlice actions
jest.mock('../../../store/profileSlice', () => ({
  updateGoalPriority: jest.fn((payload) => ({
    type: 'profile/updateGoalPriority',
    payload,
  })),
}));

// Mock formatCurrency to control its output for testing
jest
  .spyOn(formatting, 'formatCurrency')
  .mockImplementation((value, currency) => {
    if (typeof value !== 'number' || isNaN(value)) return `${currency}0`;
    return `${currency}${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  });

// Mock formStyles to prevent issues with actual style objects
jest.mock('../../../styles/formStyles', () => ({
  getWellInputStyle: jest.fn(() => ({
    border: '1px solid #ccc',
    padding: '8px',
  })),
}));

const mockStore = configureStore([]);
const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('EditableGoalItem Component', () => {
  let store;
  let mockDispatch;

  const defaultGoal = {
    id: 'goal1',
    name: 'Dream House',
    targetAmount: 5000000,
    targetYear: 2030,
    category: 'housing',
    priority: 2, // Medium
    status: 'Partially Funded',
    inflationAdjustedTarget: 7500000,
  };

  const defaultProps = {
    goal: defaultGoal,
    currency: '₹',
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onOpenBridgeGapModal: jest.fn(),
  };

  const renderComponent = (props = {}) => {
    store = mockStore({});
    mockDispatch = jest.fn();
    mockUseDispatch.mockReturnValue(mockDispatch);

    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <EditableGoalItem {...defaultProps} {...props} />
        </ThemeProvider>
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    formatting.formatCurrency.mockClear();
    formatting.formatCurrency.mockImplementation((value, currency) => {
      if (typeof value !== 'number' || isNaN(value)) return `${currency}0`;
      return `${currency}${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    });
  });

  // --- Basic Rendering ---
  it('renders goal name, target amount, and frequency', () => {
    renderComponent();
    expect(screen.getByText('Dream House')).toBeInTheDocument();
    expect(screen.getByText('Target: ₹50,00,000')).toBeInTheDocument();
  });

  it('renders priority chip with correct label and color', () => {
    renderComponent();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toHaveClass('MuiChip-colorWarning');
  });

  it('renders status chip with correct label and color', () => {
    renderComponent();
    expect(screen.getByText('Partially Funded')).toBeInTheDocument();
    expect(screen.getByText('Partially Funded')).toHaveClass(
      'MuiChip-colorWarning',
    );
  });

  it('renders inflation-adjusted target with tooltip when present', () => {
    renderComponent();
    expect(screen.getByText('Real Value: ₹75,00,000')).toBeInTheDocument();
    expect(screen.getByTestId('InfoIcon')).toBeInTheDocument();
    fireEvent.mouseOver(screen.getByTestId('InfoIcon'));
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      "This is the target amount adjusted for inflation in today's money.",
    );
  });

  it('does not render inflation-adjusted target if not provided', () => {
    renderComponent({
      goal: { ...defaultGoal, inflationAdjustedTarget: undefined },
    });
    expect(screen.queryByText('Real Value:')).not.toBeInTheDocument();
    expect(screen.queryByTestId('InfoIcon')).not.toBeInTheDocument();
  });

  // --- Buttons and Interactions ---
  it('renders Edit and Delete buttons', () => {
    renderComponent();
    expect(screen.getByTestId('EditIcon')).toBeInTheDocument();
    expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('EditIcon').closest('button'));
    expect(defaultProps.onEdit).toHaveBeenCalledWith(defaultGoal);
  });

  it('calls onDelete when Delete button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('DeleteIcon').closest('button'));
    expect(defaultProps.onDelete).toHaveBeenCalledWith('goal1');
  });

  it('dispatches updateGoalPriority when priority is changed', () => {
    renderComponent();
    fireEvent.mouseDown(
      screen.getByRole('button', { name: 'Medium Priority' }),
    ); // Open select
    fireEvent.click(screen.getByText('High Priority')); // Select new priority
    expect(mockDispatch).toHaveBeenCalledWith(
      profileSlice.updateGoalPriority({ goalId: 'goal1', priority: 1 }),
    );
  });

  it('renders "Calculate Required Monthly SIP" button for "Partially Funded" status', () => {
    renderComponent({ goal: { ...defaultGoal, status: 'Partially Funded' } });
    expect(
      screen.getByRole('button', { name: 'Calculate Required Monthly SIP' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('CalculateIcon')).toBeInTheDocument();
  });

  it('renders "Calculate Required Monthly SIP" button for "At Risk" status', () => {
    renderComponent({ goal: { ...defaultGoal, status: 'At Risk' } });
    expect(
      screen.getByRole('button', { name: 'Calculate Required Monthly SIP' }),
    ).toBeInTheDocument();
  });

  it('calls onOpenBridgeGapModal when "Calculate Required Monthly SIP" button is clicked', () => {
    renderComponent({ goal: { ...defaultGoal, status: 'Partially Funded' } });
    fireEvent.click(
      screen.getByRole('button', { name: 'Calculate Required Monthly SIP' }),
    );
    expect(defaultProps.onOpenBridgeGapModal).toHaveBeenCalledWith(defaultGoal);
  });

  it('does not render "Calculate Required Monthly SIP" button for "Fully Funded" status', () => {
    renderComponent({ goal: { ...defaultGoal, status: 'Fully Funded' } });
    expect(
      screen.queryByRole('button', { name: 'Calculate Required Monthly SIP' }),
    ).not.toBeInTheDocument();
  });

  // --- Edge Cases / Negative Scenarios ---
  it('handles different priority values correctly', () => {
    renderComponent({ goal: { ...defaultGoal, priority: 1 } }); // High
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('High')).toHaveClass('MuiChip-colorError');

    renderComponent({ goal: { ...defaultGoal, priority: 3 } }); // Low
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Low')).toHaveClass('MuiChip-colorInfo');
  });

  it('handles default priority for unknown values', () => {
    renderComponent({ goal: { ...defaultGoal, priority: 99 } }); // Unknown
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toHaveClass('MuiChip-colorWarning');
  });

  it('handles different status values correctly', () => {
    renderComponent({ goal: { ...defaultGoal, status: 'Fully Funded' } });
    expect(screen.getByText('Fully Funded')).toHaveClass(
      'MuiChip-colorSuccess',
    );

    renderComponent({ goal: { ...defaultGoal, status: 'At Risk' } });
    expect(screen.getByText('At Risk')).toHaveClass('MuiChip-colorError');

    renderComponent({ goal: { ...defaultGoal, status: 'Unknown Status' } });
    expect(screen.getByText('Unknown Status')).toHaveClass(
      'MuiChip-colorDefault',
    );
  });

  it('does not render Edit button if onEdit is not provided', () => {
    renderComponent({ onEdit: undefined });
    expect(screen.queryByTestId('EditIcon')).not.toBeInTheDocument();
  });

  it('does not render Delete button if onDelete is not provided', () => {
    renderComponent({ onDelete: undefined });
    expect(screen.queryByTestId('DeleteIcon')).not.toBeInTheDocument();
  });

  it('renders correctly with minimal goal data', () => {
    const minimalGoal = {
      id: 'g2',
      name: 'Minimal Goal',
      targetAmount: 1000,
      targetYear: 2025,
    };
    renderComponent({ goal: minimalGoal });
    expect(screen.getByText('Minimal Goal')).toBeInTheDocument();
    expect(screen.getByText('Target: ₹1,000')).toBeInTheDocument();
    expect(screen.queryByText('Medium')).not.toBeInTheDocument(); // Default priority chip not rendered if priority is undefined
    expect(screen.queryByText('Fully Funded')).not.toBeInTheDocument(); // Default status chip not rendered if status is undefined
  });

  it('ensures the priority select displays the correct value', () => {
    renderComponent({ goal: { ...defaultGoal, priority: 1 } });
    expect(
      screen.getByRole('button', { name: 'High Priority' }),
    ).toBeInTheDocument();
  });
});
