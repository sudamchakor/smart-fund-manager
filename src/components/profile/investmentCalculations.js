export const calculateSip = (monthlyInvestment, annualRate, timePeriod) => {
  const monthlyRate = annualRate / 12 / 100;
  const numberOfMonths = timePeriod * 12;
  let futureValue = 0;
  if (monthlyRate === 0) {
    futureValue = monthlyInvestment * numberOfMonths;
  } else {
    // Formula for Future Value of an ordinary annuity
    futureValue =
      monthlyInvestment *
      ((Math.pow(1 + monthlyRate, numberOfMonths) - 1) / monthlyRate);
  }
  const investedAmount = monthlyInvestment * numberOfMonths;
  const estimatedReturns = futureValue - investedAmount;
  return { investedAmount, estimatedReturns, totalValue: futureValue };
};

export const calculateLumpsum = (principal, annualRate, timePeriod) => {
  const futureValue = principal * Math.pow(1 + annualRate / 100, timePeriod);
  const investedAmount = principal;
  const estimatedReturns = futureValue - investedAmount;
  return { investedAmount, estimatedReturns, totalValue: futureValue };
};

export const calculateStepUpSip = (
  monthlyInvestment,
  annualRate,
  timePeriod,
  stepUpPercentage,
) => {
  let totalInvested = 0;
  let totalValue = 0;
  let currentMonthlyInvestment = monthlyInvestment;
  const monthlyRate = annualRate / 12 / 100;

  for (let year = 1; year <= timePeriod; year++) {
    for (let month = 1; month <= 12; month++) {
      // Calculation for ordinary annuity (payment at the end of the period)
      totalValue = totalValue * (1 + monthlyRate) + currentMonthlyInvestment;
      totalInvested += currentMonthlyInvestment;
    }
    if (year < timePeriod) {
      currentMonthlyInvestment *= 1 + stepUpPercentage / 100;
    }
  }
  const estimatedReturns = totalValue - totalInvested;
  return { investedAmount: totalInvested, estimatedReturns, totalValue };
};

export const calculateSwp = (
  principal,
  annualRate,
  timePeriod,
  withdrawalPerMonth,
) => {
  let remainingPrincipal = principal;
  let totalWithdrawn = 0;
  const monthlyRate = annualRate / 12 / 100;
  const numberOfMonths = timePeriod * 12;

  for (let i = 0; i < numberOfMonths; i++) {
    remainingPrincipal =
      remainingPrincipal * (1 + monthlyRate) - withdrawalPerMonth;
    totalWithdrawn += withdrawalPerMonth;
    if (remainingPrincipal < 0) {
      remainingPrincipal = 0; // Cannot withdraw more than available
      break;
    }
  }
  return {
    investedAmount: principal, // Initial principal is the invested amount
    totalWithdrawn: totalWithdrawn,
    totalValue: remainingPrincipal, // Remaining balance
    estimatedReturns: totalWithdrawn + remainingPrincipal - principal,
  };
};

export const calculateFd = (
  principal,
  annualRate,
  timePeriod,
  compoundingFrequency,
) => {
  let n; // Number of times interest is compounded per year
  switch (compoundingFrequency) {
    case "annually":
      n = 1;
      break;
    case "semi-annually":
      n = 2;
      break;
    case "quarterly":
      n = 4;
      break;
    case "monthly":
      n = 12;
      break;
    default:
      n = 1; // Default to annually
  }

  const futureValue =
    principal * Math.pow(1 + annualRate / 100 / n, n * timePeriod);
  const investedAmount = principal;
  const estimatedReturns = futureValue - investedAmount;
  return { investedAmount, estimatedReturns, totalValue: futureValue };
};
