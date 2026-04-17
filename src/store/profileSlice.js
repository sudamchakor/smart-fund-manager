import { createSlice, createSelector } from "@reduxjs/toolkit";

const currentYear = new Date().getFullYear();

const initialState = {
  currentAge: 30,
  retirementAge: 60,
  considerInflation: false,
  generalInflationRate: 0.06, // 6% general inflation
  educationInflationRate: 0.10, // 10% education inflation
  careerGrowthRate: 0.05, // 5% annual career growth
  totalDebt: 0, // New: Initial debt amount
  incomes: [
    { id: 1, name: "Salary", amount: 100000, type: 'monthly' },
  ],
  expenses: [
    { id: 1, name: "Basic Needs", amount: 30000, type: 'monthly', category: 'basic', frequency: 'monthly' },
    { id: 2, name: "Discretionary", amount: 20000, type: 'monthly', category: 'discretionary', frequency: 'monthly' },
  ],
  goals: [
    { 
      id: 1, 
      name: "Retirement", 
      targetAmount: 20000000, 
      targetYear: currentYear + 30, 
      category: 'retirement',
      investmentPlans: [] // Initialize with empty array
    },
  ],
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setCurrentAge: (state, action) => { state.currentAge = action.payload; },
    setRetirementAge: (state, action) => { state.retirementAge = action.payload; },
    setConsiderInflation: (state, action) => { state.considerInflation = action.payload; },
    setGeneralInflationRate: (state, action) => { state.generalInflationRate = action.payload; },
    setEducationInflationRate: (state, action) => { state.educationInflationRate = action.payload; },
    setCareerGrowthRate: (state, action) => { state.careerGrowthRate = action.payload; },
    setTotalDebt: (state, action) => { state.totalDebt = action.payload; }, // New reducer for debt
    addIncome: (state, action) => { state.incomes.push({ ...action.payload, id: state.incomes.length > 0 ? Math.max(...state.incomes.map(i => i.id)) + 1 : 1 }); },
    updateIncome: (state, action) => { 
        const index = state.incomes.findIndex(i => i.id === action.payload.id);
        if(index !== -1) state.incomes[index] = action.payload;
    },
    deleteIncome: (state, action) => { state.incomes = state.incomes.filter(i => i.id !== action.payload); },
    addExpense: (state, action) => { state.expenses.push({ ...action.payload, id: state.expenses.length > 0 ? Math.max(...state.expenses.map(e => e.id)) + 1 : 1 }); },
    updateExpense: (state, action) => {
        const index = state.expenses.findIndex(e => e.id === action.payload.id);
        if(index !== -1) state.expenses[index] = action.payload;
    },
    deleteExpense: (state, action) => { state.expenses = state.expenses.filter(e => e.id !== action.payload); },
    addGoal: (state, action) => { 
        state.goals.push({ 
            ...action.payload, 
            id: state.goals.length > 0 ? Math.max(...state.goals.map(g => g.id)) + 1 : 1,
            investmentPlans: action.payload.investmentPlans || [] // Ensure investmentPlans array exists
        }); 
    },
    updateGoal: (state, action) => {
        const index = state.goals.findIndex(g => g.id === action.payload.id);
        if(index !== -1) state.goals[index] = action.payload;
    },
    deleteGoal: (state, action) => { 
        state.goals = state.goals.filter(g => g.id !== action.payload); 
    },
    
    addTemplateGoal: (state, action) => { // New reducer for template goals
      const { type, monthlyExpenses } = action.payload;
      let newGoal = {};
      const nextId = state.goals.length > 0 ? Math.max(...state.goals.map(g => g.id)) + 1 : 1;

      switch (type) {
        case 'emergencyFund':
          newGoal = { 
            id: nextId, 
            name: "Emergency Fund", 
            targetAmount: monthlyExpenses * 6, 
            targetYear: currentYear + 1, // Aim for 1 year to build
            investmentPlans: [], // Initialize with empty array
            category: 'safety'
          };
          break;
        case 'childEducation':
          newGoal = { 
            id: nextId, 
            name: "Child's Higher Education", 
            targetAmount: 5000000, // Example amount
            targetYear: currentYear + 18, // Example: child is 0, goal in 18 years
            investmentPlans: [], // Initialize with empty array
            category: 'education'
          };
          break;
        case 'retirement':
          newGoal = { 
            id: nextId, 
            name: "Retirement", 
            targetAmount: 20000000, 
            targetYear: state.currentAge + (state.retirementAge - state.currentAge), 
            investmentPlans: [], // Initialize with empty array
            category: 'retirement'
          };
          break;
        default:
          return;
      }
      state.goals.push(newGoal);
    },
    resetProfile: (state) => {
        return initialState;
    }
  }
});

