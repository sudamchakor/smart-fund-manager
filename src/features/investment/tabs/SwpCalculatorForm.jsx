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
import { AccountBalanceWallet as SwpIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectCurrency } from "../../../store/emiSlice";

const SwpCalculatorForm = ({
  onCalculate,
  sharedState,
  onSharedStateChange,
}) => {
  const theme = useTheme();
  // Wire up the global currency setting
  const currency = useSelector(selectCurrency) || "₹";

  const {
    totalInvestment,
    withdrawalPerMonth,
    expectedReturnRate,
    timePeriod,
  } = sharedState;

  const calculateSwp = useCallback(() => {
    // Safe fallbacks to prevent NaN crashes if inputs are cleared
    const P = totalInvestment || 0;
    const W = withdrawalPerMonth || 0;
    const n = (timePeriod || 0) * 12;
    const i = (expectedReturnRate || 0) / 100 / 12;

    let currentBalance = P;
    let totalWithdrawn = 0;
    let chartData = [];

    if (P > 0 && n > 0) {
      for (let month = 1; month <= n; month++) {
        if (currentBalance > 0) {
          let interest = currentBalance * i;
          currentBalance += interest;

          let actualWithdrawal = Math.min(W, currentBalance);
          currentBalance -= actualWithdrawal;
          totalWithdrawn += actualWithdrawal;
        }

        if (month % 12 === 0) {
          chartData.push({
            year: month / 12,
            invested: Math.round(P),
            withdrawn: Math.round(totalWithdrawn),
            total: Math.round(Math.max(0, currentBalance)),
          });
        }
      }
    }

    const finalBalance = Math.max(0, currentBalance);
    const estimatedReturns = totalWithdrawn + finalBalance - P;

    onCalculate({
      investedAmount: Math.round(P),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(finalBalance),
      totalWithdrawn: Math.round(totalWithdrawn),
      chartData: chartData,
    });
  }, [
    totalInvestment,
    withdrawalPerMonth,
    expectedReturnRate,
    timePeriod,
    onCalculate,
  ]);

  useEffect(() => {
    calculateSwp();
  }, [calculateSwp]);

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
        <SwpIcon
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
          SWP Configuration
        </Typography>
      </Stack>

      {/* 1. Total Investment */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1} alignItems="flex-end" sx={{ mb: 0.5 }}>
          <Grid item xs={7}>
            <Typography sx={labelStyle}>Initial Corpus</Typography>
          </Grid>
          <Grid item xs={5}>
            <TextField
              variant="standard"
              size="small"
              value={totalInvestment}
              onChange={(e) =>
                onSharedStateChange("totalInvestment", Number(e.target.value))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{
                      "& p": {
                        fontWeight: 900,
                        fontSize: "0.8rem",
                        color: "primary.main",
                      },
                    }}
                  >
                    {currency}
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
          value={totalInvestment}
          min={50000}
          max={50000000}
          step={10000}
          onChange={(e, val) => onSharedStateChange("totalInvestment", val)}
          sx={{
            py: 1,
            "& .MuiSlider-thumb": { width: 12, height: 12 },
            "& .MuiSlider-track": { height: 4 },
            "& .MuiSlider-rail": { height: 4, opacity: 0.2 },
          }}
        />
      </Box>

      {/* 2. Monthly Withdrawal */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1} alignItems="flex-end" sx={{ mb: 0.5 }}>
          <Grid item xs={7}>
            <Typography sx={labelStyle}>Monthly Payout</Typography>
          </Grid>
          <Grid item xs={5}>
            <TextField
              variant="standard"
              size="small"
              value={withdrawalPerMonth}
              onChange={(e) =>
                onSharedStateChange(
                  "withdrawalPerMonth",
                  Number(e.target.value),
                )
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{
                      "& p": {
                        fontWeight: 900,
                        fontSize: "0.8rem",
                        color: "warning.main",
                      },
                    }}
                  >
                    {currency}
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: {
                  fontWeight: 900,
                  fontSize: "0.9rem",
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
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
          value={withdrawalPerMonth}
          min={500}
          max={100000}
          step={500}
          onChange={(e, val) => onSharedStateChange("withdrawalPerMonth", val)}
          color="warning"
          sx={{
            py: 1,
            "& .MuiSlider-thumb": { width: 12, height: 12 },
            "& .MuiSlider-track": { height: 4 },
            "& .MuiSlider-rail": { height: 4, opacity: 0.2 },
          }}
        />
      </Box>

      {/* 3. Expected Return Rate */}
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
                    sx={{
                      "& p": {
                        fontWeight: 900,
                        fontSize: "0.8rem",
                        color: "success.main",
                      },
                    }}
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
                  textAlign: "right",
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
            "& .MuiSlider-rail": { height: 4, opacity: 0.2 },
          }}
        />
      </Box>

      {/* 4. Time Period */}
      <Box sx={{ mb: 1 }}>
        <Grid container spacing={1} alignItems="flex-end" sx={{ mb: 0.5 }}>
          <Grid item xs={7}>
            <Typography sx={labelStyle}>Payout Duration</Typography>
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
                    sx={{
                      "& p": {
                        fontWeight: 900,
                        fontSize: "0.8rem",
                        color: "info.main",
                      },
                    }}
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
                  textAlign: "right",
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
            "& .MuiSlider-rail": { height: 4, opacity: 0.2 },
          }}
        />
      </Box>
    </Box>
  );
};

export default SwpCalculatorForm;
