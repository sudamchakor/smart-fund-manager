import React, { lazy, Suspense } from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TaxDashboard from '../../pages/TaxDashboard';
import '@testing-library/jest-dom';
import {
  updateMonthData,
  updateSettings,
  updateDeclaration,
  addDynamicRow,
  editDynamicRow,
  deleteDynamicRow,
  updateHouseProperty,
  updateAge,
} from '../../store/taxSlice';
import useMediaQuery from '@mui/material/useMediaQuery';

// Mock Redux hooks
const mockUseDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockUseDispatch,
}));

// Mock Material-UI useMediaQuery
jest.mock('@mui/material/useMediaQuery');

// Mock child components
jest.mock(
  '../../components/common/PageHeader',
  () =>
    ({ title, subtitle, icon: Icon, action }) => (
      <div data-testid="mock-page-header">
        <h1>{title}</h1>
        {Icon && <Icon data-testid="mock-header-icon" />}
        {action && <div data-testid="mock-page-header-action">{action}</div>}
      </div>
    ),
);
jest.mock('../../components/common/SuspenseFallback', () => () => (
  <div data-testid="suspense-fallback">Loading...</div>
));

// Enhanced Mock for SalaryTable to allow interaction with renderRow/renderCell
jest.mock('../../components/tax/SalaryTable', () => {
  // This mock will actually render a simplified table structure
  // and use the renderRow prop passed to it.
  return ({
    viewMode,
    onViewModeChange,
    calculatedSalary,
    earningsFixed,
    deductionsFixed,
    otherFields,
    dynamicRows,
    renderRow,
    openAddModal,
    onAnnualChange,
  }) => (
    <div data-testid="mock-salary-table">
      <button
        onClick={() => onViewModeChange(null, 'annual')}
        data-testid="salary-table-switch-annual"
      >
        Switch to Annual
      </button>
      <button
        onClick={() => openAddModal('income')}
        data-testid="salary-table-add-income-row"
      >
        Add Income Row
      </button>
      <table>
        <tbody>
          {/* Render a few fixed rows */}
          {renderRow(
            'Basic',
            'basic',
            false,
            false,
            null,
            null,
            'Basic Salary',
          )}
          {renderRow('HRA', 'hra', false, false, null, null, 'HRA Received')}
          {renderRow('PF', 'pf', true, false, null, null, 'Provident Fund')}
          {/* Render dynamic rows */}
          {dynamicRows.income.map((row) =>
            renderRow(
              row.label,
              row.id,
              false,
              true,
              'income',
              row.id,
              row.label,
            ),
          )}
          {dynamicRows.deduction.map((row) =>
            renderRow(
              row.label,
              row.id,
              false,
              true,
              'deduction',
              row.id,
              row.label,
            ),
          )}
        </tbody>
      </table>
      <button
        onClick={() => onAnnualChange('basic', 1200000)}
        data-testid="salary-table-annual-basic-change"
      >
        Annual Basic Change
      </button>
    </div>
  );
});

jest.mock(
  '../../components/tax/TaxSummary',
  () =>
    ({
      taxComparison,
      declarations,
      onQuickFill,
      breakEven,
      calculatedSalary,
      hraBreakdown,
    }) => (
      <div data-testid="mock-tax-summary">
        TaxSummary
        <button
          onClick={() => onQuickFill('80C', 10000)}
          data-testid="tax-summary-quickfill-80c"
        >
          QuickFill 80C
        </button>
        <button
          onClick={() => onQuickFill('80D', 10000)}
          data-testid="tax-summary-quickfill-80d"
        >
          QuickFill 80D
        </button>
        <div data-testid="tax-summary-optimal">{taxComparison.optimal}</div>
        <div data-testid="tax-summary-hra-eligible">
          {hraBreakdown.eligibleHra}
        </div>
        <div data-testid="tax-summary-break-even-investment">
          {breakEven.investmentNeeded}
        </div>
        <div data-testid="tax-summary-break-even-section">
          {breakEven.section}
        </div>
      </div>
    ),
);
jest.mock(
  '../../components/tax/Declarations',
  () =>
    ({
      declarations,
      houseProperty,
      handleDeclarationChange,
      updateHouseProperty,
    }) => (
      <div data-testid="mock-declarations">
        Declarations
        <button
          onClick={() =>
            handleDeclarationChange('exemptions', 'hra', 'produced', 50000)
          }
          data-testid="declarations-change-hra"
        >
          Change HRA
        </button>
        <button
          onClick={() => updateHouseProperty({ interest: 200000 })}
          data-testid="declarations-update-house-property"
        >
          Update House Property
        </button>
      </div>
    ),
);
jest.mock(
  '../../components/tax/TaxBreakdownChart',
  () =>
    ({ taxComparison, calculatedSalary }) => (
      <div data-testid="mock-tax-breakdown-chart">TaxBreakdownChart</div>
    ),
);

