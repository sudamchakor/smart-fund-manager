import React from 'react';
import { render, screen } from '@testing-library/react';
import WealthTab from '../../../features/profile/tabs/WealthTab';

// Mock Redux hooks and selectors
jest.mock('react-redux', () => ({
  useSelector: jest.fn(selector => selector({
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
    emiCalculator: {
      emi: 0,
    },
  })),
  useDispatch: () => jest.fn(),
}));

// Mock child components
jest.mock('../../profile/components/InvestmentSummary', () => () => <div data-testid="investment-summary">InvestmentSummary</div>);
jest.mock('../../profile/components/AssetAllocationChart', () => () => <div data-testid="asset-allocation-chart">AssetAllocationChart</div>);
jest.mock('../../profile/components/ProjectedCashFlowChart', () => () => <div data-testid="projected-cash-flow-chart">ProjectedCashFlowChart</div>);
jest.mock('../../profile/components/CashFlowDonutChart', () => () => <div data-testid="cash-flow-donut-chart">CashFlowDonutChart</div>);
jest.mock('../../profile/components/WealthProjectionEngine', () => () => <div data-testid="wealth-projection-engine">WealthProjectionEngine</div>);
jest.mock('../../profile/components/CorrectionEngine', () => () => <div data-testid="correction-engine">CorrectionEngine</div>);
jest.mock('../../profile/components/DebtAccelerator', () => () => <div data-testid="debt-accelerator">DebtAccelerator</div>);
jest.mock('../../profile/components/ExpenseOptimizer', () => () => <div data-testid="expense-optimizer">ExpenseOptimizer</div>);
jest.mock('../../profile/components/AutoBalancer', () => () => <div data-testid="auto-balancer">AutoBalancer</div>);
jest.mock('../../profile/components/ScenarioManager', () => () => <div data-testid="scenario-manager">ScenarioManager</div>);
jest.mock('../../profile/components/BridgeGapModal', () => () => <div data-testid="bridge-gap-modal">BridgeGapModal</div>);
jest.mock('../../profile/components/FinancialModal', () => () => <div data-testid="financial-modal">FinancialModal</div>);
jest.mock('../../profile/components/GoalCoverage', () => () => <div data-testid="goal-coverage">GoalCoverage</div>);
jest.mock('../../profile/components/FinancialSection', () => () => <div data-testid="financial-section">FinancialSection</div>);
jest.mock('../../profile/components/FinancialSettings', () => () => <div data-testid="financial-settings">FinancialSettings</div>);

describe.skip('WealthTab', () => {
  it('renders without crashing', () => {
    render(<WealthTab />);
    expect(screen.getByText(/Wealth Management Dashboard/i)).toBeInTheDocument();
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