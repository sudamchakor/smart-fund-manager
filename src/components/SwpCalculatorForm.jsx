import React, { useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Slider,
  Grid,
  InputAdornment,
} from "@mui/material";

const SwpCalculatorForm = ({ onCalculate, sharedState, onSharedStateChange }) => {
  const { totalInvestment, withdrawalPerMonth, expectedReturnRate, timePeriod } = sharedState;

  useEffect(() => {
    calculateSwp();
  }, [totalInvestment, withdrawalPerMonth, expectedReturnRate, timePeriod]);

  const calculateSwp = () => {
    const P = totalInvestment;
    const W = withdrawalPerMonth;
    const n = timePeriod * 12; // months
    const i = expectedReturnRate / 100 / 12; // monthly rate
    
    let currentBalance = P;
    let totalWithdrawn = 0;
    let chartData = [];

    // SWP Calculation
    for (let month = 1; month <= n; month++) {
      if (currentBalance > 0) {
        // Interest earned for the month
        let interest = currentBalance * i;
        
        // Add interest to balance
        currentBalance += interest;
        
        // Subtract withdrawal
        let actualWithdrawal = Math.min(W, currentBalance);
        currentBalance -= actualWithdrawal;
        totalWithdrawn += actualWithdrawal;
      }
      
      // Add data points every 12 months (end of year)
      if (month % 12 === 0) {
        chartData.push({
          year: month / 12,
          invested: Math.round(P),
          withdrawn: Math.round(totalWithdrawn),
          total: Math.round(Math.max(0, currentBalance))
        });
      }
    }

    // Final calculations
    const finalBalance = Math.max(0, currentBalance);
    // Estimated Returns in SWP context = (Total Withdrawn + Final Balance) - Initial Investment
    const estimatedReturns = (totalWithdrawn + finalBalance) - P;

    onCalculate({
      investedAmount: Math.round(P),
      // To display logically in the same UI as SIP/Lumpsum:
      // "Estimated Returns" = Total earned above initial investment
      estimatedReturns: Math.round(estimatedReturns), 
      // "Total Value" = What's left at the end
      totalValue: Math.round(finalBalance),
      // We also want to pass totalWithdrawn, but the parent UI might not show it currently
      totalWithdrawn: Math.round(totalWithdrawn),
      chartData: chartData
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        SWP Details
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
          min={50000}
          max={50000000}
          step={10000}
          onChange={(e, val) => onSharedStateChange("totalInvestment", val)}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ my: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Typography gutterBottom>Withdrawal per month</Typography>
          <TextField
            size="small"
            value={withdrawalPerMonth}
            onChange={(e) => onSharedStateChange("withdrawalPerMonth", Number(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            sx={{ width: 120 }}
          />
        </Grid>
        <Slider
          value={withdrawalPerMonth}
          min={500}
          max={100000}
          step={500}
          onChange={(e, val) => onSharedStateChange("withdrawalPerMonth", val)}
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

export default SwpCalculatorForm;
