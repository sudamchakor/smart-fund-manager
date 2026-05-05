import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import ReadOnlyItem from '../../../components/common/ReadOnlyItem';
import * as formatting from '../../../utils/formatting'; // Import the actual formatting functions
import '@testing-library/jest-dom';

// Mock Material-UI Icons
jest.mock('@mui/icons-material/Edit', () => (props) => (
  <svg data-testid="EditIcon" {...props} />
));
jest.mock('@mui/icons-material/Delete', () => (props) => (
  <svg data-testid="DeleteIcon" {...props} />
));
jest.mock('@mui/icons-material/ExpandMore', () => (props) => (
  <svg data-testid="ExpandMoreIcon" {...props} />
));
jest.mock('@mui/icons-material/ExpandLess', () => (props) => (
  <svg data-testid="ExpandLessIcon" {...props} />
));
jest.mock('@mui/icons-material/InfoOutlined', () => (props) => (
  <svg data-testid="InfoOutlinedIcon" {...props} />
));

// Mock Material-UI Dialog components to control their behavior
jest.mock(
  '@mui/material/Dialog',
  () =>
    ({ open, children, ...props }) =>
      open ? (
        <div data-testid="mock-dialog" {...props}>
          {children}
        </div>
      ) : null,
);
jest.mock('@mui/material/DialogTitle', () => ({ children }) => (
  <h2 data-testid="mock-dialog-title">{children}</h2>
));
jest.mock('@mui/material/DialogContent', () => ({ children }) => (
  <div data-testid="mock-dialog-content">{children}</div>
));
jest.mock('@mui/material/DialogContentText', () => ({ children }) => (
  <p data-testid="mock-dialog-content-text">{children}</p>
));
jest.mock('@mui/material/DialogActions', () => ({ children }) => (
  <div data-testid="mock-dialog-actions">{children}</div>
));

