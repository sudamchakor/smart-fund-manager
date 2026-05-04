import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PersonalProfileTab from "../../../features/profile/tabs/PersonalProfileTab";
import { useSelector, useDispatch } from "react-redux";
import * as profileSlice from "../../../store/profileSlice";

const mockState = {
  emi: { tenure: 10, tenureType: 'years' },
  emiCalculator: {}
};

jest.mock("react-redux", () => ({
  useSelector: jest.fn((fn) => fn(mockState)),
  useDispatch: jest.fn(),
}));

jest.mock("../../../store/profileSlice", () => ({
  selectIncomes: jest.fn(() => [{ id: 1, name: "Salary", amount: 80000, frequency: "monthly" }]),
  selectProfileExpenses: jest.fn(() => [{ id: 2, name: "Groceries", amount: 20000, frequency: "monthly" }]),
  selectCurrentAge: jest.fn(() => 30),
  selectRetirementAge: jest.fn(() => 60),
  selectTotalMonthlyIncome: jest.fn(() => 80000),
  selectTotalMonthlyExpenses: jest.fn(() => 20000),
  selectCurrentSurplus: jest.fn(() => 60000),
  selectCareerGrowthRate: jest.fn(() => ({ type: 'percentage', value: 0.1 })),
  selectTotalMonthlyGoalContributions: jest.fn(() => 0),
  selectIndividualGoalInvestmentContributions: jest.fn(() => []),
  selectGoals: jest.fn(() => []),
  addIncome: jest.fn(),
  deleteIncome: jest.fn(),
  updateIncome: jest.fn(),
  addExpense: jest.fn(),
  deleteExpense: jest.fn(),
  updateExpense: jest.fn(),
  setCurrentAge: jest.fn(),
  setRetirementAge: jest.fn(),
  setCareerGrowthRate: jest.fn(),
}));

jest.mock("../../../store/emiSlice", () => ({
  selectCurrency: jest.fn(() => "₹"),
}));

jest.mock("../../../features/emiCalculator/utils/emiCalculator", () => ({
  selectCalculatedValues: jest.fn(() => ({ emi: 5000 })),
}));

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="recharts-container">{children}</div>,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => null,
  Cell: () => null,
  ComposedChart: () => <div data-testid="composed-chart" />,
  Bar: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

jest.mock("@mui/x-date-pickers/DatePicker", () => ({
  DatePicker: ({ label }) => <div data-testid={`datepicker-${label}`}>{label}</div>,
}));

jest.mock("../../profile/components/BasicInfoDisplay", () => ({ onEdit }) => (
  <div data-testid="basic-info-display">
    <button onClick={onEdit}>Edit Basic Info</button>
  </div>
));

jest.mock("../../profile/components/BasicInfoEdit", () => ({ onCancel }) => (
  <div data-testid="basic-info-edit">
    <button onClick={onCancel}>Cancel Edit</button>
  </div>
));

jest.mock("../../../components/common/EditableIncomeExpenseItem", () => ({ item }) => (
  <div data-testid={`editable-item-${item.id}`}>{item.name}</div>
));

jest.mock("../../../components/common/ExpenseReadOnlyItem", () => ({ item }) => (
  <div data-testid={`readonly-item-${item.id}`}>{item.name}</div>
));

jest.mock("../../../components/common/SliderInput", () => (props) => <div data-testid={`slider-${props.label}`}>{props.label}</div>);
jest.mock("../../../components/common/CommonComponents", () => ({
  AmountWithUnitInput: () => <div data-testid="amount-with-unit-input" />
}));

describe.skip("PersonalProfileTab Component", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
  });

  it("renders BasicInfoDisplay by default and toggles to BasicInfoEdit", () => {
    render(<PersonalProfileTab onEditGoal={jest.fn()} />);

    expect(screen.getByTestId("basic-info-display")).toBeInTheDocument();
    expect(screen.queryByTestId("basic-info-edit")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Edit Basic Info"));
    expect(screen.getByTestId("basic-info-edit")).toBeInTheDocument();
    expect(screen.queryByTestId("basic-info-display")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel Edit"));
    expect(screen.getByTestId("basic-info-display")).toBeInTheDocument();
  });

  it("renders incomes and expenses properly", () => {
    render(<PersonalProfileTab onEditGoal={jest.fn()} />);

    expect(screen.getByTestId("editable-item-1")).toHaveTextContent("Salary");
    expect(screen.getByTestId("editable-item-2")).toHaveTextContent("Groceries");
    expect(screen.getByTestId("readonly-item-home-loan-emi")).toHaveTextContent("Home Loan EMI");
  });

  it("shows budget exceeded warning when surplus is negative", () => {
    profileSlice.selectCurrentSurplus.mockReturnValue(-10000);
    profileSlice.selectTotalMonthlyIncome.mockReturnValue(50000);
    profileSlice.selectTotalMonthlyExpenses.mockReturnValue(60000);
    
    render(<PersonalProfileTab onEditGoal={jest.fn()} />);

    // Expenses + EMI = 60,000 + 5,000 = 65,000
    // Exceeds 50,000 by 10,000 (Based on mock surplus amount).
    expect(screen.getByText(/Your spending \(₹65,000\) exceeds income \(₹50,000\) by ₹10,000/i)).toBeInTheDocument();
  });
});