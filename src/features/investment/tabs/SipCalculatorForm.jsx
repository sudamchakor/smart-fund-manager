import React, { useEffect, useCallback } from 'react';
import { Box, Typography, useTheme, Stack } from '@mui/material';
import { SettingsInputComponent as SettingsIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrency } from '../../../store/emiSlice';
import InvestmentSlider from '../../../components/common/InvestmentSlider';

const SipCalculatorForm = ({
  onCalculate,
  sharedState,
  onSharedStateChange,
}) => {
  const theme = useTheme();
  const currency = useSelector(selectCurrency) || '₹';

  const { monthlyInvestment, expectedReturnRate, timePeriod } = sharedState;

  const calculateSip = useCallback(() => {
    const P = monthlyInvestment || 0;
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

  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <SettingsIcon
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
          SIP Parameters
        </Typography>
      </Stack>

      <InvestmentSlider
        label="Monthly Investment"
        value={monthlyInvestment}
        min={500}
        max={100000}
        step={500}
        onChange={(val) => onSharedStateChange('monthlyInvestment', val)}
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

export default SipCalculatorForm;
