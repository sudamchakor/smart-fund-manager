// Pure mathematical functions for tax calculations

const calculateOldRegimeSlabs = (taxableIncome, age) => {
  let tax = 0;
  let remainingIncome = taxableIncome;
  let exemptionLimit = age >= 80 ? 500000 : (age >= 60 ? 300000 : 250000);

  if (remainingIncome <= exemptionLimit) return 0;

  remainingIncome -= exemptionLimit;

  // Next slab up to 5 Lakhs (5%)
  if (exemptionLimit < 500000) {
      let taxableInThisSlab = Math.min(remainingIncome, 500000 - exemptionLimit);
      tax += taxableInThisSlab * 0.05;
      remainingIncome -= taxableInThisSlab;
  }

  if (remainingIncome <= 0) return tax;

  // Next slab up to 10 Lakhs (20%)
  let taxableIn20Slab = Math.min(remainingIncome, 500000); // 5L to 10L is 5L
  tax += taxableIn20Slab * 0.20;
  remainingIncome -= taxableIn20Slab;

  if (remainingIncome <= 0) return tax;

  // Above 10 Lakhs (30%)
  tax += remainingIncome * 0.30;
  
  return tax;
};

const calculateNewRegimeSlabs = (taxableIncome) => {
  let tax = 0;
  let remainingIncome = taxableIncome;

  // 0-3L (0%)
  let exemptionLimit = 300000;
  if (remainingIncome <= exemptionLimit) return 0;
  remainingIncome -= exemptionLimit;

  // 3-7L (5%)
  let slab1 = Math.min(remainingIncome, 400000);
  tax += slab1 * 0.05;
  remainingIncome -= slab1;
  if (remainingIncome <= 0) return tax;

  // 7-10L (10%)
  let slab2 = Math.min(remainingIncome, 300000);
  tax += slab2 * 0.10;
  remainingIncome -= slab2;
  if (remainingIncome <= 0) return tax;

  // 10-12L (15%)
  let slab3 = Math.min(remainingIncome, 200000);
  tax += slab3 * 0.15;
  remainingIncome -= slab3;
  if (remainingIncome <= 0) return tax;

  // 12-15L (20%)
  let slab4 = Math.min(remainingIncome, 300000);
  tax += slab4 * 0.20;
  remainingIncome -= slab4;
  if (remainingIncome <= 0) return tax;

  // Above 15L (30%)
  tax += remainingIncome * 0.30;

  return tax;
};

export const calculateTax = (income, declarations, houseProperty, meta) => {
  const ex = declarations.exemptions;
  const c80 = declarations.sec80C;
  const ded = declarations.deductions;
  const otherIncome = declarations.otherIncome;

  const totalOtherIncome = (parseFloat(otherIncome.bonus) || 0) + 
                           (parseFloat(otherIncome.savingsInt) || 0) + 
                           (parseFloat(otherIncome.dividends) || 0) + 
                           (parseFloat(otherIncome.capitalGains) || 0) + 
                           (parseFloat(otherIncome.crypto) || 0);

  const totalIncome = (parseFloat(income.salary) || 0) + totalOtherIncome;

  const OLD_STANDARD_DEDUCTION = 50000;
  const NEW_STANDARD_DEDUCTION = 75000;
  
  const totalExemptions = (ex.hra.limited || 0) + 
                          (ex.transport.limited || 0) + 
                          (ex.gratuity.limited || 0) + 
                          (ex.childrenEduc.limited || 0) + 
                          (ex.lta.limited || 0) + 
                          (ex.uniform.limited || 0);

  const sec80C = c80.limited || 0;
  const otherDeductions = (ded.sec80D.limited || 0) + 
                          (ded.sec80DD_DDB.limited || 0) + 
                          (ded.sec80E_EEB.limited || 0) + 
                          (ded.sec80G.limited || 0) + 
                          (ded.sec80GG.limited || 0) + 
                          (ded.sec80TTA_U.limited || 0);
  const profTax = parseFloat(meta.profTax) || 0;
  
  // Section 24(b) - Home Loan Interest limit 2,000,000
  const homeLoanInterest = Math.min(parseFloat(houseProperty.interest) || 0, 200000); 

  // OLD REGIME CALCULATION
  const oldDeductions = OLD_STANDARD_DEDUCTION + totalExemptions + sec80C + otherDeductions + homeLoanInterest + profTax;
  const oldTaxableIncome = Math.max(0, totalIncome - oldDeductions);
  let oldTax = calculateOldRegimeSlabs(oldTaxableIncome, meta.age || 30);
  
  // Rebate 87A (Old Regime)
  if (oldTaxableIncome <= 500000) {
      oldTax = Math.max(0, oldTax - 12500);
  }
  
  const oldTotalTax = oldTax + (oldTax * 0.04); // 4% Cess

  // NEW REGIME CALCULATION (115BAC - FY 25-26)
  // New regime allows standard deduction and Employer NPS 80CCD(2), we assume basic standard deduction.
  const newDeductions = NEW_STANDARD_DEDUCTION + (parseFloat(c80.npsEmployer) || 0);
  const newTaxableIncome = Math.max(0, totalIncome - newDeductions);
  let newTax = calculateNewRegimeSlabs(newTaxableIncome);

  // Crypto flat 30% tax simple addition on crypto income (ignoring losses and standard deductions for simplicity in basic calc)
  const cryptoIncome = parseFloat(otherIncome.crypto) || 0;
  const cryptoTax = cryptoIncome * 0.30;
  
  // Rebate 87A (New Regime up to 12L)
  if (newTaxableIncome <= 1200000) {
      // Marginal relief could apply but standard rebate is full tax up to 12L
      const maxRebate = calculateNewRegimeSlabs(1200000); 
      newTax = Math.max(0, newTax - maxRebate);
  } else if (newTaxableIncome > 1200000 && newTaxableIncome <= 1227770) {
      // Marginal relief basic approximation
      let taxAt12L = calculateNewRegimeSlabs(1200000);
      let incomeAbove12L = newTaxableIncome - 1200000;
      let taxWithoutRebate = calculateNewRegimeSlabs(newTaxableIncome);
      if(taxWithoutRebate > incomeAbove12L) {
          newTax = incomeAbove12L; // simplified marginal relief
      }
  }

  // Adding crypto tax after slab rebate (as crypto is special rate)
  newTax += cryptoTax;

  const newTotalTax = newTax + (newTax * 0.04); // 4% Cess

  // Re-adjust old tax for crypto flat rate
  // This is a simplified approach, actual crypto tax is 30% flat under both regimes
  let oldTaxExcludingCrypto = calculateOldRegimeSlabs(Math.max(0, oldTaxableIncome - cryptoIncome), meta.age || 30);
  if (oldTaxableIncome - cryptoIncome <= 500000) {
      oldTaxExcludingCrypto = Math.max(0, oldTaxExcludingCrypto - 12500);
  }
  const oldTotalTaxFinal = oldTaxExcludingCrypto + cryptoTax + ((oldTaxExcludingCrypto + cryptoTax) * 0.04);

  return {
      oldRegime: {
          taxableIncome: oldTaxableIncome,
          tax: oldTotalTaxFinal,
      },
      newRegime: {
          taxableIncome: newTaxableIncome,
          tax: newTotalTax,
      },
      optimal: oldTotalTaxFinal < newTotalTax ? 'Old Regime' : 'New Regime',
      savings: Math.abs(oldTotalTaxFinal - newTotalTax),
  };
};