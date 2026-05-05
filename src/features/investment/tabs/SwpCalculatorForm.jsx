import React, { useEffect, useCallback } from 'react';
import { Box, Typography, useTheme, Stack } from '@mui/material';
import { AccountBalanceWallet as SwpIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrency } from '../../../store/emiSlice';
import InvestmentSlider from '../../../components/common/InvestmentSlider';

const SwpCalculatorForm = ({
  onCalculate,
  sharedState,
  onSharedStateChange,
}) => {
  const theme = useTheme();
  const currency = useSelector(selectCurrency) || '₹';

  const {
    totalInvestment,
    withdrawalPerMonth,
    expectedReturnRate,
    timePeriod,
  } = sharedState;

  const calculateSwp = useCallback(() => {
    const P = parseFloat(totalInvestment) || 0;
    const W = parseFloat(withdrawalPerMonth) || 0;
    const n = (parseFloat(timePeriod) || 0) * 12;
    const i = (parseFloat(expectedReturnRate) || 0) / 100 / 12;

    let finalBalance = 0;
    let totalWithdrawn = 0;
    let totalInterest = 0;

    if (P > 0 && n > 0) {
      if (i > 0) {
        const r_plus_1_pow_n = Math.pow(1 + i, n);
        finalBalance = P * r_plus_1_pow_n - W * ((r_plus_1_pow_n - 1) / i);
      } else {
        // If rate is 0, it's just principal minus withdrawals
        finalBalance = P - W * n;
      }
      totalWithdrawn = W * n;
    }

    finalBalance = Math.max(0, finalBalance);
    totalInterest = finalBalance + totalWithdrawn - P;

    // Sanitize outputs to prevent NaN or Infinity
    const sanitizedResults = {
      investedAmount: isFinite(P) ? Math.round(P) : 0,
      estimatedReturns: isFinite(totalInterest) ? Math.round(totalInterest) : 0,
      totalValue: isFinite(finalBalance) ? Math.round(finalBalance) : 0,
      totalWithdrawn: isFinite(totalWithdrawn) ? Math.round(totalWithdrawn) : 0,
      chartData: [], // Chart data generation can be added back if needed
    };
    console.log('Sudam 1', sanitizedResults);

    onCalculate(sanitizedResults);
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

  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <SwpIcon
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
          SWP Configuration
        </Typography>
      </Stack>

      <InvestmentSlider
        label="Initial Corpus"
        value={totalInvestment}
        min={50000}
        max={50000000}
        step={10000}
        onChange={(val) => onSharedStateChange('totalInvestment', val)}
        color="primary"
        adornment={currency}
        adornmentPosition="start"
      />

      <InvestmentSlider
        label="Monthly Payout"
        value={withdrawalPerMonth}
        min={500}
        max={100000}
        step={500}
        onChange={(val) => onSharedStateChange('withdrawalPerMonth', val)}
        color="warning"
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
        label="Payout Duration"
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

export default SwpCalculatorForm;
