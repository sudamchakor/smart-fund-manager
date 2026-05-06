import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Declarations from '../../../components/tax/Declarations';
import '@testing-library/jest-dom';

// Mock DataCard and ExemptionRow to simplify testing
jest.mock(
  '../../../components/common/DataCard',
  () =>
    ({ title, children }) => (
      <div
        data-testid={`data-card-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      >
        <h3>{title}</h3>
        <div>{children}</div>
      </div>
    ),
);
jest.mock(
  '../../../components/common/ExemptionRow',
  () =>
    ({ label, produced, limited, tooltip }) => (
      <div
        data-testid={`exemption-row-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      >
        <span>{label}</span>
        <div
          data-testid={`produced-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        >
          {produced}
        </div>
        <span
          data-testid={`limited-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        >
          {limited}
        </span>
        {tooltip && (
          <span
            data-testid={`tooltip-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          >
            {tooltip}
          </span>
        )}
      </div>
    ),
);

// Mock formStyles to prevent issues with actual style objects
jest.mock('../../../styles/formStyles', () => ({
  labelStyle: { fontSize: '0.75rem', fontWeight: 700 },
  getWellInputStyle: jest.fn(() => ({
    border: '1px solid #ccc',
    padding: '8px',
  })),
}));

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('Declarations Component', () => {
  const defaultDeclarations = {
    exemptions: {
      hra: { produced: 50000, limited: 40000 },
      transport: { produced: 30000, limited: 20000 },
      gratuity: { produced: 100000, limited: 100000 },
      childrenEduc: { produced: 1000, limited: 1000 },
      lta: { produced: 20000, limited: 20000 },
      uniform: { produced: 5000, limited: 5000 },
    },
    otherIncome: {
      bonus: 10000,
      savingsInt: 5000,
      dividends: 2000,
      capitalGains: 15000,
      crypto: 3000,
    },
    deductions: {
      sec80D: { produced: 30000, limited: 25000 },
      sec80DD_DDB: { produced: 50000, limited: 50000 },
      sec80E_EEB: { produced: 10000, limited: 10000 },
      sec80G: { produced: 5000, limited: 5000 },
      sec80GG: { produced: 70000, limited: 60000 },
      sec80TTA_U: { produced: 12000, limited: 10000 },
    },
    sec80C: {
      npsEmployee: 20000,
      npsEmployer: 30000,
      standard80C: 100000,
      superannuation: 10000,
      limited: 160000, // Sum of above, assuming 80C limit is 150000
    },
  };
  const defaultHouseProperty = { interest: 180000 };
  const mockHandleDeclarationChange = jest.fn();
  const mockUpdateHouseProperty = jest.fn();

  const renderComponent = (props) => {
    return render(
      <ThemeProvider theme={theme}>
        <Declarations
          declarations={defaultDeclarations}
          houseProperty={defaultHouseProperty}
          handleDeclarationChange={mockHandleDeclarationChange}
          updateHouseProperty={mockUpdateHouseProperty}
          {...props}
        />
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- General Rendering Tests ---
  it('renders all main sections', () => {
    renderComponent();
    expect(screen.getByText('A. Sec 10 & 17 Exemptions')).toBeInTheDocument();
    expect(screen.getByText('B. Other Income')).toBeInTheDocument();
    expect(screen.getByText('C. Chapter VI-A Deductions')).toBeInTheDocument();
    expect(screen.getByText('D. Sec 80C Investments')).toBeInTheDocument();
  });

  // --- Section A: Sec 10 & 17 Exemptions ---
  it('renders all exemption rows in Section A', () => {
    renderComponent();
    expect(screen.getByText('Standard Deduction')).toBeInTheDocument();
    expect(screen.getByText('HRA Exemption')).toBeInTheDocument();
    expect(screen.getByText('Transport Exemption')).toBeInTheDocument();
    expect(screen.getByText('Gratuity / Other')).toBeInTheDocument();
    expect(screen.getByText("Children's Ed. Allowance")).toBeInTheDocument();
    expect(screen.getByText('LTA Exemption')).toBeInTheDocument();
    expect(screen.getByText('Uniform Expenses')).toBeInTheDocument();
  });

  it('displays correct values for Section A exemptions', () => {
    renderComponent();
    expect(
      screen.getByTestId('produced-hra-exemption').querySelector('input')
    ).toHaveValue('50000');
    expect(
      screen.getByTestId('produced-transport-exemption').querySelector('input')
    ).toHaveValue('30000');
  });

  it('calls handleDeclarationChange when an exemption field changes', () => {
    renderComponent();
    const hraInput = screen
      .getByTestId('produced-hra-exemption')
      .querySelector('input');
    fireEvent.change(hraInput, { target: { value: '60000' } });
    expect(mockHandleDeclarationChange).toHaveBeenCalledWith(
      'exemptions',
      'hra',
      'produced',
      '60000',
    );
  });

  it('shows error for Transport Exemption if value exceeds limit', () => {
    const declarationsWithHighTransport = {
      ...defaultDeclarations,
      exemptions: {
        ...defaultDeclarations.exemptions,
        transport: { produced: 40000, limited: 38400 }, // Exceeds 38400 limit
      },
    };
    renderComponent({ declarations: declarationsWithHighTransport });
    const transportInput = screen
      .getByTestId('produced-transport-exemption')
      .querySelector('input');
    expect(transportInput).toHaveValue('40000');
    expect(screen.getByText('Max limit is ₹38,400')).toBeInTheDocument();
    expect(transportInput).toHaveAttribute('aria-invalid', 'true');
  });

  it("shows error for Children's Ed. Allowance if value exceeds limit", () => {
    const declarationsWithHighChildrenEduc = {
      ...defaultDeclarations,
      exemptions: {
        ...defaultDeclarations.exemptions,
        childrenEduc: { produced: 3000, limited: 2400 }, // Exceeds 2400 limit
      },
    };
    renderComponent({ declarations: declarationsWithHighChildrenEduc });
    const childrenEducInput = screen
      .getByTestId("produced-children-s-ed-allowance")
      .querySelector('input');
    expect(childrenEducInput).toHaveValue('3000');
    expect(screen.getByText('Max limit is ₹2,400')).toBeInTheDocument();
    expect(childrenEducInput).toHaveAttribute('aria-invalid', 'true');
  });

  // --- Section B: Other Income ---
  it('renders all other income fields in Section B', () => {
    renderComponent();
    expect(screen.getByLabelText('Bonus')).toBeInTheDocument();
    expect(screen.getByLabelText('Savings Interest')).toBeInTheDocument();
    expect(screen.getByLabelText('Dividends')).toBeInTheDocument();
    expect(screen.getByLabelText('Capital Gains')).toBeInTheDocument();
    expect(screen.getByLabelText('Crypto')).toBeInTheDocument();
  });

  it('displays correct values for Section B other income', () => {
    renderComponent();
    expect(screen.getByLabelText('Bonus')).toHaveValue('10000');
    expect(screen.getByLabelText('Savings Interest')).toHaveValue('5000');
  });

  it('calls handleDeclarationChange when an other income field changes', () => {
    renderComponent();
    const bonusInput = screen.getByLabelText('Bonus');
    fireEvent.change(bonusInput, { target: { value: '12000' } });
    expect(mockHandleDeclarationChange).toHaveBeenCalledWith(
      'otherIncome',
      'bonus',
      null,
      '12000',
    );
  });

  // --- Section C: Chapter VI-A Deductions ---
  it('renders all deduction rows in Section C', () => {
    renderComponent();
    expect(screen.getByText('80D - Health Insurance')).toBeInTheDocument();
    expect(screen.getByText('80DD/DDB - Medical')).toBeInTheDocument();
    expect(screen.getByText('80E/EEB - Loan Interest')).toBeInTheDocument();
    expect(screen.getByText('80G - Charity Donations')).toBeInTheDocument();
    expect(screen.getByText('80GG - Rent (No HRA)')).toBeInTheDocument();
    expect(screen.getByText('80TTA/U - Bank Interest')).toBeInTheDocument();
    expect(screen.getByText('Sec 24(b) - Home Loan')).toBeInTheDocument();
  });

  it('displays correct values for Section C deductions', () => {
    renderComponent();
    expect(
      screen.getByTestId('produced-80d-health-insurance').querySelector('input')
    ).toHaveValue('30000');
    expect(
      screen.getByTestId('produced-80gg-rent-no-hra-').querySelector('input')
    ).toHaveValue('70000');
  });

  it('calls handleDeclarationChange when a deduction field changes', () => {
    renderComponent();
    const sec80DInput = screen
      .getByTestId('produced-80d-health-insurance')
      .querySelector('input');
    fireEvent.change(sec80DInput, { target: { value: '35000' } });
    expect(mockHandleDeclarationChange).toHaveBeenCalledWith(
      'deductions',
      'sec80D',
      'produced',
      '35000',
    );
  });

  it('shows error for 80D if value exceeds limit', () => {
    const declarationsWithHigh80D = {
      ...defaultDeclarations,
      deductions: {
        ...defaultDeclarations.deductions,
        sec80D: { produced: 40000, limited: 25000 }, // Exceeds 25000 limit
      },
    };
    renderComponent({ declarations: declarationsWithHigh80D });
    const sec80DInput = screen
      .getByTestId('produced-80d-health-insurance')
      .querySelector('input');
    expect(sec80DInput).toHaveValue('40000');
    expect(screen.getByText('Max limit is ₹1,00,000')).toBeInTheDocument(); // Limit from createTextField
    expect(sec80DInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows error for 80GG if value exceeds limit', () => {
    const declarationsWithHigh80GG = {
      ...defaultDeclarations,
      deductions: {
        ...defaultDeclarations.deductions,
        sec80GG: { produced: 70000, limited: 60000 }, // Exceeds 60000 limit
      },
    };
    renderComponent({ declarations: declarationsWithHigh80GG });
    const sec80GGInput = screen
      .getByTestId('produced-80gg-rent-no-hra-')
      .querySelector('input');
    expect(sec80GGInput).toHaveValue('70000');
    expect(screen.getByText('Max limit is ₹60,000')).toBeInTheDocument();
    expect(sec80GGInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows error for 80TTA/U if value exceeds limit', () => {
    const declarationsWithHigh80TTA_U = {
      ...defaultDeclarations,
      deductions: {
        ...defaultDeclarations.deductions,
        sec80TTA_U: { produced: 15000, limited: 10000 }, // Exceeds 10000 limit
      },
    };
    renderComponent({ declarations: declarationsWithHigh80TTA_U });
    const sec80TTA_UInput = screen
      .getByTestId('produced-80tta-u-bank-interest')
      .querySelector('input');
    expect(sec80TTA_UInput).toHaveValue('15000');
    expect(screen.getByText('Max limit is ₹50,000')).toBeInTheDocument(); // Limit from createTextField
    expect(sec80TTA_UInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('calls updateHouseProperty when Sec 24(b) Home Loan interest changes', () => {
    renderComponent();
    const sec24BInput = screen
      .getByTestId('produced-sec-24-b-home-loan')
      .querySelector('input');
    fireEvent.change(sec24BInput, { target: { value: '200000' } });
    expect(mockUpdateHouseProperty).toHaveBeenCalledWith('interest', '200000');
  });

  it('shows error for Sec 24(b) Home Loan if value exceeds limit', () => {
    const housePropertyWithHighInterest = { interest: 250000 }; // Exceeds 200000 limit
    renderComponent({ houseProperty: housePropertyWithHighInterest });
    const sec24BInput = screen
      .getByTestId('produced-sec-24-b-home-loan')
      .querySelector('input');
    expect(sec24BInput).toHaveValue('250000');
    expect(screen.getByText('Max limit is ₹2,00,000')).toBeInTheDocument();
    expect(sec24BInput).toHaveAttribute('aria-invalid', 'true');
  });

  // --- Section D: Sec 80C Investments ---
  it('renders all 80C investment fields in Section D', () => {
    renderComponent();
    expect(screen.getByLabelText('NPS Employee')).toBeInTheDocument();
    expect(screen.getByLabelText('NPS Employer')).toBeInTheDocument();
    expect(screen.getByLabelText('Standard 80C')).toBeInTheDocument();
    expect(screen.getByLabelText('Superannuation')).toBeInTheDocument();
  });

  it('displays correct values for Section D 80C investments', () => {
    renderComponent();
    expect(screen.getByLabelText('NPS Employee')).toHaveValue('20000');
    expect(screen.getByLabelText('Standard 80C')).toHaveValue('100000');
  });

  it('calls handleDeclarationChange when an 80C field changes', () => {
    renderComponent();
    const npsEmployeeInput = screen.getByLabelText('NPS Employee');
    fireEvent.change(npsEmployeeInput, { target: { value: '25000' } });
    expect(mockHandleDeclarationChange).toHaveBeenCalledWith(
      'sec80C',
      'npsEmployee',
      null,
      '25000',
    );
  });

  it('shows error for standard80C if value exceeds limit', () => {
    const declarationsWithHighStandard80C = {
      ...defaultDeclarations,
      sec80C: {
        ...defaultDeclarations.sec80C,
        standard80C: 160000, // Exceeds 150000 limit
      },
    };
    renderComponent({ declarations: declarationsWithHighStandard80C });
    const standard80CInput = screen.getByLabelText('Standard 80C');
    expect(standard80CInput).toHaveValue('160000');
    expect(screen.getByText('Max limit is ₹1,50,000')).toBeInTheDocument();
    expect(standard80CInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays the total 80C claimed amount', () => {
    renderComponent();
    expect(screen.getByText('Total 80C Claimed')).toBeInTheDocument();
    expect(screen.getByText('₹ 1,60,000')).toBeInTheDocument();
  });

  // --- Edge Cases / Negative Scenarios for createTextField ---
  it('createTextField handles null/undefined currentValue gracefully', () => {
    const declarationsWithNullValues = {
      ...defaultDeclarations,
      exemptions: {
        ...defaultDeclarations.exemptions,
        hra: { produced: null, limited: 0 },
      },
      otherIncome: {
        ...defaultDeclarations.otherIncome,
        bonus: undefined,
      },
    };
    renderComponent({ declarations: declarationsWithNullValues });
    const hraInput = screen
      .getByTestId('produced-hra-exemption')
      .querySelector('input');
    expect(hraInput).toHaveValue(''); // TextField with null/undefined value renders as empty string
    const bonusInput = screen.getByLabelText('Bonus');
    expect(bonusInput).toHaveValue('');
  });

  it('createTextField handles zero limit correctly (no error)', () => {
    const declarationsWithZeroLimit = {
      ...defaultDeclarations,
      exemptions: {
        ...defaultDeclarations.exemptions,
        transport: { produced: 1000, limited: 0 }, // Limit is 0, but value is 1000
      },
    };
    renderComponent({ declarations: declarationsWithZeroLimit });
    const transportInput = screen
      .getByTestId('produced-transport-exemption')
      .querySelector('input');
    expect(transportInput).toHaveValue('1000');
    expect(screen.queryByText('Max limit is ₹0')).not.toBeInTheDocument(); // Should not show error if limit is 0
    expect(transportInput).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('createTextField handles negative limit correctly (no error)', () => {
    const declarationsWithNegativeLimit = {
      ...defaultDeclarations,
      exemptions: {
        ...defaultDeclarations.exemptions,
        transport: { produced: 1000, limited: -100 }, // Limit is negative
      },
    };
    renderComponent({ declarations: declarationsWithNegativeLimit });
    const transportInput = screen
      .getByTestId('produced-transport-exemption')
      .querySelector('input');
    expect(transportInput).toHaveValue('1000');
    expect(screen.queryByText(/Max limit is/i)).not.toBeInTheDocument();
    expect(transportInput).not.toHaveAttribute('aria-invalid', 'true');
  });
});