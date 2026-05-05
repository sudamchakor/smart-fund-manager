import { configureStore } from '@reduxjs/toolkit';
import profileReducer, {
  setCurrentAge,
  setRetirementAge,
  setConsiderInflation,
  setGeneralInflationRate,
  setEducationInflationRate,
  setCareerGrowthRate,
  setTotalDebt,
  addIncome,
  updateIncome,
  deleteIncome,
  addExpense,
  updateExpense,
  deleteExpense,
  addGoal,
  updateGoal,
  deleteGoal,
  addTemplateGoal,
  resetProfile,
  selectCurrentAge,
  selectRetirementAge,
  selectConsiderInflation,
  selectGeneralInflationRate,
  selectEducationInflationRate,
  selectCareerGrowthRate,
  selectTotalDebt,
  selectIncomes,
  selectProfileExpenses,
  selectGoals,
  selectTotalMonthlyIncome,
  selectTotalMonthlyExpenses,
  selectTotalMonthlyGoalContributions,
  selectIndividualGoalInvestmentContributions,
  selectGoalsWithMonthlyContributions,
  selectCurrentSurplus,
  selectIsTotalOutflowExceedingIncome,
  selectDebtFreeCountdown,
  selectProjectedMonthlyIncome,
  selectInflationAdjustedValue,
  selectNeedsExpenses,
  selectWantsExpenses,
  selectFutureWealthContributions,
  selectTotalOutflow,
} from '../../../src/store/profileSlice';

const currentYear = new Date().getFullYear();

const initialState = {
  name: '',
  occupation: '',
  riskTolerance: 'medium',
  currentAge: 30,
  retirementAge: 60,
  considerInflation: false,
  generalInflationRate: 0.06,
  educationInflationRate: 0.1,
  careerGrowthRate: 0.05,
  expectedReturnRate: 0.12,
  stepUpPercentage: 0.05,
  postTax: false,
  scenario: 'current', // "current", "frugal", "aggressive"
  taxRegime: 'new', // 'new' vs 'old'
  emergencyFundTarget: 6, // in months
  riskProfile: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3 }, // 5 questions, default to neutral
  totalDebt: 0,
  incomes: {
    1: { id: 1, name: 'Salary', amount: 100000, frequency: 'monthly' },
  },
  expenses: [
    {
      id: 1,
      name: 'Basic Needs',
      amount: 30000,
      type: 'monthly',
      category: 'basic',
      frequency: 'monthly',
    },
    {
      id: 2,
      name: 'Discretionary',
      amount: 20000,
      type: 'monthly',
      category: 'discretionary',
      frequency: 'monthly',
    },
  ],
  goals: {
    1: {
      id: 1,
      name: 'Retirement',
      targetAmount: 20000000,
      targetYear: currentYear + 30,
      category: 'retirement',
      investmentPlans: [],
      priority: 1, // Add priority
    },
  },
};

