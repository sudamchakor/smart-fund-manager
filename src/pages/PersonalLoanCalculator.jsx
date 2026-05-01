import React, { useState, useEffect } from "react";
import {
  Box,
  Slider,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  CircularProgress,
  useTheme,
  alpha,
  Stack,
  Divider,
} from "@mui/material";
import { Payments as LoanIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectCurrency } from "../store/emiSlice"; // Assumes you have this based on previous files

const PersonalLoanCalculator = () => {
  const theme = useTheme();
  const currency = useSelector(selectCurrency) || "₹";

  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenure, setTenure] = useState(5);

  const [details, setDetails] = useState({
    monthlyEmi: 0,
    totalInterest: 0,
    totalPayment: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const p = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;

    if (r === 0) {
      setDetails({
        monthlyEmi: Math.round(p / n),
        totalInterest: 0,
        totalPayment: p,
      });
      setLoading(false);
      return;
    }

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInt = totalPayable - p;

    setDetails({
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInt),
      totalPayment: Math.round(totalPayable),
    });
    setLoading(false);
  }, [loanAmount, interestRate, tenure]);

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
          <LoanIcon fontSize="medium" />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 900, color: "text.primary", letterSpacing: -0.5 }}
          >
            Personal Loan Details
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.secondary" }}
          >
            Configure unsecured debt parameters to calculate monthly
            liabilities.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={5}>
        {/* Left Side: Input Controls */}
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            {/* 1. Loan Amount */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >
                <Typography sx={labelStyle}>Loan Amount</Typography>
                <TextField
                  variant="standard"
                  size="small"
                  value={loanAmount}
                  onChange={handleInputChange(setLoanAmount)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{
                          "& p": { fontWeight: 900, color: "primary.main" },
                        }}
                      >
                        {currency}
                      </InputAdornment>
                    ),
                    disableUnderline: true,
                    sx: inputWellStyle,
                  }}
                  sx={{ width: 140 }}
                />
              </Stack>
              <Slider
                value={loanAmount}
                min={50000}
                max={5000000}
                step={10000}
                onChange={(e, val) => setLoanAmount(val)}
                color="primary"
                sx={{
                  py: 1,
                  "& .MuiSlider-thumb": { width: 14, height: 14 },
                  "& .MuiSlider-track": { height: 4 },
                  "& .MuiSlider-rail": { height: 4, opacity: 0.2 },
                }}
              />
            </Box>

            {/* 2. Interest Rate */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >
                <Typography sx={labelStyle}>Interest Rate (p.a)</Typography>
                <TextField
                  variant="standard"
                  size="small"
                  value={interestRate}
                  onChange={handleInputChange(setInterestRate)}
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
                value={interestRate}
                min={5}
                max={25}
                step={0.1}
                onChange={(e, val) => setInterestRate(val)}
                color="primary"
                sx={{
                  py: 1,
                  "& .MuiSlider-thumb": { width: 14, height: 14 },
                  "& .MuiSlider-track": { height: 4 },
                  "& .MuiSlider-rail": { height: 4, opacity: 0.2 },
                }}
              />
            </Box>

            {/* 3. Tenure */}
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
                  onChange={handleInputChange(setTenure)}
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
                min={1}
                max={15}
                step={1}
                onChange={(e, val) => setTenure(val)}
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

        {/* Right Side: Dynamic Status Output Terminal */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              position: "relative",
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderRadius: 3,
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              border: "1px dashed",
              borderColor: alpha(theme.palette.primary.main, 0.2),
              overflow: "hidden",
            }}
          >
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: "blur(4px)",
                  zIndex: 10,
                }}
              >
                <CircularProgress color="primary" />
              </Box>
            )}

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
              Loan Summary
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
                {currency} {details.monthlyEmi.toLocaleString("en-IN")}
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
                  sx={{ fontWeight: 900, color: "warning.main" }}
                >
                  {currency} {details.totalInterest.toLocaleString("en-IN")}
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
                  {currency} {details.totalPayment.toLocaleString("en-IN")}
                </Typography>
              </Stack>
            </Stack>

            {/* Placeholder for Chart */}
            <Box
              sx={{
                mt: 4,
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
                bgcolor: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.disabled",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Chart Visualization Region
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalLoanCalculator;
