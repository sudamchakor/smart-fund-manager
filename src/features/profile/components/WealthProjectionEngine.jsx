import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Slider,
} from "@mui/material";
import {
  selectWealthProjection,
  selectFinancialIndependenceYear,
  selectExpectedReturnRate,
  selectStepUpPercentage,
  setExpectedReturnRate,
  setStepUpPercentage,
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
  BarChart,
  Bar,
} from "recharts";
import { formatCurrency } from "../../../utils/formatting";
import { selectCurrency } from "../../../store/emiSlice";

const DataCard = ({ title, value, subValue }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
      {subValue && (
        <Typography variant="body2" color="text.secondary">
          {subValue}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography variant="subtitle1">{`Age: ${label}`}</Typography>
        {payload.map((p) => (
          <Typography key={p.name} style={{ color: p.color }}>
            {`${p.name}: ${formatCurrency(p.value, currency)}`}
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

const WealthProjectionEngine = () => {
  const dispatch = useDispatch();
  const projectionData = useSelector(selectWealthProjection);
  const financialIndependence = useSelector(selectFinancialIndependenceYear);
  const expectedReturnRate = useSelector(selectExpectedReturnRate);
  const stepUpPercentage = useSelector(selectStepUpPercentage);
  const currency = useSelector(selectCurrency);
  console.log(projectionData, "Sudam");
  const handleReturnRateChange = (event, newValue) => {
    dispatch(setExpectedReturnRate(newValue / 100));
  };

  const handleStepUpChange = (event, newValue) => {
    dispatch(setStepUpPercentage(newValue / 100));
  };

  const finalProjection =
    projectionData.length > 0 ? projectionData[projectionData.length - 1] : {};
  const projectedCorpus = finalProjection.totalWealth || 0;
  const inflationAdjustedValue = finalProjection.inflationAdjustedWealth || 0;
  const passiveIncome = projectedCorpus * 0.04;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Wealth Creation & Projection Engine
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <DataCard
            title="Projected Corpus at 55"
            value={formatCurrency(projectedCorpus, currency)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DataCard
            title="Inflation-Adjusted Value"
            value={formatCurrency(inflationAdjustedValue, currency)}
            subValue="(Real Wealth)"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DataCard
            title="Passive Income Potential"
            value={`${formatCurrency(passiveIncome, currency)} / year`}
            subValue="(4% Withdrawal Rule)"
          />
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Investment Strategy
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Expected Return %</Typography>
              <Slider
                value={expectedReturnRate * 100}
                onChange={handleReturnRateChange}
                aria-labelledby="return-rate-slider"
                valueLabelDisplay="auto"
                step={0.5}
                marks
                min={8}
                max={15}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Annual Step-up %</Typography>
              <Slider
                value={stepUpPercentage * 100}
                onChange={handleStepUpChange}
                aria-labelledby="step-up-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={20}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inflation-Adjusted Wealth Growth
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis
                    tickFormatter={(tick) => formatCurrency(tick, currency)}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="inflationAdjustedWealth"
                    name="Real Wealth"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalInvested"
                    name="Total Invested"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Year-on-Year Cash Flow
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis
                    tickFormatter={(tick) => formatCurrency(tick, currency)}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend />
                  <Bar dataKey="annualIncome" name="Income" fill="#82ca9d" />
                  <Bar
                    dataKey="annualExpenses"
                    name="Expenses"
                    fill="#ff8042"
                  />
                  <Bar
                    dataKey="annualInvestment"
                    name="Investments"
                    fill="#8884d8"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {financialIndependence ? (
        <Typography
          variant="h5"
          align="center"
          sx={{ mt: 4, p: 2, bgcolor: "success.light", borderRadius: 2 }}
        >
          Financial Independence Achievable by Age{" "}
          <strong>{financialIndependence.age}</strong>!
        </Typography>
      ) : (
        <Typography
          variant="h5"
          align="center"
          sx={{ mt: 4, p: 2, bgcolor: "error.light", borderRadius: 2 }}
        >
          Financial Independence Not Achievable!
        </Typography>
      )}
    </Box>
  );
};

export default WealthProjectionEngine;
