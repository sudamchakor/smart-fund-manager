import { configureStore } from '@reduxjs/toolkit';
import taxReducer, {
  updateMonthData,
  updateSettings,
  updateDeclaration,
  addDynamicRow,
  editDynamicRow,
  deleteDynamicRow,
  updateHouseProperty,
  updateAge,
  resetTax,
  selectCalculatedSalary,
  selectTaxComparison,
  selectCalculatedDeclarations,
} from '../../../src/store/taxSlice';

const defaultInitialState = {
  salaryMonths: Array(12).fill({
    basic: 50000,
    hra: 25000,
    lta: 10000,
    otherAllowances: 5000,
    rent: 20000,
    vpf: 0,
    nps: 0,
  }),
  dynamicRows: {
    income: [],
    deduction: [],
  },
  declarations: {
    exemptions: {
      hra: { produced: 0, limited: 0 },
      lta: { produced: 0, limited: 0 },
      otherExemptions: { produced: 0, limited: 0 },
    },
    sec80C: {
      standard80C: 0,
      npsEmployee: 0,
      totalProduced: 0,
      limited: 0,
    },
    deductions: {
      sec80D: { produced: 0, limited: 0 },
      sec80E: { produced: 0, limited: 0 },
      sec80G: { produced: 0, limited: 0 },
      sec80TTA: { produced: 0, limited: 0 },
      sec80TTB: { produced: 0, limited: 0 },
      npsEmployer: { produced: 0, limited: 0 },
    },
    otherIncome: {
      interestIncome: 0,
      other: 0,
    },
  },
  houseProperty: {
    interest: 0,
  },
  settings: {
    isMetro: 'Yes',
    pfPercent: 12,
    vpfPercent: 0,
    includePfBasic: 'Y',
    includePfDa: 'N',
  },
  age: 30,
};

