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
const MockRenderRow = jest.fn(
  (label, field, isCalculated, isDynamic, type, id, tooltip) => (
    <tr data-testid={`mock-row-${field}`} key={field}>
      <td>{label}</td>
      <td>{field}</td>
      <td>{isCalculated ? 'Calculated' : 'Input'}</td>
      <td>{isDynamic ? 'Dynamic' : 'Fixed'}</td>
      <td>{type || 'N/A'}</td>
      <td>{id || 'N/A'}</td>
      <td>{tooltip || 'N/A'}</td>
    </tr>
  ),
);

describe('SalaryTable Component', () => {
  const theme = createTheme();
  const defaultCalculatedSalary = {
    months: [
      {
        month: 1,
        basic: 50000,
        hra: 20000,
        total: 70000,
        pf: 6000,
        totDed: 6000,
        net: 64000,
      },
      {
        month: 2,
        basic: 50000,
        hra: 20000,
        total: 70000,
        pf: 6000,
        totDed: 6000,
        net: 64000,
      },
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
    {
      label: 'Other Income',
      field: 'otherIncome',
      tooltip: 'Any other income',
    },
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
      </ThemeProvider>,
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
    expect(
      screen.queryByRole('group', { name: /View mode/i }),
    ).not.toBeInTheDocument(); // ToggleButtonGroup should not be present
    expect(screen.queryByRole('table')).not.toBeInTheDocument(); // Table should not be rendered
  });

  it('calls onAnnualChange with correct annual value when input changes in mobile view', () => {
    useMediaQuery.mockReturnValue(true);
    renderComponent();

    // Since the inputs don't have explicit associated labels like <label for="...">
    // we find the container by the text and then the input.
    const basicInputContainer = screen.getByText('Basic').closest('.MuiCardContent-root');
    const basicInput = basicInputContainer.querySelector('input');
    
    fireEvent.change(basicInput, { target: { value: '60000' } });
    expect(defaultOnAnnualChange).toHaveBeenCalledWith('basic', 60000 * 12);
  });

  // --- Desktop View (Monthly Mode) Tests ---
  it('renders desktop view with monthly table by default', () => {
    renderComponent();

    expect(screen.getByText('Monthly Salary Parameters')).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: /View mode/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /Detailed Monthly/i })[0],
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('table')[0]).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Month 1 header
    expect(screen.getByText('2')).toBeInTheDocument(); // Month 2 header
    expect(MockRenderRow).toHaveBeenCalledTimes(
      defaultEarningsFixed.length +
        defaultDynamicRows.income.length +
        defaultDeductionsFixed.length +
        defaultDynamicRows.deduction.length +
        defaultOtherFields.length +
        3, // +3 for Gross Total, Tot Deduct, Net Pay
    );
  });

  it('calls renderRow for all fixed and dynamic income/deduction rows', () => {
    renderComponent();
    // The renderRow function signature is:
    // (label, field, isCalculated, isDynamic, type, id, tooltip)
    expect(MockRenderRow).toHaveBeenCalledWith('Basic', 'basic', false, false, null, null, 'Basic Salary');
    expect(MockRenderRow).toHaveBeenCalledWith('HRA', 'hra', false, false, null, null, 'House Rent Allowance');
    expect(MockRenderRow).toHaveBeenCalledWith('Bonus', 'bonus', false, true, 'income', 'bonus');
    expect(MockRenderRow).toHaveBeenCalledWith('PF', 'pf', false, false, null, null, 'Provident Fund');
    expect(MockRenderRow).toHaveBeenCalledWith('Loan Repay', 'loanRepay', false, true, 'deduction', 'loanRepay');
    expect(MockRenderRow).toHaveBeenCalledWith('Other Income', 'otherIncome', false, false, null, null, 'Any other income');
    expect(MockRenderRow).toHaveBeenCalledWith('Gross Total', 'total', true, false, null, null, 'Total Monthly Gross Earnings');
    expect(MockRenderRow).toHaveBeenCalledWith('Tot Deduct', 'totDed', true, false, null, null, 'Total Monthly Deductions');
    expect(MockRenderRow).toHaveBeenCalledWith('Net Pay', 'net', true, false, null, null, 'Net Monthly Salary');
  });

  it('calls openAddModal when "Inject Income Row" button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Inject Income Row/i }));
    expect(defaultOpenAddModal).toHaveBeenCalledWith('income');
  });

  it('calls openAddModal when "Inject Deduction Row" button is clicked', () => {
    renderComponent();
    fireEvent.click(
      screen.getByRole('button', { name: /Inject Deduction Row/i }),
    );
    expect(defaultOpenAddModal).toHaveBeenCalledWith('deduction');
  });

  // --- Desktop View (Annual Mode) Tests ---
  it('switches to annual view when "Annual Summary" button is clicked', async () => {
    const { rerender } = renderComponent();
    const btn = screen.getAllByRole('button', { name: /Annual Summary/i })[0];
    fireEvent.click(btn);

    await waitFor(() => {
      expect(defaultOnViewModeChange).toHaveBeenCalledWith(
        expect.anything(),
        'annual',
      );
      // Simulating the state change since we're providing the prop
      currentViewMode = 'annual';
    });
    
    rerender(
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
        />
      </ThemeProvider>
    );

    expect(
      screen.getAllByRole('button', { name: /Annual Summary/i })[0],
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('table')[0]).toBeInTheDocument();
    expect(screen.getByText('Component')).toBeInTheDocument();
    expect(screen.getByText('Total Annual')).toBeInTheDocument();
  });

  it('renders annual rows with correct summed values in annual view', async () => {
    renderComponent({ viewMode: 'annual' });

    // Assuming value is in the input field
    // Basic: 50000 * 2 = 100000
    const basicInput = screen.getByText('Basic').closest('tr').querySelector('input');
    expect(basicInput).toHaveValue('100000');
    
    // HRA: 20000 * 2 = 40000
    const hraInput = screen.getByText('HRA').closest('tr').querySelector('input');
    expect(hraInput).toHaveValue('40000');
    
    // PF: 6000 * 2 = 12000
    const pfInput = screen.getByText('PF').closest('tr').querySelector('input');
    expect(pfInput).toHaveValue('12000');
    
    // Gross Total: 70000 * 2 = 140000
    const totalInput = screen.getByText('Gross Total').closest('tr').querySelector('input');
    expect(totalInput).toHaveValue('140000');
    
    // Tot Deduct: 6000 * 2 = 12000
    const totDedInput = screen.getByText('Tot Deduct').closest('tr').querySelector('input');
    expect(totDedInput).toHaveValue('12000');
    
    // Net Pay: 64000 * 2 = 128000
    const netInput = screen.getByText('Net Pay').closest('tr').querySelector('input');
    expect(netInput).toHaveValue('128000');
  });

  it('calls onAnnualChange when input changes in annual view', async () => {
    renderComponent({ viewMode: 'annual' });

    const basicInput = screen.getByText('Basic').closest('tr').querySelector('input');
    fireEvent.change(basicInput, { target: { value: '120000' } });
    expect(defaultOnAnnualChange).toHaveBeenCalledWith('basic', '120000');
  });

  it('switches back to monthly view when "Detailed Monthly" button is clicked', async () => {
    const { rerender } = renderComponent({ viewMode: 'annual' });
    fireEvent.click(screen.getAllByRole('button', { name: /Detailed Monthly/i })[0]); // Switch back to monthly

    await waitFor(() => {
      expect(defaultOnViewModeChange).toHaveBeenCalledWith(
        expect.anything(),
        'monthly',
      );
      currentViewMode = 'monthly';
    });
    
    rerender(
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
        />
      </ThemeProvider>
    );
    
    expect(
      screen.getAllByRole('button', { name: /Detailed Monthly/i })[0],
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1')).toBeInTheDocument(); // Monthly headers should be back
  });

  // --- Edge Cases / Negative Scenarios ---
  it('handles empty calculatedSalary gracefully', () => {
    const emptyCalculatedSalary = { months: [] };
    renderComponent({ calculatedSalary: emptyCalculatedSalary });
    expect(screen.queryByRole('table')).toBeInTheDocument(); // Table structure still renders
    expect(screen.queryByText('1')).not.toBeInTheDocument(); // No month headers
    
    // It will render the rows but with 0 values since length of months is 0
    expect(MockRenderRow).toHaveBeenCalled(); 
  });

  it('handles empty dynamicRows gracefully', () => {
    const emptyDynamicRows = { income: [], deduction: [] };
    renderComponent({ dynamicRows: emptyDynamicRows });
    expect(screen.queryByText('Bonus')).not.toBeInTheDocument();
    expect(screen.queryByText('Loan Repay')).not.toBeInTheDocument();
  });

  it('ensures calculated fields in annual view are disabled', async () => {
    renderComponent({ viewMode: 'annual' });
    
    const grossTotalInput = screen.getByText('Gross Total').closest('tr').querySelector('input');
    expect(grossTotalInput).toBeDisabled();
    
    const totDeductInput = screen.getByText('Tot Deduct').closest('tr').querySelector('input');
    expect(totDeductInput).toBeDisabled();
    
    const netPayInput = screen.getByText('Net Pay').closest('tr').querySelector('input');
    expect(netPayInput).toBeDisabled();
  });
});