import emiReducer, {
  updateLoanDetails,
  updateExpenses,
  updatePrepayments,
  changeLoanUnit,
  changeExpenseUnit,
  setCurrency,
  setThemeMode,
  setDesignSystem,
  setVisualStyle,
  setAutoSave,
  resetEmiState,
  resetHomeLoanForm,
  selectLoanDetails,
  selectExpenses,
  selectPrepayments,
  selectCurrency,
  selectThemeMode,
  selectDesignSystem,
  selectVisualStyle,
  selectAutoSave,
  selectIsLoanActive,
} from '../../src/store/emiSlice';

// Define the default initial state as it is in emiSlice.js for comparison
const defaultInitialState = {
  loanDetails: {
    homeValue: 5000000,
    marginAmount: 1000000,
    marginUnit: "Rs",
    loanInsurance: 0,
    interestRate: 8.5,
    loanTenure: 20,
    tenureUnit: "years",
    loanFees: 10000,
    feesUnit: "Rs",
    startDate: expect.any(String), // Date will be different on each run
    yearlyPaymentIncreaseAmount: 0,
    yearlyPaymentIncreaseUnit: "%",
  },
  prepayments: {
    monthly: { amount: 0, startDate: expect.any(String) },
    yearly: { amount: 0, startDate: expect.any(String) },
    quarterly: { amount: 0, startDate: expect.any(String) },
    oneTime: { amount: 0, date: expect.any(String) },
  },
  expenses: {
    oneTimeExpenses: 0,
    oneTimeUnit: "Rs",
    propertyTaxes: 0,
    taxesUnit: "Rs",
    homeInsurance: 0,
    homeInsUnit: "Rs",
    maintenance: 0,
  },
  isLoanActive: true,
  currency: "₹",
  designSystem: "material",
  visualStyle: "flat",
  autoSave: true,
};

