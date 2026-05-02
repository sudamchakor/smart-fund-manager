import React, { useState } from "react";
import {  Typography } from "@mui/material";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { selectCurrency } from "../../../store/emiSlice";
import dayjs from "dayjs";

const currentYear = new Date().getFullYear();

// Helper to round values to nice numbers (e.g. 112344 -> 120000)
const roundToNiceNumber = (val, roundUp) => {
  if (val === 0) return 0;
  const sign = val < 0 ? -1 : 1;
  const absVal = Math.abs(val);

  // Find magnitude to get 2 significant digits (e.g., 10000 for 123456)
  const magnitude = Math.pow(10, Math.floor(Math.log10(absVal)) - 1);

  let scaled = absVal / magnitude;
  const shouldRoundUpAbs = (sign === 1 && roundUp) || (sign === -1 && !roundUp);

  if (shouldRoundUpAbs) {
    scaled = Math.ceil(scaled);
  } else {
    scaled = Math.floor(scaled);
  }

  return sign * scaled * magnitude;
};

// Custom Legend to show struck-through or faded text for disabled items
const renderLegend = (props, hiddenLines) => {
  const { payload, onClick } = props;
  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        display: "flex",
        justifyContent: "center",
        margin: 0,
      }}
    >
      {payload.map((entry, index) => {
        const isHidden = hiddenLines[entry.dataKey];
        return (
          <li
            key={`item-${index}`}
            onClick={() => onClick(entry)}
            style={{
              cursor: "pointer",
              marginRight: 20,
              display: "flex",
              alignItems: "center",
              color: isHidden ? "#999" : "#000",
              textDecoration: isHidden ? "line-through" : "none",
              opacity: isHidden ? 0.5 : 1,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                backgroundColor: entry.color,
                marginRight: 8,
                opacity: isHidden ? 0.5 : 1,
              }}
            />
            {entry.value}
          </li>
        );
      })}
    </ul>
  );
};

