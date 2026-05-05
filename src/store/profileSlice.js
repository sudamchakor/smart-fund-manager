import { createSlice, createSelector } from '@reduxjs/toolkit';

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

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setBasicInfo: (state, action) => {
      state.name = action.payload.name;
      state.occupation = action.payload.occupation;
      state.riskTolerance = action.payload.riskTolerance;
      state.currentAge = action.payload.age;
    },
    setCurrentAge: (state, action) => {
      state.currentAge = action.payload;
    },
    setRetirementAge: (state, action) => {
      state.retirementAge = action.payload;
    },
    setConsiderInflation: (state, action) => {
      state.considerInflation = action.payload;
    },
    setGeneralInflationRate: (state, action) => {
      state.generalInflationRate = action.payload;
    },
    setEducationInflationRate: (state, action) => {
      state.educationInflationRate = action.payload;
    },
    setCareerGrowthRate: (state, action) => {
      state.careerGrowthRate = action.payload;
    },
    setExpectedReturnRate: (state, action) => {
      state.expectedReturnRate = action.payload;
    },
    setStepUpPercentage: (state, action) => {
      state.stepUpPercentage = action.payload;
    },
    setPostTax: (state, action) => {
      state.postTax = action.payload;
    },
    setScenario: (state, action) => {
      state.scenario = action.payload;
    },
    updateFinancialSettings: (state, action) => {
      const { taxRegime, emergencyFundTarget, riskProfile } = action.payload;
      state.taxRegime = taxRegime;
      state.emergencyFundTarget = emergencyFundTarget;
      state.riskProfile = riskProfile;

      // Automatically update expected return rate based on risk profile
      const score = Object.values(riskProfile).reduce(
        (sum, val) => sum + val,
        0,
      );
      if (score <= 8) {
        // Low risk
        state.expectedReturnRate = 0.08;
      } else if (score <= 17) {
        // Medium risk
        state.expectedReturnRate = 0.12;
      } else {
        // High risk
        state.expectedReturnRate = 0.15;
      }
    },
    setTotalDebt: (state, action) => {
      state.totalDebt = action.payload;
    },
    addIncome: (state, action) => {
      const newId =
        Object.keys(state.incomes).length > 0
          ? Math.max(...Object.keys(state.incomes).map(Number)) + 1
          : 1;
      state.incomes[newId] = { ...action.payload, id: newId };
    },
    updateIncome: (state, action) => {
      state.incomes[action.payload.id] = action.payload;
    },
    deleteIncome: (state, action) => {
      delete state.incomes[action.payload];
    },
    addExpense: (state, action) => {
      state.expenses.push({
        ...action.payload,
        id:
          state.expenses.length > 0
            ? Math.max(...state.expenses.map((e) => e.id)) + 1
            : 1,
      });
    },
    updateExpense: (state, action) => {
      const index = state.expenses.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) state.expenses[index] = action.payload;
    },
    deleteExpense: (state, action) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
    },
    deleteGoal: (state, action) => {
      const deletedGoalPriority = state.goals[action.payload].priority;
      delete state.goals[action.payload];
      Object.values(state.goals).forEach((goal) => {
        if (goal.priority > deletedGoalPriority) {
          goal.priority -= 1;
        }
      });
    },
    addGoal: (state, action) => {
      const newId =
        Object.keys(state.goals).length > 0
          ? Math.max(...Object.keys(state.goals).map(Number)) + 1
          : 1;
      state.goals[newId] = {
        ...action.payload,
        id: newId,
        investmentPlans: action.payload.investmentPlans || [],
        priority: Object.keys(state.goals).length + 1,
      };
    },
    updateGoal: (state, action) => {
      state.goals[action.payload.id] = action.payload;
    },
    addInvestmentPlan: (state, action) => {
      const { goalId, plan } = action.payload;
      const goal = state.goals[goalId];
      if (goal) {
        const newPlanId =
          goal.investmentPlans.length > 0
            ? Math.max(...goal.investmentPlans.map((p) => p.id)) + 1
            : 1;
        goal.investmentPlans.push({ ...plan, id: newPlanId });
      }
    },
    updateGoalPriority: (state, action) => {
      const { goalId, priority } = action.payload;
      const goal = state.goals[goalId];
      if (goal) {
        goal.priority = priority;
      }
    },
    reorderGoals: (state, action) => {
      action.payload.forEach((goal, index) => {
        state.goals[goal.id].priority = index + 1;
      });
    },
    addTemplateGoal: (state, action) => {
      const { type, monthlyExpenses } = action.payload;
      let newGoal = {};
      const newId =
        Object.keys(state.goals).length > 0
          ? Math.max(...Object.keys(state.goals).map(Number)) + 1
          : 1;
      const priority = Object.keys(state.goals).length + 1;

      switch (type) {
        case 'emergencyFund':
          newGoal = {
            id: newId,
            name: 'Emergency Fund',
            targetAmount: monthlyExpenses * 6,
            targetYear: currentYear + 1,
            investmentPlans: [],
            category: 'safety',
            priority,
          };
          break;
        case 'childEducation':
          newGoal = {
            id: newId,
            name: "Child's Higher Education",
            targetAmount: 5000000,
            targetYear: currentYear + 18,
            investmentPlans: [],
            category: 'education',
            priority,
          };
          break;
        case 'retirement':
          newGoal = {
            id: newId,
            name: 'Retirement',
            targetAmount: 20000000,
            targetYear:
              state.currentAge + (state.retirementAge - state.currentAge),
            investmentPlans: [],
            category: 'retirement',
            priority,
          };
          break;
        default:
          return;
      }
      state.goals[newId] = newGoal;
    },
    resetProfile: (state) => {
      return initialState;
    },
  },
});

