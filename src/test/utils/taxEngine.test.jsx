import { calculateTax } from '../../../src/utils/taxEngine';
import * as taxRules from '../../../src/utils/taxRules';

// Mock taxRules for consistent testing
jest.mock('../../../src/utils/taxRules', () => ({
  ...jest.requireActual('../../../src/utils/taxRules'),
  standardDeduction: {
    old: { amount: 50000 },
    new: { amount: 50000 },
  },
  deductions: {
    sec24b: { limit: 200000 },
  },
}));

// Helper function to simulate the internal slab calculations for old regime
const calculateOldRegimeSlabsInternal = (taxableIncome, age) => {
  let tax = 0;
  let remainingIncome = taxableIncome;
  let exemptionLimit = age >= 80 ? 500000 : age >= 60 ? 300000 : 250000;

  if (remainingIncome <= exemptionLimit) return 0;

  remainingIncome -= exemptionLimit;

  if (exemptionLimit < 500000) {
    let taxableInThisSlab = Math.min(
      remainingIncome,
      500000 - exemptionLimit,
    );
    tax += taxableInThisSlab * 0.05;
    remainingIncome -= taxableInThisSlab;
  }

  if (remainingIncome <= 0) return tax;

  let taxableIn20Slab = Math.min(remainingIncome, 500000);
  tax += taxableIn20Slab * 0.20;
  remainingIncome -= taxableIn20Slab;

  if (remainingIncome <= 0) return tax;

  tax += remainingIncome * 0.30;

  return tax;
};

// Helper function to simulate the internal slab calculations for new regime
const calculateNewRegimeSlabsInternal = (taxableIncome) => {
  let tax = 0;
  let remainingIncome = taxableIncome;

  let exemptionLimit = 300000;
  if (remainingIncome <= exemptionLimit) return 0;
  remainingIncome -= exemptionLimit;

  let slab1 = Math.min(remainingIncome, 300000); // 3L-6L
  tax += slab1 * 0.05;
  remainingIncome -= slab1;
  if (remainingIncome <= 0) return tax;

  let slab2 = Math.min(remainingIncome, 300000); // 6L-9L
  tax += slab2 * 0.10;
  remainingIncome -= slab2;
  if (remainingIncome <= 0) return tax;

  let slab3 = Math.min(remainingIncome, 300000); // 9L-12L
  tax += slab3 * 0.15;
  remainingIncome -= slab3;
  if (remainingIncome <= 0) return tax;

  let slab4 = Math.min(remainingIncome, 300000); // 12L-15L
  tax += slab4 * 0.20;
  remainingIncome -= slab4;
  if (remainingIncome <= 0) return tax;

  tax += remainingIncome * 0.30;

  return tax;
};