// Mock formatCurrency to control its output for testing
jest
  .spyOn(formatting, 'formatCurrency')
  .mockImplementation((value, currency) => {
    if (typeof value !== 'number' || isNaN(value)) return `${currency}0`;
    return `${currency}${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  });

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('ReadOnlyItem Component', () => {
  const defaultItem = {
    id: '1',
    name: 'Test Item',
    amount: 10000,
    frequency: 'monthly',
  };
  const defaultProps = {
    item: defaultItem,
    currency: '₹',
    isExpense: false,
    isIncome: false,
    isGoal: false,
    isReadOnly: false,
    onDelete: jest.fn(),
    onEdit: jest.fn(),
    onEditGoal: jest.fn(),
    formatCurrency: formatting.formatCurrency,
    totalIncome: 0,
    expenseRatio: 0,
    expenseColor: '',
    onConfirmDelete: undefined,
    deletionImpactMessage: '',
    onClick: undefined,
    taxRate: 0,
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <ReadOnlyItem {...defaultProps} {...props} />
      </ThemeProvider>,
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
  it('renders item name, amount, and frequency', () => {
    renderComponent();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('₹10,000 / monthly')).toBeInTheDocument();
    expect(formatting.formatCurrency).toHaveBeenCalledWith(10000, '₹');
  });

  it('applies correct border color based on item type (income)', () => {
    renderComponent({ isIncome: true });
    const itemBox = screen.getByText('Test Item').closest('.MuiBox-root');
    expect(itemBox).toHaveStyle(
      `border-left: 4px solid ${theme.palette.success.main}`,
    );
  });

  it('applies correct border color based on item type (expense)', () => {
    renderComponent({ isExpense: true });
    const itemBox = screen.getByText('Test Item').closest('.MuiBox-root');
    expect(itemBox).toHaveStyle(
      `border-left: 4px solid ${theme.palette.error.main}`,
    );
  });

  it('applies correct border color based on item type (goal)', () => {
    renderComponent({ isGoal: true });
    const itemBox = screen.getByText('Test Item').closest('.MuiBox-root');
    expect(itemBox).toHaveStyle(
      `border-left: 4px solid ${theme.palette.primary.main}`,
    );
  });

  it('applies custom expenseColor if provided for expense', () => {
    renderComponent({ isExpense: true, expenseColor: 'orange' });
    const itemBox = screen.getByText('Test Item').closest('.MuiBox-root');
    expect(itemBox).toHaveStyle('border-left: 4px solid orange');
  });

  // --- Edit Button ---
  it('renders Edit button for non-goal items when onEdit is provided and not read-only', () => {
    renderComponent({ onEdit: jest.fn(), isReadOnly: false, isGoal: false });
    expect(screen.getByTestId('EditIcon')).toBeInTheDocument();
  });

  it('calls onEdit with item.id when Edit button is clicked for non-goal item', () => {
    const mockOnEdit = jest.fn();
    renderComponent({ onEdit: mockOnEdit, isReadOnly: false, isGoal: false });
    fireEvent.click(screen.getByTestId('EditIcon').closest('button'));
    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });

  it('renders Edit button for goal items when onEditGoal is provided', () => {
    renderComponent({ onEditGoal: jest.fn(), isGoal: true });
    expect(screen.getByTestId('EditIcon')).toBeInTheDocument();
  });

  it('calls onEditGoal with item.id when Edit button is clicked for goal item', () => {
    const mockOnEditGoal = jest.fn();
    renderComponent({ onEditGoal: mockOnEditGoal, isGoal: true });
    fireEvent.click(screen.getByTestId('EditIcon').closest('button'));
    expect(mockOnEditGoal).toHaveBeenCalledWith('1');
  });

  it('does not render Edit button if onEdit/onEditGoal is not provided', () => {
    renderComponent({ onEdit: undefined, onEditGoal: undefined });
    expect(screen.queryByTestId('EditIcon')).not.toBeInTheDocument();
  });

  it('does not render Edit button if isReadOnly is true for non-goal item', () => {
    renderComponent({ onEdit: jest.fn(), isReadOnly: true, isGoal: false });
    expect(screen.queryByTestId('EditIcon')).not.toBeInTheDocument();
  });

  // --- Delete Button ---
  it('renders Delete button when onDelete is provided and not read-only', () => {
    renderComponent({ onDelete: jest.fn(), isReadOnly: false });
    expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
  });

  it('calls onDelete with item.id when Delete button is clicked (without confirmation)', () => {
    const mockOnDelete = jest.fn();
    renderComponent({ onDelete: mockOnDelete, isReadOnly: false });
    fireEvent.click(screen.getByTestId('DeleteIcon').closest('button'));
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('does not render Delete button if onDelete is not provided and no onConfirmDelete', () => {
    renderComponent({ onDelete: undefined, onConfirmDelete: undefined });
    expect(screen.queryByTestId('DeleteIcon')).not.toBeInTheDocument();
  });

  it('does not render Delete button if isReadOnly is true and no onConfirmDelete', () => {
    renderComponent({
      onDelete: jest.fn(),
      isReadOnly: true,
      onConfirmDelete: undefined,
    });
    expect(screen.queryByTestId('DeleteIcon')).not.toBeInTheDocument();
  });

  // --- Confirmation Dialog ---
  it('opens confirmation dialog when onConfirmDelete is provided and Delete button is clicked', async () => {
    renderComponent({ onConfirmDelete: jest.fn() });
    fireEvent.click(screen.getByTestId('DeleteIcon').closest('button'));
    await waitFor(() => {
      expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('mock-dialog-title')).toHaveTextContent(
        'Confirm Deletion',
      );
      expect(screen.getByTestId('mock-dialog-content-text')).toHaveTextContent(
        'Are you sure you want to delete this item?',
      );
    });
  });

  it('displays custom deletionImpactMessage in confirmation dialog', async () => {
    renderComponent({
      onConfirmDelete: jest.fn(),
      deletionImpactMessage: 'Custom message here.',
    });
    fireEvent.click(screen.getByTestId('DeleteIcon').closest('button'));
    await waitFor(() => {
      expect(screen.getByTestId('mock-dialog-content-text')).toHaveTextContent(
        'Custom message here.',
      );
    });
  });

  it('calls onConfirmDelete when "Confirm" button in dialog is clicked', async () => {
    const mockOnConfirmDelete = jest.fn();
    renderComponent({ onConfirmDelete: mockOnConfirmDelete });
    fireEvent.click(screen.getByTestId('DeleteIcon').closest('button'));
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' })),
    );
    expect(mockOnConfirmDelete).toHaveBeenCalledTimes(1);
  });

  it('does not call onConfirmDelete when "Cancel" button in dialog is clicked', async () => {
    const mockOnConfirmDelete = jest.fn();
    renderComponent({ onConfirmDelete: mockOnConfirmDelete });
    fireEvent.click(screen.getByTestId('DeleteIcon').closest('button'));
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' })),
    );
    expect(mockOnConfirmDelete).not.toHaveBeenCalled();
  });

  // --- Sub-items and Expand/Collapse Button ---
  it('renders ExpandMoreIcon when subItems are present and not expanded', () => {
    renderComponent({
      subItems: [
        { id: '2', name: 'Sub Item', amount: 500, frequency: 'monthly' },
      ],
    });
    expect(screen.getByTestId('ExpandMoreIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('ExpandLessIcon')).not.toBeInTheDocument();
  });

  it('renders ExpandLessIcon and sub-items when expand button is clicked', () => {
    const subItems = [
      { id: '2', name: 'Sub Item', amount: 500, frequency: 'monthly' },
    ];
    renderComponent({ subItems });
    fireEvent.click(screen.getByTestId('ExpandMoreIcon').closest('button'));
    expect(screen.getByTestId('ExpandLessIcon')).toBeInTheDocument();
    expect(screen.getByText('Sub Item')).toBeInTheDocument();
    expect(screen.getByText('₹500 / monthly')).toBeInTheDocument();
  });

  it('hides sub-items when collapse button is clicked', () => {
    const subItems = [
      { id: '2', name: 'Sub Item', amount: 500, frequency: 'monthly' },
    ];
    renderComponent({ subItems });
    fireEvent.click(screen.getByTestId('ExpandMoreIcon').closest('button')); // Expand
    fireEvent.click(screen.getByTestId('ExpandLessIcon').closest('button')); // Collapse
    expect(screen.queryByText('Sub Item')).not.toBeInTheDocument();
  });

  it('does not render expand/collapse button if subItems are empty or null', () => {
    renderComponent({ subItems: [] });
    expect(screen.queryByTestId('ExpandMoreIcon')).not.toBeInTheDocument();
    renderComponent({ subItems: null });
    expect(screen.queryByTestId('ExpandMoreIcon')).not.toBeInTheDocument();
  });

  // --- Expense Ratio Chip ---
  it('renders expense ratio chip for expense items with totalIncome > 0', () => {
    renderComponent({
      isExpense: true,
      totalIncome: 50000,
      item: { ...defaultItem, amount: 10000 },
    });
    expect(screen.getByText('20.0%')).toBeInTheDocument(); // 10000/50000 * 100
  });

  it('does not render expense ratio chip if not an expense', () => {
    renderComponent({
      isIncome: true,
      totalIncome: 50000,
      item: { ...defaultItem, amount: 10000 },
    });
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('does not render expense ratio chip if totalIncome is 0', () => {
    renderComponent({
      isExpense: true,
      totalIncome: 0,
      item: { ...defaultItem, amount: 10000 },
    });
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  // --- Net Cost Chip (Tax Savings) ---
  it('renders Net Cost chip for tax deductible expenses', () => {
    renderComponent({
      isExpense: true,
      item: { ...defaultItem, amount: 10000, isTaxDeductible: true },
      taxRate: 0.3,
      currency: '₹',
    });
    // Tax Saved: 10000 * 0.3 = 3000
    // Net Cost: 10000 - 3000 = 7000
    expect(screen.getByText('Net Cost: ₹7,000')).toBeInTheDocument();
    expect(
      screen.getByRole('tooltip', {
        name: 'Original: ₹10,000, Tax Saved: ₹3,000',
      }),
    ).toBeInTheDocument();
  });

  it('does not render Net Cost chip if not tax deductible', () => {
    renderComponent({
      isExpense: true,
      item: { ...defaultItem, amount: 10000, isTaxDeductible: false },
      taxRate: 0.3,
    });
    expect(screen.queryByText(/Net Cost/)).not.toBeInTheDocument();
  });

  it('does not render Net Cost chip if taxRate is 0', () => {
    renderComponent({
      isExpense: true,
      item: { ...defaultItem, amount: 10000, isTaxDeductible: true },
      taxRate: 0,
    });
    expect(screen.queryByText(/Net Cost/)).not.toBeInTheDocument();
  });

  // --- onClick prop ---
  it('calls onClick handler when the item box is clicked', () => {
    const mockOnClick = jest.fn();
    renderComponent({ onClick: mockOnClick });
    fireEvent.click(screen.getByText('Test Item').closest('.MuiBox-root'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick handler if not provided', () => {
    const mockOnClick = jest.fn();
    renderComponent({ onClick: undefined });
    fireEvent.click(screen.getByText('Test Item').closest('.MuiBox-root'));
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  // --- Event Propagation ---
  it('stops propagation for edit button click', () => {
    const mockOnClick = jest.fn();
    const mockOnEdit = jest.fn();
    renderComponent({ onClick: mockOnClick, onEdit: mockOnEdit });
    const editButton = screen.getByTestId('EditIcon').closest('button');
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnClick).not.toHaveBeenCalled(); // onClick of parent should not be called
  });

  it('stops propagation for delete button click', () => {
    const mockOnClick = jest.fn();
    const mockOnDelete = jest.fn();
    renderComponent({ onClick: mockOnClick, onDelete: mockOnDelete });
    const deleteButton = screen.getByTestId('DeleteIcon').closest('button');
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('stops propagation for expand/collapse button click', () => {
    const mockOnClick = jest.fn();
    const subItems = [
      { id: '2', name: 'Sub Item', amount: 500, frequency: 'monthly' },
    ];
    renderComponent({ onClick: mockOnClick, subItems });
    const expandButton = screen.getByTestId('ExpandMoreIcon').closest('button');
    fireEvent.click(expandButton);
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