export const {
  setBasicInfo,
  setCurrentAge,
  setRetirementAge,
  setConsiderInflation,
  setGeneralInflationRate,
  setEducationInflationRate,
  setCareerGrowthRate,
  setExpectedReturnRate,
  setStepUpPercentage,
  setPostTax,
  setScenario,
  updateFinancialSettings,
  setTotalDebt,
  addIncome,
  updateIncome,
  deleteIncome,
  addExpense,
  updateExpense,
  deleteExpense,
  deleteGoal,
  addGoal,
  updateGoal,
  addInvestmentPlan,
  updateGoalPriority,
  reorderGoals,
  addTemplateGoal,
  resetProfile,
} = profileSlice.actions;

// Basic Selectors
export const selectName = (state) => state.profile.name;
export const selectOccupation = (state) => state.profile.occupation;
export const selectRiskTolerance = (state) => state.profile.riskTolerance;
export const selectCurrentAge = (state) => state.profile.currentAge;
export const selectRetirementAge = (state) => state.profile.retirementAge;
export const selectConsiderInflation = (state) =>
  state.profile.considerInflation;
export const selectGeneralInflationRate = (state) =>
  state.profile.generalInflationRate;
export const selectEducationInflationRate = (state) =>
  state.profile.educationInflationRate;
export const selectCareerGrowthRate = (state) => state.profile.careerGrowthRate;
export const selectExpectedReturnRate = (state) =>
  state.profile.expectedReturnRate;
export const selectStepUpPercentage = (state) => state.profile.stepUpPercentage;
export const selectPostTax = (state) => state.profile.postTax;
export const selectScenario = (state) => state.profile.scenario;
export const selectTaxRegime = (state) => state.profile.taxRegime;
export const selectEmergencyFundTarget = (state) =>
  state.profile.emergencyFundTarget;
export const selectRiskProfile = (state) => state.profile.riskProfile;
export const selectTotalDebt = (state) => state.profile.totalDebt;
export const selectIncomes = (state) => Object.values(state.profile.incomes);
export const selectProfileExpenses = (state) => state.profile.expenses;
export const selectGoals = (state) => Object.values(state.profile.goals);

// Derived Selectors
export const selectTotalMonthlyIncome = createSelector(
  [selectIncomes],
  (incomes) => {
    const currentYear = new Date().getFullYear();
    return incomes.reduce((total, income) => {
      if (
        (typeof income.startYear === 'number' &&
          currentYear < income.startYear) ||
        (typeof income.endYear === 'number' && currentYear > income.endYear)
      ) {
        return total;
      }
      let monthlyAmount = income.amount || 0;
      if (income.frequency === 'quarterly') {
        monthlyAmount /= 3;
      } else if (income.frequency === 'yearly') {
        monthlyAmount /= 12;
      }
      return total + monthlyAmount;
    }, 0);
  },
);

export const selectTotalMonthlyExpenses = createSelector(
  [selectProfileExpenses],
  (expenses) =>
    expenses.reduce((total, expense) => {
      let monthlyAmount = expense.amount || 0;
      if (expense.frequency === 'quarterly') {
        monthlyAmount /= 3;
      } else if (expense.frequency === 'yearly') {
        monthlyAmount /= 12;
      }
      return total + monthlyAmount;
    }, 0),
);

