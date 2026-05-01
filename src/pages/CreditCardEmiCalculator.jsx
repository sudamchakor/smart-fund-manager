import React, { useState, useEffect } from "react";
import {
  Box,
  Slider,
  Typography,
  Grid,
  Stack,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import { CreditCard as CreditCardIcon } from "@mui/icons-material";

const CreditCardEMICalculator = () => {
  const theme = useTheme();

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

  // Shared styles for the "Command Center" labels
  const labelStyle = {
    fontWeight: 800,
    textTransform: "uppercase",
    fontSize: "0.75rem",
    color: "text.secondary",
    letterSpacing: 0.5,
  };

  // Shared styles for the tinted input wells
  const inputWellStyle = {
    fontWeight: 900,
    fontSize: "0.95rem",
    bgcolor: alpha(theme.palette.primary.main, 0.05),
    color: "primary.main",
    px: 1.5,
    py: 0.5,
    borderRadius: 2,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.1),
        bgcolor: theme.palette.background.paper,
        boxShadow: `0 4px 24px ${alpha(theme.palette.common.black || "#000", 0.02)}`,

        mx: "auto",
      }}
    >
      {/* Technical Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
          }}
        >
          <CreditCardIcon fontSize="medium" />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 900, color: "text.primary", letterSpacing: -0.5 }}
          >
            Credit Card EMI Calculator
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.secondary" }}
          >
            Simulate the exact cost and monthly liability of converting card
            purchases to EMI.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={5}>
        {/* Input Configuration Section */}
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            {/* 1. Amount Configuration */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >
                <Typography sx={labelStyle}>Principal Amount</Typography>
                <TextField
                  variant="standard"
                  size="small"
                  value={amount}
                  onChange={handleInputChange(setAmount, minAmount, maxAmount)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{
                          "& p": { fontWeight: 900, color: "primary.main" },
                        }}
                      >
                        ₹
                      </InputAdornment>
                    ),
                    disableUnderline: true,
                    sx: inputWellStyle,
                  }}
                  sx={{ width: 140 }}
                />
              </Stack>
              <Slider
                value={amount}
                min={minAmount}
                max={maxAmount}
                step={5000}
                onChange={(e, v) => setAmount(v)}
                color="primary"
                sx={{
                  py: 1,
                  "& .MuiSlider-thumb": { width: 14, height: 14 },
                  "& .MuiSlider-track": { height: 4 },
                  "& .MuiSlider-rail": { height: 4, opacity: 0.2 },
                }}
              />
            </Box>

            {/* 2. Interest Configuration */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >
                <Typography sx={labelStyle}>Interest Rate (P.A.)</Typography>
                <TextField
                  variant="standard"
                  size="small"
                  value={interest}
                  onChange={handleInputChange(
                    setInterest,
                    minInterest,
                    maxInterest,
                  )}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        sx={{
                          "& p": { fontWeight: 900, color: "primary.main" },
                        }}
                      >
                        %
                      </InputAdornment>
                    ),
                    disableUnderline: true,
                    sx: inputWellStyle,
                  }}
                  sx={{ width: 140 }}
                />
              </Stack>
              <Slider
                value={interest}
                min={minInterest}
                max={maxInterest}
                step={0.1}
                onChange={(e, v) => setInterest(v)}
                color="primary"
                sx={{
                  py: 1,
                  "& .MuiSlider-thumb": { width: 14, height: 14 },
                  "& .MuiSlider-track": { height: 4 },
                  "& .MuiSlider-rail": { height: 4, opacity: 0.2 },
                }}
              />
            </Box>

            {/* 3. Tenure Configuration */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >
                <Typography sx={labelStyle}>Tenure (Years)</Typography>
                <TextField
                  variant="standard"
                  size="small"
                  value={tenure}
                  onChange={handleInputChange(setTenure, minTenure, maxTenure)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        sx={{
                          "& p": { fontWeight: 900, color: "primary.main" },
                        }}
                      >
                        YRS
                      </InputAdornment>
                    ),
                    disableUnderline: true,
                    sx: inputWellStyle,
                  }}
                  sx={{ width: 140 }}
                />
              </Stack>
              <Slider
                value={tenure}
                min={minTenure}
                max={maxTenure}
                onChange={(e, v) => setTenure(v)}
                color="primary"
                sx={{
                  py: 1,
                  "& .MuiSlider-thumb": { width: 14, height: 14 },
                  "& .MuiSlider-track": { height: 4 },
                  "& .MuiSlider-rail": { height: 4, opacity: 0.2 },
                }}
              />
            </Box>
          </Stack>
        </Grid>

        {/* Dynamic Status Output Terminal */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderRadius: 3,
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              border: "1px dashed",
              borderColor: alpha(theme.palette.primary.main, 0.2),
            }}
          >
            <Typography
              variant="caption"
              align="center"
              sx={{
                fontWeight: 800,
                textTransform: "uppercase",
                color: "text.secondary",
                letterSpacing: 1,
              }}
              gutterBottom
            >
              Liability Summary
            </Typography>

            <Box textAlign="center" sx={{ my: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "text.disabled",
                  letterSpacing: 0.5,
                  display: "block",
                  mb: 0.5,
                }}
              >
                Monthly EMI
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  color: "primary.main",
                  letterSpacing: -1,
                }}
              >
                ₹ {emi.toLocaleString("en-IN")}
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ mt: 2 }}>
              {/* Interest Burden */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "text.secondary" }}
                >
                  Total Interest Burden
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 900, color: "error.main" }}
                >
                  ₹ {totalInterest.toLocaleString("en-IN")}
                </Typography>
              </Stack>

              <Divider
                sx={{ borderColor: alpha(theme.palette.divider, 0.1) }}
              />

              {/* Total Payable */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, color: "text.primary" }}
                >
                  Total Amount Payable
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, color: "text.primary" }}
                >
                  ₹ {totalPayable.toLocaleString("en-IN")}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreditCardEMICalculator;
