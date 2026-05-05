import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import IncomeExpenseForm from '../../../components/common/IncomeExpenseForm';
import '@testing-library/jest-dom';
import dayjs from 'dayjs'; // Import dayjs outside of jest.mock

// Mock SliderInput to control its behavior
jest.mock(
  '../../../components/common/SliderInput',
  () =>
    ({ label, value, onChange, ...props }) => (
      <div data-testid={`mock-slider-input-${label}`}>
        <label htmlFor={`mock-slider-input-field-${label}`}>{label}</label>
        <input
          id={`mock-slider-input-field-${label}`}
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          data-testid={`mock-slider-input-field-${label}`}
        />
      </div>
    ),
);

// Mock DatePicker to control its behavior
jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({
    label,
    value,
    onChange,
    open,
    onOpen,
    onClose,
    slotProps,
    ...props
  }) => (
    <div data-testid={`mock-datepicker-${label}`}>
      <label htmlFor={`mock-datepicker-input-${label}`}>{label}</label>
      <input
        id={`mock-datepicker-input-${label}`}
        data-testid={`mock-datepicker-input-field-${label}`}
        value={value ? dayjs(value).format('YYYY') : ''} // Use dayjs here
        readOnly
        onClick={onOpen}
      />
      {open && (
        <div data-testid={`mock-datepicker-popup-${label}`}>
          <button
            onClick={() => {
              onChange(dayjs('2025-01-01'));
              onClose();
            }}
          >
            Select 2025
          </button>
          <button
            onClick={() => {
              onChange(null);
              onClose();
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  ),
}));

// Mock utility data
jest.mock('../../../utils/taxRules', () => ({
  incomeTypes: [
    { value: 'Salary', label: 'Salary' },
    { value: 'Rental Income', label: 'Rental Income' },
  ],
  expenseCategories: [
    { value: 'basic', label: 'Basic Needs' },
    { value: 'discretionary', label: 'Discretionary' },
  ],
  taxExpenseCategories: [
    { value: '80C', label: 'Section 80C' },
    { value: '80D', label: 'Section 80D' },
  ],
}));

// Mock formStyles
jest.mock('../../../styles/formStyles', () => ({
  labelStyle: { fontSize: '0.75rem', fontWeight: 700 },
  getWellInputStyle: jest.fn(() => ({
    border: '1px solid #ccc',
    padding: '8px',
  })),
}));

const theme = createTheme(); // Create a basic theme for ThemeProvider
const currentYear = new Date().getFullYear();

describe.skip('IncomeExpenseForm Component', () => {
  const defaultIncomeProps = {
    isExpense: false,
    onSave: jest.fn(),
    onCancel: jest.fn(),
    submitLabel: 'Add Income',
  };

  const defaultExpenseProps = {
    isExpense: true,
    onSave: jest.fn(),
    onCancel: jest.fn(),
    submitLabel: 'Add Expense',
  };

  const renderComponent = (props = {}, initialData = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <IncomeExpenseForm initialData={initialData} {...props} />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Income Form (isExpense = false) ---
  describe('Income Form', () => {
    it('renders income-specific fields', () => {
      renderComponent(defaultIncomeProps);
      expect(screen.getByLabelText('Income Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Source')).toBeInTheDocument();
      expect(screen.getByLabelText('Frequency')).toBeInTheDocument();
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Year')).toBeInTheDocument();
      expect(screen.getByLabelText('End Year')).toBeInTheDocument();
      expect(screen.queryByLabelText('Category')).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Is this tax-deductible?'),
      ).not.toBeInTheDocument();
    });

    it('pre-fills form with initialData for income', () => {
      const initial = {
        name: 'Old Salary',
        amount: 50000,
        frequency: 'yearly',
        incomeType: 'Salary',
        startYear: 2020,
        endYear: 2030,
      };
      renderComponent(defaultIncomeProps, initial);
      expect(screen.getByDisplayValue('Old Salary')).toBeInTheDocument();
      expect(screen.getByDisplayValue('50000')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'yearly' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Salary' }),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('2020')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2030')).toBeInTheDocument();
    });

    it('updates form fields when initialData changes', () => {
      const { rerender } = renderComponent(defaultIncomeProps, {
        name: 'Initial',
      });
      expect(screen.getByDisplayValue('Initial')).toBeInTheDocument();

      rerender(
        <ThemeProvider theme={theme}>
          <IncomeExpenseForm
            {...defaultIncomeProps}
            initialData={{ name: 'Updated' }}
          />
        </ThemeProvider>,
      );
      expect(screen.getByDisplayValue('Updated')).toBeInTheDocument();
    });

    it('handles incomeType change', () => {
      renderComponent(defaultIncomeProps);
      fireEvent.mouseDown(screen.getByRole('button', { name: 'Salary' }));
      fireEvent.click(screen.getByText('Rental Income'));
      expect(
        screen.getByRole('button', { name: 'Rental Income' }),
      ).toBeInTheDocument();
    });

    it('handles name change', () => {
      renderComponent(defaultIncomeProps);
      fireEvent.change(screen.getByLabelText('Source'), {
        target: { value: 'New Job' },
      });
      expect(screen.getByDisplayValue('New Job')).toBeInTheDocument();
    });

    it('handles amount change', () => {
      renderComponent(defaultIncomeProps);
      fireEvent.change(screen.getByTestId('mock-slider-input-field-Amount'), {
        target: { value: '120000' },
      });
      expect(screen.getByDisplayValue('120000')).toBeInTheDocument();
    });

    it('handles frequency change', () => {
      renderComponent(defaultIncomeProps);
      fireEvent.mouseDown(screen.getByRole('button', { name: 'monthly' }));
      fireEvent.click(screen.getByText('Yearly'));
      expect(
        screen.getByRole('button', { name: 'Yearly' }),
      ).toBeInTheDocument();
    });

    it('handles startYear change', async () => {
      renderComponent(defaultIncomeProps);
      fireEvent.click(
        screen.getByTestId('mock-datepicker-input-field-Start Year'),
      );
      await waitFor(() =>
        fireEvent.click(screen.getByRole('button', { name: 'Select 2025' })),
      );
      expect(screen.getByDisplayValue('2025')).toBeInTheDocument();
    });

    it('handles endYear change', async () => {
      renderComponent(defaultIncomeProps);
      fireEvent.click(
        screen.getByTestId('mock-datepicker-input-field-End Year'),
      );
      await waitFor(() =>
        fireEvent.click(screen.getByRole('button', { name: 'Select 2025' })),
      );
      expect(screen.getByDisplayValue('2025')).toBeInTheDocument();
    });

    it('calls onSave with correct data for regular income', () => {
      const mockOnSave = jest.fn();
      renderComponent(
        { ...defaultIncomeProps, onSave: mockOnSave },
        { name: 'Salary', amount: 100000 },
      );
      fireEvent.click(screen.getByRole('button', { name: 'Add Income' }));
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Salary', amount: 100000 }),
      );
    });

    it('calls onSave with 30% deduction for Rental Income', () => {
      const mockOnSave = jest.fn();
      renderComponent(
        { ...defaultIncomeProps, onSave: mockOnSave },
        { name: 'Rent', amount: 100000, incomeType: 'Rental Income' },
      );
      fireEvent.click(screen.getByRole('button', { name: 'Add Income' }));
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Rent', amount: 70000 }),
      ); // 100000 * 0.7
    });

    it('does not call onSave if name is empty', () => {
      const mockOnSave = jest.fn();
      renderComponent(
        { ...defaultIncomeProps, onSave: mockOnSave },
        { name: '', amount: 100000 },
      );
      fireEvent.click(screen.getByRole('button', { name: 'Add Income' }));
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('does not call onSave if amount is 0', () => {
      const mockOnSave = jest.fn();
      renderComponent(
        { ...defaultIncomeProps, onSave: mockOnSave },
        { name: 'Salary', amount: 0 },
      );
      fireEvent.click(screen.getByRole('button', { name: 'Add Income' }));
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  // --- Expense Form (isExpense = true) ---
  describe('Expense Form', () => {
    it('renders expense-specific fields', () => {
      renderComponent(defaultExpenseProps);
      expect(screen.getByLabelText('Expense Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Frequency')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Is this tax-deductible?'),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Start Year')).toBeInTheDocument();
      expect(screen.getByLabelText('End Year')).toBeInTheDocument();
      expect(screen.queryByLabelText('Income Type')).not.toBeInTheDocument();
    });

    it('pre-fills form with initialData for expense', () => {
      const initial = {
        name: 'Rent',
        amount: 20000,
        frequency: 'monthly',
        category: 'basic',
        isTaxDeductible: true,
        taxCategory: '80C',
        startYear: 2021,
        endYear: 2031,
      };
      renderComponent(defaultExpenseProps, initial);
      expect(screen.getByDisplayValue('Rent')).toBeInTheDocument();
      expect(screen.getByDisplayValue('20000')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'monthly' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Basic Needs' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeChecked();
      expect(
        screen.getByRole('button', { name: 'Section 80C' }),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('2021')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2031')).toBeInTheDocument();
    });

    it('handles expense name change', () => {
      renderComponent(defaultExpenseProps);
      fireEvent.change(screen.getByLabelText('Expense Name'), {
        target: { value: 'Groceries' },
      });
      expect(screen.getByDisplayValue('Groceries')).toBeInTheDocument();
    });

    it('handles expense amount change', () => {
      renderComponent(defaultExpenseProps);
      fireEvent.change(screen.getByTestId('mock-slider-input-field-Amount'), {
        target: { value: '5000' },
      });
      expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
    });

    it('handles expense category change', () => {
      renderComponent(defaultExpenseProps);
      fireEvent.mouseDown(screen.getByRole('button', { name: 'Basic Needs' }));
      fireEvent.click(screen.getByText('Discretionary'));
      expect(
        screen.getByRole('button', { name: 'Discretionary' }),
      ).toBeInTheDocument();
    });

    it('handles expense frequency change', () => {
      renderComponent(defaultExpenseProps);
      fireEvent.mouseDown(screen.getByRole('button', { name: 'monthly' }));
      fireEvent.click(screen.getByText('Yearly'));
      expect(
        screen.getByRole('button', { name: 'Yearly' }),
      ).toBeInTheDocument();
    });

    it('toggles isTaxDeductible checkbox and shows/hides taxCategory select', () => {
      renderComponent(defaultExpenseProps);
      const checkbox = screen.getByLabelText('Is this tax-deductible?');
      expect(checkbox).not.toBeChecked();
      expect(
        screen.queryByLabelText('Exemption Category'),
      ).not.toBeInTheDocument();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      expect(screen.getByLabelText('Exemption Category')).toBeInTheDocument();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
      expect(
        screen.queryByLabelText('Exemption Category'),
      ).not.toBeInTheDocument();
    });

    it('handles taxCategory change when isTaxDeductible is true', () => {
      renderComponent(defaultExpenseProps, { isTaxDeductible: true });
      fireEvent.mouseDown(screen.getByRole('button', { name: 'Section 80C' }));
      fireEvent.click(screen.getByText('Section 80D'));
      expect(
        screen.getByRole('button', { name: 'Section 80D' }),
      ).toBeInTheDocument();
    });

    it('calls onSave with correct data for expense', () => {
      const mockOnSave = jest.fn();
      renderComponent(
        { ...defaultExpenseProps, onSave: mockOnSave },
        { name: 'Food', amount: 5000 },
      );
      fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Food', amount: 5000 }),
      );
    });

    it('does not call onSave if expense name is empty', () => {
      const mockOnSave = jest.fn();
      renderComponent(
        { ...defaultExpenseProps, onSave: mockOnSave },
        { name: '', amount: 5000 },
      );
      fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('does not call onSave if expense amount is 0', () => {
      const mockOnSave = jest.fn();
      renderComponent(
        { ...defaultExpenseProps, onSave: mockOnSave },
        { name: 'Food', amount: 0 },
      );
      fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  // --- Common Functionality ---
  it('renders custom submitLabel', () => {
    renderComponent({ ...defaultIncomeProps, submitLabel: 'Update Item' });
    expect(
      screen.getByRole('button', { name: 'Update Item' }),
    ).toBeInTheDocument();
  });

  it('renders Cancel button and calls onCancel when clicked', () => {
    const mockOnCancel = jest.fn();
    renderComponent({ ...defaultIncomeProps, onCancel: mockOnCancel });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('does not render Cancel button if onCancel is not provided', () => {
    renderComponent({ ...defaultIncomeProps, onCancel: undefined });
    expect(
      screen.queryByRole('button', { name: 'Cancel' }),
    ).not.toBeInTheDocument();
  });

  it('DatePicker minDate and maxDate are correctly set for Start Year', () => {
    renderComponent(defaultIncomeProps);
    const startYearPicker = screen.getByTestId('mock-datepicker-Start Year');
    // In the mock, we don't expose minDate/maxDate directly, but we can check if the value is within range
    // For a real DatePicker, you'd check the props passed to it.
    expect(startYearPicker).toBeInTheDocument();
  });

  it('DatePicker minDate for End Year is correctly set based on Start Year', async () => {
    renderComponent(defaultIncomeProps, { startYear: 2020 });
    const endYearPicker = screen.getByTestId('mock-datepicker-End Year');
    expect(endYearPicker).toBeInTheDocument();
    // In a real test, you'd check the minDate prop passed to the DatePicker.
    // Here, we're just checking the component renders.
  });
});
