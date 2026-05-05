import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  DynamicRowModal,
  SettingsModal,
} from '../../../components/tax/ActionModals';
import '@testing-library/jest-dom';

// Mock formStyles to prevent issues with actual style objects
jest.mock('../../../styles/formStyles', () => ({
  labelStyle: { fontSize: '0.75rem', fontWeight: 700 },
  getWellInputStyle: jest.fn(() => ({
    border: '1px solid #ccc',
    padding: '8px',
  })),
}));

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('DynamicRowModal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    mode: 'add',
    label: '',
    onLabelChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in "add" mode', () => {
    render(
      <ThemeProvider theme={theme}>
        <DynamicRowModal {...defaultProps} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Inject Data Row')).toBeInTheDocument();
    expect(screen.getByLabelText('Row Identifier')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Apply Change' }),
    ).toBeInTheDocument();
  });

  it('renders correctly in "modify" mode', () => {
    render(
      <ThemeProvider theme={theme}>
        <DynamicRowModal {...defaultProps} mode="modify" />
      </ThemeProvider>,
    );
    expect(screen.getByText('Modify Data Row')).toBeInTheDocument();
  });

  it('displays the provided label value', () => {
    render(
      <ThemeProvider theme={theme}>
        <DynamicRowModal {...defaultProps} label="Test Label" />
      </ThemeProvider>,
    );
    expect(screen.getByDisplayValue('Test Label')).toBeInTheDocument();
  });

  it('calls onLabelChange when the TextField value changes', () => {
    render(
      <ThemeProvider theme={theme}>
        <DynamicRowModal {...defaultProps} />
      </ThemeProvider>,
    );
    fireEvent.change(screen.getByLabelText('Row Identifier'), {
      target: { value: 'New Label' },
    });
    expect(defaultProps.onLabelChange).toHaveBeenCalledWith(expect.any(Object)); // Event object
  });

  it('calls onSave when "Apply Change" button is clicked', () => {
    render(
      <ThemeProvider theme={theme}>
        <DynamicRowModal {...defaultProps} />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply Change' }));
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when "Cancel" button is clicked', () => {
    render(
      <ThemeProvider theme={theme}>
        <DynamicRowModal {...defaultProps} />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when open is false', () => {
    render(
      <ThemeProvider theme={theme}>
        <DynamicRowModal {...defaultProps} open={false} />
      </ThemeProvider>,
    );
    expect(screen.queryByText('Inject Data Row')).not.toBeInTheDocument();
  });
});

