import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Stack, useTheme, alpha } from '@mui/material';
import { CreditCard as CreditCardIcon } from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import InputSlider from '../components/common/InputSlider';
import LoanSummaryTerminal from '../components/common/LoanSummaryTerminal';

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

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        bgcolor: theme.palette.background.paper,
        boxShadow: `0 4px 24px ${alpha(theme.palette.common.black || '#000', 0.02)}`,

        mx: 'auto',
      }}
    >
      <PageHeader
        title="Credit Card EMI Calculator"
        subtitle="Simulate the exact cost and monthly liability of converting card purchases to EMI."
        icon={CreditCardIcon}
      />

      <Grid container spacing={5}>
        {/* Input Configuration Section */}
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            <InputSlider
              label="Principal Amount"
              value={amount}
              min={minAmount}
              max={maxAmount}
              step={5000}
              onChange={setAmount}
              adornment="₹"
              adornmentPosition="start"
            />

            <InputSlider
              label="Interest Rate (P.A.)"
              value={interest}
              min={minInterest}
              max={maxInterest}
              step={0.1}
              onChange={setInterest}
              adornment="%"
              adornmentPosition="end"
            />

            <InputSlider
              label="Tenure (Years)"
              value={tenure}
              min={minTenure}
              max={maxTenure}
              step={1}
              onChange={setTenure}
              adornment="YRS"
              adornmentPosition="end"
            />
          </Stack>
        </Grid>

        {/* Dynamic Status Output Terminal */}
        <Grid item xs={12} md={5}>
          <LoanSummaryTerminal
            title="Liability Summary"
            monthlyEmi={emi}
            totalInterest={totalInterest}
            totalPayable={totalPayable}
            interestColor="error.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreditCardEMICalculator;