describe.skip('taxSlice reducer', () => {
  it('should return the initial state', () => {
    expect(taxReducer(undefined, {})).toEqual(defaultInitialState);
  });

  it('should handle updateMonthData', () => {
    const actual = taxReducer(
      defaultInitialState,
      updateMonthData({
        index: 0,
        field: 'basic',
        value: 55000,
        populateRemaining: false,
      }),
    );
    expect(actual.salaryMonths[0].basic).toEqual(55000);
  });

  it('should handle updateMonthData with populateRemaining', () => {
    const actual = taxReducer(
      defaultInitialState,
      updateMonthData({
        index: 0,
        field: 'basic',
        value: 60000,
        populateRemaining: true,
      }),
    );
    expect(actual.salaryMonths[0].basic).toEqual(60000);
    expect(actual.salaryMonths[11].basic).toEqual(60000);
  });

  it('should handle updateSettings', () => {
    const actual = taxReducer(
      defaultInitialState,
      updateSettings({ isMetro: 'No', pfPercent: 10 }),
    );
    expect(actual.settings.isMetro).toEqual('No');
    expect(actual.settings.pfPercent).toEqual(10);
  });

  it('should handle addDynamicRow for income', () => {
    const actual = taxReducer(
      defaultInitialState,
      addDynamicRow({ type: 'income', label: 'Bonus' }),
    );
    expect(actual.dynamicRows.income.length).toBe(1);
    expect(actual.dynamicRows.income[0].label).toBe('Bonus');
    expect(actual.salaryMonths[0]).toHaveProperty(
      actual.dynamicRows.income[0].id,
    );
  });

  it('should handle addDynamicRow for deduction', () => {
    const actual = taxReducer(
      defaultInitialState,
      addDynamicRow({ type: 'deduction', label: 'Sodexo' }),
    );
    expect(actual.dynamicRows.deduction.length).toBe(1);
    expect(actual.dynamicRows.deduction[0].label).toBe('Sodexo');
    expect(actual.salaryMonths[0]).toHaveProperty(
      actual.dynamicRows.deduction[0].id,
    );
  });

  it('should handle editDynamicRow', () => {
    let state = taxReducer(
      defaultInitialState,
      addDynamicRow({ type: 'income', label: 'Bonus' }),
    );
    const rowId = state.dynamicRows.income[0].id;
    state = taxReducer(
      state,
      editDynamicRow({ type: 'income', id: rowId, label: 'Annual Bonus' }),
    );
    expect(state.dynamicRows.income[0].label).toBe('Annual Bonus');
  });

  it('should handle deleteDynamicRow', () => {
    let state = taxReducer(
      defaultInitialState,
      addDynamicRow({ type: 'income', label: 'Bonus' }),
    );
    const rowId = state.dynamicRows.income[0].id;
    state = taxReducer(state, deleteDynamicRow({ type: 'income', id: rowId }));
    expect(state.dynamicRows.income.length).toBe(0);
    expect(state.salaryMonths[0]).not.toHaveProperty(rowId);
  });

  it('should handle updateHouseProperty', () => {
    const actual = taxReducer(
      defaultInitialState,
      updateHouseProperty({ interest: 200000 }),
    );
    expect(actual.houseProperty.interest).toEqual(200000);
  });

  it('should handle updateAge', () => {
    const actual = taxReducer(defaultInitialState, updateAge(40));
    expect(actual.age).toEqual(40);
  });

  it('should handle resetTax', () => {
    const stateWithChanges = { ...defaultInitialState, age: 45 };
    const actual = taxReducer(stateWithChanges, resetTax());
    expect(actual).toEqual(defaultInitialState);
  });

  it('should handle updateDeclaration for a nested field', () => {
    const actual = taxReducer(
      defaultInitialState,
      updateDeclaration({
        section: 'exemptions',
        field: 'hra',
        value: { produced: 50000 },
      }),
    );
    expect(actual.declarations.exemptions.hra.produced).toEqual(50000);
  });

  it('should handle updateDeclaration for a top-level field', () => {
    const actual = taxReducer(
      defaultInitialState,
      updateDeclaration({
        section: 'sec80C',
        field: 'standard80C',
        value: 100000,
      }),
    );
    expect(actual.declarations.sec80C.standard80C).toEqual(100000);
  });

  describe('selectCalculatedSalary', () => {
    it('should calculate annual salary correctly', () => {
      const state = { tax: defaultInitialState };
      const calculated = selectCalculatedSalary(state);
      expect(calculated.annual.basic).toBe(50000 * 12);
      expect(calculated.annual.hraReceived).toBe(25000 * 12);
      expect(calculated.annual.totalIncome).toBe(
        (50000 + 25000 + 10000 + 5000) * 12,
      );
      expect(calculated.annual.pf).toBe(6000 * 12);
      expect(calculated.annual.vpf).toBe(0);
      expect(calculated.annual.nps).toBe(0);
      expect(calculated.annual.profTax).toBe(2500);
      expect(calculated.annual.totalDeductions).toBe(6000 * 12 + 2500);
      expect(calculated.annual.netIncome).toBe(
        calculated.annual.totalIncome - calculated.annual.totalDeductions,
      );
    });

    it('should handle dynamic rows in salary calculation', () => {
      let state = taxReducer(
        defaultInitialState,
        addDynamicRow({ type: 'income', label: 'Bonus' }),
      );
      const incomeId = state.dynamicRows.income[0].id;
      state = taxReducer(
        state,
        updateMonthData({
          index: 0,
          field: incomeId,
          value: 10000,
          populateRemaining: false,
        }),
      );

      let stateWithDeduction = taxReducer(
        state,
        addDynamicRow({ type: 'deduction', label: 'Sodexo' }),
      );
      const deductionId = stateWithDeduction.dynamicRows.deduction[0].id;
      stateWithDeduction = taxReducer(
        stateWithDeduction,
        updateMonthData({
          index: 0,
          field: deductionId,
          value: 1000,
          populateRemaining: false,
        }),
      );

      const calculated = selectCalculatedSalary({ tax: stateWithDeduction });
      expect(calculated.annual.totalIncome).toBe(
        (50000 + 25000 + 10000 + 5000) * 12 + 10000,
      );
      expect(calculated.annual.totalDeductions).toBe(6000 * 12 + 2500 + 1000);
    });
  });

  describe('selectCalculatedDeclarations', () => {
    const baseState = {
      tax: {
        ...defaultInitialState,
        declarations: {
          ...defaultInitialState.declarations,
          sec80C: {
            standard80C: 50000,
            npsEmployee: 10000,
            totalProduced: 0,
            limited: 0,
          },
          deductions: {
            ...defaultInitialState.declarations.deductions,
            sec80D: { produced: 30000, limited: 0 },
            npsEmployer: { produced: 20000, limited: 0 },
          },
          exemptions: {
            ...defaultInitialState.declarations.exemptions,
            lta: { produced: 10000, limited: 0 },
          },
        },
        salaryMonths: Array(12).fill({
          ...defaultInitialState.salaryMonths[0],
          vpf: 1000, // 12000 annually
          nps: 1000, // 12000 annually
          basic: 60000, // 720000 annually
        }),
        age: 40,
      },
    };

    it('should calculate limited 80C exemption correctly', () => {
      const calculated = selectCalculatedDeclarations(baseState);
      // PF: 12% of 720000 = 86400
      // VPF: 12000
      // NPS Employee (from declaration): 10000
      // Standard 80C (from declaration): 50000
      // Life Insurance (from declaration, assuming 0): 0
      // Total Produced: 10k (npsEmployee) + 50k (standard80C) + 86400 (PF) + 12000 (VPF) = 158400
      // Limited 80C: Min(158400, 150000) = 150000
      expect(calculated.sec80C.limited).toBe(150000);
      expect(calculated.sec80C.totalProduced).toBe(158400);
    });

    it('should calculate other limited exemptions/deductions correctly', () => {
      const calculated = selectCalculatedDeclarations(baseState);
      expect(calculated.exemptions.lta.limited).toBe(0); // Produced 10000, annualLtaReceived is 0, so min is 0.
      expect(calculated.deductions.sec80D.limited).toBe(25000); // Produced 30000, capped at 25000 for age < 60
      expect(calculated.deductions.npsEmployer.limited).toBe(20000); // No cap logic in selector, returns produced
    });

    it('should handle zero produced values for declarations', () => {
      const state = {
        tax: {
          ...defaultInitialState,
          salaryMonths: Array(12).fill({
            ...defaultInitialState.salaryMonths[0],
            basic: 70000, // PF will be 84000
          }),
        },
      };
      const calculated = selectCalculatedDeclarations(state);
      expect(calculated.exemptions.hra.limited).toBe(0);
      expect(calculated.sec80C.limited).toBe(84000);
      expect(calculated.deductions.sec80D.limited).toBe(0);
    });
  });
});