describe('SettingsModal', () => {
  const defaultSettings = {
    isMetro: 'No',
    pfPercent: '12',
    vpfPercent: '0',
  };
  const defaultCalculatedSalary = {
    months: [
      {
        includePfBasic: 'Y',
        includePfHra: 'N',
        includePfBonus: 'Y', // For dynamic row
      },
    ],
  };
  const defaultEarningsFixed = [
    { label: 'Basic', field: 'basic', includeField: 'includePfBasic' },
    { label: 'HRA', field: 'hra', includeField: 'includePfHra' },
  ];
  const defaultDynamicRows = {
    income: [{ label: 'Bonus', id: 'bonus' }],
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    settings: defaultSettings,
    age: 30,
    onAgeChange: jest.fn(),
    onSettingChange: jest.fn(),
    earningsFixed: defaultEarningsFixed,
    dynamicRows: defaultDynamicRows,
    calculatedSalary: defaultCalculatedSalary,
    onInclusionChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal {...defaultProps} />
      </ThemeProvider>,
    );
    expect(screen.getByText('System Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText('Assessee Age')).toBeInTheDocument();
    expect(screen.getByLabelText('Metro City Residence?')).toBeInTheDocument();
    expect(screen.getByLabelText('Employee PF Base (%)')).toBeInTheDocument();
    expect(screen.getByLabelText('Voluntary PF Boost (%)')).toBeInTheDocument();
    expect(screen.getByText('PF Inclusion Logic Engine')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Apply Config' }),
    ).toBeInTheDocument();
  });

  it('displays the provided age value', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal {...defaultProps} age={45} />
      </ThemeProvider>,
    );
    expect(screen.getByDisplayValue('45')).toBeInTheDocument();
  });

  it('calls onAgeChange when the age TextField value changes', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal {...defaultProps} />
      </ThemeProvider>,
    );
    fireEvent.change(screen.getByLabelText('Assessee Age'), {
      target: { value: '31' },
    });
    expect(defaultProps.onAgeChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it('displays the provided isMetro setting', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal
          {...defaultProps}
          settings={{ ...defaultSettings, isMetro: 'Yes' }}
        />
      </ThemeProvider>,
    );
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
  });

  it('calls onSettingChange when isMetro Select value changes', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal {...defaultProps} />
      </ThemeProvider>,
    );
    fireEvent.mouseDown(screen.getByRole('button', { name: 'No' }));
    fireEvent.click(screen.getByText('Yes'));
    expect(defaultProps.onSettingChange).toHaveBeenCalledWith('isMetro', 'Yes');
  });

  it('displays the provided pfPercent and vpfPercent settings', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal
          {...defaultProps}
          settings={{ ...defaultSettings, pfPercent: '15', vpfPercent: '5' }}
        />
      </ThemeProvider>,
    );
    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  it('calls onSettingChange when pfPercent TextField value changes', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal {...defaultProps} />
      </ThemeProvider>,
    );
    fireEvent.change(screen.getByLabelText('Employee PF Base (%)'), {
      target: { value: '13' },
    });
    expect(defaultProps.onSettingChange).toHaveBeenCalledWith(
      'pfPercent',
      '13',
    );
  });

  it('renders fixed earnings items in the PF inclusion table', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal {...defaultProps} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('HRA')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Included' }),
    ).toBeInTheDocument(); // Basic is 'Y'
    expect(
      screen.getByRole('button', { name: 'Excluded' }),
    ).toBeInTheDocument(); // HRA is 'N'
  });

  it('renders dynamic income items in the PF inclusion table', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal {...defaultProps} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Bonus')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Included' }),
    ).toBeInTheDocument(); // Bonus is 'Y'
  });

  it('calls onInclusionChange when a Select value changes in the PF inclusion table', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal {...defaultProps} />
      </ThemeProvider>,
    );
    // Change HRA from 'Excluded' to 'Included'
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Excluded' })); // HRA's current value
    fireEvent.click(screen.getByText('Included'));
    expect(defaultProps.onInclusionChange).toHaveBeenCalledWith(
      'includePfHra',
      'Y',
    );
  });

  it('calls onClose when "Apply Config" button is clicked', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal {...defaultProps} />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Apply Config' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when open is false', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal {...defaultProps} open={false} />
      </ThemeProvider>,
    );
    expect(screen.queryByText('System Configuration')).not.toBeInTheDocument();
  });

  it('handles empty earningsFixed and dynamicRows.income gracefully', () => {
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal
          {...defaultProps}
          earningsFixed={[]}
          dynamicRows={{ income: [] }}
        />
      </ThemeProvider>,
    );
    expect(screen.queryByText('Basic')).not.toBeInTheDocument();
    expect(screen.queryByText('HRA')).not.toBeInTheDocument();
    expect(screen.queryByText('Bonus')).not.toBeInTheDocument();
    expect(screen.getByText('PF Inclusion Logic Engine')).toBeInTheDocument(); // Header still present
  });

  it('ensures default "N" is selected if calculatedSalary does not have the field', () => {
    const customCalculatedSalary = { months: [{}] }; // No includePfBasic
    render(
      <ThemeProvider theme={theme}>
        <SettingsModal
          {...defaultProps}
          calculatedSalary={customCalculatedSalary}
        />
      </ThemeProvider>,
    );
    // Find the select for Basic and check its value
    const basicRow = screen.getByText('Basic').closest('tr');
    const select = basicRow.querySelector('input[type="hidden"]'); // MUI Select uses hidden input for value
    expect(select).toHaveValue('N');
  });
});
