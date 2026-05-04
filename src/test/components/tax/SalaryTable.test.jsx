import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SalaryTable from '../../../components/tax/SalaryTable';
import '@testing-library/jest-dom';
import useMediaQuery from '@mui/material/useMediaQuery';

// Mock Material-UI's useMediaQuery hook
jest.mock('@mui/material/useMediaQuery');

// Mock getWellInputStyle if it causes issues, but it's usually just styles
jest.mock('../../../styles/formStyles', () => ({
  getWellInputStyle: jest.fn(() => ({ border: '1px solid red' })),
}));

// Mock the renderRow prop to simplify testing its calls and output
const MockRenderRow = jest.fn(({ label, field, isCalculated, isDynamic, type, id, tooltip }) => (
  <tr data-testid={`mock-row-${field}`} key={field}>
    <td>{label}</td>
    <td>{field}</td>
    <td>{isCalculated ? 'Calculated' : 'Input'}</td>
    <td>{isDynamic ? 'Dynamic' : 'Fixed'}</td>
    <td>{type || 'N/A'}</td>
    <td>{id || 'N/A'}</td>
    <td>{tooltip || 'N/A'}</td>
  </tr>
));

describe('SalaryTable Component', () => {
  const theme = createTheme();
  const defaultCalculatedSalary = {
    months: [
      { month: 1, basic: 50000, hra: 20000, total: 70000, pf: 6000, totDed: 6000, net: 64000 },
      { month: 2, basic: 50000, hra: 20000, total: 70000, pf: 6000, totDed: 6000, net: 64000 },
    ],
  };
  const defaultEarningsFixed = [
    { label: 'Basic', field: 'basic', tooltip: 'Basic Salary' },
    { label: 'HRA', field: 'hra', tooltip: 'House Rent Allowance' },
  ];
  const defaultDeductionsFixed = [
    { label: 'PF', field: 'pf', calculated: false, tooltip: 'Provident Fund' },
  ];
  const defaultOtherFields = [
    { label: 'Other Income', field: 'otherIncome', tooltip: 'Any other income' },
  ];
  const defaultDynamicRows = {
    income: [{ label: 'Bonus', id: 'bonus' }],
    deduction: [{ label: 'Loan Repay', id: 'loanRepay' }],
  };
  const defaultOpenAddModal = jest.fn();
  const defaultOnAnnualChange = jest.fn();
  const defaultOnViewModeChange = jest.fn((e, newMode) => {
    // Simulate state change for ToggleButtonGroup
    if (newMode !== null) {
      currentViewMode = newMode;
    }
  });

  let currentViewMode = 'monthly'; // To simulate internal state for ToggleButtonGroup

  const renderComponent = (props) => {
    return render(
      <ThemeProvider theme={theme}>
        <SalaryTable
          viewMode={currentViewMode}
          onViewModeChange={defaultOnViewModeChange}
          calculatedSalary={defaultCalculatedSalary}
          earningsFixed={defaultEarningsFixed}
          deductionsFixed={defaultDeductionsFixed}
          otherFields={defaultOtherFields}
          dynamicRows={defaultDynamicRows}
          renderRow={MockRenderRow}
          openAddModal={defaultOpenAddModal}
          onAnnualChange={defaultOnAnnualChange}
          {...props}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useMediaQuery.mockReturnValue(false); // Default to desktop view
    currentViewMode = 'monthly'; // Reset view mode for each test
    MockRenderRow.mockClear(); // Clear mock calls for renderRow
  });

  // --- Mobile View Tests ---
  it('renders mobile view with Cards when isMobile is true', () => {
    useMediaQuery.mockReturnValue(true);
    renderComponent();

    expect(screen.getByText('Salary Components')).toBeInTheDocument();
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('HRA')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /View mode/i })).not.toBeInTheDocument(); // ToggleButtonGroup should not be present
    expect(screen.queryByRole('table')).not.toBeInTheDocument(); // Table should not be present
  });

  it('calls onAnnualChange with correct annual value when input changes in mobile view', () => {
    useMediaQuery.mockReturnValue(true);
    renderComponent();

    const basicInput = screen.getByLabelText('Basic');
    fireEvent.change(basicInput, { target: { value: '60000' } });
    expect(defaultOnAnnualChange).toHaveBeenCalledWith('basic', 60000 * 12);
  });

  // --- Desktop View (Monthly Mode) Tests ---
  it('renders desktop view with monthly table by default', () => {
    renderComponent();

    expect(screen.getByText('Monthly Salary Parameters')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /View mode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Detailed Monthly/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Month 1 header
    expect(screen.getByText('2')).toBeInTheDocument(); // Month 2 header
    expect(MockRenderRow).toHaveBeenCalledTimes(
      defaultEarningsFixed.length +
      defaultDynamicRows.income.length +
      defaultDeductionsFixed.length +
      defaultDynamicRows.deduction.length +
      defaultOtherFields.length + 3 // +3 for Gross Total, Tot Deduct, Net Pay
    );
  });

  it('calls renderRow for all fixed and dynamic income/deduction rows', () => {
    renderComponent();
    expect(MockRenderRow).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Basic', field: 'basic' }),
    );
    expect(MockRenderRow).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'HRA', field: 'hra' }),
    );
    expect(MockRenderRow).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Bonus', field: 'bonus', isDynamic: true, type: 'income', id: 'bonus' }),
    );
    expect(MockRenderRow).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'PF', field: 'pf' }),
    );
    expect(MockRenderRow).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Loan Repay', field: 'loanRepay', isDynamic: true, type: 'deduction', id: 'loanRepay' }),
    );
    expect(MockRenderRow).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Other Income', field: 'otherIncome' }),
    );
    expect(MockRenderRow).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Gross Total', field: 'total', isCalculated: true }),
    );
    expect(MockRenderRow).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Tot Deduct', field: 'totDed', isCalculated: true }),
    );
    expect(MockRenderRow).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Net Pay', field: 'net', isCalculated: true }),
    );
  });

  it('calls openAddModal when "Inject Income Row" button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Inject Income Row/i }));
    expect(defaultOpenAddModal).toHaveBeenCalledWith('income');
  });

  it('calls openAddModal when "Inject Deduction Row" button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Inject Deduction Row/i }));
    expect(defaultOpenAddModal).toHaveBeenCalledWith('deduction');
  });

  // --- Desktop View (Annual Mode) Tests ---
  it('switches to annual view when "Annual Summary" button is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Annual Summary/i }));

    await waitFor(() => {
      expect(defaultOnViewModeChange).toHaveBeenCalledWith(expect.anything(), 'annual');
      expect(screen.getByRole('button', { name: /Annual Summary/i })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Component')).toBeInTheDocument();
      expect(screen.getByText('Total Annual')).toBeInTheDocument();
      expect(screen.queryByText('1')).not.toBeInTheDocument(); // Monthly headers should be gone
    });
  });

  it('renders annual rows with correct summed values in annual view', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Annual Summary/i }));

    await waitFor(() => {
      // Basic: 50000 * 2 = 100000
      expect(screen.getByText('Basic').closest('tr')).toHaveTextContent('1,00,000');
      // HRA: 20000 * 2 = 40000
      expect(screen.getByText('HRA').closest('tr')).toHaveTextContent('40,000');
      // PF: 6000 * 2 = 12000
      expect(screen.getByText('PF').closest('tr')).toHaveTextContent('12,000');
      // Gross Total: 70000 * 2 = 140000
      expect(screen.getByText('Gross Total').closest('tr')).toHaveTextContent('1,40,000');
      // Tot Deduct: 6000 * 2 = 12000
      expect(screen.getByText('Tot Deduct').closest('tr')).toHaveTextContent('12,000');
      // Net Pay: 64000 * 2 = 128000
      expect(screen.getByText('Net Pay').closest('tr')).toHaveTextContent('1,28,000');
    });
  });

  it('calls onAnnualChange when input changes in annual view', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Annual Summary/i }));

    await waitFor(() => {
      const basicInput = screen.getByLabelText('Basic');
      fireEvent.change(basicInput, { target: { value: '120000' } });
      expect(defaultOnAnnualChange).toHaveBeenCalledWith('basic', '120000');
    });
  });

  it('switches back to monthly view when "Detailed Monthly" button is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Annual Summary/i })); // Switch to annual
    fireEvent.click(screen.getByRole('button', { name: /Detailed Monthly/i })); // Switch back to monthly

    await waitFor(() => {
      expect(defaultOnViewModeChange).toHaveBeenCalledWith(expect.anything(), 'monthly');
      expect(screen.getByRole('button', { name: /Detailed Monthly/i })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText('1')).toBeInTheDocument(); // Monthly headers should be back
      expect(screen.queryByText('Total Annual')).not.toBeInTheDocument(); // Annual header should be gone
    });
  });

  // --- Edge Cases / Negative Scenarios ---
  it('handles empty calculatedSalary gracefully', () => {
    const emptyCalculatedSalary = { months: [] };
    renderComponent({ calculatedSalary: emptyCalculatedSalary });
    expect(screen.queryByRole('table')).toBeInTheDocument(); // Table structure still renders
    expect(screen.queryByText('1')).not.toBeInTheDocument(); // No month headers
    expect(MockRenderRow).not.toHaveBeenCalled(); // No rows rendered
  });

  it('handles empty dynamicRows gracefully', () => {
    const emptyDynamicRows = { income: [], deduction: [] };
    renderComponent({ dynamicRows: emptyDynamicRows });
    expect(screen.queryByText('Bonus')).not.toBeInTheDocument();
    expect(screen.queryByText('Loan Repay')).not.toBeInTheDocument();
  });

  it('ensures calculated fields in annual view are disabled', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Annual Summary/i }));
    await waitFor(() => {
      expect(screen.getByLabelText('Gross Total')).toBeDisabled();
      expect(screen.getByLabelText('Tot Deduct')).toBeDisabled();
      expect(screen.getByLabelText('Net Pay')).toBeDisabled();
    });
  });
});