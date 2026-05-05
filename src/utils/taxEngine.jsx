import { taxRules } from './taxRules';

// Pure mathematical functions for tax calculations
const calculateOldRegimeSlabs = (taxableIncome, age) => {
  let tax = 0;
  let remainingIncome = taxableIncome;
  let exemptionLimit = age >= 80 ? 500000 : age >= 60 ? 300000 : 250000;

  if (remainingIncome <= exemptionLimit) return 0;

  remainingIncome -= exemptionLimit;

  if (exemptionLimit < 500000) {
    let taxableInThisSlab = Math.min(remainingIncome, 500000 - exemptionLimit);
    tax += taxableInThisSlab * 0.05;
    remainingIncome -= taxableInThisSlab;
  }

  if (remainingIncome <= 0) return tax;

  let taxableIn20Slab = Math.min(remainingIncome, 500000);
  tax += taxableIn20Slab * 0.2;
  remainingIncome -= taxableIn20Slab;

  if (remainingIncome <= 0) return tax;

  tax += remainingIncome * 0.3;

  return tax;
};

const calculateNewRegimeSlabs = (taxableIncome) => {
  let tax = 0;
  let remainingIncome = taxableIncome;

  let exemptionLimit = 300000;
  if (remainingIncome <= exemptionLimit) return 0;
  remainingIncome -= exemptionLimit;

  let slab1 = Math.min(remainingIncome, 400000);
  tax += slab1 * 0.05;
  remainingIncome -= slab1;
  if (remainingIncome <= 0) return tax;

  let slab2 = Math.min(remainingIncome, 300000);
  tax += slab2 * 0.1;
  remainingIncome -= slab2;
  if (remainingIncome <= 0) return tax;

  let slab3 = Math.min(remainingIncome, 200000);
  tax += slab3 * 0.15;
  remainingIncome -= slab3;
  if (remainingIncome <= 0) return tax;

  let slab4 = Math.min(remainingIncome, 300000);
  tax += slab4 * 0.2;
  remainingIncome -= slab4;
  if (remainingIncome <= 0) return tax;

  tax += remainingIncome * 0.3;

  return tax;
};

export const calculateTax = (income, declarations, houseProperty, meta) => {
  const ex = declarations.exemptions;
  const c80 = declarations.sec80C;
  const ded = declarations.deductions;
  const otherIncome = declarations.otherIncome;

  const totalOtherIncome =
    (parseFloat(otherIncome?.bonus) || 0) +
    (parseFloat(otherIncome?.savingsInt) || 0) +
    (parseFloat(otherIncome?.dividends) || 0) +
    (parseFloat(otherIncome?.capitalGains) || 0) +
    (parseFloat(otherIncome?.crypto) || 0);

  const totalIncome = (parseFloat(income.salary) || 0) + totalOtherIncome;

  // OLD REGIME CALCULATION
  const oldRegimeDeductions = {
    standard: taxRules.standardDeduction.old.amount,
    hra: ex?.hra?.limited || 0,
    sec80C: c80?.limited || 0,
    sec80D: ded?.sec80D?.limited || 0,
    sec24b: Math.min(
      parseFloat(houseProperty?.interest) || 0,
      taxRules.deductions.sec24b.limit,
    ),
    nps80CCD1B: ded?.nps80CCD1B?.limited || 0,
    nps80CCD2: ded?.nps80CCD2?.limited || 0,
    sec80E: ded?.sec80E?.limited || 0,
    sec80TTA: ded?.sec80TTA?.limited || 0,
    profTax: parseFloat(meta?.profTax) || 0,
  };

  const totalOldDeductions = Object.values(oldRegimeDeductions).reduce(
    (sum, val) => sum + val,
    0,
  );
  const oldTaxableIncome = Math.max(0, totalIncome - totalOldDeductions);
  let oldTax = calculateOldRegimeSlabs(oldTaxableIncome, meta.age || 30);
  if (oldTaxableIncome <= 500000) {
    oldTax = Math.max(0, oldTax - 12500);
  }
  const oldTotalTax = oldTax + oldTax * 0.04;

  // NEW REGIME CALCULATION
  const newRegimeDeductions = {
    standard: taxRules.standardDeduction.new.amount,
    nps80CCD1B: ded?.nps80CCD1B?.limited || 0,
    nps80CCD2: ded?.nps80CCD2?.limited || 0,
  };
  const totalNewDeductions = Object.values(newRegimeDeductions).reduce(
    (sum, val) => sum + val,
    0,
  );
  const newTaxableIncome = Math.max(0, totalIncome - totalNewDeductions);
  let newTax = calculateNewRegimeSlabs(newTaxableIncome);
  if (newTaxableIncome <= 700000) {
    newTax = 0; // Full rebate
  }
  const newTotalTax = newTax + newTax * 0.04;

  return {
    oldRegime: {
      grossIncome: totalIncome,
      deductions: totalOldDeductions,
      taxableIncome: oldTaxableIncome,
      tax: oldTotalTax,
    },
    newRegime: {
      grossIncome: totalIncome,
      deductions: totalNewDeductions,
      taxableIncome: newTaxableIncome,
      tax: newTotalTax,
    },
    optimal: oldTotalTax < newTotalTax ? 'Old Regime' : 'New Regime',
    savings: Math.abs(oldTotalTax - newTotalTax),
  };
};