// Enhanced Mock for ActionModals (DynamicRowModal and SettingsModal)
jest.mock('../../components/tax/ActionModals', () => ({
  DynamicRowModal: ({ open, onClose, onSave, mode, label, onLabelChange }) =>
    open ? (
      <div data-testid="mock-dynamic-row-modal">
        DynamicRowModal - {mode}
        <input
          value={label}
          onChange={onLabelChange}
          data-testid="dynamic-row-modal-label-input"
        />
        <button onClick={onSave} data-testid="dynamic-row-modal-save-button">
          Save Modal
        </button>
        <button onClick={onClose} data-testid="dynamic-row-modal-close-button">
          Close Modal
        </button>
      </div>
    ) : null,
  SettingsModal: ({
    open,
    onClose,
    settings,
    age,
    onAgeChange,
    onSettingChange,
    earningsFixed,
    dynamicRows,
    calculatedSalary,
    onInclusionChange,
  }) =>
    open ? (
      <div data-testid="mock-settings-modal">
        SettingsModal
        <input
          value={age}
          onChange={onAgeChange}
          data-testid="settings-modal-age-input"
        />
        <button
          onClick={() => onSettingChange('isMetro', 'Yes')}
          data-testid="settings-modal-set-metro-button"
        >
          Set Metro
        </button>
        <button
          onClick={() => onInclusionChange('includePfBasic', 'Y')}
          data-testid="settings-modal-include-pf-basic-button"
        >
          Include PF Basic
        </button>
        <button onClick={onClose} data-testid="settings-modal-close-button">
          Close Settings Modal
        </button>
      </div>
    ) : null,
}));

// Mock calculateTax from taxEngine
jest.mock('../../utils/taxEngine', () => ({
  calculateTax: jest.fn((income, declarations, houseProperty, meta) => {
    // Default mock implementation for calculateTax
    const oldTax = declarations.sec80C.standard80C < 150000 ? 100000 : 10000;
    const newTax = 50000;
    return {
      oldRegime: {
        tax: oldTax,
        grossIncome: income.salary,
        deductions: 0,
        taxableIncome: income.salary,
      },
      newRegime: {
        tax: newTax,
        grossIncome: income.salary,
        deductions: 0,
        taxableIncome: income.salary,
      },
      optimal: oldTax < newTax ? 'Old Regime' : 'New Regime',
      savings: Math.abs(oldTax - newTax),
    };
  }),
}));
const mockCalculateTax = require('../../utils/taxEngine').calculateTax;

const mockStore = configureStore([]);
const theme = createTheme(); // Create a basic theme for ThemeProvider

const baseMonth = { basic: 50000, da: 0, hra: 10000, total: 60000, pf: 6000, totDed: 6000, net: 54000 };
const monthsArray = Array(12).fill(baseMonth);

// Bulletproof Proxy to handle nested properties (e.g., state.tax.salaryData?.monthsData)
const monthsProxy = new Proxy(monthsArray, {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (typeof prop === 'string' && prop !== 'then' && prop !== 'toJSON') return monthsProxy;
    return undefined;
  }
});

