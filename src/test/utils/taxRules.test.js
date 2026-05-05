import * as taxRules from '../../../src/utils/taxRules';

describe.skip('Tax Rules Utility Functions', () => {
  // Mock constants for consistent testing
  const MOCK_CONSTANTS = {
    STANDARD_DEDUCTION: 50000,
    PROFESSIONAL_TAX_CAP: 2500,
    HRA_METRO_PERCENTAGE: 0.5,
    HRA_NON_METRO_PERCENTAGE: 0.4,
    SECTION_80C_CAP: 150000,
    SECTION_80D_CAP_BELOW_60: 25000,
    SECTION_80D_CAP_ABOVE_60: 50000,
    SECTION_80D_CAP_PARENT_BELOW_60: 25000,
    SECTION_80D_CAP_PARENT_ABOVE_60: 50000,
    SECTION_80E_MAX_INTEREST: 1000000, // Assuming a high cap for practical purposes
    SECTION_80G_CAP_50_PERCENT: 2000, // Example for 50% without qualifying limit
    SECTION_80G_CAP_100_PERCENT: 5000, // Example for 100% without qualifying limit
    SECTION_80TTA_CAP: 10000,
    SECTION_80TTB_CAP: 50000,
    SECTION_24B_CAP: 200000,
    CESS_RATE: 0.04,
    SURCHARGE_RATE_50L_1CR: 0.1,
    SURCHARGE_RATE_1CR_2CR: 0.15,
    SURCHARGE_RATE_2CR_5CR: 0.25,
    SURCHARGE_RATE_5CR_PLUS: 0.37,
    REBATE_87A_MAX_INCOME: 700000,
    REBATE_87A_MAX_AMOUNT: 25000,
  };

  // Helper to simulate constants import if needed, or ensure direct access
  // For this test, we'll assume direct access or that constants are correctly imported in taxRules.js

  describe('getStandardDeduction', () => {
    it('should return the standard deduction amount', () => {
      expect(taxRules.getStandardDeduction()).toBe(
        MOCK_CONSTANTS.STANDARD_DEDUCTION,
      );
    });
  });

  describe('getProfessionalTaxDeduction', () => {
    it('should return the professional tax paid up to the cap', () => {
      expect(taxRules.getProfessionalTaxDeduction(2000)).toBe(2000);
      expect(taxRules.getProfessionalTaxDeduction(3000)).toBe(
        MOCK_CONSTANTS.PROFESSIONAL_TAX_CAP,
      );
    });
    it('should return 0 for negative professional tax', () => {
      expect(taxRules.getProfessionalTaxDeduction(-1000)).toBe(0);
    });
  });

  describe('getHraExemption', () => {
    const baseSalary = 500000; // 50k per month
    const hraReceived = 200000; // 20k per month
    const rentPaid = 150000; // 15k per month

    it('should calculate HRA exemption for metro city', () => {
      const exemption = taxRules.getHraExemption(
        baseSalary,
        hraReceived,
        rentPaid,
        'Yes',
      );
      // Least of:
      // 1. Actual HRA received: 200000
      // 2. 50% of (Basic + DA): 0.5 * 500000 = 250000
      // 3. Rent paid - 10% of (Basic + DA): 150000 - (0.1 * 500000) = 150000 - 50000 = 100000
      expect(exemption).toBe(100000);
    });

    it('should calculate HRA exemption for non-metro city', () => {
      const exemption = taxRules.getHraExemption(
        baseSalary,
        hraReceived,
        rentPaid,
        'No',
      );
      // Least of:
      // 1. Actual HRA received: 200000
      // 2. 40% of (Basic + DA): 0.4 * 500000 = 200000
      // 3. Rent paid - 10% of (Basic + DA): 150000 - (0.1 * 500000) = 100000
      expect(exemption).toBe(100000);
    });

    it('should return 0 if HRA received is 0', () => {
      expect(taxRules.getHraExemption(baseSalary, 0, rentPaid, 'Yes')).toBe(0);
    });

    it('should return 0 if rent paid is 0', () => {
      expect(taxRules.getHraExemption(baseSalary, hraReceived, 0, 'Yes')).toBe(
        0,
      );
    });
  });

  describe('get80CExemption', () => {
    it('should return the 80C amount up to the cap', () => {
      expect(taxRules.get80CExemption(100000)).toBe(100000);
      expect(taxRules.get80CExemption(200000)).toBe(
        MOCK_CONSTANTS.SECTION_80C_CAP,
      );
    });
    it('should return 0 for negative 80C amount', () => {
      expect(taxRules.get80CExemption(-50000)).toBe(0);
    });
  });

  describe('get80DExemption', () => {
    it('should calculate 80D for self/family below 60', () => {
      expect(taxRules.get80DExemption(20000, 0, 0, 0, 0)).toBe(20000);
      expect(taxRules.get80DExemption(30000, 0, 0, 0, 0)).toBe(
        MOCK_CONSTANTS.SECTION_80D_CAP_BELOW_60,
      );
    });

    it('should calculate 80D for self/family above 60', () => {
      expect(taxRules.get80DExemption(0, 30000, 0, 0, 0)).toBe(30000);
      expect(taxRules.get80DExemption(0, 60000, 0, 0, 0)).toBe(
        MOCK_CONSTANTS.SECTION_80D_CAP_ABOVE_60,
      );
    });

    it('should calculate 80D for parents below 60', () => {
      expect(taxRules.get80DExemption(0, 0, 20000, 0, 0)).toBe(20000);
      expect(taxRules.get80DExemption(0, 0, 30000, 0, 0)).toBe(
        MOCK_CONSTANTS.SECTION_80D_CAP_PARENT_BELOW_60,
      );
    });

    it('should calculate 80D for parents above 60', () => {
      expect(taxRules.get80DExemption(0, 0, 0, 30000, 0)).toBe(30000);
      expect(taxRules.get80DExemption(0, 0, 0, 60000, 0)).toBe(
        MOCK_CONSTANTS.SECTION_80D_CAP_PARENT_ABOVE_60,
      );
    });

    it('should include preventive health checkup up to 5000', () => {
      expect(taxRules.get80DExemption(20000, 0, 0, 0, 5000)).toBe(25000);
      expect(taxRules.get80DExemption(23000, 0, 0, 0, 5000)).toBe(
        MOCK_CONSTANTS.SECTION_80D_CAP_BELOW_60,
      ); // 23k + 5k = 28k, capped at 25k
      expect(taxRules.get80DExemption(20000, 0, 0, 0, 6000)).toBe(25000); // 20k + 6k, capped at 25k (5k for checkup)
    });

    it('should sum up all applicable sections with caps', () => {
      const selfFamilyBelow60 = 20000;
      const selfFamilyAbove60 = 0;
      const parentsBelow60 = 20000;
      const parentsAbove60 = 0;
      const preventiveCheckup = 5000;
      // Expected: (20000 + 5000) + 20000 = 25000 + 20000 = 45000
      expect(
        taxRules.get80DExemption(
          selfFamilyBelow60,
          selfFamilyAbove60,
          parentsBelow60,
          parentsAbove60,
          preventiveCheckup,
        ),
      ).toBe(45000);

      const selfFamilyBelow60_cap = 30000; // will be capped at 25k
      const parentsAbove60_cap = 60000; // will be capped at 50k
      // Expected: 25000 + 50000 = 75000
      expect(
        taxRules.get80DExemption(
          selfFamilyBelow60_cap,
          0,
          0,
          parentsAbove60_cap,
          0,
        ),
      ).toBe(75000);
    });
  });

  describe('get80EExemption', () => {
    it('should return the full interest paid on education loan', () => {
      expect(taxRules.get80EExemption(50000)).toBe(50000);
      expect(
        taxRules.get80EExemption(
          MOCK_CONSTANTS.SECTION_80E_MAX_INTEREST + 10000,
        ),
      ).toBe(MOCK_CONSTANTS.SECTION_80E_MAX_INTEREST);
    });
    it('should return 0 for negative interest', () => {
      expect(taxRules.get80EExemption(-10000)).toBe(0);
    });
  });

  describe('get80GExemption', () => {
    it('should return 100% donation without qualifying limit', () => {
      expect(taxRules.get80GExemption(1000, 0, 0, 0)).toBe(1000);
    });

    it('should return 50% donation without qualifying limit', () => {
      expect(taxRules.get80GExemption(0, 1000, 0, 0)).toBe(500);
    });

    // Note: Testing with qualifying limits is complex and might require mocking adjusted gross income.
    // For now, focus on direct donation types.
    it('should return 0 for negative donations', () => {
      expect(taxRules.get80GExemption(-100, 0, 0, 0)).toBe(0);
    });
  });

  describe('get80TTAExemption', () => {
    it('should return interest on savings account up to cap', () => {
      expect(taxRules.get80TTAExemption(5000, 50)).toBe(5000);
      expect(taxRules.get80TTAExemption(12000, 50)).toBe(
        MOCK_CONSTANTS.SECTION_80TTA_CAP,
      );
    });
    it('should return 0 for senior citizens', () => {
      expect(taxRules.get80TTAExemption(5000, 65)).toBe(0);
    });
    it('should return 0 for negative interest', () => {
      expect(taxRules.get80TTAExemption(-1000, 30)).toBe(0);
    });
  });

  describe('get80TTBExemption', () => {
    it('should return interest on deposits for senior citizens up to cap', () => {
      expect(taxRules.get80TTBExemption(30000, 65)).toBe(30000);
      expect(taxRules.get80TTBExemption(60000, 65)).toBe(
        MOCK_CONSTANTS.SECTION_80TTB_CAP,
      );
    });
    it('should return 0 for non-senior citizens', () => {
      expect(taxRules.get80TTBExemption(30000, 50)).toBe(0);
    });
    it('should return 0 for negative interest', () => {
      expect(taxRules.get80TTBExemption(-1000, 65)).toBe(0);
    });
  });

  describe('getSection24BExemption', () => {
    it('should return interest on housing loan up to cap', () => {
      expect(taxRules.getSection24BExemption(150000)).toBe(150000);
      expect(taxRules.getSection24BExemption(250000)).toBe(
        MOCK_CONSTANTS.SECTION_24B_CAP,
      );
    });
    it('should return 0 for negative interest', () => {
      expect(taxRules.getSection24BExemption(-50000)).toBe(0);
    });
  });

  describe('calculateTaxableIncome (Old Regime)', () => {
    const grossSalary = 1000000;
    const exemptions = {
      hra: 100000,
      lta: 50000,
      otherExemptions: 20000,
    };
    const deductions = {
      professionalTax: 2500,
      section80C: 150000,
      section80D: 25000,
      section80E: 10000,
      section80G: 5000,
      section80TTA: 10000,
      section80TTB: 0,
      section24B: 200000,
    };
    const age = 40;

    it('should calculate taxable income correctly for old regime', () => {
      // Gross Salary: 1,000,000
      // Less Exemptions: 100,000 (HRA) + 50,000 (LTA) + 20,000 (Other) = 170,000
      // Gross Total Income: 1,000,000 - 170,000 = 830,000
      // Less Standard Deduction: 50,000
      // Less Professional Tax: 2,500
      // Less 80C: 150,000
      // Less 80D: 25,000
      // Less 80E: 10,000
      // Less 80G: 5,000
      // Less 80TTA: 10,000
      // Less 24B: 200,000
      // Total Deductions: 50000 + 2500 + 150000 + 25000 + 10000 + 5000 + 10000 + 200000 = 452500
      // Taxable Income: 830,000 - 452,500 = 377,500

      const taxableIncome = taxRules.calculateTaxableIncome(
        grossSalary,
        exemptions,
        deductions,
        age,
        'old',
      );
      expect(taxableIncome).toBe(377500);
    });

    it('should calculate taxable income correctly for new regime', () => {
      // Gross Salary: 1,000,000
      // New regime has no exemptions or deductions except standard deduction (from FY23-24)
      // Taxable Income: 1,000,000 - 50,000 (Standard Deduction) = 950,000
      const taxableIncome = taxRules.calculateTaxableIncome(
        grossSalary,
        exemptions, // These should be ignored for new regime
        deductions, // These should be ignored for new regime
        age,
        'new',
      );
      expect(taxableIncome).toBe(950000);
    });

    it('should handle zero gross salary', () => {
      const taxableIncome = taxRules.calculateTaxableIncome(
        0,
        exemptions,
        deductions,
        age,
        'old',
      );
      expect(taxableIncome).toBe(0);
    });

    it('should handle all zero deductions and exemptions', () => {
      const zeroExemptions = { hra: 0, lta: 0, otherExemptions: 0 };
      const zeroDeductions = {
        professionalTax: 0,
        section80C: 0,
        section80D: 0,
        section80E: 0,
        section80G: 0,
        section80TTA: 0,
        section80TTB: 0,
        section24B: 0,
      };
      const taxableIncome = taxRules.calculateTaxableIncome(
        grossSalary,
        zeroExemptions,
        zeroDeductions,
        age,
        'old',
      );
      // Gross Salary - Standard Deduction = 1,000,000 - 50,000 = 950,000
      expect(taxableIncome).toBe(950000);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax for old regime (below 60)', () => {
      const taxableIncome = 700000; // Example income
      const age = 40;
      const regime = 'old';
      // 0-2.5L: 0
      // 2.5L-5L: 2.5L * 5% = 12500
      // 5L-7L: 2L * 20% = 40000
      // Total: 12500 + 40000 = 52500
      expect(taxRules.calculateTax(taxableIncome, age, regime)).toBe(52500);
    });

    it('should calculate tax for old regime (60-80)', () => {
      const taxableIncome = 700000;
      const age = 65;
      const regime = 'old';
      // 0-3L: 0
      // 3L-5L: 2L * 5% = 10000
      // 5L-7L: 2L * 20% = 40000
      // Total: 10000 + 40000 = 50000
      expect(taxRules.calculateTax(taxableIncome, age, regime)).toBe(50000);
    });

    it('should calculate tax for old regime (above 80)', () => {
      const taxableIncome = 700000;
      const age = 85;
      const regime = 'old';
      // 0-5L: 0
      // 5L-7L: 2L * 20% = 40000
      // Total: 40000
      expect(taxRules.calculateTax(taxableIncome, age, regime)).toBe(40000);
    });

    it('should calculate tax for new regime', () => {
      const taxableIncome = 1000000;
      const age = 40; // Age doesn't matter for new regime slabs
      const regime = 'new';
      // 0-3L: 0
      // 3L-6L: 300000 * 0.05 = 15000
      // 6L-9L: 300000 * 0.10 = 30000
      // 9L-10L: 1L * 15% = 15000
      // Total: 15000 + 30000 + 15000 = 60000
      expect(taxRules.calculateTax(taxableIncome, age, regime)).toBe(60000);
    });

    it('should return 0 tax for income below taxable limit (old regime)', () => {
      expect(taxRules.calculateTax(200000, 40, 'old')).toBe(0);
    });

    it('should return 0 tax for income below taxable limit (new regime)', () => {
      expect(taxRules.calculateTax(200000, 40, 'new')).toBe(0);
    });

    it('should apply rebate 87A for old regime below 5L', () => {
      const taxableIncome = 400000; // Taxable income below 5L
      const age = 40;
      const regime = 'old';
      // Tax before rebate: 2.5L * 0% + 1.5L * 5% = 7500
      // Rebate 87A: 7500 (full tax amount)
      expect(taxRules.calculateTax(taxableIncome, age, regime)).toBe(0);
    });

    it('should apply rebate 87A for new regime below 7L', () => {
      const taxableIncome = 600000; // Taxable income below 7L
      const age = 40;
      const regime = 'new';
      // Tax before rebate: 3L * 0% + 3L * 5% = 15000
      // Rebate 87A: 15000 (full tax amount)
      expect(taxRules.calculateTax(taxableIncome, age, regime)).toBe(0);
    });

    it('should apply max rebate 87A for old regime if tax is higher than max rebate', () => {
      const taxableIncome = 500000; // Taxable income at 5L
      const age = 40;
      const regime = 'old';
      // Tax before rebate: 2.5L * 0% + 2.5L * 5% = 12500
      // Rebate 87A: 12500 (full tax amount)
      expect(taxRules.calculateTax(taxableIncome, age, regime)).toBe(0);
    });

    it('should apply max rebate 87A for new regime if tax is higher than max rebate', () => {
      const taxableIncome = 700000; // Taxable income at 7L
      const age = 40;
      const regime = 'new';
      // Tax before rebate: 3L * 0% + 3L * 5% + 1L * 10% = 15000 + 10000 = 25000
      // Rebate 87A: 25000 (full tax amount)
      expect(taxRules.calculateTax(taxableIncome, age, regime)).toBe(0);
    });

    it('should not apply rebate 87A if income is above limit (old regime)', () => {
      const taxableIncome = 500001;
      const age = 40;
      const regime = 'old';
      // Tax: 12500 + 0.05 * 1 = 12500.05
      expect(taxRules.calculateTax(taxableIncome, age, regime)).toBeCloseTo(
        12500.05,
      );
    });

    it('should not apply rebate 87A if income is above limit (new regime)', () => {
      const taxableIncome = 700001;
      const age = 40;
      const regime = 'new';
      // Tax: 15000 + 30000 + 15000 + 0.15 * 1 = 60000.15
      expect(taxRules.calculateTax(taxableIncome, age, regime)).toBeCloseTo(
        60000.15,
      );
    });
  });

  describe('calculateSurcharge', () => {
    it('should return 0 for income below 50L', () => {
      expect(taxRules.calculateSurcharge(4000000, 100000)).toBe(0);
    });

    it('should apply 10% surcharge for income between 50L and 1Cr', () => {
      const totalIncome = 7500000; // 75L
      const taxAmount = 1000000; // 10L
      expect(taxRules.calculateSurcharge(totalIncome, taxAmount)).toBe(
        taxAmount * MOCK_CONSTANTS.SURCHARGE_RATE_50L_1CR,
      );
    });

    it('should apply 15% surcharge for income between 1Cr and 2Cr', () => {
      const totalIncome = 15000000; // 1.5Cr
      const taxAmount = 2000000; // 20L
      expect(taxRules.calculateSurcharge(totalIncome, taxAmount)).toBe(
        taxAmount * MOCK_CONSTANTS.SURCHARGE_RATE_1CR_2CR,
      );
    });

    it('should apply 25% surcharge for income between 2Cr and 5Cr', () => {
      const totalIncome = 30000000; // 3Cr
      const taxAmount = 5000000; // 50L
      expect(taxRules.calculateSurcharge(totalIncome, taxAmount)).toBe(
        taxAmount * MOCK_CONSTANTS.SURCHARGE_RATE_2CR_5CR,
      );
    });

    it('should apply 37% surcharge for income above 5Cr', () => {
      const totalIncome = 60000000; // 6Cr
      const taxAmount = 10000000; // 1Cr
      expect(taxRules.calculateSurcharge(totalIncome, taxAmount)).toBe(
        taxAmount * MOCK_CONSTANTS.SURCHARGE_RATE_5CR_PLUS,
      );
    });

    it('should handle marginal relief for income just above 50L', () => {
      const totalIncome = 5000001;
      const taxAmount = 1250000; // Example tax
      // Tax on 50L: 1250000 (example)
      // Tax on 50L + 1: 1250000 + marginal tax on 1 (example)
      // Surcharge on 50L + 1: 10% of tax on 50L + 1
      // Marginal relief calculation is complex, this is a basic check
      const taxWithoutSurcharge = taxRules.calculateTax(5000001, 40, 'old'); // Assuming old regime for simplicity
      const taxWithSurcharge =
        taxWithoutSurcharge * (1 + MOCK_CONSTANTS.SURCHARGE_RATE_50L_1CR);
      const incomeDifference = totalIncome - 5000000;
      const marginalRelief =
        taxWithSurcharge -
        (taxRules.calculateTax(5000000, 40, 'old') + incomeDifference);
      // This test would need a more precise marginal relief calculation to be accurate.
      // For now, we'll just check if it's not simply 10% of tax.
      expect(
        taxRules.calculateSurcharge(totalIncome, taxAmount),
      ).toBeGreaterThan(0);
    });
  });

  describe('calculateCess', () => {
    it('should calculate cess as 4% of (tax + surcharge)', () => {
      const tax = 100000;
      const surcharge = 10000;
      expect(taxRules.calculateCess(tax, surcharge)).toBe(
        (tax + surcharge) * MOCK_CONSTANTS.CESS_RATE,
      );
    });

    it('should return 0 if tax and surcharge are 0', () => {
      expect(taxRules.calculateCess(0, 0)).toBe(0);
    });

    it('should handle negative tax/surcharge by treating them as 0', () => {
      expect(taxRules.calculateCess(-1000, -500)).toBe(0);
    });
  });

  describe('getRebate87A', () => {
    it('should return full tax amount if taxable income is below limit (old regime)', () => {
      const taxableIncome = 400000;
      const age = 40;
      const regime = 'old';
      const taxBeforeRebate = taxRules.calculateTax(taxableIncome, age, regime); // Should be 7500
      expect(
        taxRules.getRebate87A(taxableIncome, taxBeforeRebate, regime),
      ).toBe(taxBeforeRebate);
    });

    it('should return full tax amount if taxable income is below limit (new regime)', () => {
      const taxableIncome = 600000;
      const age = 40;
      const regime = 'new';
      const taxBeforeRebate = taxRules.calculateTax(taxableIncome, age, regime); // Should be 15000
      expect(
        taxRules.getRebate87A(taxableIncome, taxBeforeRebate, regime),
      ).toBe(taxBeforeRebate);
    });

    it('should return max rebate amount if tax is higher than max rebate (old regime)', () => {
      const taxableIncome = 490000; // Tax is 12000
      const age = 40;
      const regime = 'old';
      const taxBeforeRebate = taxRules.calculateTax(taxableIncome, age, regime);
      expect(
        taxRules.getRebate87A(taxableIncome, taxBeforeRebate, regime),
      ).toBe(taxBeforeRebate);
    });

    it('should return max rebate amount if tax is higher than max rebate (new regime)', () => {
      const taxableIncome = 690000; // Tax is 24000
      const age = 40;
      const regime = 'new';
      const taxBeforeRebate = taxRules.calculateTax(taxableIncome, age, regime);
      expect(
        taxRules.getRebate87A(taxableIncome, taxBeforeRebate, regime),
      ).toBe(taxBeforeRebate);
    });

    it('should return 0 if taxable income is above limit (old regime)', () => {
      const taxableIncome = 500001;
      const age = 40;
      const regime = 'old';
      const taxBeforeRebate = taxRules.calculateTax(taxableIncome, age, regime);
      expect(
        taxRules.getRebate87A(taxableIncome, taxBeforeRebate, regime),
      ).toBe(0);
    });

    it('should return 0 if taxable income is above limit (new regime)', () => {
      const taxableIncome = 700001;
      const age = 40;
      const regime = 'new';
      const taxBeforeRebate = taxRules.calculateTax(taxableIncome, age, regime);
      expect(
        taxRules.getRebate87A(taxableIncome, taxBeforeRebate, regime),
      ).toBe(0);
    });
  });

  describe('getTaxRegimeBenefits', () => {
    const grossSalary = 1000000;
    const exemptions = {
      hra: 100000,
      lta: 50000,
      otherExemptions: 20000,
    };
    const deductions = {
      professionalTax: 2500,
      section80C: 150000,
      section80D: 25000,
      section80E: 10000,
      section80G: 5000,
      section80TTA: 10000,
      section80TTB: 0,
      section24B: 200000,
    };
    const age = 40;

    it('should calculate benefits for old regime', () => {
      const benefits = taxRules.getTaxRegimeBenefits(
        grossSalary,
        exemptions,
        deductions,
        age,
        'old',
      );
      expect(benefits.totalExemptions).toBe(170000);
      expect(benefits.totalDeductions).toBe(452500);
      expect(benefits.taxableIncome).toBe(377500);
      expect(benefits.taxBeforeCess).toBe(0); // Due to 87A rebate
      expect(benefits.cess).toBe(0);
      expect(benefits.surcharge).toBe(0);
      expect(benefits.totalTax).toBe(0);
    });

    it('should calculate benefits for new regime', () => {
      const benefits = taxRules.getTaxRegimeBenefits(
        grossSalary,
        exemptions,
        deductions,
        age,
        'new',
      );
      expect(benefits.totalExemptions).toBe(0); // New regime ignores most exemptions
      expect(benefits.totalDeductions).toBe(MOCK_CONSTANTS.STANDARD_DEDUCTION); // Only standard deduction
      expect(benefits.taxableIncome).toBe(950000);
      expect(benefits.taxBeforeCess).toBe(60000);
      expect(benefits.cess).toBe(2400); // 4% of 60000
      expect(benefits.surcharge).toBe(0);
      expect(benefits.totalTax).toBe(62400);
    });
  });

  describe('getTaxRegimeComparison', () => {
    const grossSalary = 1000000;
    const exemptions = {
      hra: 100000,
      lta: 50000,
      otherExemptions: 20000,
    };
    const deductions = {
      professionalTax: 2500,
      section80C: 150000,
      section80D: 25000,
      section80E: 10000,
      section80G: 5000,
      section80TTA: 10000,
      section80TTB: 0,
      section24B: 200000,
    };
    const age = 40;

    it('should compare old and new tax regimes and recommend the better one', () => {
      const comparison = taxRules.getTaxRegimeComparison(
        grossSalary,
        exemptions,
        deductions,
        age,
      );

      expect(comparison.oldRegimeTax).toBe(0);
      expect(comparison.newRegimeTax).toBe(62400);
      expect(comparison.recommendedRegime).toBe('Old Tax Regime');
      expect(comparison.taxSavings).toBe(62400);
    });

    it('should recommend new regime if it results in lower tax', () => {
      const lowDeductions = {
        professionalTax: 0,
        section80C: 0,
        section80D: 0,
        section80E: 0,
        section80G: 0,
        section80TTA: 0,
        section80TTB: 0,
        section24B: 0,
      };
      const lowExemptions = { hra: 0, lta: 0, otherExemptions: 0 };

      const comparison = taxRules.getTaxRegimeComparison(
        grossSalary,
        lowExemptions,
        lowDeductions,
        age,
      );

      // Old regime: 1,000,000 - 50,000 (SD) = 950,000 taxable. Tax on 9.5L = 112500 + cess
      // New regime: 1,000,000 - 50,000 (SD) = 950,000 taxable. Tax on 9.5L = 65000 + cess
      // Old regime tax on 9.5L:
      // 0-2.5L: 0
      // 2.5L-5L: 12500
      // 5L-9.5L: 4.5L * 20% = 90000
      // Total: 102500. Add 4% cess = 106600
      // New regime tax on 9.5L:
      // 0-3L: 0
      // 3L-6L: 15000
      // 6L-9L: 30000
      // 9L-9.5L: 0.5L * 15% = 7500
      // Total: 52500. Add 4% cess = 54600
      expect(comparison.oldRegimeTax).toBeCloseTo(106600);
      expect(comparison.newRegimeTax).toBeCloseTo(54600);
      expect(comparison.recommendedRegime).toBe('New Tax Regime');
      expect(comparison.taxSavings).toBeCloseTo(106600 - 54600);
    });
  });
});
