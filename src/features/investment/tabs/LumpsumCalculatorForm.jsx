import React, { useEffect, useCallback } from 'react';
import { Box, Typography, useTheme, Stack } from '@mui/material';
import { Toll as LumpsumIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrency } from '../../../store/emiSlice';
import InvestmentSlider from '../../../components/common/InvestmentSlider';

const LumpsumCalculatorForm = ({
  onCalculate,
  sharedState,
  onSharedStateChange,
}) => {
  const theme = useTheme();
  // Wire up the global currency setting
  const currency = useSelector(selectCurrency) || '₹';

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

  return (
    <Box sx={{ mt: 1 }}>
      {/* Internal Subsection Header */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <LumpsumIcon
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
          Lumpsum Parameters
        </Typography>
      </Stack>

      <InvestmentSlider
        label="Initial Investment"
        value={totalInvestment}
        min={5000}
        max={5000000}
        step={1000}
        onChange={(val) => onSharedStateChange('totalInvestment', val)}
        color="primary"
        adornment={currency}
        adornmentPosition="start"
      />

      <InvestmentSlider
        label="Expected Returns (p.a)"
        value={expectedReturnRate}
        min={1}
        max={30}
        step={0.1}
        onChange={(val) => onSharedStateChange('expectedReturnRate', val)}
        color="success"
        adornment="%"
        adornmentPosition="end"
      />

      <InvestmentSlider
        label="Duration (Years)"
        value={timePeriod}
        min={1}
        max={40}
        step={1}
        onChange={(val) => onSharedStateChange('timePeriod', val)}
        color="info"
        adornment="Yr"
        adornmentPosition="end"
      />
    </Box>
  );
};

export default LumpsumCalculatorForm;
