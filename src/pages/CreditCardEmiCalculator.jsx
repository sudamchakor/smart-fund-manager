import React, { useState, useEffect } from "react";
import {
  Box,
  Slider,
  Typography,
  Card,
  Grid,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useEmiContext } from "../context/EmiContext";
import { themes } from "../components/ThemeSelector";

const CreditCardEMICalculator = () => {
  const { themeMode } = useEmiContext();
  const getThemeColor = () => {
    let currentThemeValue = themeMode;
    if (currentThemeValue === "light") {
      currentThemeValue = "dodgerblue";
    }
    const selectedTheme = themes.find((t) => t.value === currentThemeValue) || themes[0];
    return selectedTheme.colors[0]; // primary color
  };
  // State for inputs
  const [amount, setAmount] = useState(500000);
  const [interest, setInterest] = useState(10.5);
  const [tenure, setTenure] = useState(5);

  // State for outputs
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);

  // Constants for ranges
  const minAmount = 10000;
  const maxAmount = 2000000;
  const minInterest = 1;
  const maxInterest = 30;
  const minTenure = 1;
  const maxTenure = 30;

  useEffect(() => {
    const calculateEMI = () => {
      const p = amount;
      const r = interest / 12 / 100; // monthly interest rate
      const n = tenure * 12; // tenure in months

      if (r === 0) {
        setEmi(Math.round(p / n));
        setTotalInterest(0);
        setTotalPayable(p);
        return;
      }

      // EMI Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
      const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayableValue = emiValue * n;

      setEmi(Math.round(emiValue));
      setTotalInterest(Math.round(totalPayableValue - p));
      setTotalPayable(Math.round(totalPayableValue));
    };

    calculateEMI();
  }, [amount, interest, tenure]);

  const handleInputChange = (setter, min, max) => (e) => {
    let value = e.target.value === "" ? "" : Number(e.target.value);
    setter(value);
  };

  return (
    <Card
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: 4,
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        bgcolor: "background.paper",
      }}
    >
      <Grid container spacing={4}>
        {/* Input Section */}
        <Grid item xs={12} md={7}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 700, color: getThemeColor(), mb: 3 }}
          >
            Credit Card EMI Calculator
          </Typography>

          <Stack spacing={4}>
            {/* Amount Slider */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="subtitle1" fontWeight="500">
                  Loan Amount
                </Typography>
                <TextField
                  size="small"
                  value={amount}
                  onChange={handleInputChange(setAmount, minAmount, maxAmount)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  sx={{ width: 130 }}
                />
              </Stack>
               <Slider
                 value={amount}
                 min={minAmount}
                 max={maxAmount}
                 step={5000}
                 onChange={(e, v) => setAmount(v)}
                 sx={{ color: getThemeColor() }}
               />
            </Box>

            {/* Interest Slider */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="subtitle1" fontWeight="500">
                  Interest Rate (p.a %)
                </Typography>
                <TextField
                  size="small"
                  value={interest}
                  onChange={handleInputChange(
                    setInterest,
                    minInterest,
                    maxInterest,
                  )}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  sx={{ width: 130 }}
                />
              </Stack>
               <Slider
                 value={interest}
                 min={minInterest}
                 max={maxInterest}
                 step={0.1}
                 onChange={(e, v) => setInterest(v)}
                 sx={{ color: getThemeColor() }}
               />
            </Box>

            {/* Tenure Slider */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="subtitle1" fontWeight="500">
                  Tenure (Years)
                </Typography>
                <TextField
                  size="small"
                  value={tenure}
                  onChange={handleInputChange(setTenure, minTenure, maxTenure)}
                  sx={{ width: 130 }}
                />
              </Stack>
               <Slider
                 value={tenure}
                 min={minTenure}
                 max={maxTenure}
                 onChange={(e, v) => setTenure(v)}
                 sx={{ color: getThemeColor() }}
               />
            </Box>
          </Stack>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={5}>
          <Box
             sx={{
               bgcolor: "background.paper",
               borderRadius: 3,
               p: 3,
               height: "100%",
               display: "flex",
               flexDirection: "column",
               justifyContent: "center",
               border: "1px solid",
               borderColor: "divider",
             }}
           >
            <Typography
              variant="h6"
              align="center"
              color="textSecondary"
              gutterBottom
            >
              Loan Summary
            </Typography>

            <Box textAlign="center" sx={{ my: 3 }}>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textTransform: "uppercase", letterSpacing: 1 }}
              >
                Monthly EMI
              </Typography>
              <Typography variant="h3" color="#2e7d32" sx={{ fontWeight: 800 }}>
                ₹ {emi.toLocaleString("en-IN")}
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ mt: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="textSecondary">Total Interest</Typography>
                <Typography fontWeight="700">
                  ₹ {totalInterest.toLocaleString("en-IN")}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ pt: 2, borderTop: "1px solid #eee" }}
              >
                <Typography color="textSecondary">Total Payable</Typography>
                <Typography fontWeight="700">
                  ₹ {totalPayable.toLocaleString("en-IN")}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};

export default CreditCardEMICalculator;
