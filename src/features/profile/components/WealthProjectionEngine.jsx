import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Grid,
  Slider,
  Tooltip as MuiTooltip,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  Stack,
} from "@mui/material";
import {
  InfoOutlined as InfoIcon,
  Timeline as TimelineIcon,
  CheckCircle as SuccessIcon,
  Cancel as ErrorIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  selectWealthProjection,
  selectFinancialIndependenceYear,
  selectExpectedReturnRate,
  selectStepUpPercentage,
  selectPostTax,
  setExpectedReturnRate,
  setStepUpPercentage,
  setPostTax,
} from "../../../store/profileSlice";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import { formatCurrency } from "../../../utils/formatting";
import { selectCurrency } from "../../../store/emiSlice";
import ScenarioManager from "./ScenarioManager";

// Helper function to format large numbers for Y-axis ticks
const formatLargeNumber = (num, currency) => {
  const absNum = Math.abs(num);
  let formattedNum;
  if (absNum >= 10000000) formattedNum = `${(num / 10000000).toFixed(1)}Cr`;
  else if (absNum >= 100000) formattedNum = `${(num / 100000).toFixed(1)}L`;
  else if (absNum >= 1000) formattedNum = `${(num / 1000).toFixed(1)}K`;
  else formattedNum = num.toString();

  if (currency === "INR") return `₹${formattedNum}`;
  if (currency === "USD") return `$${formattedNum}`;
  return `${currency} ${formattedNum}`;
};

// Command Center Data Well
const DataWell = ({ title, value, subValue, tooltipText, colorToken }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(colorToken || theme.palette.divider, 0.1),
        bgcolor: alpha(colorToken || theme.palette.background.paper, 0.03),
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 2px 10px rgba(0,0,0,0.01)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: "text.disabled",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Typography>
        {tooltipText && (
          <MuiTooltip title={tooltipText} arrow placement="top">
            <InfoIcon
              sx={{ fontSize: "1rem", color: "text.disabled", cursor: "help" }}
            />
          </MuiTooltip>
        )}
      </Box>
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            color: colorToken || "text.primary",
            letterSpacing: -0.5,
          }}
        >
          {value}
        </Typography>
        {subValue && (
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: "text.secondary" }}
          >
            {subValue}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Glassmorphic Chart Tooltip
const CustomTooltip = ({ active, payload, label, currency }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: "blur(8px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black || "#000", 0.12)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            display: "block",
            mb: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            pb: 0.5,
          }}
        >
          AGE: {label}
        </Typography>
        <Stack spacing={0.5}>
          {payload.map((p) => (
            <Box
              key={p.name}
              sx={{ display: "flex", justifyContent: "space-between", gap: 3 }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "text.secondary" }}
              >
                {p.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 900, color: p.color }}
              >
                {formatCurrency(p.value, currency)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }
  return null;
};

