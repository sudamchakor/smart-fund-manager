import React, { useEffect, useCallback } from 'react';
import { Box, Typography, useTheme, Stack } from '@mui/material';
import { SettingsInputComponent as SettingsIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrency } from '../../../store/emiSlice';
import InvestmentSlider from '../../../components/common/InvestmentSlider';

const StepUpSipCalculatorForm = ({
  onCalculate,
  sharedState,
  onSharedStateChange,
}) => {
  const theme = useTheme();
  const currency = useSelector(selectCurrency) || '₹';

  const {
    initialMonthlyInvestment,
    stepUpPercentage,
    expectedReturnRate,
    timePeriod,
  } = sharedState;

  const calculateStepUpSip = useCallback(() => {
    const P = initialMonthlyInvestment || 0;
    const annualIncrease = stepUpPercentage || 0;
    const years = timePeriod || 0;
    const annualRate = expectedReturnRate || 0;
    const i = annualRate / 100 / 12;
    const r = annualIncrease / 100;

    let totalValue = 0;
    let totalInvestment = 0;
    let chartData = [];

    if (P > 0 && years > 0) {
      let currentInvestment = P;
      for (let year = 1; year <= years; year++) {
        let yearlyInvestment = 0;
        for (let month = 1; month <= 12; month++) {
          totalValue = totalValue * (1 + i) + currentInvestment;
          yearlyInvestment += currentInvestment;
        }
        totalInvestment += yearlyInvestment;
        currentInvestment *= 1 + r;

        chartData.push({
          year: year,
          invested: Math.round(totalInvestment),
          returns: Math.round(totalValue - totalInvestment),
          total: Math.round(totalValue),
        });
      }
    }

    onCalculate({
      investedAmount: Math.round(totalInvestment),
      estimatedReturns: Math.round(totalValue - totalInvestment),
      totalValue: Math.round(totalValue),
      initialMonthlyInvestment: initialMonthlyInvestment,
      chartData: chartData,
    });
  }, [
    initialMonthlyInvestment,
    stepUpPercentage,
    expectedReturnRate,
    timePeriod,
    onCalculate,
  ]);

  useEffect(() => {
    calculateStepUpSip();
  }, [calculateStepUpSip]);

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
          Step-Up SIP Parameters
        </Typography>
      </Stack>

      <InvestmentSlider
        label="Initial Monthly SIP"
        value={initialMonthlyInvestment}
        min={500}
        max={100000}
        step={500}
        onChange={(val) => onSharedStateChange('initialMonthlyInvestment', val)}
        color="primary"
        adornment={currency}
        adornmentPosition="start"
      />

      <InvestmentSlider
        label="Annual Step-Up (%)"
        value={stepUpPercentage}
        min={1}
        max={25}
        step={1}
        onChange={(val) => onSharedStateChange('stepUpPercentage', val)}
        color="secondary"
        adornment="%"
        adornmentPosition="end"
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

export default StepUpSipCalculatorForm;