export const { 
    setCurrentAge, setRetirementAge, setConsiderInflation, 
    setGeneralInflationRate, setEducationInflationRate, setCareerGrowthRate, setTotalDebt,
    addIncome, updateIncome, deleteIncome, 
    addExpense, updateExpense, deleteExpense, 
    addGoal, updateGoal, deleteGoal, 
    addTemplateGoal,
    resetProfile
} = profileSlice.actions;

// Basic Selectors
export const selectCurrentAge = state => state.profile.currentAge;
export const selectRetirementAge = state => state.profile.retirementAge;
export const selectConsiderInflation = state => state.profile.considerInflation;
export const selectGeneralInflationRate = state => state.profile.generalInflationRate;
export const selectEducationInflationRate = state => state.profile.educationInflationRate;
export const selectCareerGrowthRate = state => state.profile.careerGrowthRate;
export const selectTotalDebt = state => state.profile.totalDebt; // New selector for debt
export const selectIncomes = state => state.profile.incomes;
export const selectProfileExpenses = state => state.profile.expenses;
export const selectGoals = state => state.profile.goals;

// Derived Selectors
export const selectTotalMonthlyIncome = createSelector(
    [selectIncomes],
    (incomes) => incomes.reduce((total, income) => total + (income.amount || 0), 0)
);

export const selectTotalMonthlyExpenses = createSelector(
    [selectProfileExpenses],
    (expenses) => expenses.reduce((total, expense) => total + (expense.amount || 0), 0)
);

export const selectTotalMonthlyGoalContributions = createSelector(
    [selectGoals],
    (goals) => goals.reduce((total, goal) => 
        total + (goal.investmentPlans || []).reduce((planTotal, plan) => planTotal + (plan.monthlyContribution || 0), 0)
    , 0)
);

// Selector to get individual investment plan contributions
export const selectIndividualGoalInvestmentContributions = createSelector(
  [selectGoals],
  (goals) => {
    const contributions = [];
    goals.forEach((goal) => {
      (goal.investmentPlans || []).forEach((plan, index) => {
        const uniqueKey = plan.id || index;

        // Handle monthly contributions
        if (
          (plan.type === "sip" || plan.type === "stepUpSip") &&
          plan.monthlyContribution > 0
        ) {
          let planTypeName =
            plan.type === "sip"
              ? "SIP"
              : `Step-up SIP (${plan.stepUpRate || 0}%)`;
          contributions.push({
            id: `goal-${goal.id}-plan-${uniqueKey}`,
            name: `${goal.name} (${planTypeName})`,
            amount: plan.monthlyContribution,
            type: "monthly",
            category: "investment",
            frequency: "monthly",
            goalId: goal.id,
          });
        } else if (
          (plan.type === "lumpsum" || plan.type === "fd") &&
          plan.investedAmount > 0
        ) {
          const planTypeName =
            plan.type === "lumpsum" ? "Lumpsum" : "Fixed Deposit";
          contributions.push({
            id: `goal-${goal.id}-plan-${uniqueKey}`,
            name: `${goal.name} (${planTypeName})`,
            amount: plan.investedAmount,
            type: "yearly", // Representing as yearly for display purposes
            category: "investment",
            frequency: "yearly",
            goalId: goal.id,
          });
        }
      });
    });
    return contributions;
  }
);