describe('emiSlice reducer', () => {
  it('should return the initial state when passed an empty action', () => {
    const initialState = emiReducer(undefined, { type: '' });
    // Use toEqual with expect.any(String) for date fields
    expect(initialState).toEqual(defaultInitialState);
  });

  // --- Reducers ---
  it('should handle updateLoanDetails', () => {
    const actual = emiReducer(undefined, updateLoanDetails({ key: 'homeValue', value: 6000000 }));
    expect(actual.loanDetails.homeValue).toEqual(6000000);
    expect(actual.isLoanActive).toBe(true); // Should be set to true
  });

  it('should handle updateExpenses', () => {
    const actual = emiReducer(undefined, updateExpenses({ key: 'propertyTaxes', value: 5000 }));
    expect(actual.expenses.propertyTaxes).toEqual(5000);
  });

  it('should handle updatePrepayments', () => {
    const actual = emiReducer(undefined, updatePrepayments({ type: 'monthly', key: 'amount', value: 1000 }));
    expect(actual.prepayments.monthly.amount).toEqual(1000);
  });

  it('should handle changeLoanUnit from Rs to %', () => {
    const initialState = {
      ...defaultInitialState,
      loanDetails: { ...defaultInitialState.loanDetails, marginAmount: 1000000, homeValue: 5000000 },
    };
    const actual = emiReducer(
      initialState,
      changeLoanUnit({
        unitField: 'marginUnit',
        amountField: 'marginAmount',
        newUnit: '%',
        convertedAmount: 20, // 1,000,000 / 5,000,000 * 100
      }),
    );
    expect(actual.loanDetails.marginUnit).toEqual('%');
    expect(actual.loanDetails.marginAmount).toEqual(20);
  });

  it('should handle changeLoanUnit from % to Rs', () => {
    const initialState = {
      ...defaultInitialState,
      loanDetails: { ...defaultInitialState.loanDetails, marginAmount: 20, marginUnit: '%', homeValue: 5000000 },
    };
    const actual = emiReducer(
      initialState,
      changeLoanUnit({
        unitField: 'marginUnit',
        amountField: 'marginAmount',
        newUnit: 'Rs',
        convertedAmount: 1000000, // 20 * 5,000,000 / 100
      }),
    );
    expect(actual.loanDetails.marginUnit).toEqual('Rs');
    expect(actual.loanDetails.marginAmount).toEqual(1000000);
  });

  it('should handle changeExpenseUnit from Rs to %', () => {
    const initialState = {
      ...defaultInitialState,
      expenses: { ...defaultInitialState.expenses, propertyTaxes: 50000 },
      loanDetails: { ...defaultInitialState.loanDetails, homeValue: 5000000 },
    };
    const actual = emiReducer(
      initialState,
      changeExpenseUnit({
        unitField: 'taxesUnit',
        amountField: 'propertyTaxes',
        newUnit: '%',
        convertedAmount: 1, // 50,000 / 5,000,000 * 100
      }),
    );
    expect(actual.expenses.taxesUnit).toEqual('%');
    expect(actual.expenses.propertyTaxes).toEqual(1);
  });

  it('should handle changeExpenseUnit from % to Rs', () => {
    const initialState = {
      ...defaultInitialState,
      expenses: { ...defaultInitialState.expenses, propertyTaxes: 1, taxesUnit: '%' },
      loanDetails: { ...defaultInitialState.loanDetails, homeValue: 5000000 },
    };
    const actual = emiReducer(
      initialState,
      changeExpenseUnit({
        unitField: 'taxesUnit',
        amountField: 'propertyTaxes',
        newUnit: 'Rs',
        convertedAmount: 50000, // 1 * 5,000,000 / 100
      }),
    );
    expect(actual.expenses.taxesUnit).toEqual('Rs');
    expect(actual.expenses.propertyTaxes).toEqual(50000);
  });

  it('should handle setCurrency', () => {
    const actual = emiReducer(undefined, setCurrency('$'));
    expect(actual.currency).toEqual('$');
  });

  it('should handle setThemeMode', () => {
    const actual = emiReducer(undefined, setThemeMode('dark'));
    expect(actual.themeMode).toEqual('dark');
  });

  it('should handle setDesignSystem', () => {
    const actual = emiReducer(undefined, setDesignSystem('apple'));
    expect(actual.designSystem).toEqual('apple');
  });

  it('should handle setVisualStyle', () => {
    const actual = emiReducer(undefined, setVisualStyle('glass'));
    expect(actual.visualStyle).toEqual('glass');
  });

  it('should handle setAutoSave', () => {
    const actual = emiReducer(undefined, setAutoSave(false));
    expect(actual.autoSave).toEqual(false);
  });

  it('should handle resetEmiState', () => {
    const stateWithChanges = {
      ...defaultInitialState,
      currency: '$',
      loanDetails: { ...defaultInitialState.loanDetails, homeValue: 1000000 },
    };
    const actual = emiReducer(stateWithChanges, resetEmiState());
    expect(actual).toEqual(defaultInitialState);
  });

  it('should handle resetHomeLoanForm', () => {
    const stateWithChanges = {
      ...defaultInitialState,
      currency: '$', // This should NOT be reset
      themeMode: 'dark', // This should NOT be reset
      loanDetails: { ...defaultInitialState.loanDetails, homeValue: 1000000 },
      prepayments: { ...defaultInitialState.prepayments, monthly: { amount: 500, startDate: '2023-01-01' } },
      expenses: { ...defaultInitialState.expenses, oneTimeExpenses: 2000 },
      isLoanActive: false,
    };
    const actual = emiReducer(stateWithChanges, resetHomeLoanForm());
    expect(actual.loanDetails).toEqual(defaultInitialState.loanDetails);
    expect(actual.prepayments).toEqual(defaultInitialState.prepayments);
    expect(actual.expenses).toEqual(defaultInitialState.expenses);
    expect(actual.isLoanActive).toBe(false); // Should be set to false by resetHomeLoanForm
    expect(actual.currency).toEqual('$'); // Should remain unchanged
    expect(actual.themeMode).toEqual('dark'); // Should remain unchanged
  });

  // --- Selectors ---
  it('selectLoanDetails should return loanDetails', () => {
    const state = { emi: { loanDetails: { homeValue: 100 } } };
    expect(selectLoanDetails(state)).toEqual({ homeValue: 100 });
  });

  it('selectExpenses should return expenses', () => {
    const state = { emi: { expenses: { propertyTaxes: 100 } } };
    expect(selectExpenses(state)).toEqual({ propertyTaxes: 100 });
  });

  it('selectPrepayments should return prepayments', () => {
    const state = { emi: { prepayments: { monthly: { amount: 100 } } } };
    expect(selectPrepayments(state)).toEqual({ monthly: { amount: 100 } });
  });

  it('selectCurrency should return currency', () => {
    const state = { emi: { currency: '$' } };
    expect(selectCurrency(state)).toEqual('$');
  });

  it('selectThemeMode should return themeMode', () => {
    const state = { emi: { themeMode: 'dark' } };
    expect(selectThemeMode(state)).toEqual('dark');
  });

  it('selectDesignSystem should return designSystem', () => {
    const state = { emi: { designSystem: 'apple' } };
    expect(selectDesignSystem(state)).toEqual('apple');
  });

  it('selectVisualStyle should return visualStyle', () => {
    const state = { emi: { visualStyle: 'glass' } };
    expect(selectVisualStyle(state)).toEqual('glass');
  });

  it('selectAutoSave should return autoSave', () => {
    const state = { emi: { autoSave: true } };
    expect(selectAutoSave(state)).toEqual(true);
  });

  it('selectIsLoanActive should return isLoanActive', () => {
    const state = { emi: { isLoanActive: false } };
    expect(selectIsLoanActive(state)).toEqual(false);
  });
});