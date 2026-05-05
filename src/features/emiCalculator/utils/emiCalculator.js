import { createSelector } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

// This selector will take the raw loanDetails, expenses, and prepayments
// and compute all derived values.
export const selectCalculatedValues = createSelector(
  [
    (state) => state.emi.loanDetails,
    (state) => state.emi.expenses,
    (state) => state.emi.prepayments,
  ],
  (loanDetails, expenses, prepayments) => {
    const marginInRs =
      loanDetails.marginUnit === '%'
        ? (loanDetails.homeValue * loanDetails.marginAmount) / 100
        : loanDetails.marginAmount;
    const loanAmount =
      loanDetails.homeValue + loanDetails.loanInsurance - marginInRs;
    const feesInRs =
      loanDetails.feesUnit === '%'
        ? (loanAmount * loanDetails.loanFees) / 100
        : loanDetails.loanFees;
    const tenureInMonths =
      loanDetails.tenureUnit === 'years'
        ? loanDetails.loanTenure * 12
        : loanDetails.loanTenure;

    const oneTimeInRs =
      expenses.oneTimeUnit === '%'
        ? (loanDetails.homeValue * expenses.oneTimeExpenses) / 100
        : expenses.oneTimeExpenses;
    const taxesYearlyInRs =
      expenses.taxesUnit === '%'
        ? (loanDetails.homeValue * expenses.propertyTaxes) / 100
        : expenses.propertyTaxes;
    const homeInsYearlyInRs =
      expenses.homeInsUnit === '%'
        ? (loanDetails.homeValue * expenses.homeInsurance) / 100
        : expenses.homeInsurance;

    const monthlyInterestRate = loanDetails.interestRate / 12 / 100;

    let emi = 0;
    if (monthlyInterestRate > 0 && tenureInMonths > 0 && loanAmount > 0) {
      emi =
        (loanAmount *
          monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, tenureInMonths)) /
        (Math.pow(1 + monthlyInterestRate, tenureInMonths) - 1);
    } else if (tenureInMonths > 0) {
      emi = loanAmount / tenureInMonths;
    }

    let yearlyIncreaseAmountRs = 0;
    if (loanDetails.yearlyPaymentIncreaseUnit === '%') {
      yearlyIncreaseAmountRs =
        (emi * (loanDetails.yearlyPaymentIncreaseAmount || 0)) / 100;
    } else {
      yearlyIncreaseAmountRs = loanDetails.yearlyPaymentIncreaseAmount || 0;
    }

    let balance = loanAmount;
    let totalInterest = 0;
    let totalPrincipal = 0;
    let totalPrepayments = 0;
    let totalPayments = 0;
    const schedule = [];

    const startDate = dayjs(loanDetails.startDate);

    const getMonthDate = (start, addMonths) => {
      return start.add(addMonths, 'month');
    };

    for (let i = 1; i <= tenureInMonths && balance > 0; i++) {
      const currentDate = getMonthDate(startDate, i - 1);
      let interestForMonth = balance * monthlyInterestRate;
      let prepayForMonth = 0;

      const monthlyStart = dayjs(prepayments.monthly.startDate);
      if (
        prepayments.monthly.amount > 0 &&
        !currentDate.isBefore(monthlyStart, 'month')
      ) {
        prepayForMonth += prepayments.monthly.amount;
      }

      const yearlyStart = dayjs(prepayments.yearly.startDate);
      if (
        prepayments.yearly.amount > 0 &&
        !currentDate.isBefore(yearlyStart, 'month')
      ) {
        if (currentDate.month() === yearlyStart.month()) {
          prepayForMonth += prepayments.yearly.amount;
        }
      }

      const quarterlyStart = dayjs(prepayments.quarterly.startDate);
      if (
        prepayments.quarterly.amount > 0 &&
        !currentDate.isBefore(quarterlyStart, 'month')
      ) {
        const monthsDiff = currentDate.diff(quarterlyStart, 'month');
        if (monthsDiff >= 0 && monthsDiff % 3 === 0) {
          prepayForMonth += prepayments.quarterly.amount;
        }
      }

      const oneTimeDate = dayjs(prepayments.oneTime.date);
      if (
        prepayments.oneTime.amount > 0 &&
        currentDate.isSame(oneTimeDate, 'month')
      ) {
        prepayForMonth += prepayments.oneTime.amount;
      }

      let currentTotalPayment = emi;
      if (yearlyIncreaseAmountRs > 0) {
        const yearsPassed = Math.floor(
          currentDate.diff(startDate, 'month') / 12,
        );
        if (yearsPassed > 0) {
          if (loanDetails.yearlyPaymentIncreaseUnit === '%') {
            currentTotalPayment =
              emi *
              Math.pow(
                1 + (loanDetails.yearlyPaymentIncreaseAmount || 0) / 100,
                yearsPassed,
              );
          } else {
            currentTotalPayment = emi + yearsPassed * yearlyIncreaseAmountRs;
          }
        }
      }

      let principalForMonth = currentTotalPayment - interestForMonth; // Adjusted to use currentTotalPayment

      // Ensure principal is not negative
      if (principalForMonth < 0) {
        principalForMonth = 0;
      }

      // If balance is less than principal + prepay, adjust
      if (balance < principalForMonth + prepayForMonth) {
        if (balance < principalForMonth) {
          principalForMonth = balance;
          prepayForMonth = 0;
        } else {
          prepayForMonth = balance - principalForMonth;
        }
      }

      balance -= principalForMonth + prepayForMonth;
      if (balance < 0) balance = 0;

      totalInterest += interestForMonth;
      totalPrincipal += principalForMonth;
      totalPrepayments += prepayForMonth;

      const monthlyPayment =
        principalForMonth + interestForMonth + prepayForMonth;
      totalPayments += monthlyPayment;

      const paidPercent =
        loanAmount > 0 ? ((loanAmount - balance) / loanAmount) * 100 : 0;

      schedule.push({
        month: i,
        date: currentDate.format('MMM YYYY'),
        principal: Math.round(principalForMonth),
        interest: Math.round(interestForMonth),
        prepayment: Math.round(prepayForMonth),
        balance: Math.round(balance),
        totalPayment: Math.round(monthlyPayment),
        taxes: Math.round(taxesYearlyInRs / 12),
        homeInsurance: Math.round(homeInsYearlyInRs / 12),
        maintenance: Math.round(expenses.maintenance),
        paidPercent: paidPercent.toFixed(2),
      });
    }

    // Recalculate totalPayments based on the schedule
    const totalScheduledPayments = schedule.reduce(
      (sum, month) => sum + month.totalPayment,
      0,
    );
    const totalOtherExpenses =
      marginInRs +
      feesInRs +
      oneTimeInRs +
      (taxesYearlyInRs + homeInsYearlyInRs) * (schedule.length / 12) +
      expenses.maintenance * schedule.length;

    totalPayments = totalScheduledPayments + totalOtherExpenses;

    return {
      marginInRs,
      loanAmount,
      feesInRs,
      tenureInMonths,
      oneTimeInRs,
      taxesYearlyInRs,
      homeInsYearlyInRs,
      emi,
      totalInterest,
      totalPrincipal,
      totalPrepayments,
      schedule,
      totalPayments,
      yearlyIncreaseAmountRs,
    };
  },
);

// Helper function to convert amount based on unit
export const convertAmount = (amount, oldUnit, newUnit, baseValue, emi = 0) => {
  if (oldUnit === newUnit) return amount;

  if (newUnit === '%') {
    return baseValue ? (amount / baseValue) * 100 : 0;
  } else {
    // Converting from % to Rs
    return (amount * baseValue) / 100;
  }
};

// Helper function for tenure conversion
export const convertTenure = (tenure, oldUnit, newUnit) => {
  if (oldUnit === newUnit) return tenure;

  if (newUnit === 'months' && oldUnit === 'years') {
    return Math.round(tenure * 12);
  } else if (newUnit === 'years' && oldUnit === 'months') {
    return parseFloat((tenure / 12).toFixed(2));
  }
  return tenure;
};

// Helper function for yearly payment increase conversion
export const convertYearlyPaymentIncrease = (
  amount,
  oldUnit,
  newUnit,
  baseEmi,
) => {
  if (oldUnit === newUnit) return amount;

  if (newUnit === '%') {
    return baseEmi ? (amount / baseEmi) * 100 : 0;
  } else {
    // Converting from % to Rs
    return (amount * baseEmi) / 100;
  }
};