// New selector: selectGoalsWithMonthlyContributions (This one aggregates per goal, keeping it for now as it's used elsewhere)
export const selectGoalsWithMonthlyContributions = createSelector(
  [selectGoals],
  (goals) => goals.map(goal => ({
    id: goal.id,
    name: goal.name,
    monthlyContribution: (goal.investmentPlans || []).reduce((total, plan) => total + (plan.monthlyContribution || 0), 0)
  }))
);

export const selectCurrentSurplus = createSelector(
    [selectTotalMonthlyIncome, selectTotalMonthlyExpenses, selectTotalMonthlyGoalContributions],
    (totalIncome, totalExpenses, totalGoalContributions) => 
        totalIncome - totalExpenses - totalGoalContributions
);

export const selectTotalOutflow = createSelector(
    [selectTotalMonthlyExpenses, selectTotalMonthlyGoalContributions],
    (totalExpenses, totalGoalContributions) => totalExpenses + totalGoalContributions
);

export const selectIsTotalOutflowExceedingIncome = createSelector(
    [selectTotalMonthlyIncome, selectTotalOutflow],
    (totalIncome, totalOutflow) => totalOutflow > totalIncome
);

// New: Debt-Free Countdown Selector
export const selectDebtFreeCountdown = createSelector(
  [selectTotalDebt, selectCurrentSurplus],
  (totalDebt, currentSurplus) => {
    if (totalDebt <= 0) {
      return "Debt-Free!";
    }
    if (currentSurplus <= 0) {
      return "Cannot pay off debt with current surplus.";
    }
    const monthsToPayOff = totalDebt / currentSurplus;
    const years = Math.floor(monthsToPayOff / 12);
    const months = Math.round(monthsToPayOff % 12);

    if (years > 0) {
      return `${years} years and ${months} months`;
    } else {
      return `${months} months`;
    }
  }
);

// New: Career Growth Engine Selector (projected monthly income)
export const selectProjectedMonthlyIncome = createSelector(
  [selectTotalMonthlyIncome, selectCareerGrowthRate, selectCurrentAge, selectRetirementAge],
  (totalMonthlyIncome, careerGrowthRate, currentAge, retirementAge) => {
    const projectedIncomes = [];
    let currentIncome = totalMonthlyIncome;
    for (let age = currentAge; age <= retirementAge; age++) {
      projectedIncomes.push({ age, income: currentIncome });
      currentIncome *= (1 + careerGrowthRate);
    }
    return projectedIncomes;
  }
);

// New: Inflation Adjusted Value Selector (for Real-Value Toggle)
// This selector takes a value and number of years, and returns its inflation-adjusted value.
// It's designed to be used with a reselect selector factory or directly in components.
export const selectInflationAdjustedValue = createSelector(
  [
    (state, value) => value,
    (state, value, years) => years,
    selectGeneralInflationRate,
    selectConsiderInflation
  ],
  (value, years, generalInflationRate, considerInflation) => {
    if (!considerInflation || years <= 0) return value;
    return value / Math.pow(1 + generalInflationRate, years);
  }
);

// Selectors for Cash Flow Doughnut Chart: 'Needs vs. Wants vs. Future Wealth'
export const selectNeedsExpenses = createSelector(
  [selectProfileExpenses],
  (expenses) => expenses.filter(e => e.category === 'basic').reduce((total, expense) => total + (expense.amount || 0), 0)
);

export const selectWantsExpenses = createSelector(
  [selectProfileExpenses],
  (expenses) => expenses.filter(e => e.category === 'discretionary').reduce((total, expense) => total + (expense.amount || 0), 0)
);

export const selectFutureWealthContributions = selectTotalMonthlyGoalContributions;

export default profileSlice.reducer;
