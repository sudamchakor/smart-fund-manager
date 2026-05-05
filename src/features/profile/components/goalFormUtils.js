import {
  calculateSip,
  calculateLumpsum,
  calculateStepUpSip,
  calculateSwp,
  calculateFd,
} from './investmentCalculations';

// Helper function to perform calculations for a single plan
export const calculatePlanResults = (plan) => {
  let calculatedResult = {
    investedAmount: 0,
    estimatedReturns: 0,
    totalValue: 0,
    totalWithdrawn: 0,
    timePeriod: plan.timePeriod || 0,
    details: plan.details || '',
  };

  // Create a mutable copy of the plan to update its details string
  const updatedPlanDetails = { ...plan };

  // Ensure numeric values for calculations
  const monthlyContribution =
    Number(updatedPlanDetails.monthlyContribution) || 0;
  const totalInvestment = Number(updatedPlanDetails.totalInvestment) || 0;
  const expectedReturnRate = Number(updatedPlanDetails.expectedReturnRate) || 0;
  const timePeriod = Number(updatedPlanDetails.timePeriod) || 0;
  const stepUpPercentage = Number(updatedPlanDetails.stepUpPercentage) || 0;
  const withdrawalPerMonth = Number(updatedPlanDetails.withdrawalPerMonth) || 0;
  const principalAmount = Number(updatedPlanDetails.principalAmount) || 0;
  const interestRate = Number(updatedPlanDetails.interestRate) || 0;
  const compoundingFrequency =
    updatedPlanDetails.compoundingFrequency || 'annually';

  switch (updatedPlanDetails.type) {
    case 'sip':
      calculatedResult = calculateSip(
        monthlyContribution,
        expectedReturnRate,
        timePeriod,
      );
      updatedPlanDetails.details = `SIP: ₹${monthlyContribution.toLocaleString()} for ${timePeriod} years @ ${expectedReturnRate}%`;
      updatedPlanDetails.frequency = 'monthly';
      break;
    case 'lumpsum':
      calculatedResult = calculateLumpsum(
        totalInvestment,
        expectedReturnRate,
        timePeriod,
      );
      updatedPlanDetails.details = `Lumpsum: ₹${totalInvestment.toLocaleString()} for ${timePeriod} years @ ${expectedReturnRate}%`;
      updatedPlanDetails.frequency = 'one-time';
      break;
    case 'stepUpSip':
      calculatedResult = calculateStepUpSip(
        monthlyContribution,
        expectedReturnRate,
        timePeriod,
        stepUpPercentage,
      );
      updatedPlanDetails.details = `Step-Up SIP: ₹${monthlyContribution.toLocaleString()} with ${stepUpPercentage}% step-up for ${timePeriod} years @ ${expectedReturnRate}%`;
      updatedPlanDetails.frequency = 'monthly';
      break;
    case 'swp':
      calculatedResult = calculateSwp(
        totalInvestment,
        withdrawalPerMonth,
        expectedReturnRate,
        timePeriod,
      );

      console.log(
        'Sudam 12',
        totalInvestment,
        withdrawalPerMonth,
        expectedReturnRate,
        timePeriod,
        calculatedResult,
      );
      updatedPlanDetails.details = `SWP: Withdraw ₹${withdrawalPerMonth.toLocaleString()} from ₹${totalInvestment.toLocaleString()} for ${timePeriod} years @ ${expectedReturnRate}%`;
      updatedPlanDetails.frequency = 'monthly'; // This is a withdrawal, not a contribution.
      break;
    case 'fd':
      calculatedResult = calculateFd(
        principalAmount,
        interestRate,
        timePeriod,
        compoundingFrequency,
      );
      updatedPlanDetails.details = `FD: ₹${principalAmount.toLocaleString()} for ${timePeriod} years @ ${interestRate}% (${compoundingFrequency})`;
      updatedPlanDetails.frequency = 'one-time';
      break;
    default:
      console.error(
        `Unknown plan type encountered: ${updatedPlanDetails.type}`,
      );
      // Optionally, you might want to throw an error here depending on desired strictness:
      // throw new Error(`Unknown plan type: ${updatedPlanDetails.type}`);
      break;
  }

  return {
    ...updatedPlanDetails,
    investedAmount: calculatedResult.investedAmount,
    estimatedReturns: calculatedResult.estimatedReturns,
    totalValue: calculatedResult.totalValue,
    totalWithdrawn: calculatedResult.totalWithdrawn,
  };
};

