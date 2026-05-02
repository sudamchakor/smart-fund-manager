import { createSlice } from "@reduxjs/toolkit";


// Define the default initial state
const defaultInitialState = {
  loanDetails: {
    homeValue: 5000000,
    marginAmount: 1000000,
    marginUnit: "Rs", // 'Rs' or '%'
    loanInsurance: 0,
    interestRate: 8.5,
    loanTenure: 20,
    tenureUnit: "years", // 'years' or 'months'
    loanFees: 10000,
    feesUnit: "Rs", // 'Rs' or '%'
    startDate: new Date().toISOString(), // Store as ISO string
    yearlyPaymentIncreaseAmount: 0,
    yearlyPaymentIncreaseUnit: "%", // 'Rs' or '%'
  },
  prepayments: {
    monthly: { amount: 0, startDate: new Date().toISOString() },
    yearly: { amount: 0, startDate: new Date().toISOString() },
    quarterly: { amount: 0, startDate: new Date().toISOString() },
    oneTime: { amount: 0, date: new Date().toISOString() },
  },
  expenses: {
    oneTimeExpenses: 0,
    oneTimeUnit: "Rs", // 'Rs' or '%'
    propertyTaxes: 0,
    taxesUnit: "Rs", // 'Rs' or '%'
    homeInsurance: 0,
    homeInsUnit: "Rs", // 'Rs' or '%'
    maintenance: 0, // monthly Rs
  },
  isLoanActive: true, // Flag to track if the loan should be displayed
  currency: "₹",
  themeMode: "dodgerblue",
  autoSave: true,
};

const emiSlice = createSlice({
  name: "emi",
  initialState: defaultInitialState, // Use defaultInitialState directly
  reducers: {
    updateLoanDetails: (state, action) => {
      const { key, value } = action.payload;
      state.loanDetails[key] = value;
      state.isLoanActive = true; // Any update makes the loan active
    },
    updateExpenses: (state, action) => {
      const { key, value } = action.payload;
      state.expenses[key] = value;
    },
    updatePrepayments: (state, action) => {
      const { type, key, value } = action.payload;
      state.prepayments[type][key] = value;
    },
    changeLoanUnit: (state, action) => {
      const { unitField, amountField, newUnit, convertedAmount } = action.payload;
      state.loanDetails[unitField] = newUnit;
      state.loanDetails[amountField] = convertedAmount;
    },
    changeExpenseUnit: (state, action) => {
      const { unitField, amountField, newUnit, convertedAmount } = action.payload;
      state.expenses[unitField] = newUnit;
      state.expenses[amountField] = convertedAmount;
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
    },
    setAutoSave: (state, action) => {
      state.autoSave = action.payload;
    },
    resetEmiState: () => {
      return defaultInitialState; // Simply return the default state
    },
    resetHomeLoanForm: (state) => {
      state.loanDetails = defaultInitialState.loanDetails;
      state.prepayments = defaultInitialState.prepayments;
      state.expenses = defaultInitialState.expenses;
      state.isLoanActive = false; // Deactivating the loan
    },
  },
});

export const {
  updateLoanDetails,
  updateExpenses,
  updatePrepayments,
  changeLoanUnit,
  changeExpenseUnit,
  setCurrency,
  setThemeMode,
  setAutoSave,
  resetEmiState,
  resetHomeLoanForm,
} = emiSlice.actions;

export const selectLoanDetails = (state) => state.emi.loanDetails;
export const selectExpenses = (state) => state.emi.expenses;
export const selectPrepayments = (state) => state.emi.prepayments;
export const selectCurrency = (state) => state.emi.currency;
export const selectThemeMode = (state) => state.emi.themeMode;
export const selectAutoSave = (state) => state.emi.autoSave;
export const selectIsLoanActive = (state) => state.emi.isLoanActive;

export default emiSlice.reducer;
