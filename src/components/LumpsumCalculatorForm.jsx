import React, { useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Slider,
  Grid,
  InputAdornment,
} from "@mui/material";

const LumpsumCalculatorForm = ({ onCalculate, sharedState, onSharedStateChange }) => {
  const { totalInvestment, expectedReturnRate, timePeriod } = sharedState;

  useEffect(() => {
    calculateLumpsum();
  }, [totalInvestment, expectedReturnRate, timePeriod]);

  const calculateLumpsum = () => {
    const P = totalInvestment;
    const r = expectedReturnRate / 100;
    const n = timePeriod;

    // Formula: A = P(1 + r)^n
    const totalValue = P * Math.pow(1 + r, n);
    const estimatedReturns = totalValue - P;

    let chartData = [];
    for (let year = 1; year <= timePeriod; year++) {
      let yearlyValue = P * Math.pow(1 + r, year);
      chartData.push({
        year: year,
        invested: Math.round(P),
        returns: Math.round(yearlyValue - P),
        total: Math.round(yearlyValue)
      });
    }

    onCalculate({
      investedAmount: Math.round(P),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue),
      chartData: chartData
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Lumpsum Details
      </Typography>

      <Box sx={{ my: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Typography gutterBottom>Total Investment</Typography>
          <TextField
            size="small"
            value={totalInvestment}
            onChange={(e) => onSharedStateChange("totalInvestment", Number(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            sx={{ width: 140 }}
          />
        </Grid>
        <Slider
          value={totalInvestment}
          min={5000}
          max={5000000}
          step={1000}
          onChange={(e, val) => onSharedStateChange("totalInvestment", val)}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ my: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Typography gutterBottom>Expected Return Rate (p.a)</Typography>
          <TextField
            size="small"
            value={expectedReturnRate}
            onChange={(e) => onSharedStateChange("expectedReturnRate", Number(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            sx={{ width: 100 }}
          />
        </Grid>
        <Slider
          value={expectedReturnRate}
          min={1}
          max={30}
          step={0.1}
          onChange={(e, val) => onSharedStateChange("expectedReturnRate", val)}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ my: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Typography gutterBottom>Time Period (Years)</Typography>
          <TextField
            size="small"
            value={timePeriod}
            onChange={(e) => onSharedStateChange("timePeriod", Number(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end">Yr</InputAdornment>,
            }}
            sx={{ width: 100 }}
          />
        </Grid>
        <Slider
          value={timePeriod}
          min={1}
          max={40}
          step={1}
          onChange={(e, val) => onSharedStateChange("timePeriod", val)}
          valueLabelDisplay="auto"
        />
      </Box>
    </Box>
  );
};

export default LumpsumCalculatorForm;