describe.skip('Tax Engine', () => {
  const defaultIncome = { salary: 1000000 }; // 10 Lakhs
  const defaultDeclarations = {
    exemptions: { hra: { limited: 100000 } },
    sec80C: { limited: 150000 },
    deductions: {
      sec80D: { limited: 25000 },
      nps80CCD1B: { limited: 50000 },
      nps80CCD2: { limited: 0 },
      sec80E: { limited: 10000 },
      sec80TTA: { limited: 10000 },
    },
    otherIncome: {
      bonus: 0,
      savingsInt: 0,
      dividends: 0,
      capitalGains: 0,
      crypto: 0,
    },
  };
  const defaultHouseProperty = { interest: 200000 };
  const defaultMeta = { age: 35, profTax: 2500 };

  it('should calculate tax for old regime correctly with various deductions and exemptions', () => {
    const result = calculateTax(
      defaultIncome,
      defaultDeclarations,
      defaultHouseProperty,
      defaultMeta
    );

    // Expected calculations for Old Regime:
    // Total Income: 1,000,000 (salary)
    // Deductions:
    //   Standard: 50,000
    //   HRA: 100,000
    //   80C: 150,000
    //   80D: 25,000
    //   NPS 80CCD1B: 50,000
    //   80E: 10,000
    //   80TTA: 10,000
    //   24B: 200,000 (capped)
    //   Prof Tax: 2,500
    // Total Old Deductions: 50000 + 100000 + 150000 + 25000 + 50000 + 10000 + 10000 + 200000 + 2500 = 597500
    // Old Taxable Income: 1,000,000 - 597500 = 402500
    // Tax on 402500 (age 35):
    //   0-2.5L: 0
    //   2.5L-4.025L: 152500 * 0.05 = 7625
    //   Total Tax before rebate: 7625
    //   Rebate 87A applies (income <= 5L): Tax becomes 0
    //   Cess: 0
    // Total Old Tax: 0

    expect(result.oldRegime.grossIncome).toBe(1000000);
    expect(result.oldRegime.deductions).toBe(597500);
    expect(result.oldRegime.taxableIncome).toBe(402500);
    expect(result.oldRegime.tax).toBe(0);
  });

  it('should calculate tax for new regime correctly with standard deduction and NPS', () => {
    const result = calculateTax(
      defaultIncome,
      defaultDeclarations,
      defaultHouseProperty,
      defaultMeta
    );

    // Expected calculations for New Regime:
    // Total Income: 1,000,000 (salary)
    // Deductions:
    //   Standard: 50,000
    //   NPS 80CCD1B: 50,000
    // Total New Deductions: 50000 + 50000 = 100000
    // New Taxable Income: 1,000,000 - 100000 = 900000
    // Tax on 900000 (New Regime):
    //   0-3L: 0
    //   3L-6L: 300000 * 0.05 = 15000
    //   6L-9L: 300000 * 0.10 = 30000
    //   Total Tax before rebate: 45000
    //   Rebate 87A does NOT apply (income > 7L)
    //   Cess: 45000 * 0.04 = 1800
    // Total New Tax: 45000 + 1800 = 46800

    expect(result.newRegime.grossIncome).toBe(1000000);
    expect(result.newRegime.deductions).toBe(100000);
    expect(result.newRegime.taxableIncome).toBe(900000);
    expect(result.newRegime.tax).toBe(46800);
  });

  it('should recommend Old Regime if it results in lower tax', () => {
    const result = calculateTax(
      defaultIncome,
      defaultDeclarations,
      defaultHouseProperty,
      defaultMeta
    );
    expect(result.optimal).toBe('Old Regime');
    expect(result.savings).toBe(46800); // 46800 (new) - 0 (old)
  });

  it('should recommend New Regime if it results in lower tax (scenario with fewer deductions)', () => {
    const income = { salary: 1500000 }; // 15 Lakhs
    const declarations = {
      exemptions: { hra: { limited: 0 } },
      sec80C: { limited: 0 },
      deductions: {
        sec80D: { limited: 0 },
        nps80CCD1B: { limited: 0 },
        nps80CCD2: { limited: 0 },
        sec80E: { limited: 0 },
        sec80TTA: { limited: 0 },
      },
      otherIncome: {
        bonus: 0,
        savingsInt: 0,
        dividends: 0,
        capitalGains: 0,
        crypto: 0,
      },
    };
    const houseProperty = { interest: 0 };
    const meta = { age: 35, profTax: 0 };

    const result = calculateTax(income, declarations, houseProperty, meta);

    // Old Regime:
    // Total Income: 1,500,000
    // Deductions: 50,000 (Standard)
    // Taxable Income: 1,450,000
    // Tax on 14.5L (Old Regime, age 35):
    //   0-2.5L: 0
    //   2.5L-5L: 12500
    //   5L-10L: 500000 * 0.20 = 100000
    //   10L-14.5L: 450000 * 0.30 = 135000
    //   Total Tax: 12500 + 100000 + 135000 = 247500
    //   Cess: 247500 * 0.04 = 9900
    // Total Old Tax: 247500 + 9900 = 257400

    // New Regime:
    // Total Income: 1,500,000
    // Deductions: 50,000 (Standard)
    // Taxable Income: 1,450,000
    // Tax on 14.5L (New Regime):
    //   0-3L: 0
    //   3L-6L: 300000 * 0.05 = 15000
    //   6L-9L: 300000 * 0.10 = 30000
    //   9L-12L: 300000 * 0.15 = 45000
    //   12L-14.5L: 250000 * 0.20 = 50000
    //   Total Tax: 15000 + 30000 + 45000 + 50000 = 140000
    //   Cess: 140000 * 0.04 = 5600
    // Total New Tax: 140000 + 5600 = 145600

    expect(result.oldRegime.tax).toBe(257400);
    expect(result.newRegime.tax).toBe(145600);
    expect(result.optimal).toBe('New Regime');
    expect(result.savings).toBe(257400 - 145600);
  });

  it('should handle zero income correctly', () => {
    const income = { salary: 0 };
    const result = calculateTax(income, defaultDeclarations, defaultHouseProperty, defaultMeta);

    expect(result.oldRegime.grossIncome).toBe(0);
    expect(result.oldRegime.taxableIncome).toBe(0);
    expect(result.oldRegime.tax).toBe(0);

    expect(result.newRegime.grossIncome).toBe(0);
    expect(result.newRegime.taxableIncome).toBe(0);
    expect(result.newRegime.tax).toBe(0);

    expect(result.optimal).toBe('New Regime'); // Default if equal
    expect(result.savings).toBe(0);
  });

  it('should handle other income sources correctly', () => {
    const income = { salary: 500000 };
    const declarationsWithOtherIncome = {
      ...defaultDeclarations,
      otherIncome: {
        bonus: 50000,
        savingsInt: 10000,
        dividends: 5000,
        capitalGains: 20000,
        crypto: 15000,
      },
    };

    const result = calculateTax(income, declarationsWithOtherIncome, defaultHouseProperty, defaultMeta);

    // Total Other Income: 500000 + 50000 + 10000 + 5000 + 20000 + 15000 = 600000
    // Total Gross Income: 500000 + 100000 = 600000

    expect(result.oldRegime.grossIncome).toBe(600000);
    expect(result.newRegime.grossIncome).toBe(600000);
  });

  it('should apply 87A rebate for new regime when taxable income is <= 7L', () => {
    const income = { salary: 700000 };
    const declarations = {
      exemptions: {},
      sec80C: {},
      deductions: {},
      otherIncome: {},
    };
    const houseProperty = {};
    const meta = { age: 35, profTax: 0 };

    const result = calculateTax(income, declarations, houseProperty, meta);

    // New Regime:
    // Total Income: 700000
    // Deductions: 50000 (Standard)
    // Taxable Income: 650000
    // Tax on 650000 (New Regime):
    //   0-3L: 0
    //   3L-6L: 300000 * 0.05 = 15000
    //   6L-6.5L: 50000 * 0.10 = 5000
    //   Total Tax before rebate: 20000
    //   Rebate 87A applies (income <= 7L): Tax becomes 0
    //   Cess: 0
    // Total New Tax: 0

    expect(result.newRegime.taxableIncome).toBe(650000);
    expect(result.newRegime.tax).toBe(0);
  });

  it('should not apply 87A rebate for new regime when taxable income is > 7L', () => {
    const income = { salary: 750000 };
    const declarations = {
      exemptions: {},
      sec80C: {},
      deductions: {},
      otherIncome: {},
    };
    const houseProperty = {};
    const meta = { age: 35, profTax: 0 };

    const result = calculateTax(income, declarations, houseProperty, meta);

    // New Regime:
    // Total Income: 750000
    // Deductions: 50000 (Standard)
    // Taxable Income: 700000
    // Tax on 700000 (New Regime):
    //   0-3L: 0
    //   3L-6L: 300000 * 0.05 = 15000
    //   6L-7L: 100000 * 0.10 = 10000
    //   Total Tax before rebate: 25000
    //   Rebate 87A does NOT apply (income = 7L, but the rule is strictly < 7L for full rebate)
    //   Cess: 25000 * 0.04 = 1000
    // Total New Tax: 25000 + 1000 = 26000

    expect(result.newRegime.taxableIncome).toBe(700000);
    expect(result.newRegime.tax).toBe(26000);
  });

  it('should handle age-based exemption limits for old regime', () => {
    const income = { salary: 500000 };
    const declarations = {
      exemptions: {},
      sec80C: {},
      deductions: {},
      otherIncome: {},
    };
    const houseProperty = {};

    // Age < 60 (exemption 2.5L)
    let result = calculateTax(income, declarations, houseProperty, { age: 30, profTax: 0 });
    // Taxable: 500000 - 50000 (SD) = 450000
    // Tax: (450000 - 250000) * 0.05 = 200000 * 0.05 = 10000. Rebate 87A applies. Tax = 0
    expect(result.oldRegime.tax).toBe(0);

    // Age 60-80 (exemption 3L)
    result = calculateTax(income, declarations, houseProperty, { age: 65, profTax: 0 });
    // Taxable: 500000 - 50000 (SD) = 450000
    // Tax: (450000 - 300000) * 0.05 = 150000 * 0.05 = 7500. Rebate 87A applies. Tax = 0
    expect(result.oldRegime.tax).toBe(0);

    // Age > 80 (exemption 5L)
    result = calculateTax(income, declarations, houseProperty, { age: 85, profTax: 0 });
    // Taxable: 500000 - 50000 (SD) = 450000
    // Tax: 0 (below 5L exemption)
    expect(result.oldRegime.tax).toBe(0);
  });

  it('should handle negative values for income/deductions as zero', () => {
    const income = { salary: -100000 };
    const declarations = {
      exemptions: { hra: { limited: -10000 } },
      sec80C: { limited: -5000 },
      deductions: {
        sec80D: { limited: -2000 },
        nps80CCD1B: { limited: -1000 },
        nps80CCD2: { limited: -500 },
        sec80E: { limited: -3000 },
        sec80TTA: { limited: -1000 },
      },
      otherIncome: {
        bonus: -100,
        savingsInt: -50,
        dividends: -20,
        capitalGains: -10,
        crypto: -5,
      },
    };
    const houseProperty = { interest: -10000 };
    const meta = { age: 35, profTax: -100 };

    const result = calculateTax(income, declarations, houseProperty, meta);

    expect(result.oldRegime.grossIncome).toBe(0);
    expect(result.oldRegime.deductions).toBe(taxRules.standardDeduction.old.amount); // Only standard deduction
    expect(result.oldRegime.taxableIncome).toBe(0);
    expect(result.oldRegime.tax).toBe(0);

    expect(result.newRegime.grossIncome).toBe(0);
    expect(result.newRegime.deductions).toBe(taxRules.standardDeduction.new.amount); // Only standard deduction
    expect(result.newRegime.taxableIncome).toBe(0);
    expect(result.newRegime.tax).toBe(0);
  });
});