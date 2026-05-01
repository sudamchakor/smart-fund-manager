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
import { Toll as LumpsumIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectCurrency } from "../../../store/emiSlice";

const LumpsumCalculatorForm = ({
  onCalculate,
  sharedState,
  onSharedStateChange,
}) => {
  const theme = useTheme();
  // Wire up the global currency setting
  const currency = useSelector(selectCurrency) || "₹";

  const { totalInvestment, expectedReturnRate, timePeriod } = sharedState;

  const calculateLumpsum = useCallback(() => {
    // Safe fallbacks to prevent NaN crashes if inputs are cleared
    const P = totalInvestment || 0;
    const r = (expectedReturnRate || 0) / 100;
    const n = timePeriod || 0;

    // Formula: A = P(1 + r)^n
    const totalValue = P > 0 && n > 0 ? P * Math.pow(1 + r, n) : P;
    const estimatedReturns = totalValue - P;

    let chartData = [];
    if (P > 0 && n > 0) {
      for (let year = 1; year <= n; year++) {
        let yearlyValue = P * Math.pow(1 + r, year);
        chartData.push({
          year: year,
          invested: Math.round(P),
          returns: Math.round(yearlyValue - P),
          total: Math.round(yearlyValue),
        });
      }
    }

    onCalculate({
      investedAmount: Math.round(P),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue),
      chartData: chartData,
    });
  }, [totalInvestment, expectedReturnRate, timePeriod, onCalculate]);

  useEffect(() => {
    calculateLumpsum();
  }, [calculateLumpsum]);

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
        <LumpsumIcon
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
          Lumpsum Parameters
        </Typography>
      </Stack>

      {/* 1. Total Investment Input */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1} alignItems="flex-end" sx={{ mb: 0.5 }}>
          <Grid item xs={7}>
            <Typography sx={labelStyle}>Initial Investment</Typography>
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
                  textAlign: "right", // Keeps numbers aligned neatly
                },
              }}
              fullWidth
            />
          </Grid>
        </Grid>
        <Slider
          value={totalInvestment}
          min={5000}
          max={5000000}
          step={1000}
          onChange={(e, val) => onSharedStateChange("totalInvestment", val)}
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
          }}
        />
      </Box>
    </Box>
  );
};

export default LumpsumCalculatorForm;
