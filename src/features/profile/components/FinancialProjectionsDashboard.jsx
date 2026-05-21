import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';

// --- UTILITY FUNCTIONS & CUSTOM COMPONENTS ---

// Helper to calculate active months in a year for an item
const getActiveMonthsInYear = (startMonth, endMonth, year, startYear, endYear) => {
  if (startYear === endYear && year === startYear) {
    // Item only spans one year
    return endMonth - startMonth + 1;
  }
  if (year === startYear) {
    // First year: from startMonth to December
    return 12 - startMonth;
  }
  if (year === endYear) {
    // Last year: from January to endMonth
    return endMonth + 1;
  }
  // Full year
  return 12;
};

const formatCurrency = (value, currency = '₹') => {
  return `${currency}${value.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
};

const formatAxisCurrency = (value) => {
  if (Math.abs(value) >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)} Cr`;
  }
  if (Math.abs(value) >= 100000) {
    return `₹${(value / 100000).toFixed(1)} L`;
  }
  if (Math.abs(value) >= 1000) {
    return `₹${(value / 1000).toFixed(0)} K`;
  }
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Card
        sx={{
          borderRadius: '12px',
          border: 'none',
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: 'blur(10px)',
          padding: '10px',
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {`Year: ${label}`}
        </Typography>
        {payload.map((pld, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{
              color: pld.color || pld.stroke || pld.payload.fill,
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            {`${pld.name}: ${formatCurrency(pld.value)}`}
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

// --- CHART COMPONENTS ---

const YearlyCashFlowChart = ({ data }) => {
  const theme = useTheme();
  const incomeGradientId = 'incomeGradient';
  const totalExpensesGradientId = 'totalExpensesGradient';

  return (
    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Yearly Cash Flow Engine
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart
            data={data}
            syncId="financialProjections"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id={incomeGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme.palette.success.main}
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor={theme.palette.success.light}
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient
                id={totalExpensesGradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={theme.palette.error.main}
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor={theme.palette.error.light}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatAxisCurrency}
              tick={{ fontSize: 12 }}
              domain={[0, 'auto']}
              tickCount={7}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey="annualIncome"
              name="Annual Income"
              fill={`url(#${incomeGradientId})`}
              stroke={theme.palette.success.dark}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="totalExpenses"
              name="Total Expenses (Inflated)"
              fill={`url(#${totalExpensesGradientId})`}
              stroke={theme.palette.error.dark}
              strokeWidth={2.5}
            />
            <Line
              type="monotone"
              dataKey="baseTotalExpenses"
              name="Base Expenses (No Inflation)"
              stroke={theme.palette.warning.main}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="annualSurplus"
              name="Annual Surplus"
              stroke={theme.palette.info.main}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const WealthAccumulationChart = ({ data }) => {
  const theme = useTheme();
  const cumulativeSurplusGradientId = 'cumulativeSurplusGradient';

  return (
    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Wealth Accumulation (Net Worth)
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart
            data={data}
            syncId="financialProjections"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient
                id={cumulativeSurplusGradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                {/* Opacities increased by ~25% for a richer, more solid dark blue shade */}
                <stop
                  offset="5%"
                  stopColor={theme.palette.primary.main}
                  stopOpacity={0.85}
                />
                <stop
                  offset="95%"
                  stopColor={theme.palette.primary.light}
                  stopOpacity={0.15}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />

            {/* Left Y-Axis for Flows (Income Line / Surplus Bars) */}
            <YAxis
              yAxisId="left"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tickFormatter={formatAxisCurrency}
              tick={{ fontSize: 12 }}
              domain={[0, 'auto']}
              tickCount={7}
            />

            {/* Right Y-Axis for Cumulative Growth (Net Worth Mountain) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tickFormatter={formatAxisCurrency}
              tick={{ fontSize: 12 }}
              domain={[0, 'auto']}
              tickCount={7}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />

            {/* Benchmarks (Left Axis) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="annualIncome"
              name="Annual Income"
              stroke={theme.palette.success.main}
              strokeWidth={2}
              dot={false}
            />

            {/* Surplus Bars (Left Axis) */}
            <Bar
              yAxisId="left"
              dataKey="annualSurplus"
              name="Annual Surplus"
              fill={theme.palette.info.main}
              barSize={18}
            />

            {/* Net Worth Area Gradient (Right Axis) */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="cumulativeSurplus"
              name="Cumulative Surplus (Net Worth)"
              fill={`url(#${cumulativeSurplusGradientId})`}
              stroke={theme.palette.primary.dark}
              strokeWidth={2.5}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

const FinancialProjectionsDashboard = ({
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
}) => {
  // --- Projection Calculation ---
  const currentYear = new Date().getFullYear();
  const projectionYears =
    retirementAge > currentAge ? retirementAge - currentAge : 0;
  const endProjectionYear = currentYear + projectionYears;

  let loanTenureMonths = 0;
  let emiStartYear = currentYear;
  let emiStartMonth = new Date().getMonth();

  if (emiState?.loanDetails) {
    loanTenureMonths =
      emiState.loanDetails.tenureUnit === 'years'
        ? Number(emiState.loanDetails.loanTenure) * 12
        : Number(emiState.loanDetails.loanTenure);
    const startDate = dayjs(emiState.loanDetails.startDate);
    if (startDate.isValid()) {
      emiStartYear = startDate.year();
      emiStartMonth = startDate.month();
    }
  } else if (emiState && emiState.tenure) {
    loanTenureMonths =
      emiState.tenureType === 'years'
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
        // Skip funded incomes
        if (inc.isFunded) {
          return;
        }
        const start = inc.startYear || currentYear;
        const end = inc.endYear || currentYear + 40;
        const startMonth = inc.startMonth !== undefined ? inc.startMonth : 0;
        const endMonth = inc.endMonth !== undefined ? inc.endMonth : 11;
        
        if (year >= start && year <= end) {
          hasActiveIncome = true;
          let rawAmount = Number(inc.amount) || 0;

          if (inc.frequency === 'monthly') rawAmount *= 12;
          else if (inc.frequency === 'quarterly') rawAmount *= 4;

          let yearlyAmount = rawAmount;
          
          // Prorate if item doesn't span full year
          const activeMonths = getActiveMonthsInYear(startMonth, endMonth, year, start, end);
          if (activeMonths < 12) {
            yearlyAmount = (rawAmount / 12) * activeMonths;
          }
          
          const activeYears = year - Math.max(start, currentYear);
          if (activeYears > 0) {
            if (careerGrowthType === 'percentage') {
              yearlyAmount *= Math.pow(1 + careerGrowthRate, activeYears);
            }
          }
          annualIncome += yearlyAmount;
        }
      });

      if (careerGrowthType === 'fixed' && hasActiveIncome) {
        const activeYears = year - currentYear;
        if (activeYears > 0) {
          annualIncome += careerGrowthRate * activeYears;
        }
      }

      let baseTotalExpenses = 0;
      let totalExpenses = 0;

      expenses.forEach((exp) => {
        // Skip funded expenses
        if (exp.isFunded) {
          return;
        }
        const start = exp.startYear || currentYear;
        const end = exp.endYear || currentYear + 40;
        const startMonth = exp.startMonth !== undefined ? exp.startMonth : 0;
        const endMonth = exp.endMonth !== undefined ? exp.endMonth : 11;
        
        if (year >= start && year <= end) {
          let rawAmount = Number(exp.amount) || 0;
          if (exp.frequency === 'monthly') rawAmount *= 12;
          else if (exp.frequency === 'quarterly') rawAmount *= 4;

          // Prorate if expense doesn't span full year
          const activeMonths = getActiveMonthsInYear(startMonth, endMonth, year, start, end);
          const baseAmount = (activeMonths < 12) ? (rawAmount / 12) * activeMonths : rawAmount;
          baseTotalExpenses += baseAmount;

          let yearlyAmount = baseAmount;
          const activeYears = year - Math.max(start, currentYear);
          if (activeYears > 0) {
            yearlyAmount *= Math.pow(1 + inflationRate, activeYears);
          }
          totalExpenses += yearlyAmount;
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
      baseTotalExpenses += emiAnnual;
      totalExpenses += emiAnnual;

      individualGoalInvestments.forEach((inv) => {
        const goal = goals.find((g) => g.id === inv.goalId);
        if (goal?.isFunded || inv.isFunded) {
          return;
        }
        if (inv.type === 'one-time-yearly') {
          if (year === inv.year) {
            const amt = Number(inv.amount) || 0;
            baseTotalExpenses += amt;
            totalExpenses += amt;
          }
        } else {
          const start = inv.startYear || currentYear;
          const end =
            inv.endYear ||
            (inv.goalTargetYear ? inv.goalTargetYear : currentYear + 40);
          const startMonth = inv.startMonth !== undefined ? inv.startMonth : 0;
          const endMonth = inv.endMonth !== undefined ? inv.endMonth : 11;

          if (year >= start && year <= end) {
            let rawAmount = Number(inv.amount) || 0;

            if (inv.frequency === 'monthly') rawAmount *= 12;
            else if (inv.frequency === 'quarterly') rawAmount *= 4;

            // Prorate if investment doesn't span full year
            const activeMonths = getActiveMonthsInYear(startMonth, endMonth, year, start, end);
            const baseAmount = (activeMonths < 12) ? (rawAmount / 12) * activeMonths : rawAmount;
            baseTotalExpenses += baseAmount;

            let yearlyAmount = baseAmount;
            if (
              inv.type === 'step_up_sip' ||
              inv.investmentType === 'step_up_sip'
            ) {
              const stepUpRate = inv.stepUpRate ? inv.stepUpRate / 100 : 0;
              const activeYears = year - start;
              if (activeYears > 0) {
                yearlyAmount *= Math.pow(1 + stepUpRate, activeYears);
              }
            }
            totalExpenses += yearlyAmount;
          }
        }
      });

      const annualSurplus = annualIncome - totalExpenses;

      projectionData.push({
        year: year,
        annualIncome: Math.round(annualIncome),
        totalExpenses: Math.round(totalExpenses),
        baseTotalExpenses: Math.round(baseTotalExpenses),
        annualSurplus: Math.round(annualSurplus),
        cumulativeSurplus: 0,
      });
    }
  }

  // --- Cumulative Surplus Calculation ---
  let cumulativeSurplus = 0;
  projectionData.forEach((d) => {
    cumulativeSurplus += d.annualSurplus;
    d.cumulativeSurplus = cumulativeSurplus;
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={6}>
        <YearlyCashFlowChart data={projectionData} />
      </Grid>
      <Grid item xs={12} lg={6}>
        <WealthAccumulationChart data={projectionData} />
      </Grid>
    </Grid>
  );
};

export default FinancialProjectionsDashboard;