describe.skip('profileSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        profile: profileReducer,
      },
      preloadedState: {
        profile: JSON.parse(JSON.stringify(initialState)), // Deep copy to avoid mutation across tests
      },
    });
  });

  // --- Reducers Tests ---

  it('should return the initial state', () => {
    expect(profileReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle setCurrentAge', () => {
    store.dispatch(setCurrentAge(35));
    expect(store.getState().profile.currentAge).toBe(35);
  });

  it('should handle setRetirementAge', () => {
    store.dispatch(setRetirementAge(65));
    expect(store.getState().profile.retirementAge).toBe(65);
  });

  it('should handle setConsiderInflation', () => {
    store.dispatch(setConsiderInflation(true));
    expect(store.getState().profile.considerInflation).toBe(true);
  });

  it('should handle setGeneralInflationRate', () => {
    store.dispatch(setGeneralInflationRate(0.07));
    expect(store.getState().profile.generalInflationRate).toBe(0.07);
  });

  it('should handle setEducationInflationRate', () => {
    store.dispatch(setEducationInflationRate(0.12));
    expect(store.getState().profile.educationInflationRate).toBe(0.12);
  });

  it('should handle setCareerGrowthRate', () => {
    store.dispatch(setCareerGrowthRate(0.06));
    expect(store.getState().profile.careerGrowthRate).toBe(0.06);
  });

  it('should handle setTotalDebt', () => {
    store.dispatch(setTotalDebt(50000));
    expect(store.getState().profile.totalDebt).toBe(50000);
  });

  it('should handle addIncome', () => {
    store.dispatch(
      addIncome({ name: 'Bonus', amount: 10000, frequency: 'yearly' }),
    );
    const incomes = store.getState().profile.incomes;
    expect(Object.keys(incomes).length).toBe(2);
    expect(incomes[2]).toEqual({
      id: 2,
      name: 'Bonus',
      amount: 10000,
      frequency: 'yearly',
    });
  });

  it('should handle updateIncome', () => {
    store.dispatch(
      updateIncome({
        id: 1,
        name: 'Main Salary',
        amount: 120000,
        frequency: 'monthly',
      }),
    );
    const incomes = store.getState().profile.incomes;
    expect(incomes[1]).toEqual({
      id: 1,
      name: 'Main Salary',
      amount: 120000,
      frequency: 'monthly',
    });
  });

  it('should not update income if id not found', () => {
    store.dispatch(
      updateIncome({
        id: 99,
        name: 'Non Existent',
        amount: 100,
        frequency: 'monthly',
      }),
    );
    const incomes = store.getState().profile.incomes;
    expect(Object.keys(incomes).length).toBe(1);
    expect(incomes[1].name).toBe('Salary');
  });

  it('should handle deleteIncome', () => {
    store.dispatch(deleteIncome(1));
    expect(Object.keys(store.getState().profile.incomes).length).toBe(0);
  });

  it('should handle addExpense', () => {
    store.dispatch(
      addExpense({
        name: 'Rent',
        amount: 15000,
        type: 'monthly',
        category: 'basic',
        frequency: 'monthly',
      }),
    );
    const expenses = store.getState().profile.expenses;
    expect(expenses.length).toBe(3);
    expect(expenses[2]).toEqual({
      id: 3,
      name: 'Rent',
      amount: 15000,
      type: 'monthly',
      category: 'basic',
      frequency: 'monthly',
    });
  });

  it('should handle updateExpense', () => {
    store.dispatch(
      updateExpense({
        id: 1,
        name: 'Updated Basic Needs',
        amount: 35000,
        type: 'monthly',
        category: 'basic',
        frequency: 'monthly',
      }),
    );
    const expenses = store.getState().profile.expenses;
    expect(expenses[0]).toEqual({
      id: 1,
      name: 'Updated Basic Needs',
      amount: 35000,
      type: 'monthly',
      category: 'basic',
      frequency: 'monthly',
    });
  });

  it('should not update expense if id not found', () => {
    store.dispatch(
      updateExpense({
        id: 99,
        name: 'Non Existent',
        amount: 100,
        type: 'monthly',
        category: 'basic',
        frequency: 'monthly',
      }),
    );
    const expenses = store.getState().profile.expenses;
    expect(expenses.length).toBe(2);
    expect(expenses[0].name).toBe('Basic Needs');
  });

  it('should handle deleteExpense', () => {
    store.dispatch(deleteExpense(1));
    expect(store.getState().profile.expenses.length).toBe(1);
  });

  it('should handle addGoal', () => {
    const newGoal = {
      name: 'Car',
      targetAmount: 500000,
      targetYear: 2025,
      category: 'purchase',
      investmentPlans: [],
    };
    store.dispatch(addGoal(newGoal));
    const goals = store.getState().profile.goals;
    expect(Object.keys(goals).length).toBe(2);
    expect(goals[2].name).toBe('Car');
    expect(goals[2].id).toBe(2);
    expect(goals[2].investmentPlans).toEqual([]);
    expect(goals[2].priority).toBe(2);
  });

  it('should handle addGoal with existing investmentPlans', () => {
    const newGoal = {
      name: 'House',
      targetAmount: 10000000,
      targetYear: 2030,
      category: 'purchase',
      investmentPlans: [{ id: 1, type: 'sip', monthlyContribution: 5000 }],
    };
    store.dispatch(addGoal(newGoal));
    const goals = store.getState().profile.goals;
    expect(Object.keys(goals).length).toBe(2);
    expect(goals[2].name).toBe('House');
    expect(goals[2].investmentPlans).toEqual([
      { id: 1, type: 'sip', monthlyContribution: 5000 },
    ]);
  });

  it('should handle updateGoal', () => {
    store.dispatch(
      updateGoal({
        id: 1,
        name: 'Early Retirement',
        targetAmount: 25000000,
        targetYear: new Date().getFullYear() + 20,
        category: 'retirement',
        investmentPlans: [],
      }),
    );
    const goals = store.getState().profile.goals;
    expect(goals[1].name).toBe('Early Retirement');
    expect(goals[1].targetAmount).toBe(25000000);
  });

  it('should not update goal if id not found', () => {
    store.dispatch(
      updateGoal({
        id: 99,
        name: 'Non Existent',
        targetAmount: 100,
        targetYear: 2025,
        category: 'other',
        investmentPlans: [],
      }),
    );
    const goals = store.getState().profile.goals;
    expect(Object.keys(goals).length).toBe(1);
    expect(goals[1].name).toBe('Retirement');
  });

  it('should handle deleteGoal', () => {
    store.dispatch(deleteGoal(1));
    expect(Object.keys(store.getState().profile.goals).length).toBe(0);
  });

  it('should handle addTemplateGoal for emergencyFund', () => {
    store.dispatch(
      addTemplateGoal({ type: 'emergencyFund', monthlyExpenses: 50000 }),
    );
    const goals = store.getState().profile.goals;
    expect(Object.keys(goals).length).toBe(2);
    expect(goals[2].name).toBe('Emergency Fund');
    expect(goals[2].targetAmount).toBe(50000 * 6);
    expect(goals[2].category).toBe('safety');
  });

  it('should handle addTemplateGoal for childEducation', () => {
    store.dispatch(addTemplateGoal({ type: 'childEducation' }));
    const goals = store.getState().profile.goals;
    expect(Object.keys(goals).length).toBe(2);
    expect(goals[2].name).toBe("Child's Higher Education");
    expect(goals[2].targetAmount).toBe(5000000);
    expect(goals[2].category).toBe('education');
  });

  it('should handle addTemplateGoal for retirement', () => {
    // Reset state to ensure only one retirement goal is added for this test
    store = configureStore({
      reducer: {
        profile: profileReducer,
      },
      preloadedState: {
        profile: { ...initialState, goals: {} }, // Start with no goals
      },
    });
    store.dispatch(addTemplateGoal({ type: 'retirement' }));
    const goals = store.getState().profile.goals;
    expect(Object.keys(goals).length).toBe(1);
    expect(goals[1].name).toBe('Retirement');
    expect(goals[1].targetAmount).toBe(20000000);
    expect(goals[1].category).toBe('retirement');
    expect(goals[1].targetYear).toBe(initialState.retirementAge);
  });

  it('should not add template goal for unknown type', () => {
    store.dispatch(addTemplateGoal({ type: 'unknown' }));
    expect(Object.keys(store.getState().profile.goals).length).toBe(1); // Should remain 1
  });

  it('should handle resetProfile', () => {
    store.dispatch(setCurrentAge(40));
    store.dispatch(
      addIncome({ name: 'Extra', amount: 5000, frequency: 'monthly' }),
    );
    store.dispatch(resetProfile());
    expect(store.getState().profile).toEqual(initialState);
  });

  // --- Selectors Tests ---

  it('selectCurrentAge should return the current age', () => {
    expect(selectCurrentAge(store.getState())).toBe(30);
  });

  it('selectRetirementAge should return the retirement age', () => {
    expect(selectRetirementAge(store.getState())).toBe(60);
  });

  it('selectConsiderInflation should return considerInflation', () => {
    expect(selectConsiderInflation(store.getState())).toBe(false);
  });

  it('selectGeneralInflationRate should return generalInflationRate', () => {
    expect(selectGeneralInflationRate(store.getState())).toBe(0.06);
  });

  it('selectEducationInflationRate should return educationInflationRate', () => {
    expect(selectEducationInflationRate(store.getState())).toBe(0.1);
  });

  it('selectCareerGrowthRate should return careerGrowthRate', () => {
    expect(selectCareerGrowthRate(store.getState())).toBe(0.05);
  });

  it('selectTotalDebt should return totalDebt', () => {
    expect(selectTotalDebt(store.getState())).toBe(0);
  });

  it('selectIncomes should return incomes array', () => {
    expect(selectIncomes(store.getState())).toEqual(
      Object.values(initialState.incomes),
    );
  });

  it('selectProfileExpenses should return expenses array', () => {
    expect(selectProfileExpenses(store.getState())).toEqual(
      initialState.expenses,
    );
  });

  it('selectGoals should return goals array', () => {
    expect(selectGoals(store.getState())).toEqual(
      Object.values(initialState.goals),
    );
  });

  it('selectTotalMonthlyIncome should calculate total monthly income', () => {
    store.dispatch(
      addIncome({ name: 'Part-time', amount: 5000, frequency: 'monthly' }),
    );
    expect(selectTotalMonthlyIncome(store.getState())).toBe(100000 + 5000);
  });

  it('selectTotalMonthlyIncome should handle zero incomes', () => {
    store.dispatch(deleteIncome(1));
    expect(selectTotalMonthlyIncome(store.getState())).toBe(0);
  });

  it('selectTotalMonthlyExpenses should calculate total monthly expenses', () => {
    // Initial: 30000 (monthly) + 20000 (monthly) = 50000
    expect(selectTotalMonthlyExpenses(store.getState())).toBe(50000);

    // Add a quarterly expense
    store.dispatch(
      addExpense({
        id: 3,
        name: 'Insurance',
        amount: 3000,
        type: 'quarterly',
        category: 'basic',
        frequency: 'quarterly',
      }),
    );
    // 50000 + (3000 / 3) = 51000
    expect(selectTotalMonthlyExpenses(store.getState())).toBe(51000);

    // Add a yearly expense
    store.dispatch(
      addExpense({
        id: 4,
        name: 'Subscription',
        amount: 1200,
        type: 'yearly',
        category: 'discretionary',
        frequency: 'yearly',
      }),
    );
    // 51000 + (1200 / 12) = 51100
    expect(selectTotalMonthlyExpenses(store.getState())).toBe(51100);
  });

  it('selectTotalMonthlyExpenses should handle zero expenses', () => {
    store.dispatch(deleteExpense(1));
    store.dispatch(deleteExpense(2));
    expect(selectTotalMonthlyExpenses(store.getState())).toBe(0);
  });

  it('selectTotalMonthlyGoalContributions should calculate total monthly goal contributions', () => {
    store.dispatch(
      updateGoal({
        id: 1,
        name: 'Retirement',
        targetAmount: 20000000,
        targetYear: new Date().getFullYear() + 30,
        category: 'retirement',
        investmentPlans: [
          { id: 1, type: 'sip', monthlyContribution: 5000 },
          {
            id: 2,
            type: 'stepUpSip',
            monthlyContribution: 2000,
            stepUpRate: 0.1,
          },
        ],
      }),
    );
    expect(selectTotalMonthlyGoalContributions(store.getState())).toBe(7000);
  });

  it('selectTotalMonthlyGoalContributions should handle no investment plans', () => {
    expect(selectTotalMonthlyGoalContributions(store.getState())).toBe(0);
  });

  it('selectIndividualGoalInvestmentContributions should return correct contributions for SIP and Step-up SIP', () => {
    const currentYear = new Date().getFullYear();
    store.dispatch(
      updateGoal({
        id: 1,
        name: 'Retirement',
        targetAmount: 20000000,
        targetYear: currentYear + 30,
        category: 'retirement',
        investmentPlans: [
          {
            id: 1,
            type: 'sip',
            monthlyContribution: 5000,
            startYear: currentYear,
            endYear: currentYear + 30,
          },
          {
            id: 2,
            type: 'stepUpSip',
            monthlyContribution: 2000,
            stepUpRate: 0.1,
            startYear: currentYear + 1,
            endYear: currentYear + 20,
          },
        ],
      }),
    );

    const contributions = selectIndividualGoalInvestmentContributions(
      store.getState(),
    );
    expect(contributions.length).toBe(2);
    expect(contributions[0]).toEqual({
      id: `goal-1-plan-1`,
      name: `Retirement (SIP)`,
      amount: 5000,
      type: 'monthly',
      category: 'investment',
      frequency: 'monthly',
      goalId: 1,
      goalTargetYear: currentYear + 30,
      startYear: currentYear,
      endYear: currentYear + 30,
    });
    expect(contributions[1]).toEqual({
      id: `goal-1-plan-2`,
      name: `Retirement (Step-up SIP (0.1%))`,
      amount: 2000,
      type: 'monthly',
      category: 'investment',
      frequency: 'monthly',
      goalId: 1,
      goalTargetYear: currentYear + 30,
      startYear: currentYear + 1,
      endYear: currentYear + 20,
    });
  });

  it('selectIndividualGoalInvestmentContributions should return correct contributions for Lumpsum and FD', () => {
    const currentYear = new Date().getFullYear();
    store.dispatch(
      addGoal({
        id: 2,
        name: 'House Downpayment',
        targetAmount: 5000000,
        targetYear: currentYear + 5,
        category: 'purchase',
        investmentPlans: [
          {
            id: 1,
            type: 'lumpsum',
            investedAmount: 1000000,
            startYear: currentYear + 2,
            endYear: currentYear + 5,
          },
          {
            id: 2,
            type: 'fd',
            investedAmount: 500000,
            startYear: currentYear + 1,
            endYear: currentYear + 3,
          },
        ],
      }),
    );

    const contributions = selectIndividualGoalInvestmentContributions(
      store.getState(),
    );
    // There's an existing retirement goal with no plans, so it won't add to this.
    // We expect 2 contributions from the new goal.
    expect(contributions.length).toBe(2);
    expect(contributions[0]).toEqual({
      id: `goal-2-plan-1`,
      name: `House Downpayment (Lumpsum)`,
      amount: 1000000,
      type: 'one-time-yearly',
      category: 'investment',
      frequency: 'yearly',
      goalId: 2,
      year: currentYear + 2,
      goalTargetYear: currentYear + 5,
      startYear: currentYear + 2,
      endYear: currentYear + 5,
    });
    expect(contributions[1]).toEqual({
      id: `goal-2-plan-2`,
      name: `House Downpayment (Fixed Deposit)`,
      amount: 500000,
      type: 'one-time-yearly',
      category: 'investment',
      frequency: 'yearly',
      goalId: 2,
      year: currentYear + 1,
      goalTargetYear: currentYear + 5,
      startYear: currentYear + 1,
      endYear: currentYear + 3,
    });
  });

  it('selectIndividualGoalInvestmentContributions should handle empty investment plans', () => {
    store.dispatch(
      updateGoal({
        id: 1,
        name: 'Retirement',
        targetAmount: 20000000,
        targetYear: new Date().getFullYear() + 30,
        category: 'retirement',
        investmentPlans: [],
      }),
    );
    expect(
      selectIndividualGoalInvestmentContributions(store.getState()).length,
    ).toBe(0);
  });

  it('selectGoalsWithMonthlyContributions should return goals with aggregated monthly contributions', () => {
    store.dispatch(
      updateGoal({
        id: 1,
        name: 'Retirement',
        targetAmount: 20000000,
        targetYear: new Date().getFullYear() + 30,
        category: 'retirement',
        investmentPlans: [
          { id: 1, type: 'sip', monthlyContribution: 5000 },
          {
            id: 2,
            type: 'stepUpSip',
            monthlyContribution: 2000,
            stepUpRate: 0.1,
          },
        ],
      }),
    );
    const goalsWithContributions = selectGoalsWithMonthlyContributions(
      store.getState(),
    );
    expect(goalsWithContributions.length).toBe(1);
    expect(goalsWithContributions[0].id).toBe(1);
    expect(goalsWithContributions[0].name).toBe('Retirement');
    expect(goalsWithContributions[0].monthlyContribution).toBe(7000);
  });

  it('selectCurrentSurplus should calculate current surplus', () => {
    // Income: 100000
    // Expenses: 50000
    // Goal Contributions: 0 (initially)
    expect(selectCurrentSurplus(store.getState())).toBe(100000 - 50000 - 0);

    store.dispatch(
      updateGoal({
        id: 1,
        name: 'Retirement',
        targetAmount: 20000000,
        targetYear: new Date().getFullYear() + 30,
        category: 'retirement',
        investmentPlans: [{ id: 1, type: 'sip', monthlyContribution: 10000 }],
      }),
    );
    // Income: 100000
    // Expenses: 50000
    // Goal Contributions: 10000
    expect(selectCurrentSurplus(store.getState())).toBe(100000 - 50000 - 10000); // 40000
  });

  it('selectTotalOutflow should calculate total outflow', () => {
    // Expenses: 50000
    // Goal Contributions: 0 (initially)
    expect(selectTotalOutflow(store.getState())).toBe(50000);

    store.dispatch(
      updateGoal({
        id: 1,
        name: 'Retirement',
        targetAmount: 20000000,
        targetYear: new Date().getFullYear() + 30,
        category: 'retirement',
        investmentPlans: [{ id: 1, type: 'sip', monthlyContribution: 10000 }],
      }),
    );
    // Expenses: 50000
    // Goal Contributions: 10000
    expect(selectTotalOutflow(store.getState())).toBe(50000 + 10000); // 60000
  });

  it('selectIsTotalOutflowExceedingIncome should return true if outflow > income', () => {
    // Income: 100000
    // Outflow: 50000
    expect(selectIsTotalOutflowExceedingIncome(store.getState())).toBe(false);

    store.dispatch(
      addExpense({
        id: 3,
        name: 'Huge Expense',
        amount: 60000,
        type: 'monthly',
        category: 'discretionary',
        frequency: 'monthly',
      }),
    );
    // Income: 100000
    // Outflow: 50000 + 60000 = 110000
    expect(selectIsTotalOutflowExceedingIncome(store.getState())).toBe(true);
  });

  it('selectIsTotalOutflowExceedingIncome should return false if outflow <= income', () => {
    // Income: 100000
    // Outflow: 50000
    expect(selectIsTotalOutflowExceedingIncome(store.getState())).toBe(false);
  });

  it('selectDebtFreeCountdown should return "Debt-Free!" if totalDebt is 0', () => {
    expect(selectDebtFreeCountdown(store.getState())).toBe('Debt-Free!');
  });

  it('selectDebtFreeCountdown should return "Cannot pay off debt..." if surplus is 0 or less', () => {
    store.dispatch(setTotalDebt(10000));
    // Current surplus is 50000, so need to make it 0 or less
    store.dispatch(
      addExpense({
        id: 3,
        name: 'Huge Expense',
        amount: 50000,
        type: 'monthly',
        category: 'basic',
        frequency: 'monthly',
      }),
    ); // Total expenses 100000
    expect(selectDebtFreeCountdown(store.getState())).toBe(
      'Cannot pay off debt with current surplus.',
    );
  });

  it('selectDebtFreeCountdown should return months if less than a year', () => {
    store.dispatch(setTotalDebt(100000)); // Debt: 100000
    // Income: 100000, Expenses: 50000, Surplus: 50000
    // Months: 100000 / 50000 = 2 months
    expect(selectDebtFreeCountdown(store.getState())).toBe('2 months');
  });

  it('selectDebtFreeCountdown should return years and months', () => {
    store.dispatch(setTotalDebt(700000)); // Debt: 700000
    // Income: 100000, Expenses: 50000, Surplus: 50000
    // Months: 700000 / 50000 = 14 months
    // Years: 1, Months: 2
    expect(selectDebtFreeCountdown(store.getState())).toBe(
      '1 years and 2 months',
    );
  });

  it('selectProjectedMonthlyIncome should return projected incomes', () => {
    const projectedIncomes = selectProjectedMonthlyIncome(store.getState());
    expect(projectedIncomes.length).toBe(
      initialState.retirementAge - initialState.currentAge + 1,
    );
    expect(projectedIncomes[0].age).toBe(initialState.currentAge);
    expect(projectedIncomes[0].income).toBe(initialState.incomes[1].amount); // 100000
    // Check next year's income
    expect(projectedIncomes[1].age).toBe(initialState.currentAge + 1);
    expect(projectedIncomes[1].income).toBeCloseTo(
      initialState.incomes[1].amount * (1 + initialState.careerGrowthRate),
    );
  });

  it('selectInflationAdjustedValue should return original value if inflation not considered', () => {
    const value = 100000;
    const years = 5;
    expect(selectInflationAdjustedValue(store.getState(), value, years)).toBe(
      value,
    );
  });

  it('selectInflationAdjustedValue should return original value if years is 0 or less', () => {
    store.dispatch(setConsiderInflation(true));
    const value = 100000;
    expect(selectInflationAdjustedValue(store.getState(), value, 0)).toBe(
      value,
    );
    expect(selectInflationAdjustedValue(store.getState(), value, -5)).toBe(
      value,
    );
  });

  it('selectInflationAdjustedValue should return inflation adjusted value if inflation considered', () => {
    store.dispatch(setConsiderInflation(true));
    store.dispatch(setGeneralInflationRate(0.05)); // Set a known inflation rate for calculation
    const value = 100000;
    const years = 2;
    // Expected: 100000 / (1 + 0.05)^2 = 100000 / 1.1025 = 90702.947845
    expect(
      selectInflationAdjustedValue(store.getState(), value, years),
    ).toBeCloseTo(100000 / Math.pow(1 + 0.05, 2));
  });

  it('selectNeedsExpenses should calculate total basic needs expenses', () => {
    // Initial: 30000 (monthly)
    expect(selectNeedsExpenses(store.getState())).toBe(30000);

    store.dispatch(
      addExpense({
        id: 3,
        name: 'Groceries',
        amount: 10000,
        type: 'monthly',
        category: 'basic',
        frequency: 'monthly',
      }),
    );
    expect(selectNeedsExpenses(store.getState())).toBe(40000);

    store.dispatch(
      addExpense({
        id: 4,
        name: 'Utilities',
        amount: 6000,
        type: 'quarterly',
        category: 'basic',
        frequency: 'quarterly',
      }),
    );
    expect(selectNeedsExpenses(store.getState())).toBe(40000 + 6000 / 3); // 42000
  });

  it('selectWantsExpenses should calculate total discretionary expenses', () => {
    // Initial: 20000 (monthly)
    expect(selectWantsExpenses(store.getState())).toBe(20000);

    store.dispatch(
      addExpense({
        id: 3,
        name: 'Dining Out',
        amount: 5000,
        type: 'monthly',
        category: 'discretionary',
        frequency: 'monthly',
      }),
    );
    expect(selectWantsExpenses(store.getState())).toBe(25000);

    store.dispatch(
      addExpense({
        id: 4,
        name: 'Vacation Fund',
        amount: 12000,
        type: 'yearly',
        category: 'discretionary',
        frequency: 'yearly',
      }),
    );
    expect(selectWantsExpenses(store.getState())).toBe(25000 + 12000 / 12); // 26000
  });

  it('selectFutureWealthContributions should return total monthly goal contributions', () => {
    store.dispatch(
      updateGoal({
        id: 1,
        name: 'Retirement',
        targetAmount: 20000000,
        targetYear: new Date().getFullYear() + 30,
        category: 'retirement',
        investmentPlans: [{ id: 1, type: 'sip', monthlyContribution: 15000 }],
      }),
    );
    expect(selectFutureWealthContributions(store.getState())).toBe(15000);
  });
});
