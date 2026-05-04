import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AmountInput, AmountWithUnitInput, DatePickerInput } from '../../../components/common/CommonComponents';
import '@testing-library/jest-dom';
import dayjs from 'dayjs';

// Mock formStyles to prevent issues with actual style objects
jest.mock('../../../styles/formStyles', () => ({
  labelStyle: { fontSize: '0.75rem', fontWeight: 700 },
  getWellInputStyle: jest.fn(() => ({ border: '1px solid #ccc', padding: '8px' })),
}));

// Mock @mui/x-date-pickers/DatePicker to control its behavior
jest.mock('@mui/x-date-pickers/DatePicker', () => {
  const dayjs = require('dayjs');
  return {
    DatePicker: ({ label, value, onChange, open, onOpen, onClose, slotProps, ...props }) => (
      <div data-testid={`mock-datepicker-${label}`}>
        <label htmlFor={`mock-datepicker-input-${label}`}>{label}</label>
        <input
          id={`mock-datepicker-input-${label}`}
          data-testid={`mock-datepicker-input-${label}`}
          value={value ? dayjs(value).format('YYYY-MM-DD') : ''}
          readOnly
          onClick={onOpen}
        />
        {open && (
          <div data-testid={`mock-datepicker-popup-${label}`}>
            <button onClick={() => { onChange(dayjs('2023-01-15')); onClose(); }}>Select 2023-01-15</button>
            <button onClick={() => { onChange(null); onClose(); }}>Clear</button>
          </div>
        )}
      </div>
    ),
  };
});

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('AmountInput Component', () => {
  const defaultProps = {
    label: 'Amount',
    value: 100,
    onChange: jest.fn(),
    currency: '₹',
    disabled: false,
    placeholder: 'Enter amount',
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <AmountInput {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Positive Scenarios ---
  it('renders with label, value, and currency adornment', () => {
    renderComponent();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByText('₹')).toBeInTheDocument();
  });

  it('renders with percentage adornment when currency is "%"', () => {
    renderComponent({ currency: '%' });
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.queryByText('₹')).not.toBeInTheDocument();
  });

  it('calls onChange with numeric value when input changes', () => {
    const { rerender } = renderComponent();
    fireEvent.change(screen.getByDisplayValue('100'), { target: { value: '150' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(expect.any(Object)); // Event object
    
    rerender(
        <ThemeProvider theme={theme}>
            <AmountInput {...defaultProps} value={150} />
        </ThemeProvider>
    );
    expect(screen.getByDisplayValue('150')).toBeInTheDocument();
  });

  it('calls onChange with empty string when input is cleared', () => {
    const { rerender } = renderComponent();
    fireEvent.change(screen.getByDisplayValue('100'), { target: { value: '' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(expect.any(Object));
    
    rerender(
        <ThemeProvider theme={theme}>
            <AmountInput {...defaultProps} value="" />
        </ThemeProvider>
    );
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('selects all text on focus', () => {
    const mockSelect = jest.fn();
    renderComponent();
    const input = screen.getByDisplayValue('100');
    input.select = mockSelect; // Mock the select method
    fireEvent.focus(input);
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });

  it('renders as disabled when disabled prop is true', () => {
    renderComponent({ disabled: true });
    expect(screen.getByDisplayValue('100')).toBeDisabled();
  });

  it('displays placeholder text', () => {
    renderComponent({ value: '' });
    expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument();
  });

  // --- Negative Scenarios / Edge Cases ---
  it('renders without label when label prop is empty', () => {
    renderComponent({ label: '' });
    expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('handles null/undefined value gracefully', () => {
    renderComponent({ value: null });
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('does not render adornment if currency is null/undefined', () => {
    renderComponent({ currency: null });
    expect(screen.queryByText('₹')).not.toBeInTheDocument();
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });
});

describe('AmountWithUnitInput Component', () => {
  const defaultUnitOptions = [
    { label: 'Months', value: 'months' },
    { label: 'Years', value: 'years' },
  ];
  const defaultProps = {
    label: 'Time Period',
    value: 12,
    onAmountChange: jest.fn(),
    unitValue: 'months',
    onUnitChange: jest.fn(),
    unitOptions: defaultUnitOptions,
    placeholder: 'Enter duration',
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <AmountWithUnitInput {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Positive Scenarios ---
  it('renders with label, amount input, and unit toggle buttons', () => {
    renderComponent();
    expect(screen.getByText('Time Period')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Months' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Years' })).toBeInTheDocument();
  });

  it('highlights the selected unit button', () => {
    renderComponent({ unitValue: 'years' });
    expect(screen.getByRole('button', { name: 'Months' })).not.toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Years' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onAmountChange when amount input changes', () => {
    const { rerender } = renderComponent();
    fireEvent.change(screen.getByDisplayValue('12'), { target: { value: '24' } });
    expect(defaultProps.onAmountChange).toHaveBeenCalledWith(expect.any(Object));
    
    rerender(
        <ThemeProvider theme={theme}>
            <AmountWithUnitInput {...defaultProps} value={24} />
        </ThemeProvider>
    );
    expect(screen.getByDisplayValue('24')).toBeInTheDocument();
  });

  it('calls onUnitChange when a unit button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Years' }));
    expect(defaultProps.onUnitChange).toHaveBeenCalledWith({ target: { value: 'years' } });
  });

  it('selects all text on focus for amount input', () => {
    const mockSelect = jest.fn();
    renderComponent();
    const input = screen.getByDisplayValue('12');
    input.select = mockSelect;
    fireEvent.focus(input);
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });

  it('displays placeholder text', () => {
    renderComponent({ value: '' });
    expect(screen.getByPlaceholderText('Enter duration')).toBeInTheDocument();
  });

  // --- Negative Scenarios / Edge Cases ---
  it('renders without label when label prop is empty', () => {
    renderComponent({ label: '' });
    expect(screen.queryByText('Time Period')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('12')).toBeInTheDocument();
  });

  it('handles null/undefined value for amount gracefully', () => {
    renderComponent({ value: null });
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('handles empty unitOptions array gracefully', () => {
    renderComponent({ unitOptions: [] });
    expect(screen.queryByRole('button', { name: 'Months' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Years' })).not.toBeInTheDocument();
  });

  it('does not call onUnitChange if newUnit is null (e.g., clicking already selected button)', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Months' })); // Click selected button
    expect(defaultProps.onUnitChange).not.toHaveBeenCalled();
  });
});

describe('DatePickerInput Component', () => {
  const defaultProps = {
    label: 'Select Date',
    value: null,
    onChange: jest.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <DatePickerInput {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Positive Scenarios ---
  it('renders with label and input field', () => {
    renderComponent();
    expect(screen.getByLabelText('Select Date')).toBeInTheDocument();
    expect(screen.getByTestId('mock-datepicker-input-Select Date')).toBeInTheDocument();
  });

  it('displays formatted date when value is provided as a dayjs object', () => {
    const date = dayjs('2024-03-20');
    renderComponent({ value: date });
    expect(screen.getByDisplayValue('2024-03-20')).toBeInTheDocument();
  });

  it('displays formatted date when value is provided as a string', () => {
    renderComponent({ value: '2023-07-01T00:00:00.000Z' });
    expect(screen.getByDisplayValue('2023-07-01')).toBeInTheDocument();
  });

  it('opens the date picker when the input field is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('mock-datepicker-input-Select Date'));
    await waitFor(() => {
      expect(screen.getByTestId('mock-datepicker-popup-Select Date')).toBeInTheDocument();
    });
  });

  it('calls onChange with selected date when a date is picked', async () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('mock-datepicker-input-Select Date'));
    fireEvent.click(screen.getByRole('button', { name: 'Select 2023-01-15' }));
    expect(defaultProps.onChange).toHaveBeenCalledWith(dayjs('2023-01-15').toISOString());
    await waitFor(() => {
      expect(screen.queryByTestId('mock-datepicker-popup-Select Date')).not.toBeInTheDocument();
    });
  });

  it('calls onChange with null when date is cleared', async () => {
    renderComponent({ value: '2023-01-01' });
    fireEvent.click(screen.getByTestId('mock-datepicker-input-Select Date'));
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(defaultProps.onChange).toHaveBeenCalledWith(null);
    await waitFor(() => {
      expect(screen.queryByTestId('mock-datepicker-popup-Select Date')).not.toBeInTheDocument();
    });
  });

  // --- Negative Scenarios / Edge Cases ---
  it('renders without label when label prop is empty', () => {
    renderComponent({ label: '' });
    expect(screen.queryByLabelText('Select Date')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-datepicker-input-')).toBeInTheDocument(); // Input still renders
  });

  it('handles null value for date gracefully', () => {
    renderComponent({ value: null });
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('handles undefined value for date gracefully', () => {
    renderComponent({ value: undefined });
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });
});