import React, { useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Slider,
  Grid,
  InputAdornment,
  alpha,
  useTheme,
  Stack,
} from "@mui/material";
import { SettingsInputComponent as SettingsIcon } from "@mui/icons-material";

const SipCalculatorForm = ({
  onCalculate,
  sharedState,
  onSharedStateChange,
}) => {
  const theme = useTheme();

  // FIX: Destructure 'monthlyInvestment' instead of 'monthlyContribution' to match parent state
  const { monthlyInvestment, expectedReturnRate, timePeriod } = sharedState;

  const calculateSip = useCallback(() => {
    const P = monthlyInvestment || 0; // Fallback to 0 if undefined
    const years = timePeriod || 0;
    const annualRate = expectedReturnRate || 0;
    const n = years * 12;
    const i = annualRate / 100 / 12;

    let totalValue = 0;
    if (i > 0 && n > 0) {
      totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    } else {
      totalValue = P * n;
    }

    const investedAmount = P * n;
    const estimatedReturns = totalValue - investedAmount;

    let chartData = [];
    if (P > 0 && years > 0) {
      for (let year = 1; year <= years; year++) {
        const months = year * 12;
        const currentInvested = P * months;
        let yearlyTotalValue =
          i > 0
            ? P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i)
            : P * months;

        chartData.push({
          year: year,
          invested: Math.round(currentInvested),
          returns: Math.round(yearlyTotalValue - currentInvested),
          total: Math.round(yearlyTotalValue),
        });
      }
    }

    onCalculate({
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue),
      monthlyInvestment: monthlyInvestment,
      chartData: chartData,
    });
  }, [monthlyInvestment, expectedReturnRate, timePeriod, onCalculate]);

  useEffect(() => {
    calculateSip();
  }, [calculateSip]);

  // Label style consistent with "Command Center" metadata
  const labelStyle = {
    fontWeight: 800,
    textTransform: "uppercase",
    fontSize: "0.65rem",
    color: "text.disabled",
    letterSpacing: 1,
    mb: 0.5,
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Internal Subsection Header */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <SettingsIcon
          sx={{
            fontSize: "1rem",
            color: theme.palette.primary.main,
            opacity: 0.8,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 900,
            color: "text.primary",
            textTransform: "uppercase",
          }}
        >
          SIP Parameters
        </Typography>
      </Stack>

      {/* 1. Monthly Investment Input */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1} alignItems="flex-end" sx={{ mb: 0.5 }}>
          <Grid item xs={7}>
            <Typography sx={labelStyle}>Monthly Investment</Typography>
          </Grid>
          <Grid item xs={5}>
            <TextField
              variant="standard"
              size="small"
              value={monthlyInvestment}
              onChange={(e) =>
                onSharedStateChange("monthlyInvestment", Number(e.target.value))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ "& p": { fontWeight: 900, fontSize: "0.8rem" } }}
                  >
                    ₹
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: {
                  fontWeight: 900,
                  fontSize: "0.9rem",
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  px: 1,
                  borderRadius: 1,
                  textAlign: "right",
                },
              }}
              fullWidth
            />
          </Grid>
        </Grid>
        <Slider
          value={monthlyInvestment}
          min={500}
          max={100000}
          step={500}
          onChange={(e, val) => onSharedStateChange("monthlyInvestment", val)}
          sx={{
            py: 1,
            "& .MuiSlider-thumb": { width: 12, height: 12 },
            "& .MuiSlider-track": { height: 4 },
            "& .MuiSlider-rail": { height: 4, opacity: 0.2 },
          }}
        />
      </Box>

      {/* 2. Expected Return Rate */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1} alignItems="flex-end" sx={{ mb: 0.5 }}>
          <Grid item xs={7}>
            <Typography sx={labelStyle}>Expected Returns (p.a)</Typography>
          </Grid>
          <Grid item xs={5}>
            <TextField
              variant="standard"
              size="small"
              value={expectedReturnRate}
              onChange={(e) =>
                onSharedStateChange(
                  "expectedReturnRate",
                  Number(e.target.value),
                )
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    position="end"
                    sx={{ "& p": { fontWeight: 900, fontSize: "0.8rem" } }}
                  >
                    %
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: {
                  fontWeight: 900,
                  fontSize: "0.9rem",
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  px: 1,
                  borderRadius: 1,
                },
              }}
              fullWidth
            />
          </Grid>
        </Grid>
        <Slider
          value={expectedReturnRate}
          min={1}
          max={30}
          step={0.1}
          onChange={(e, val) => onSharedStateChange("expectedReturnRate", val)}
          color="success"
          sx={{
            py: 1,
            "& .MuiSlider-thumb": { width: 12, height: 12 },
            "& .MuiSlider-track": { height: 4 },
          }}
        />
      </Box>

      {/* 3. Time Period */}
      <Box sx={{ mb: 1 }}>
        <Grid container spacing={1} alignItems="flex-end" sx={{ mb: 0.5 }}>
          <Grid item xs={7}>
            <Typography sx={labelStyle}>Duration (Years)</Typography>
          </Grid>
          <Grid item xs={5}>
            <TextField
              variant="standard"
              size="small"
              value={timePeriod}
              onChange={(e) =>
                onSharedStateChange("timePeriod", Number(e.target.value))
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    position="end"
                    sx={{ "& p": { fontWeight: 900, fontSize: "0.8rem" } }}
                  >
                    Yr
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: {
                  fontWeight: 900,
                  fontSize: "0.9rem",
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  px: 1,
                  borderRadius: 1,
                },
              }}
              fullWidth
            />
          </Grid>
        </Grid>
        <Slider
          value={timePeriod}
          min={1}
          max={40}
          step={1}
          onChange={(e, val) => onSharedStateChange("timePeriod", val)}
          color="info"
          sx={{
            py: 1,
            "& .MuiSlider-thumb": { width: 12, height: 12 },
            "& .MuiSlider-track": { height: 4 },
          }}
        />
      </Box>
    </Box>
  );
};

export default SipCalculatorForm;