export const selectIndividualGoalInvestmentContributions = createSelector(
  [selectGoals],
  (goals) => {
    const contributions = [];
    goals.forEach((goal) => {
      (goal.investmentPlans || []).forEach((plan, index) => {
        const uniqueKey = plan.id || index;
        if (
          (plan.type === 'sip' || plan.type === 'stepUpSip') &&
          plan.monthlyContribution > 0
        ) {
          let planTypeName =
            plan.type === 'sip'
              ? 'SIP'
              : `Step-up SIP (${plan.stepUpRate || 0}%)`;
          contributions.push({
            id: `goal-${goal.id}-plan-${uniqueKey}`,
            name: `${goal.name} (${planTypeName})`,
            amount: plan.monthlyContribution,
            type: 'monthly',
            category: 'investment',
            frequency: 'monthly',
            goalId: goal.id,
            goalTargetYear: goal.targetYear,
            startYear: plan.startYear || currentYear,
            endYear: plan.endYear || goal.targetYear,
          });
        } else if (
          (plan.type === 'lumpsum' || plan.type === 'fd') &&
          plan.investedAmount > 0
        ) {
          const planTypeName =
            plan.type === 'lumpsum' ? 'Lumpsum' : 'Fixed Deposit';
          contributions.push({
            id: `goal-${goal.id}-plan-${uniqueKey}`,
            name: `${goal.name} (${planTypeName})`,
            amount: plan.investedAmount,
            type: 'one-time-yearly',
            category: 'investment',
            frequency: 'yearly',
            goalId: goal.id,
            year: plan.startYear || currentYear,
            goalTargetYear: goal.targetYear,
            startYear: plan.startYear || currentYear,
            endYear: plan.endYear || goal.targetYear,
          });
        }
      });
    });
    return contributions;
  },
);

export const selectTotalMonthlyGoalContributions = createSelector(
  [selectIndividualGoalInvestmentContributions],
  (contributions) =>
    contributions.reduce((total, contribution) => {
      let monthlyAmount = contribution.amount || 0;
      if (contribution.frequency === 'yearly') {
        monthlyAmount /= 12;
      } else if (contribution.frequency === 'quarterly') {
        monthlyAmount /= 3;
      }
      return total + monthlyAmount;
    }, 0),
);

export const selectGoalsWithMonthlyContributions = createSelector(
  [selectGoals],
  (goals) =>
    goals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      monthlyContribution: (goal.investmentPlans || []).reduce(
        (total, plan) => total + (plan.monthlyContribution || 0),
        0,
      ),
    })),
);

export const selectCurrentSurplus = createSelector(
  [
    selectTotalMonthlyIncome,
    selectTotalMonthlyExpenses,
    selectTotalMonthlyGoalContributions,
  ],
  (totalIncome, totalExpenses, totalGoalContributions) =>
    totalIncome - totalExpenses - totalGoalContributions,
);

export const selectTotalOutflow = createSelector(
  [selectTotalMonthlyExpenses, selectTotalMonthlyGoalContributions],
  (totalExpenses, totalGoalContributions) =>
    totalExpenses + totalGoalContributions,
);

export const selectIsTotalOutflowExceedingIncome = createSelector(
  [selectTotalMonthlyIncome, selectTotalOutflow],
  (totalIncome, totalOutflow) => totalOutflow > totalIncome,
);

export const selectDebtFreeCountdown = createSelector(
  [selectTotalDebt, selectCurrentSurplus],
  (totalDebt, currentSurplus) => {
    if (totalDebt <= 0) return 'Debt-Free!';
    if (currentSurplus <= 0) return 'Cannot pay off debt with current surplus.';
    const monthsToPayOff = totalDebt / currentSurplus;
    const years = Math.floor(monthsToPayOff / 12);
    const months = Math.round(monthsToPayOff % 12);
    return years > 0
      ? `${years} years and ${months} months`
      : `${months} months`;
  },
);

export const selectProjectedMonthlyIncome = createSelector(
  [
    selectTotalMonthlyIncome,
    selectCareerGrowthRate,
    selectCurrentAge,
    selectRetirementAge,
  ],
  (totalMonthlyIncome, careerGrowthRate, currentAge, retirementAge) => {
    const projectedIncomes = [];
    let currentIncome = totalMonthlyIncome;
    for (let age = currentAge; age <= retirementAge; age++) {
      projectedIncomes.push({ age, income: currentIncome });
      currentIncome *= 1 + careerGrowthRate;
    }
    return projectedIncomes;
  },
);