export default function ProjectedCashFlowChart({
  currentAge,
  retirementAge,
  careerGrowthRate,
  careerGrowthType,
  monthlyEmi,
  emiState,
  individualGoalInvestments,
  goals,
  expenses,
  incomes,
  inflationRate,
}) {
  const theme = useTheme();
  const currency = useSelector(selectCurrency);
  const [hiddenLines, setHiddenLines] = useState({});

  const formatCurrency = (val) =>
    `${currency}${Number(val || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const handleLegendClick = (e) => {
    const { dataKey } = e;
    if (dataKey) {
      setHiddenLines((prev) => ({
        ...prev,
        [dataKey]: !prev[dataKey],
      }));
    }
  };

  // --- Income & Expense Projection Calculation ---
  const projectionYears =
    retirementAge > currentAge ? retirementAge - currentAge : 0;
  const endProjectionYear = currentYear + projectionYears;

  let loanTenureMonths = 0;
  let emiStartYear = currentYear;
  let emiStartMonth = new Date().getMonth();

  if (emiState?.loanDetails) {
    loanTenureMonths =
      emiState.loanDetails.tenureUnit === "years"
        ? Number(emiState.loanDetails.loanTenure) * 12
        : Number(emiState.loanDetails.loanTenure);
    const startDate = dayjs(emiState.loanDetails.startDate);
    if (startDate.isValid()) {
      emiStartYear = startDate.year();
      emiStartMonth = startDate.month();
    }
  } else if (emiState && emiState.tenure) {
    loanTenureMonths =
      emiState.tenureType === "years"
        ? Number(emiState.tenure) * 12
        : Number(emiState.tenure);
  }

  const absoluteStartMonth = emiStartYear * 12 + emiStartMonth;
  const absoluteEndMonth = absoluteStartMonth + loanTenureMonths;

  const projectionData = [];
  if (projectionYears > 0) {
    for (let year = currentYear; year <= endProjectionYear; year++) {

      let annualIncome = 0;
      let hasActiveIncome = false;

      incomes.forEach((inc) => {
        const start = inc.startYear || currentYear;
        const end = inc.endYear || currentYear + 10;
        if (year >= start && year <= end) {
          hasActiveIncome = true;
          let rawAmount = Number(inc.amount) || 0;

          if (inc.frequency === "monthly") rawAmount *= 12;
          else if (inc.frequency === "quarterly") rawAmount *= 4;

          let yearlyAmount = rawAmount;
          const activeYears = year - Math.max(start, currentYear);
          if (activeYears > 0) {
            if (careerGrowthType === "percentage") {
              yearlyAmount *= Math.pow(1 + careerGrowthRate, activeYears);
            }
          }
          annualIncome += yearlyAmount;
        }
      });

      if (careerGrowthType === "fixed" && hasActiveIncome) {
        const activeYears = year - currentYear;
        if (activeYears > 0) {
          annualIncome += careerGrowthRate * activeYears;
        }
      }

      let baseAnnualExpense = 0;
      let annualExpense = 0;

      expenses.forEach((exp) => {
        const start = exp.startYear || currentYear;
        const end = exp.endYear || currentYear + 10;
        if (year >= start && year <= end) {
          let rawAmount = Number(exp.amount) || 0;
          if (exp.frequency === "monthly") rawAmount *= 12;
          else if (exp.frequency === "quarterly") rawAmount *= 4;

          baseAnnualExpense += rawAmount;

          let yearlyAmount = rawAmount;
          const activeYears = year - Math.max(start, currentYear);
          if (activeYears > 0) {
            yearlyAmount *= Math.pow(1 + inflationRate, activeYears);
          }
          annualExpense += yearlyAmount;
        }
      });

      let activeEmiMonths = 0;
      if (loanTenureMonths > 0) {
        for (let m = 0; m < 12; m++) {
          const absoluteCurrentMonth = year * 12 + m;
          if (
            absoluteCurrentMonth >= absoluteStartMonth &&
            absoluteCurrentMonth < absoluteEndMonth
          ) {
            activeEmiMonths++;
          }
        }
      }

      const emiAnnual = (monthlyEmi || 0) * activeEmiMonths;
      annualExpense += emiAnnual;
      baseAnnualExpense += emiAnnual;

      individualGoalInvestments.forEach((inv) => {
        if (inv.type === "one-time-yearly") {
          if (year === inv.year) {
            const amt = Number(inv.amount) || 0;
            annualExpense += amt;
            baseAnnualExpense += amt;
          }
        } else {
          const start = inv.startYear || currentYear;
          const end =
            inv.endYear ||
            (inv.goalTargetYear ? inv.goalTargetYear : currentYear + 10);

          if (year >= start && year <= end) {
            let rawAmount = Number(inv.amount) || 0;

            if (inv.frequency === "monthly") rawAmount *= 12;
            else if (inv.frequency === "quarterly") rawAmount *= 4;

            baseAnnualExpense += rawAmount;

            let yearlyAmount = rawAmount;
            if (
              inv.type === "step_up_sip" ||
              inv.investmentType === "step_up_sip"
            ) {
              const stepUpRate = inv.stepUpRate ? inv.stepUpRate / 100 : 0;
              const activeYears = year - start;
              if (activeYears > 0) {
                yearlyAmount *= Math.pow(1 + stepUpRate, activeYears);
              }
            }
            annualExpense += yearlyAmount;
          }
        }
      });

      projectionData.push({
        year: year,
        Income: Math.round(annualIncome),
        BaseExpenses: Math.round(baseAnnualExpense),
        Expenses: Math.round(annualExpense),
        Surplus: Math.round(annualIncome - annualExpense),
      });
    }
  }

  // --- Dynamic Y-Axis Calculation ---
  let yMin = 0;
  let yMax = 100000;

  if (projectionData.length > 0) {
    const allValues = projectionData.flatMap((d) => [
      d.Income,
      d.Expenses,
      d.Surplus,
      d.BaseExpenses,
    ]);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);

    const bufferedMin = minValue < 0 ? minValue * 1.1 : 0;
    const bufferedMax = maxValue * 1.1;

    yMin = roundToNiceNumber(bufferedMin, false);
    yMax = roundToNiceNumber(bufferedMax, true);
  }

  return (
    <>
      <Typography variant="h6" align="center" gutterBottom>
        Projected Annual Income vs. Expenses Until Retirement
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart
          data={projectionData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            tickFormatter={(val) => formatCurrency(val)}
            domain={[yMin, yMax]}
            allowDataOverflow={true}
          />
          <RechartsTooltip
            formatter={(value, name) => [formatCurrency(value), name]}
          />

          <Legend
            content={(props) => renderLegend(props, hiddenLines)}
            onClick={handleLegendClick}
          />

          <ReferenceLine
            y={0}
            stroke={theme.palette.text.primary}
            strokeWidth={2}
          />

          <Area
            hide={hiddenLines["Income"]}
            type="monotone"
            dataKey="Income"
            name="Annual Income"
            fill={theme.palette.success.light}
            stroke={theme.palette.success.main}
          />

          <Area
            hide={hiddenLines["Expenses"]}
            legendType="none"
            type="monotone"
            dataKey="BaseExpenses"
            name="Base Expenses"
            fill={theme.palette.error.light}
            stroke={theme.palette.error.light}
            fillOpacity={0.3}
          />
          <Line
            hide={hiddenLines["Expenses"]}
            type="monotone"
            dataKey="Expenses"
            name="Expenses"
            stroke={theme.palette.error.main}
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
          />

          <Line
            hide={hiddenLines["Surplus"]}
            type="monotone"
            dataKey="Surplus"
            name="Surplus"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
}