// Helper function to get default state for a new plan, potentially with inverse calculation
export const getDefaultPlanState = (
  type,
  targetAmountForPlan, // This is the target future value for this specific plan
  timePeriod,
  planStartYear, // Renamed from currentYear to be more descriptive
  goal, // The parent goal object, useful for default rates
) => {
  const id = Date.now();
  const expectedReturnRate = goal?.expectedReturnRate || 12; // Default for equity-linked
  const interestRate = goal?.interestRate || 7; // Default for FD
  const compoundingFrequency = goal?.compoundingFrequency || 'annually';

  let newPlan = {
    id,
    type,
    investedAmount: 0,
    estimatedReturns: 0,
    totalValue: 0,
    timePeriod: timePeriod > 0 ? timePeriod : 10, // Ensure positive time period
    startYear: planStartYear, // Store the start year
    details: '',
    isSafe: false,
    // Default values for all types
    monthlyContribution: 5000, // Default for SIP/Step-Up SIP
    totalInvestment: 100000, // Default for Lumpsum/SWP
    expectedReturnRate: expectedReturnRate,
    stepUpPercentage: 5,
    withdrawalPerMonth: 1000, // Default for SWP
    principalAmount: 100000, // Default for FD
    interestRate: interestRate,
    compoundingFrequency: compoundingFrequency,
  };

  // Perform inverse calculations to set initial investment amounts to meet targetAmountForPlan
  const nMonths = newPlan.timePeriod * 12;
  const monthlyRate = expectedReturnRate / 12 / 100;
  const annualRate = expectedReturnRate / 100;
  const fdAnnualRate = interestRate / 100;

  if (targetAmountForPlan > 0 && newPlan.timePeriod > 0) {
    switch (type) {
      case 'sip':
        if (monthlyRate > 0) {
          const factor =
            ((Math.pow(1 + monthlyRate, nMonths) - 1) / monthlyRate) *
            (1 + monthlyRate);
          newPlan.monthlyContribution = Math.round(
            targetAmountForPlan / factor,
          );
        }
        // Ensure a minimum monthly contribution for SIP
        newPlan.monthlyContribution = Math.max(
          500,
          newPlan.monthlyContribution,
        );
        break;
      case 'lumpsum':
        newPlan.totalInvestment = Math.round(
          targetAmountForPlan / Math.pow(1 + annualRate, newPlan.timePeriod),
        );
        break;
      case 'fd':
        newPlan.principalAmount = Math.round(
          targetAmountForPlan / Math.pow(1 + fdAnnualRate, newPlan.timePeriod),
        );
        break;
      case 'stepUpSip':
        // Approximate inverse calculation for Step-Up SIP
        // Use SIP inverse calculation as a starting point for monthly contribution
        if (monthlyRate > 0) {
          const factor =
            ((Math.pow(1 + monthlyRate, nMonths) - 1) / monthlyRate) *
            (1 + monthlyRate);
          newPlan.monthlyContribution = Math.round(
            targetAmountForPlan / factor,
          );
        }
        // Ensure a minimum contribution for step-up SIP
        newPlan.monthlyContribution = Math.max(
          500,
          newPlan.monthlyContribution,
        );
        break;
      // SWP inverse calculations are not directly implemented here as it's a withdrawal plan.
      default:
        console.warn(
          `No inverse calculation implemented for plan type: ${type}`,
        );
        break;
    }
  }

  // Ensure investment amounts are non-negative (already handled by Math.max(500, ...))
  // newPlan.monthlyContribution = Math.max(0, newPlan.monthlyContribution);
  newPlan.totalInvestment = Math.max(0, newPlan.totalInvestment);
  newPlan.principalAmount = Math.max(0, newPlan.principalAmount);

  return newPlan;
};