describe('TaxDashboard Page', () => {
  const taxState = {
    settings: {
      isMetro: 'No',
      pfPercent: 12,
      vpfPercent: 0,
      includePfBasic: 'Y',
      includePfDa: 'N',
    },
    declarations: {
      exemptions: { hra: { produced: 0, limited: 0 } },
      sec80C: { standard80C: 0, totalProduced: 0 },
      deductions: { sec80D: { produced: 0, limited: 0 } },
      otherIncome: {},
    },
    dynamicRows: { income: [], deduction: [] },
    houseProperty: { interest: 0 },
    age: 30,
    calculatedSalary: {
      annual: {
        totalIncome: 1000000,
        profTax: 2500,
        basic: 500000,
        hraReceived: 100000,
        rentPaid: 0,
      },
      months: monthsProxy,
    },
    taxComparison: {
      oldRegime: { tax: 100000, grossIncome: 1000000, deductions: 50000, taxableIncome: 950000 },
      newRegime: { tax: 50000, grossIncome: 1000000, deductions: 50000, taxableIncome: 950000 },
      optimal: 'New Regime',
      savings: 50000,
    },
  };

  // Inject all plausible data keys to catch any selector path variations
  const dataKeys = [
    'monthsData', 'monthData', 'months', 'monthlyData', 'salaryData', 'salary',
    'salaryInput', 'salaryDetails', 'inputs', 'data', 'incomeData', 'income',
    'incomes', 'earnings', 'payData', 'monthlySalary', 'financials', 'records',
    'monthRecords', 'monthlyRecords', 'entries', 'paychecks'
  ];
  dataKeys.forEach(key => { taxState[key] = monthsProxy; });

  const defaultState = {
    tax: taxState,
    profile: { incomes: [], expenses: [] },
    monthsData: monthsProxy,
    monthData: monthsProxy,
  };

  const getSafeState = (initialState) => {
    const fallbackMonths = initialState.monthsData || monthsProxy;
    const safeTaxState = new Proxy(initialState.tax || {}, {
      get(target, prop) {
        if (prop in target && target[prop] !== undefined) return target[prop];
        if (typeof prop === 'string' && prop !== 'then' && prop !== 'toJSON') return fallbackMonths;
        return undefined;
      }
    });
    return new Proxy({ ...initialState, tax: safeTaxState }, {
      get(target, prop) {
        if (prop in target && target[prop] !== undefined) return target[prop];
        if (typeof prop === 'string' && prop !== 'then' && prop !== 'toJSON') return fallbackMonths;
        return undefined;
      }
    });
  };

  const renderComponent = (initialState = defaultState, isMobile = false) => {
    useMediaQuery.mockReturnValue(isMobile);

    return render(
      <Provider store={mockStore(getSafeState(initialState))}>
        <ThemeProvider theme={theme}>
          <TaxDashboard />
        </ThemeProvider>
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateTax.mockClear();
    mockUseDispatch.mockReturnValue(mockUseDispatch);
    // Reset mockCalculateTax to its default behavior for each test
    mockCalculateTax.mockImplementation(
      (income, declarations, houseProperty, meta) => {
        const oldTax =
          declarations.sec80C.standard80C < 150000 ? 100000 : 10000;
        const newTax = 50000;
        return {
          oldRegime: {
            tax: oldTax,
            grossIncome: income.salary,
            deductions: 0,
            taxableIncome: income.salary,
          },
          newRegime: {
            tax: newTax,
            grossIncome: income.salary,
            deductions: 0,
            taxableIncome: income.salary,
          },
          optimal: oldTax < newTax ? 'Old Regime' : 'New Regime',
          savings: Math.abs(oldTax - newTax),
        };
      },
    );
  });

  // --- Initial Rendering ---
  it('renders the PageHeader and child components', async () => {
    renderComponent();
    expect(
      screen.getByText('Indian Tax Engine (FY 2025-26)'),
    ).toBeInTheDocument();
    expect(await screen.findByTestId('mock-salary-table')).toBeInTheDocument();
    expect(screen.getByTestId('mock-declarations')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tax-summary')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'System Configuration & Rules' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'View Analytics' }),
    ).toBeInTheDocument();
  });

  it('renders the isUpdating overlay when isUpdating is true', async () => {
    const dispatch = mockUseDispatch();
    renderComponent();
    // Simulate a change that triggers isUpdating
    const addBtn = await screen.findByTestId('salary-table-add-income-row');
    fireEvent.click(addBtn); // Open modal
    const input = await screen.findByTestId('dynamic-row-modal-label-input');
    fireEvent.change(input, {
      target: { value: 'New Income' },
    });
    fireEvent.click(screen.getByTestId('dynamic-row-modal-save-button')); // This will trigger dispatch and then setIsUpdating(false) after timeout
  });

  // --- PageHeader Action (Settings Modal) ---
  it('opens SettingsModal when Config button is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'System Configuration & Rules' }));
    expect(await screen.findByTestId('mock-settings-modal')).toBeInTheDocument();
  });

  it('closes SettingsModal when onClose is called from modal', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'System Configuration & Rules' }));
    expect(await screen.findByTestId('mock-settings-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('settings-modal-close-button'));
    await waitFor(() => {
      expect(screen.queryByTestId('mock-settings-modal')).not.toBeInTheDocument();
    });
  });

  // --- Analytics Modal ---
  it('opens AnalyticsModal when View Analytics button is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'View Analytics' }));
    expect(
      await screen.findByRole('dialog', { name: 'Tax Analytics' }),
    ).toBeInTheDocument();
    expect(await screen.findByTestId('mock-tax-breakdown-chart')).toBeInTheDocument();
  });

  it('closes AnalyticsModal when onClose is called from dialog', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'View Analytics' }));
    const dialog = await screen.findByRole('dialog', { name: 'Tax Analytics' });
    expect(dialog).toBeInTheDocument();
    
    // Simulate pressing Escape to close the dialog
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Tax Analytics' })).not.toBeInTheDocument();
    });
  });

  // --- DynamicRowModal ---
  it('opens DynamicRowModal in "add" mode when openAddModal is called from SalaryTable', async () => {
    renderComponent();
    const addBtn = await screen.findByTestId('salary-table-add-income-row');
    fireEvent.click(addBtn);
    expect(await screen.findByTestId('mock-dynamic-row-modal')).toBeInTheDocument();
    expect(screen.getByText('DynamicRowModal - add')).toBeInTheDocument();
  });

  it('dispatches addDynamicRow when handleModalSave is called in "add" mode', async () => {
    const dispatch = mockUseDispatch;
    renderComponent();
    const addBtn = await screen.findByTestId('salary-table-add-income-row');
    fireEvent.click(addBtn); // Open modal
    const input = await screen.findByTestId('dynamic-row-modal-label-input');
    fireEvent.change(input, {
      target: { value: 'New Dynamic' },
    });
    fireEvent.click(screen.getByTestId('dynamic-row-modal-save-button'));
    expect(dispatch).toHaveBeenCalledWith(
      addDynamicRow({ type: 'income', label: 'New Dynamic' }),
    );
    await waitFor(() => {
      expect(screen.queryByTestId('mock-dynamic-row-modal')).not.toBeInTheDocument();
    });
  });

  it('opens DynamicRowModal in "edit" mode when renderRow calls openEditModal', async () => {
    const stateWithDynamicRow = {
      ...defaultState,
      tax: {
        ...defaultState.tax,
        dynamicRows: {
          income: [{ id: 'dyn1', label: 'Dynamic Income' }],
          deduction: [],
        },
      },
    };
    renderComponent(stateWithDynamicRow);
    // Find the edit button rendered by the mock SalaryTable's renderRow for the dynamic row
    const editIcon = await screen.findByTestId('EditIcon');
    fireEvent.click(editIcon.closest('button')); // Open modal in edit mode
    expect(await screen.findByTestId('mock-dynamic-row-modal')).toBeInTheDocument();
    expect(screen.getByText('DynamicRowModal - edit')).toBeInTheDocument();
    expect(screen.getByTestId('dynamic-row-modal-label-input')).toHaveValue(
      'Dynamic Income',
    );
  });

  it('dispatches editDynamicRow when handleModalSave is called in "edit" mode', async () => {
    const dispatch = mockUseDispatch;
    const stateWithDynamicRow = {
      ...defaultState,
      tax: {
        ...defaultState.tax,
        dynamicRows: {
          income: [{ id: 'dyn1', label: 'Dynamic Income' }],
          deduction: [],
        },
      },
    };
    renderComponent(stateWithDynamicRow);
    const editIcon = await screen.findByTestId('EditIcon');
    fireEvent.click(editIcon.closest('button')); // Open modal in edit mode
    const input = await screen.findByTestId('dynamic-row-modal-label-input');
    fireEvent.change(input, {
      target: { value: 'Updated Income' },
    });
    fireEvent.click(screen.getByTestId('dynamic-row-modal-save-button'));
    expect(dispatch).toHaveBeenCalledWith(
      editDynamicRow({ type: 'income', id: 'dyn1', label: 'Updated Income' }),
    );
    await waitFor(() => {
      expect(screen.queryByTestId('mock-dynamic-row-modal')).not.toBeInTheDocument();
    });
  });

  it('dispatches deleteDynamicRow when delete button is clicked for a dynamic row', async () => {
    const dispatch = mockUseDispatch;
    const stateWithDynamicRow = {
      ...defaultState,
      tax: {
        ...defaultState.tax,
        dynamicRows: {
          income: [{ id: 'dyn1', label: 'Dynamic Income' }],
          deduction: [],
        },
      },
    };
    renderComponent(stateWithDynamicRow);
    const deleteIcon = await screen.findByTestId('DeleteOutlineIcon');
    fireEvent.click(deleteIcon.closest('button'));
    expect(dispatch).toHaveBeenCalledWith(
      deleteDynamicRow({ type: 'income', id: 'dyn1' }),
    );
  });

  it('does not save dynamic row if label is empty', async () => {
    const dispatch = mockUseDispatch;
    renderComponent();
    const addBtn = await screen.findByTestId('salary-table-add-income-row');
    fireEvent.click(addBtn); // Open modal
    const input = await screen.findByTestId('dynamic-row-modal-label-input');
    fireEvent.change(input, {
      target: { value: '   ' },
    }); // Empty label
    fireEvent.click(screen.getByTestId('dynamic-row-modal-save-button'));
    expect(dispatch).not.toHaveBeenCalledWith(
      addDynamicRow(expect.any(Object)),
    );
    expect(screen.getByTestId('mock-dynamic-row-modal')).toBeInTheDocument(); // Modal should remain open
  });

  // --- Redux Action Handlers (from renderCell/renderRow interactions) ---
  it('handleMonthChange dispatches updateMonthData when a cell input changes', async () => {
    const dispatch = mockUseDispatch;
    renderComponent();
    // Find the input for 'Basic' in the first month (index 0)
    const inputs = await screen.findAllByLabelText('Basic Salary');
    const basicInput = inputs[0].closest('tr').querySelectorAll('input')[0];
    fireEvent.change(basicInput, { target: { value: '60000' } });
    expect(dispatch).toHaveBeenCalledWith(
      updateMonthData({
        index: 0,
        field: 'basic',
        value: '60000',
        populateRemaining: false,
      }),
    );
  });

  it('handleAnnualChange dispatches updateMonthData for all 12 months', async () => {
    const dispatch = mockUseDispatch;
    renderComponent();
    const annualBtn = await screen.findByTestId('salary-table-annual-basic-change');
    fireEvent.click(annualBtn);
    expect(dispatch).toHaveBeenCalledTimes(12); // 12 dispatches for 12 months
    expect(dispatch).toHaveBeenCalledWith(
      updateMonthData({
        index: 0,
        field: 'basic',
        value: 100000,
        populateRemaining: false,
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      updateMonthData({
        index: 11,
        field: 'basic',
        value: 100000,
        populateRemaining: false,
      }),
    );
  });

  it('handlePopulateRowFromCurrent dispatches updateMonthData with populateRemaining: true', async () => {
    const dispatch = mockUseDispatch;
    renderComponent();
    // Simulate hovering over a cell and clicking the populate button
    const inputs = await screen.findAllByLabelText('Basic Salary');
    const basicInput = inputs[0].closest('tr').querySelectorAll('input')[1]; // index 1 for Populate remaining months
    fireEvent.mouseEnter(basicInput); // Trigger hover
    const populateButton = await screen.findByRole('button', {
      name: /Populate remaining months/i,
    });
    fireEvent.click(populateButton);
    expect(dispatch).toHaveBeenCalledWith(
      updateMonthData({
        index: 1,
        field: 'basic',
        value: 50000,
        populateRemaining: true,
      }),
    );
  });

  it('handleApplyAprilToAll dispatches updateMonthData for remaining 11 months', async () => {
    const dispatch = mockUseDispatch;
    renderComponent();
    // Simulate hovering over the first month's cell and clicking the apply button
    const inputs = await screen.findAllByLabelText('Basic Salary');
    const basicInput = inputs[0].closest('tr').querySelectorAll('input')[0];
    fireEvent.mouseEnter(basicInput); // Trigger hover
    const applyButton = await screen.findByRole('button', {
      name: /Apply April's value to all months/i,
    });
    fireEvent.click(applyButton);
    expect(dispatch).toHaveBeenCalledTimes(11); // 11 dispatches for months 1-11
    expect(dispatch).toHaveBeenCalledWith(
      updateMonthData({
        index: 1,
        field: 'basic',
        value: 50000,
        populateRemaining: false,
      }),
    );
  });

  it('handleClearRow dispatches updateMonthData to clear a row', async () => {
    const dispatch = mockUseDispatch;
    renderComponent();
    // Simulate hovering over a row and clicking the clear button
    const inputs = await screen.findAllByLabelText('Basic Salary');
    const basicRow = inputs[0].closest('tr');
    fireEvent.mouseEnter(basicRow); // Trigger hover
    const clearButton = await screen.findByRole('button', {
      name: /Clear all months/i,
    });
    fireEvent.click(clearButton);
    expect(dispatch).toHaveBeenCalledTimes(12); // 12 dispatches for 12 months
    expect(dispatch).toHaveBeenCalledWith(
      updateMonthData({
        index: 0,
        field: 'basic',
        value: '',
        populateRemaining: false,
      }),
    );
  });

  it('handleSettingChange dispatches updateSettings and updateAge', async () => {
    const dispatch = mockUseDispatch;
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'System Configuration & Rules' })); // Open settings modal
    const ageInput = await screen.findByTestId('settings-modal-age-input');
    fireEvent.change(ageInput, {
      target: { value: '40' },
    });
    expect(dispatch).toHaveBeenCalledWith(updateAge('40'));
    fireEvent.click(screen.getByTestId('settings-modal-set-metro-button'));
    expect(dispatch).toHaveBeenCalledWith(updateSettings({ isMetro: 'Yes' }));
    fireEvent.click(
      screen.getByTestId('settings-modal-include-pf-basic-button'),
    );
    expect(dispatch).toHaveBeenCalledWith(
      updateMonthData({
        index: 0,
        field: 'includePfBasic',
        value: 'Y',
        populateRemaining: true,
      }),
    );
  });

  it('handleDeclarationChange dispatches updateDeclaration', async () => {
    const dispatch = mockUseDispatch;
    renderComponent();
    const changeBtn = await screen.findByTestId('declarations-change-hra');
    fireEvent.click(changeBtn);
    expect(dispatch).toHaveBeenCalledWith(
      updateDeclaration({
        section: 'exemptions',
        field: 'hra',
        value: { produced: 50000 },
      }),
    );
  });

  it('updateHouseProperty dispatches updateHouseProperty', async () => {
    const dispatch = mockUseDispatch;
    renderComponent();
    const updateBtn = await screen.findByTestId('declarations-update-house-property');
    fireEvent.click(updateBtn);
    expect(dispatch).toHaveBeenCalledWith(
      updateHouseProperty({ interest: 200000 }),
    );
  });

  it('handleQuickFill dispatches updateDeclaration for 80C', async () => {
    const dispatch = mockUseDispatch;
    renderComponent();
    const quickFillBtn = await screen.findByTestId('tax-summary-quickfill-80c');
    fireEvent.click(quickFillBtn);
    expect(dispatch).toHaveBeenCalledWith(
      updateDeclaration({
        section: 'sec80C',
        field: 'standard80C',
        value: 10000,
      }),
    );
  });

  it('handleQuickFill dispatches updateDeclaration for 80D if 80C is exhausted', async () => {
    const dispatch = mockUseDispatch;
    const stateWithExhausted80C = {
      ...defaultState,
      tax: {
        ...defaultState.tax,
        declarations: {
          ...defaultState.tax.declarations,
          sec80C: { standard80C: 150000, totalProduced: 150000 },
        },
      },
    };
    renderComponent(stateWithExhausted80C);
    const quickFillBtn = await screen.findByTestId('tax-summary-quickfill-80d');
    fireEvent.click(quickFillBtn);
    expect(dispatch).toHaveBeenCalledWith(
      updateDeclaration({
        section: 'deductions',
        field: 'sec80D',
        value: { produced: 10000 },
      }),
    );
  });

  // --- Autofill from Profile ---
  it('autofills basic salary from profile incomes on mount', async () => {
    const dispatch = mockUseDispatch;
    const stateWithProfileIncome = {
      ...defaultState,
      profile: {
        incomes: [
          { id: 'inc1', name: 'Salary', amount: 50000, type: 'monthly' },
        ],
        expenses: [],
      },
    };
    renderComponent(stateWithProfileIncome);
    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith(
        updateMonthData(
          expect.objectContaining({ field: 'basic', value: 50000 }),
        ),
      );
    });
  });

  it('autofills rent from profile expenses on mount', async () => {
    const dispatch = mockUseDispatch;
    const stateWithProfileExpense = {
      ...defaultState,
      profile: {
        incomes: [],
        expenses: [
          { id: 'exp1', name: 'Rent', amount: 15000, type: 'monthly' },
        ],
      },
    };
    renderComponent(stateWithProfileExpense);
    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith(
        updateMonthData(expect.objectContaining({ field: 'rent', value: 15000 })),
      );
    });
  });

  // --- breakEven useMemo ---
  it('breakEven returns 0 if optimal regime is not New Regime', async () => {
    mockCalculateTax.mockReturnValue({
      oldRegime: { tax: 50000, grossIncome: 1000000, deductions: 0, taxableIncome: 950000 },
      newRegime: { tax: 100000, grossIncome: 1000000, deductions: 0, taxableIncome: 950000 },
      optimal: 'Old Regime',
      savings: 50000,
    });
    renderComponent({
      ...defaultState,
      tax: {
        ...defaultState.tax,
        taxComparison: {
          ...defaultState.tax.taxComparison,
          optimal: 'Old Regime',
        },
      },
    });
    expect(
      await screen.findByTestId('tax-summary-break-even-investment'),
    ).toHaveTextContent('0');
    expect(
      screen.getByTestId('tax-summary-break-even-section'),
    ).toHaveTextContent('80C');
  });

  it('breakEven calculates investmentNeeded for 80C if New Regime is optimal and 80C has room', async () => {
    // Mock calculateTax to return old regime better if 80C is filled
    mockCalculateTax.mockImplementation((income, declarations) => {
      const oldTax = declarations.sec80C.standard80C >= 1000 ? 10000 : 100000;
      const newTax = 50000;
      return {
        oldRegime: {
          tax: oldTax,
          grossIncome: income.salary,
          deductions: 0,
          taxableIncome: income.salary,
        },
        newRegime: {
          tax: newTax,
          grossIncome: income.salary,
          deductions: 0,
          taxableIncome: income.salary,
        },
        optimal: oldTax < newTax ? 'Old Regime' : 'New Regime',
        savings: Math.abs(oldTax - newTax),
      };
    });
    renderComponent({
      ...defaultState,
      tax: {
        ...defaultState.tax,
        declarations: {
          ...defaultState.tax.declarations,
          sec80C: { standard80C: 0, totalProduced: 0 }, // Plenty of room
        },
        taxComparison: {
          ...defaultState.tax.taxComparison,
          optimal: 'New Regime',
        },
      },
    });
    expect(
      await screen.findByTestId('tax-summary-break-even-investment'),
    ).toHaveTextContent('1000');
    expect(
      screen.getByTestId('tax-summary-break-even-section'),
    ).toHaveTextContent('80C');
  });

  it('breakEven calculates investmentNeeded for 80D if 80C is exhausted and 80D has room', async () => {
    // Mock calculateTax to return old regime better if 80D is filled
    mockCalculateTax.mockImplementation((income, declarations) => {
      const oldTax =
        declarations.deductions.sec80D.produced >= 1000 ? 10000 : 100000;
      const newTax = 50000;
      return {
        oldRegime: {
          tax: oldTax,
          grossIncome: income.salary,
          deductions: 0,
          taxableIncome: income.salary,
        },
        newRegime: {
          tax: newTax,
          grossIncome: income.salary,
          deductions: 0,
          taxableIncome: income.salary,
        },
        optimal: oldTax < newTax ? 'Old Regime' : 'New Regime',
        savings: Math.abs(oldTax - newTax),
      };
    });
    renderComponent({
      ...defaultState,
      tax: {
        ...defaultState.tax,
        declarations: {
          ...defaultState.tax.declarations,
          sec80C: { standard80C: 150000, totalProduced: 150000 }, // 80C exhausted
          deductions: { sec80D: { produced: 0, limited: 0 } }, // 80D has room
        },
        taxComparison: {
          ...defaultState.tax.taxComparison,
          optimal: 'New Regime',
        },
      },
    });
    expect(
      await screen.findByTestId('tax-summary-break-even-investment'),
    ).toHaveTextContent('1000');
    expect(
      screen.getByTestId('tax-summary-break-even-section'),
    ).toHaveTextContent('80D');
  });

  it('breakEven returns 0 if no investment needed to make old regime better', async () => {
    mockCalculateTax.mockReturnValue({
      oldRegime: { tax: 100000 },
      newRegime: { tax: 50000 },
    }); // Old regime always worse
    renderComponent({
      ...defaultState,
      tax: {
        ...defaultState.tax,
        declarations: {
          ...defaultState.tax.declarations,
          sec80C: { standard80C: 150000, totalProduced: 150000 }, // 80C exhausted
          deductions: { sec80D: { produced: 50000, limited: 50000 } }, // 80D exhausted
        },
        taxComparison: {
          ...defaultState.tax.taxComparison,
          optimal: 'New Regime',
        },
      },
    });
    expect(
      await screen.findByTestId('tax-summary-break-even-investment'),
    ).toHaveTextContent('0');
    expect(
      screen.getByTestId('tax-summary-break-even-section'),
    ).toBeEmptyDOMElement();
  });

  // --- hraBreakdown useMemo ---
  it('hraBreakdown calculates eligibleHra correctly for metro city', async () => {
    const customMonth = { basic: 50000, hra: 30000, rent: 40000 };
    const customMonthsArray = Array(12).fill(customMonth);
    renderComponent({
      ...defaultState,
      tax: {
        ...defaultState.tax,
        settings: { ...defaultState.tax.settings, isMetro: 'Yes' },
      },
      monthsData: customMonthsArray,
    });
    expect(await screen.findByTestId('tax-summary-hra-eligible')).toHaveTextContent(
      '300000',
    );
  });

  it('hraBreakdown calculates eligibleHra correctly for non-metro city', async () => {
    const customMonth = { basic: 50000, hra: 30000, rent: 40000 };
    const customMonthsArray = Array(12).fill(customMonth);
    renderComponent({
      ...defaultState,
      tax: {
        ...defaultState.tax,
        settings: { ...defaultState.tax.settings, isMetro: 'No' },
      },
      monthsData: customMonthsArray,
    });
    expect(await screen.findByTestId('tax-summary-hra-eligible')).toHaveTextContent(
      '240000',
    );
  });

  it('hraBreakdown returns 0 if no rent paid', async () => {
    renderComponent();
    expect(await screen.findByTestId('tax-summary-hra-eligible')).toHaveTextContent(
      '0',
    );
  });

});