export const selectInflationAdjustedValue = createSelector(
  [
    (state, value) => value,
    (state, value, years) => years,
    selectGeneralInflationRate,
    selectConsiderInflation,
  ],
  (value, years, generalInflationRate, considerInflation) => {
    if (!considerInflation || years <= 0) return value;
    return value / Math.pow(1 + generalInflationRate, years);
  },
);

export const selectNeedsExpenses = createSelector(
  [selectProfileExpenses],
  (expenses) =>
    expenses
      .filter((e) => e.category === 'basic')
      .reduce((total, expense) => {
        let monthlyAmount = expense.amount || 0;
        if (expense.frequency === 'quarterly') monthlyAmount /= 3;
        else if (expense.frequency === 'yearly') monthlyAmount /= 12;
        return total + monthlyAmount;
      }, 0),
);

export const selectWantsExpenses = createSelector(
  [selectProfileExpenses],
  (expenses) =>
    expenses
      .filter((e) => e.category === 'discretionary')
      .reduce((total, expense) => {
        let monthlyAmount = expense.amount || 0;
        if (expense.frequency === 'quarterly') monthlyAmount /= 3;
        else if (expense.frequency === 'yearly') monthlyAmount /= 12;
        return total + monthlyAmount;
      }, 0),
);

export const selectFutureWealthContributions =
  selectTotalMonthlyGoalContributions;

// LTCG Tax Calculation
const calculateLTCG = (totalWealth, totalInvested) => {
  const gains = totalWealth - totalInvested;
  const taxExemption = 125000; // ₹1.25 Lakh
  const taxRate = 0.125; // 12.5%

  if (gains <= taxExemption) {
    return 0;
  }

  const taxableGains = gains - taxExemption;
  return taxableGains * taxRate;
};

// Wealth Projection Engine
export const selectWealthProjection = createSelector(
  [
    selectCurrentAge,
    selectRetirementAge,
    selectIncomes,
    selectProfileExpenses,
    selectIndividualGoalInvestmentContributions,
    selectExpectedReturnRate,
    selectStepUpPercentage,
    selectCareerGrowthRate,
    selectGeneralInflationRate,
    selectPostTax,
    selectScenario,
  ],
  (
    currentAge,
    retirementAge,
    incomes,
    expenses,
    goalInvestments,
    expectedReturnRate,
    stepUpPercentage,
    careerGrowthRate,
    generalInflationRate,
    postTax,
    scenario,
  ) => {
    const projection = [];
    let totalWealth = 0;
    let totalInvested = 0;
    let committedSurplusInvestment = 0;

    let adjustedStepUp = stepUpPercentage;
    if (scenario === 'aggressive') {
      adjustedStepUp = 0.1;
    }

    for (let age = currentAge; age <= retirementAge; age++) {
      const year = currentYear + (age - currentAge);
      const isFirstYear = age === currentAge;
      const yearsElapsed = age - currentAge;

      const currentAnnualIncome = incomes.reduce((total, income) => {
        if (
          (typeof income.startYear === 'number' && year < income.startYear) ||
          (typeof income.endYear === 'number' && year > income.endYear)
        ) {
          return total;
        }
        const currentYearAmount =
          income.amount * Math.pow(1 + (careerGrowthRate || 0), yearsElapsed) ||
          income.amount;
        let annualAmount = 0;
        if (income.frequency === 'monthly')
          annualAmount = currentYearAmount * 12;
        else if (income.frequency === 'quarterly')
          annualAmount = currentYearAmount * 4;
        else if (income.frequency === 'yearly')
          annualAmount = currentYearAmount;
        return total + annualAmount;
      }, 0);

      const currentAnnualExpenses = expenses.reduce((total, expense) => {
        let expenseAmount = expense.amount;
        if (scenario === 'frugal' && expense.category === 'discretionary') {
          expenseAmount *= 0.5;
        }
        const currentYearAmount =
          expenseAmount *
          Math.pow(1 + (generalInflationRate || 0), yearsElapsed);
        let annualAmount = 0;
        if (expense.frequency === 'monthly')
          annualAmount = currentYearAmount * 12;
        else if (expense.frequency === 'quarterly')
          annualAmount = currentYearAmount * 4;
        else if (expense.frequency === 'yearly')
          annualAmount = currentYearAmount;
        return total + annualAmount;
      }, 0);

      const annualGoalInvestment = goalInvestments.reduce((total, inv) => {
        if (
          inv.frequency === 'monthly' &&
          year >= inv.startYear &&
          year < inv.endYear
        ) {
          return total + inv.amount * 12;
        }
        if (inv.frequency === 'yearly' && year === inv.year) {
          return total + inv.amount;
        }
        return total;
      }, 0);

      const currentSurplus =
        currentAnnualIncome - currentAnnualExpenses - annualGoalInvestment;

      if (isFirstYear) {
        committedSurplusInvestment = currentSurplus > 0 ? currentSurplus : 0;
      } else {
        committedSurplusInvestment *= 1 + (adjustedStepUp || 0);
      }

      const annualInvestment =
        annualGoalInvestment + committedSurplusInvestment;

      totalWealth *= 1 + (expectedReturnRate || 0);
      totalWealth += annualInvestment;
      totalInvested += annualInvestment;

      let finalWealth = totalWealth;
      if (postTax && age === retirementAge) {
        const tax = calculateLTCG(totalWealth, totalInvested);
        finalWealth -= tax;
      }

      const inflationAdjustedWealth =
        finalWealth / Math.pow(1 + generalInflationRate, age - currentAge + 1);

      projection.push({
        age,
        year,
        annualIncome: currentAnnualIncome,
        annualExpenses: currentAnnualExpenses,
        annualInvestment,
        totalInvested,
        totalWealth: finalWealth,
        inflationAdjustedWealth,
      });
    }
    return projection;
  },
);

