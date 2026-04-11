import React, { useState, useEffect } from "react";
import {
  Box,
  Slider,
  TextField,
  Typography,
  Grid,
  Paper,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEmiContext } from "../context/EmiContext";
import { themes } from "../components/ThemeSelector";

// Custom Styled Slider
const BrandSlider = styled(Slider)(({ theme: muiTheme }) => ({
  color: muiTheme.palette.primary.main,
  height: 6,
  "& .MuiSlider-thumb": {
    height: 20,
    width: 20,
    backgroundColor: muiTheme.palette.primary.main,
    border: "2px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
  },
  "& .MuiSlider-track": {
    height: 6,
  },
  "& .MuiSlider-rail": {
    color: "#d1d1d1",
    height: 6,
  },
}));

const PersonalLoanCalculator = () => {
  const { themeMode } = useEmiContext();
  const getThemeColor = () => {
    let currentThemeValue = themeMode;
    if (currentThemeValue === "light") {
      currentThemeValue = "dodgerblue";
    }
    const selectedTheme = themes.find((t) => t.value === currentThemeValue) || themes[0];
    return selectedTheme.colors[0]; // primary color
  };
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenure, setTenure] = useState(5);

  const [details, setDetails] = useState({
    monthlyEmi: 0,
    totalInterest: 0,
    totalPayment: 0,
  });

  useEffect(() => {
    const p = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInt = totalPayable - p;

    setDetails({
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInt),
      totalPayment: Math.round(totalPayable),
    });
  }, [loanAmount, interestRate, tenure]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 4,
        border: "1px solid #eee",
        bgcolor: "background.paper",
      }}
    >
      <Grid container spacing={8}>
        {/* Left Side: Input Controls */}
        <Grid item xs={12} md={7}>
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ mb: 4, color: "text.primary" }}
          >
            Personal Loan Details
          </Typography>

          {/* Loan Amount */}
          <Box sx={{ mb: 5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="body1" fontWeight="500">
                Loan Amount
              </Typography>
              <TextField
                size="small"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
                sx={{
                  width: 140,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Box>
            <BrandSlider
              value={loanAmount}
              min={50000}
              max={5000000}
              step={10000}
              onChange={(e, val) => setLoanAmount(val)}
            />
          </Box>

          {/* Interest Rate */}
          <Box sx={{ mb: 5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="body1" fontWeight="500">
                Interest Rate (p.a)
              </Typography>
              <TextField
                size="small"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                sx={{
                  width: 100,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Box>
            <BrandSlider
              value={interestRate}
              min={5}
              max={25}
              step={0.1}
              onChange={(e, val) => setInterestRate(val)}
            />
          </Box>

          {/* Tenure */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="body1" fontWeight="500">
                Tenure (Years)
              </Typography>
              <TextField
                size="small"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">Yr</InputAdornment>
                  ),
                }}
                sx={{
                  width: 100,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Box>
            <BrandSlider
              value={tenure}
              min={1}
              max={15}
              step={1}
              onChange={(e, val) => setTenure(val)}
            />
          </Box>
        </Grid>

        {/* Right Side: Visual Summary */}
        <Grid item xs={12} md={5}>
          <Typography
            variant="h6"
            fontWeight="600"
            sx={{ mb: 4, color: "text.primary" }}
          >
            Loan Summary
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Monthly EMI
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                ₹ {details.monthlyEmi.toLocaleString("en-IN")}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="textSecondary">
                Total Interest
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ color: "#2e7d32" }}
              >
                ₹ {details.totalInterest.toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="caption" color="textSecondary">
              Total Payable
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#9c27b0" }}
            >
              ₹ {details.totalPayment.toLocaleString("en-IN")}
            </Typography>
          </Box>

          {/* Placeholder for your Chart */}
          <Paper
            variant="outlined"
            sx={{
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 3,
              borderStyle: "dashed",
              bgcolor: "#fafafa",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Chart Visualization
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PersonalLoanCalculator;
