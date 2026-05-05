import React from 'react';
import { render, screen } from '@testing-library/react';
import FutureGoalsTab from '../../../features/profile/tabs/FutureGoalsTab';
import { useSelector, useDispatch } from 'react-redux';
import * as profileSlice from '../../../store/profileSlice';

const mockState = {
  emi: { tenure: 10, tenureType: 'years' },
  emiCalculator: {},
};

jest.mock('react-redux', () => ({
  useSelector: jest.fn((fn) => fn(mockState)),
  useDispatch: jest.fn(),
}));

jest.mock('../../../store/profileSlice', () => ({
  selectGoals: jest.fn(() => []),
  selectConsiderInflation: jest.fn(() => false),
  selectCurrentAge: jest.fn(() => 30),
  selectRetirementAge: jest.fn(() => 60),
  selectProfileExpenses: jest.fn(() => []),
  selectGeneralInflationRate: jest.fn(() => 0.06),
  selectEducationInflationRate: jest.fn(() => 0.08),
  selectCareerGrowthRate: jest.fn(() => ({ type: 'percentage', value: 0.1 })),
  selectCurrentSurplus: jest.fn(() => 50000),
  selectTotalMonthlyIncome: jest.fn(() => 100000),
  selectTotalMonthlyGoalContributions: jest.fn(() => 0),
  selectIndividualGoalInvestmentContributions: jest.fn(() => []),
  selectGoalsWithMonthlyContributions: jest.fn(() => []),
  addGoal: jest.fn(),
  updateGoal: jest.fn(),
  deleteGoal: jest.fn(),
  setConsiderInflation: jest.fn(),
}));

jest.mock('../../../store/emiSlice', () => ({
  selectCurrency: jest.fn(() => '₹'),
}));

jest.mock('../../../features/emiCalculator/utils/emiCalculator', () => ({
  selectCalculatedValues: jest.fn(() => ({ emi: 0 })),
}));

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="recharts-container">{children}</div>
  ),
  AreaChart: () => <div data-testid="area-chart" />,
  BarChart: () => <div data-testid="bar-chart" />,
  Line: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Area: () => null,
  ReferenceLine: () => null,
}));

jest.mock('../../../components/common/EditableGoalItem', () => (props) => (
  <div data-testid="editable-goal-item">{props.goal.name}</div>
));

jest.mock('../../profile/components/GoalForm', () => () => (
  <div data-testid="goal-form" />
));

describe.skip('FutureGoalsTab Component', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
  });

  it('renders smart goal templates', () => {
    render(<FutureGoalsTab />);
    expect(screen.getByText(/Smart Goal Templates/i)).toBeInTheDocument();
    expect(screen.getByText(/Retirement/i)).toBeInTheDocument();
    expect(screen.getByText(/Child's Education/i)).toBeInTheDocument();
    expect(screen.getByText(/Emergency Fund/i)).toBeInTheDocument();
  });

  it("displays 'No goals yet' when the goals list is empty", () => {
    profileSlice.selectGoals.mockReturnValue([]);
    render(<FutureGoalsTab />);
    expect(screen.getByText(/No goals yet/i)).toBeInTheDocument();
  });

  it('renders goals when they exist in the store', () => {
    profileSlice.selectGoals.mockReturnValue([
      {
        id: 1,
        name: 'Buy a House',
        targetAmount: 5000000,
        targetYear: 2030,
        category: 'general',
      },
    ]);

    render(<FutureGoalsTab />);
    expect(screen.getByTestId('editable-goal-item')).toBeInTheDocument();
    expect(screen.getByText('Buy a House')).toBeInTheDocument();
  });

  it("disables 'New Goal' button and shows warning if surplus is negative", () => {
    profileSlice.selectCurrentSurplus.mockReturnValue(-5000);

    render(<FutureGoalsTab />);
    const newGoalButton = screen.getByRole('button', { name: /New Goal/i });
    expect(newGoalButton).toBeDisabled();
    expect(
      screen.getByText(
        /Cannot add new goals. Your current surplus is negative./i,
      ),
    ).toBeInTheDocument();
  });
});