export const selectFinancialIndependenceYear = createSelector(
  [selectWealthProjection],
  (projection) => {
    const withdrawalRate = 0.04;
    const fiPoint = projection.find((p) => {
      const passiveIncome = p.totalWealth * withdrawalRate;
      return passiveIncome >= p.annualExpenses;
    });

    return fiPoint ? { age: fiPoint.age, year: fiPoint.year } : null;
  },
);

// Helper function for SIP calculation
const calculateRequiredSip = (futureValue, annualRate, years) => {
  if (years <= 0 || annualRate <= 0) return futureValue / (years * 12 || 1);
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  const requiredSip =
    (futureValue * monthlyRate) /
    ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));
  return requiredSip;
};

export const selectPrioritizedGoalFunding = createSelector(
  [
    selectWealthProjection,
    selectGoals,
    selectGeneralInflationRate,
    selectEducationInflationRate,
    selectCurrentAge,
    selectExpectedReturnRate,
  ],
  (
    projection,
    goals,
    generalInflationRate,
    educationInflationRate,
    currentAge,
    expectedReturnRate,
  ) => {
    if (!projection.length) return [];

    const finalWealth =
      projection[projection.length - 1].inflationAdjustedWealth;
    let remainingWealth = finalWealth;

    // Use priority if available, otherwise fallback to targetYear
    const sortedGoals = [...goals].sort((a, b) => {
      if (a.priority !== undefined && b.priority !== undefined) {
        return a.priority - b.priority;
      }
      return a.targetYear - b.targetYear;
    });

    return sortedGoals.map((goal) => {
      const yearsToGoal = goal.targetYear - currentYear;
      const inflationRate =
        goal.category === 'education'
          ? educationInflationRate
          : generalInflationRate;
      const futureValue =
        goal.targetAmount * Math.pow(1 + inflationRate, yearsToGoal);
      const inflationAdjustedTarget =
        futureValue /
        Math.pow(1 + generalInflationRate, goal.targetYear - currentYear);

      let status = 'At Risk';
      let fundedAmount = 0;
      let shortfall = inflationAdjustedTarget;
      let requiredSip = 0;

      if (remainingWealth > 0) {
        if (remainingWealth >= inflationAdjustedTarget) {
          status = 'Fully Funded';
          fundedAmount = inflationAdjustedTarget;
          shortfall = 0;
          remainingWealth -= inflationAdjustedTarget;
        } else {
          status = 'Partially Funded';
          fundedAmount = remainingWealth;
          shortfall = inflationAdjustedTarget - remainingWealth;
          remainingWealth = 0;
        }
      }

      if (shortfall > 0) {
        requiredSip = calculateRequiredSip(
          shortfall,
          expectedReturnRate,
          yearsToGoal,
        );
      }

      return {
        ...goal,
        status,
        fundedAmount,
        inflationAdjustedTarget,
        shortfall,
        requiredSip,
      };
    });
  },
);

export const selectGoalCoverage = createSelector(
  [selectPrioritizedGoalFunding],
  (goalsWithFunding) => goalsWithFunding,
);

export default profileSlice.reducer;
