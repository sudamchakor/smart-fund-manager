import React from 'react';
import { render, screen } from '@testing-library/react';
import WealthTab from '../../../../features/profile/tabs/WealthTab.jsx'; // Corrected path

// Mock Redux hooks and selectors
jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) =>
    selector({
      profile: {
        incomes: [],
        expenses: [],
        goals: [],
        currentAge: 30,
        retirementAge: 60,
        careerGrowthRate: { type: 'percentage', value: 0.05 },
        generalInflationRate: 0.06,
        educationInflationRate: 0.08,
      },
      emi: {
        currency: '₹',
      },
      emiCalculator: { // This is where selectCalculatedValues expects its inputs
        loanDetails: {
          homeValue: 5000000,
          marginAmount: 1000000,
          marginUnit: 'Rs',
          loanInsurance: 0,
          interestRate: 8.5,
          loanTenure: 20,
          tenureUnit: 'years',
          loanFees: 10000,
          feesUnit: 'Rs',
          startDate: new Date().toISOString(),
          yearlyPaymentIncreaseAmount: 0,
          yearlyPaymentIncreaseUnit: '%',
        },
        expenses: {
          oneTimeExpenses: 0, propertyTaxes: 0, homeInsurance: 0, maintenance: 0,
        },
        prepayments: {
          monthly: { amount: 0 }, yearly: { amount: 0 }, quarterly: { amount: 0 }, oneTime: { amount: 0 },
        },
        emi: 0, // This is the 'emi' property that WealthTab tries to destructure
      },
    }),
  ),
  useDispatch: () => jest.fn(),
}));

// Mock child components
jest.mock('../../../../features/profile/components/InvestmentSummary.jsx', () => () => (
  <div data-testid="investment-summary">InvestmentSummary</div>
));
jest.mock('../../../../features/profile/components/AssetAllocationChart.jsx', () => () => (
  <div data-testid="asset-allocation-chart">AssetAllocationChart</div>
));
jest.mock('../../../../features/profile/components/ProjectedCashFlowChart.jsx', () => () => (
  <div data-testid="projected-cash-flow-chart">ProjectedCashFlowChart</div>
));
jest.mock('../../../../features/profile/components/CashFlowDonutChart.jsx', () => () => (
  <div data-testid="cash-flow-donut-chart">CashFlowDonutChart</div>
));
jest.mock('../../../../features/profile/components/WealthProjectionEngine.jsx', () => () => (
  <div data-testid="wealth-projection-engine">WealthProjectionEngine</div>
));
jest.mock('../../../../features/profile/components/CorrectionEngine.jsx', () => () => (
  <div data-testid="correction-engine">CorrectionEngine</div>
));
jest.mock('../../../../features/profile/components/DebtAccelerator.jsx', () => () => (
  <div data-testid="debt-accelerator">DebtAccelerator</div>
));
jest.mock('../../../../features/profile/components/ExpenseOptimizer.jsx', () => () => (
  <div data-testid="expense-optimizer">ExpenseOptimizer</div>
));
jest.mock('../../../../features/profile/components/AutoBalancer.jsx', () => () => ( // Corrected path
  <div data-testid="auto-balancer">AutoBalancer</div>
));
jest.mock('../../../../features/profile/components/ScenarioManager.jsx', () => () => ( // Corrected path
  <div data-testid="scenario-manager">ScenarioManager</div>
));jest.mock('../../../../features/profile/components/BridgeGapModal.jsx', () => () => (
  <div data-testid="bridge-gap-modal">BridgeGapModal</div>
));
jest.mock('../../../../features/profile/components/FinancialModal.jsx', () => () => (
  <div data-testid="financial-modal">FinancialModal</div>
));jest.mock('../../../../features/profile/components/GoalCoverage.jsx', () => () => ( // Corrected path
  <div data-testid="goal-coverage">GoalCoverage</div>
));
jest.mock('../../../../features/profile/components/FinancialSection.jsx', () => () => ( // Corrected path
  <div data-testid="financial-section">FinancialSection</div>
));
jest.mock('../../../../features/profile/components/FinancialSettings.jsx', () => () => ( // Corrected path
  <div data-testid="financial-settings">FinancialSettings</div>
));

describe('WealthTab', () => {
  it('renders without crashing', () => {
    render(<WealthTab />);
    expect(
      screen.getByText(/Wealth Management Dashboard/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('investment-summary')).toBeInTheDocument();
    expect(screen.getByTestId('asset-allocation-chart')).toBeInTheDocument();
    expect(screen.getByTestId('projected-cash-flow-chart')).toBeInTheDocument();
    expect(screen.getByTestId('cash-flow-donut-chart')).toBeInTheDocument();
    expect(screen.getByTestId('wealth-projection-engine')).toBeInTheDocument();
    expect(screen.getByTestId('correction-engine')).toBeInTheDocument();
    expect(screen.getByTestId('debt-accelerator')).toBeInTheDocument();
    expect(screen.getByTestId('expense-optimizer')).toBeInTheDocument();
    expect(screen.getByTestId('auto-balancer')).toBeInTheDocument();
    expect(screen.getByTestId('scenario-manager')).toBeInTheDocument();
    expect(screen.getByTestId('bridge-gap-modal')).toBeInTheDocument();
    expect(screen.getByTestId('financial-modal')).toBeInTheDocument();
    expect(screen.getByTestId('goal-coverage')).toBeInTheDocument();
    expect(screen.getByTestId('financial-section')).toBeInTheDocument();
    expect(screen.getByTestId('financial-settings')).toBeInTheDocument();
  });
});
