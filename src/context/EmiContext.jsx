import React, { createContext, useState, useContext, useMemo } from "react";
import dayjs from "dayjs";

// Create the Context
const EmiContext = createContext();

// Create a custom hook for easier usage
export const useEmiContext = () => useContext(EmiContext);

// The Provider Component
export const EmiProvider = ({ children }) => {
  // State for Home Loan Details
  const [loanDetails, setLoanDetails] = useState({
    homeValue: 5000000,
    marginAmount: 1000000,
    marginUnit: "Rs", // 'Rs' or '%'
    loanInsurance: 0,
    interestRate: 8.5,
    loanTenure: 20,
    tenureUnit: "years", // 'years' or 'months'
    loanFees: 10000,
    feesUnit: "Rs", // 'Rs' or '%'
    startDate: dayjs(),
  });

  // State for Partial Prepayments
  const [prepayments, setPrepayments] = useState({
    monthly: { amount: 0, startDate: dayjs() },
    yearly: { amount: 0, startDate: dayjs() },
    quarterly: { amount: 0, startDate: dayjs() },
    oneTime: { amount: 0, date: dayjs() },
  });

  // State for Homeowner Expenses
  const [expenses, setExpenses] = useState({
    oneTimeExpenses: 0,
    oneTimeUnit: "Rs", // 'Rs' or '%'
    propertyTaxes: 0,
    taxesUnit: "Rs", // 'Rs' or '%'
    homeInsurance: 0,
    homeInsUnit: "Rs", // 'Rs' or '%'
    maintenance: 0, // monthly Rs
  });

  const [currency, setCurrency] = useState(
    () => localStorage.getItem("emi_currency") || "₹",
  );
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem("emi_theme") || "light",
  );

  // Persistent AutoSave state
  const [autoSave, setAutoSave] = useState(() => {
    const saved = localStorage.getItem("emi_autosave");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [saveTrigger, setSaveTrigger] = useState(0);

  const saveSettingsToLocal = (data) => {
    try {
      if (data.currency) localStorage.setItem("emi_currency", data.currency);
      if (data.themeMode) localStorage.setItem("emi_theme", data.themeMode);
      if (data.autoSave !== undefined) {
        localStorage.setItem("emi_autosave", JSON.stringify(data.autoSave));
      }
      setSaveTrigger((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    }
  };

  // Derived values & Calculations
  const calculatedValues = useMemo(() => {
    const marginInRs =
      loanDetails.marginUnit === "%"
        ? (loanDetails.homeValue * loanDetails.marginAmount) / 100
        : loanDetails.marginAmount;
    const loanAmount =
      loanDetails.homeValue + loanDetails.loanInsurance - marginInRs;
    const feesInRs =
      loanDetails.feesUnit === "%"
        ? (loanAmount * loanDetails.loanFees) / 100
        : loanDetails.loanFees;
    const tenureInMonths =
      loanDetails.tenureUnit === "years"
        ? loanDetails.loanTenure * 12
        : loanDetails.loanTenure;

    const oneTimeInRs =
      expenses.oneTimeUnit === "%"
        ? (loanDetails.homeValue * expenses.oneTimeExpenses) / 100
        : expenses.oneTimeExpenses;
    const taxesYearlyInRs =
      expenses.taxesUnit === "%"
        ? (loanDetails.homeValue * expenses.propertyTaxes) / 100
        : expenses.propertyTaxes;
    const homeInsYearlyInRs =
      expenses.homeInsUnit === "%"
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

    let balance = loanAmount;
    let totalInterest = 0;
    let totalPrincipal = 0;
    let totalPrepayments = 0;
    const schedule = [];

    const getMonthDate = (start, addMonths) => start.add(addMonths, "month");

    for (let i = 1; i <= tenureInMonths && balance > 0; i++) {
      const currentDate = getMonthDate(loanDetails.startDate, i - 1);
      let interestForMonth = balance * monthlyInterestRate;
      let prepayForMonth = 0;

      if (
        prepayments.monthly.amount > 0 &&
        !currentDate.isBefore(prepayments.monthly.startDate, "month")
      ) {
        prepayForMonth += prepayments.monthly.amount;
      }

      if (
        prepayments.yearly.amount > 0 &&
        !currentDate.isBefore(prepayments.yearly.startDate, "month")
      ) {
        if (currentDate.month() === prepayments.yearly.startDate.month()) {
          prepayForMonth += prepayments.yearly.amount;
        }
      }

      if (
        prepayments.quarterly.amount > 0 &&
        !currentDate.isBefore(prepayments.quarterly.startDate, "month")
      ) {
        const monthsDiff = currentDate.diff(
          prepayments.quarterly.startDate,
          "month",
        );
        if (monthsDiff >= 0 && monthsDiff % 3 === 0) {
          prepayForMonth += prepayments.quarterly.amount;
        }
      }

      if (
        prepayments.oneTime.amount > 0 &&
        currentDate.isSame(prepayments.oneTime.date, "month")
      ) {
        prepayForMonth += prepayments.oneTime.amount;
      }

      let principalForMonth = emi - interestForMonth;

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

      const totalPayment =
        principalForMonth + interestForMonth + prepayForMonth;
      const paidPercent =
        loanAmount > 0 ? ((loanAmount - balance) / loanAmount) * 100 : 0;

      schedule.push({
        month: i,
        date: currentDate.format("MMM YYYY"),
        principal: Math.round(principalForMonth),
        interest: Math.round(interestForMonth),
        prepayment: Math.round(prepayForMonth),
        balance: Math.round(balance),
        totalPayment: Math.round(totalPayment),
        taxes: Math.round(taxesYearlyInRs / 12),
        homeInsurance: Math.round(homeInsYearlyInRs / 12),
        maintenance: Math.round(expenses.maintenance),
        paidPercent: paidPercent.toFixed(2),
      });
    }

    const totalPayments =
      marginInRs +
      feesInRs +
      oneTimeInRs +
      totalPrincipal +
      totalPrepayments +
      totalInterest +
      taxesYearlyInRs * (schedule.length / 12) +
      homeInsYearlyInRs * (schedule.length / 12) +
      expenses.maintenance * schedule.length;

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
    };
  }, [loanDetails, expenses, prepayments]);

  const updateLoanDetails = (key, value) => {
    setLoanDetails((prev) => ({ ...prev, [key]: value }));
  };

  const updateExpenses = (key, value) => {
    setExpenses((prev) => ({ ...prev, [key]: value }));
  };

  const updatePrepayments = (type, key, value) => {
    setPrepayments((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value,
      },
    }));
  };

  const changeLoanUnit = (unitField, amountField, newUnit) => {
    const oldUnit = loanDetails[unitField];
    if (oldUnit === newUnit) return;

    if (unitField === "tenureUnit") {
      const currentTenure = loanDetails.loanTenure;
      let newTenure = currentTenure;

      if (newUnit === "months" && oldUnit === "years") {
        newTenure = Math.round(currentTenure * 12);
      } else if (newUnit === "years" && oldUnit === "months") {
        newTenure = parseFloat((currentTenure / 12).toFixed(2));
      }

      setLoanDetails((prev) => ({
        ...prev,
        [unitField]: newUnit,
        [amountField]: newTenure,
      }));
    } else {
      let currentAmount = loanDetails[amountField] || 0;
      let baseValue = loanDetails.homeValue;

      if (unitField === "feesUnit") {
        const marginInRs =
          loanDetails.marginUnit === "%"
            ? (loanDetails.homeValue * loanDetails.marginAmount) / 100
            : loanDetails.marginAmount;
        baseValue =
          loanDetails.homeValue + loanDetails.loanInsurance - marginInRs;
      }

      let newAmount = currentAmount;
      if (newUnit === "%") {
        newAmount = baseValue ? (currentAmount / baseValue) * 100 : 0;
      } else {
        newAmount = (currentAmount * baseValue) / 100;
      }

      setLoanDetails((prev) => ({
        ...prev,
        [unitField]: newUnit,
        [amountField]: Number(newAmount.toFixed(2)),
      }));
    }
  };

  const changeExpenseUnit = (unitField, amountField, newUnit) => {
    const oldUnit = expenses[unitField];
    if (oldUnit === newUnit) return;

    let currentAmount = expenses[amountField] || 0;
    let baseValue = loanDetails.homeValue;

    let newAmount = currentAmount;
    if (newUnit === "%") {
      newAmount = baseValue ? (currentAmount / baseValue) * 100 : 0.0;
    } else {
      newAmount = (currentAmount * baseValue) / 100;
    }

    setExpenses((prev) => ({
      ...prev,
      [unitField]: newUnit,
      [amountField]: Number(newAmount.toFixed(2)),
    }));
  };

  return (
    <EmiContext.Provider
      value={{
        loanDetails,
        updateLoanDetails,
        changeLoanUnit,
        expenses,
        updateExpenses,
        changeExpenseUnit,
        prepayments,
        updatePrepayments,
        calculatedValues,
        currency,
        setCurrency,
        themeMode,
        setThemeMode,
        autoSave,
        setAutoSave,
        saveSettingsToLocal,
        saveTrigger,
      }}
    >
      {children}
    </EmiContext.Provider>
  );
};
