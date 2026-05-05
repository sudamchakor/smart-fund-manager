// src/utils/taxRules.js

export const incomeTypes = [
  { value: 'Salary', label: 'Salary (from Employer)' },
  { value: 'Rental Income', label: 'Income from House Property' },
  { value: 'Interest Income', label: 'Interest (Savings, FDs)' },
  { value: 'Capital Gains', label: 'Capital Gains (Stocks, MF)' },
  { value: 'Business Profession', label: 'Profits from Business/Profession' },
  { value: 'Dividends', label: 'Dividend Income' },
  { value: 'Others', label: 'Other Sources (Freelance, etc.)' },
];

export const expenseCategories = [
  { value: 'basic', label: 'Basic Need (Housing, Food)' },
  { value: 'discretionary', label: 'Discretionary (Lifestyle, Entertainment)' },
  { value: 'transport', label: 'Transportation' },
  { value: 'health', label: 'Healthcare & Wellness' },
  { value: 'education', label: 'Education & Self-Improvement' },
  { value: 'loan', label: 'Loan Repayments (EMI)' },
];

// This will be used to populate dropdowns for linking expenses to tax deductions
export const taxExpenseCategories = [
  {
    value: 'hra',
    label: 'House Rent (for HRA)',
    description:
      'Rent paid for accommodation. Used to calculate HRA exemption.',
    applicableRegimes: ['old'],
  },
  {
    value: '80c_lic',
    label: 'Life Insurance Premium (80C)',
    description: 'Premiums paid for life insurance policies.',
    applicableRegimes: ['old'],
    limit: 150000, // Part of the combined 80C limit
    section: '80C',
  },
  {
    value: '80c_ppf',
    label: 'PPF Investment (80C)',
    description: 'Contributions to Public Provident Fund.',
    applicableRegimes: ['old'],
    limit: 150000,
    section: '80C',
  },
  {
    value: '80c_elss',
    label: 'ELSS Investment (80C)',
    description: 'Investment in Equity Linked Savings Schemes.',
    applicableRegimes: ['old'],
    limit: 150000,
    section: '80C',
  },
  {
    value: '80c_principal',
    label: 'Home Loan Principal (80C)',
    description: 'Principal repayment component of a home loan EMI.',
    applicableRegimes: ['old'],
    limit: 150000,
    section: '80C',
  },
  {
    value: '80d',
    label: 'Health Insurance (80D)',
    description:
      'Premiums for health insurance. Limit is ₹25,000 for self/family, higher for senior citizens.',
    applicableRegimes: ['old'],
    limit: 25000, // Base limit, can be higher
  },
  {
    value: '24b',
    label: 'Home Loan Interest (Sec 24b)',
    description:
      'Interest component of a home loan EMI for a self-occupied property.',
    applicableRegimes: ['old'],
    limit: 200000,
  },
  {
    value: 'nps_80ccd1b',
    label: 'NPS Self-Contribution (80CCD1B)',
    description:
      'Additional deduction for National Pension System (NPS) contribution.',
    applicableRegimes: ['old', 'new'],
    limit: 50000,
  },
  {
    value: '80e',
    label: 'Education Loan Interest (80E)',
    description:
      'Interest component of an education loan EMI. No upper limit on amount.',
    applicableRegimes: ['old'],
  },
];

// A more detailed structure for rules used by the tax engine
export const taxRules = {
  standardDeduction: {
    old: { amount: 50000, label: 'Standard Deduction (Old Regime)' },
    new: { amount: 75000, label: 'Standard Deduction (New Regime)' },
  },
  deductions: {
    sec80C: {
      limit: 150000,
      label: 'Section 80C',
      description:
        'Combined limit for investments like EPF, PPF, LIC, ELSS, Home Loan Principal, etc.',
      applicableRegimes: ['old'],
    },
    sec80D: {
      limit: 25000, // Base limit
      limitSenior: 50000,
      label: 'Section 80D',
      description: 'Deduction for health insurance premiums.',
      applicableRegimes: ['old'],
    },
    sec24b: {
      limit: 200000,
      label: 'Section 24(b)',
      description:
        'Deduction for interest on home loan for self-occupied property.',
      applicableRegimes: ['old'],
    },
    hra: {
      label: 'HRA Exemption',
      description:
        'Calculated as minimum of: Actual HRA, Rent paid - 10% of Basic, or 40%/50% of Basic.',
      applicableRegimes: ['old'],
    },
    nps80CCD1B: {
      limit: 50000,
      label: 'NPS (80CCD1B)',
      description: 'Additional deduction for self-contribution to NPS.',
      applicableRegimes: ['old', 'new'],
    },
    nps80CCD2: {
      limit: '10% of Salary',
      label: 'NPS (80CCD2)',
      description: "Deduction for employer's contribution to NPS.",
      applicableRegimes: ['old', 'new'],
    },
    sec80E: {
      label: 'Section 80E',
      description:
        'Deduction for interest on education loan, no monetary limit for 8 years.',
      applicableRegimes: ['old'],
    },
    sec80TTA: {
      limit: 10000,
      label: 'Section 80TTA',
      description: 'Deduction on interest from savings accounts.',
      applicableRegimes: ['old'],
    },
  },
};

export const investmentCategories = [
  { value: 'Equity', label: 'Equity (Stocks, Mutual Funds)' },
  { value: 'Debt', label: 'Debt (Bonds, FDs, PPF)' },
  { value: 'Gold', label: 'Gold (Digital, Physical, SGBs)' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'NPS', label: 'National Pension System (NPS)' },
  { value: 'Cash', label: 'Cash & Equivalents' },
];