const StyledChartPaper = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.1),
        bgcolor: theme.palette.background.paper,
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black || "#000", 0.02)}`,
        height: "100%",
      }}
    >
      {children}
    </Box>
  );
};

const WealthProjectionEngine = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const projectionData = useSelector(selectWealthProjection);
  const financialIndependence = useSelector(selectFinancialIndependenceYear);
  const expectedReturnRate = useSelector(selectExpectedReturnRate);
  const stepUpPercentage = useSelector(selectStepUpPercentage);
  const postTax = useSelector(selectPostTax);
  const currency = useSelector(selectCurrency);

  const finalProjection =
    projectionData.length > 0 ? projectionData[projectionData.length - 1] : {};
  const projectedCorpus = finalProjection.totalWealth || 0;
  const inflationAdjustedValue = finalProjection.inflationAdjustedWealth || 0;
  const passiveIncome = projectedCorpus * 0.04;

  const dashboardRef = useRef(null);
  const areaChartRef = useRef(null);
  const composedChartRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getSummaryData: () => [
      {
        title: "Projected Corpus at 55",
        value: formatCurrency(projectedCorpus, currency),
      },
      {
        title: "Inflation-Adjusted Value",
        value: formatCurrency(inflationAdjustedValue, currency),
      },
      {
        title: "Passive Income Potential",
        value: `${formatCurrency(passiveIncome, currency)} / year`,
      },
    ],
    getDashboardRef: () => dashboardRef,
    getChartRefs: () => [
      { ref: areaChartRef, name: "areaChart" },
      { ref: composedChartRef, name: "composedChart" },
    ],
  }));

  return (
    // mt: 0 applied here to remove the top gap
    <Box sx={{ mt: 0 }} ref={dashboardRef}>
      {/* 1. Header & Post-Tax Toggle */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              display: "flex",
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
            }}
          >
            <TimelineIcon />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "text.primary" }}
          >
            Wealth Projection Engine
          </Typography>
        </Stack>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={postTax}
              onChange={(e) => dispatch(setPostTax(e.target.checked))}
              color="primary"
            />
          }
          label={
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              POST-TAX VIEW
            </Typography>
          }
        />
      </Stack>

      <ScenarioManager />

      {/* 2. Top Level Metrics (Data Wells) */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={4}>
          <DataWell
            title="Corpus at Retirement"
            value={formatCurrency(projectedCorpus, currency)}
            colorToken={theme.palette.primary.main}
            tooltipText="Estimated total wealth at retirement age, before inflation adjustments."
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DataWell
            title="Real Wealth (Inflation Adj.)"
            value={formatCurrency(inflationAdjustedValue, currency)}
            colorToken={theme.palette.success.main}
            tooltipText="Purchasing power in today's money."
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DataWell
            title="Passive Income (4% Rule)"
            value={`${formatCurrency(passiveIncome, currency)} / yr`}
            colorToken={theme.palette.info.main}
            tooltipText="Safe withdrawal rate for a 30-year retirement."
          />
        </Grid>
      </Grid>

      {/* 3. Integrated Strategy Configuration Panel (Replaces Accordion) */}
      <Box
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <SettingsIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: "text.secondary",
              textTransform: "uppercase",
            }}
          >
            Active Strategy Overrides
          </Typography>
        </Stack>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Expected Return
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 900, color: "primary.main" }}
              >
                {Math.round(expectedReturnRate * 100)}%
              </Typography>
            </Stack>
            <Slider
              value={expectedReturnRate * 100}
              onChange={(e, val) => dispatch(setExpectedReturnRate(val / 100))}
              step={0.5}
              min={8}
              max={15}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Annual Step-Up
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 900, color: "primary.main" }}
              >
                {Math.round(stepUpPercentage * 100)}%
              </Typography>
            </Stack>
            <Slider
              value={stepUpPercentage * 100}
              onChange={(e, val) => dispatch(setStepUpPercentage(val / 100))}
              step={1}
              min={0}
              max={20}
              size="small"
              color="secondary"
            />
          </Grid>
        </Grid>
      </Box>

      {/* 4. Charts Area */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} lg={6}>
          <StyledChartPaper>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
              Real Wealth vs Invested Capital
            </Typography>
            <Box ref={areaChartRef} sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={projectionData}
                  margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={alpha(theme.palette.divider, 0.1)}
                  />
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={10}
                  />
                  <YAxis
                    tickFormatter={(tick) => formatLargeNumber(tick, currency)}
                    tick={{ fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", fontWeight: 700 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inflationAdjustedWealth"
                    name="Real Wealth"
                    stroke={theme.palette.success.main}
                    fill={alpha(theme.palette.success.main, 0.1)}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalInvested"
                    name="Total Invested"
                    stroke={theme.palette.primary.main}
                    fill={alpha(theme.palette.primary.main, 0.05)}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </StyledChartPaper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <StyledChartPaper>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
              Year-on-Year Cash Flow
            </Typography>
            <Box ref={composedChartRef} sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={projectionData}
                  margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={alpha(theme.palette.divider, 0.1)}
                  />
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={5}
                  />
                  <YAxis
                    tickFormatter={(tick) => formatLargeNumber(tick, currency)}
                    tick={{ fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", fontWeight: 700 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="annualIncome"
                    name="Income"
                    stroke={theme.palette.info.main}
                    fill={alpha(theme.palette.info.main, 0.1)}
                  />
                  <Line
                    type="monotone"
                    dataKey="annualExpenses"
                    name="Expenses"
                    stroke={theme.palette.error.main}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="annualInvestment"
                    name="Investments"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </StyledChartPaper>
        </Grid>
      </Grid>

      {/* 5. Financial Independence Status Banner */}
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          bgcolor: financialIndependence
            ? alpha(theme.palette.success.main, 0.1)
            : alpha(theme.palette.error.main, 0.1),
          border: `1px solid ${financialIndependence ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.error.main, 0.3)}`,
        }}
      >
        {financialIndependence ? (
          <>
            <SuccessIcon sx={{ color: "success.main" }} />
            <Typography
              variant="subtitle1"
              sx={{ color: "success.dark", fontWeight: 800 }}
            >
              Financial Independence Achievable by Age{" "}
              <Box
                component="span"
                sx={{ fontSize: "1.2rem", fontWeight: 900 }}
              >
                {financialIndependence.age}
              </Box>
            </Typography>
          </>
        ) : (
          <>
            <ErrorIcon sx={{ color: "error.main" }} />
            <Typography
              variant="subtitle1"
              sx={{ color: "error.dark", fontWeight: 800 }}
            >
              Financial Independence Not Currently Achievable. Adjust Strategy.
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
});

export default WealthProjectionEngine;
