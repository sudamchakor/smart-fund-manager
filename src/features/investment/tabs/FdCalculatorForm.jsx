import React, { useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  alpha,
  useTheme,
  Stack,
} from '@mui/material';
import { AccountBalance as FdIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrency } from '../../../store/emiSlice';
import InvestmentSlider, {
  investmentLabelStyle,
} from '../../../components/common/InvestmentSlider';

const FdCalculatorForm = ({
  onCalculate,
  sharedState,
  onSharedStateChange,
}) => {
  const theme = useTheme();
  // Wire up the global currency setting
  const currency = useSelector(selectCurrency) || '₹';

  // Provide fallbacks in case the plan is newly created
  const {
    principalAmount = 100000,
    interestRate = 7,
    timePeriod = 5,
    compoundingFrequency = 'annually',
  } = sharedState || {};

  const calculateFd = useCallback(() => {
    // Safe fallbacks to prevent NaN crashes if inputs are cleared
    const P = principalAmount || 0;
    const r = (interestRate || 0) / 100;
    const t = timePeriod || 0;

    // Determine compounds per year based on frequency
    let n = 1;
    if (compoundingFrequency === 'quarterly') n = 4;
    else if (compoundingFrequency === 'half-yearly') n = 2;
    else if (compoundingFrequency === 'monthly') n = 12;

    // Compound Interest Formula: A = P(1 + r/n)^(nt)
    const totalValue = P > 0 && t > 0 ? P * Math.pow(1 + r / n, n * t) : P;
    const estimatedReturns = totalValue - P;

    let chartData = [];
    if (P > 0 && t > 0) {
      for (let year = 1; year <= t; year++) {
        let yearlyValue = P * Math.pow(1 + r / n, n * year);
        chartData.push({
          year: year,
          invested: Math.round(P),
          returns: Math.round(yearlyValue - P),
          total: Math.round(yearlyValue),
        });
      }
    }

    if (typeof onCalculate === 'function') {
      onCalculate({
        investedAmount: Math.round(P),
        estimatedReturns: Math.round(estimatedReturns),
        totalValue: Math.round(totalValue),
        chartData: chartData,
      });
    }
  }, [
    principalAmount,
    interestRate,
    timePeriod,
    compoundingFrequency,
    onCalculate,
  ]);

  useEffect(() => {
    calculateFd();
  }, [calculateFd]);

  return (
    <Box sx={{ mt: 1 }}>
      {/* Internal Subsection Header */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <FdIcon
          sx={{
            fontSize: '1rem',
            color: theme.palette.primary.main,
            opacity: 0.8,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 900,
            color: 'text.primary',
            textTransform: 'uppercase',
          }}
        >
          Fixed Deposit Parameters
        </Typography>
      </Stack>

      <InvestmentSlider
        label="Principal Amount"
        value={principalAmount}
        min={10000}
        max={5000000}
        step={5000}
        onChange={(val) => onSharedStateChange('principalAmount', val)}
        color="primary"
        adornment={currency}
        adornmentPosition="start"
      />

      <InvestmentSlider
        label="Interest Rate (p.a)"
        value={interestRate}
        min={1}
        max={15}
        step={0.1}
        onChange={(val) => onSharedStateChange('interestRate', val)}
        color="success"
        adornment="%"
        adornmentPosition="end"
      />

      <InvestmentSlider
        label="Duration (Years)"
        value={timePeriod}
        min={1}
        max={20}
        step={1}
        onChange={(val) => onSharedStateChange('timePeriod', val)}
        color="info"
        adornment="Yr"
        adornmentPosition="end"
      />

      {/* 4. Compounding Frequency (Dropdown Well) */}
      <Box sx={{ mb: 1 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={6}>
            <Typography sx={investmentLabelStyle}>Compounding</Typography>
          </Grid>
          <Grid item xs={6}>
            <Select
              variant="standard"
              value={compoundingFrequency}
              onChange={(e) =>
                onSharedStateChange('compoundingFrequency', e.target.value)
              }
              disableUnderline
              sx={{
                width: '100%',
                fontWeight: 900,
                fontSize: '0.85rem',
                bgcolor: alpha(theme.palette.secondary.main, 0.05),
                color: theme.palette.secondary.main,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                '& .MuiSelect-select': { paddingRight: '24px !important' },
              }}
            >
              <MenuItem value="annually">Annually</MenuItem>
              <MenuItem value="half-yearly">Half-Yearly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default FdCalculatorForm;
