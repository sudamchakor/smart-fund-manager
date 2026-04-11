import React, { useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Slider,
  Grid,
  InputAdornment,
} from "@mui/material";

const SipCalculatorForm = ({ onCalculate, sharedState, onSharedStateChange }) => {
  const { monthlyInvestment, expectedReturnRate, timePeriod } = sharedState;

  useEffect(() => {
    calculateSip();
  }, [monthlyInvestment, expectedReturnRate, timePeriod]);

  const calculateSip = () => {
    const P = monthlyInvestment;
    const n = timePeriod * 12; // Total number of months
    const i = expectedReturnRate / 100 / 12; // Monthly rate of return

    // Formula: M = P * ({[1 + i]^n - 1} / i) * (1 + i)
    let M = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);

    const investedAmount = P * n;
    const estimatedReturns = M - investedAmount;
    
    // Generate data for chart
    let chartData = [];
    let currentInvested = 0;
    
    for (let year = 1; year <= timePeriod; year++) {
      currentInvested += P * 12;
      const months = year * 12;
      let yearlyM = P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
      
      chartData.push({
        year: year,
        invested: Math.round(currentInvested),
        returns: Math.round(yearlyM - currentInvested),
        total: Math.round(yearlyM)
      });
    }

    onCalculate({
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(M),
      chartData: chartData
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        SIP Details
      </Typography>

      <Box sx={{ my: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Typography gutterBottom>Monthly Investment</Typography>
          <TextField
            size="small"
            value={monthlyInvestment}
            onChange={(e) => onSharedStateChange("monthlyInvestment", Number(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            sx={{ width: 120 }}
          />
        </Grid>
        <Slider
          value={monthlyInvestment}
          min={500}
          max={100000}
          step={500}
          onChange={(e, val) => onSharedStateChange("monthlyInvestment", val)}
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

export default SipCalculatorForm;
