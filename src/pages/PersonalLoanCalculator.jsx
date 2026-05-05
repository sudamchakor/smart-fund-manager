import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  useTheme,
  alpha,
  Stack,
  Divider,
} from '@mui/material';
import { Payments as LoanIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrency } from '../store/emiSlice'; // Assumes you have this based on previous files
import PageHeader from '../components/common/PageHeader';
import InputSlider from '../components/common/InputSlider';
import LoanSummaryTerminal from '../components/common/LoanSummaryTerminal';

const PersonalLoanCalculator = () => {
  const theme = useTheme();
  const currency = useSelector(selectCurrency) || '₹';

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
        title="Personal Loan Details"
        subtitle="Configure unsecured debt parameters to calculate monthly liabilities."
        icon={LoanIcon}
      />

      <Grid container spacing={5}>
        {/* Left Side: Input Controls */}
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            <InputSlider
              label="Loan Amount"
              value={loanAmount}
              min={50000}
              max={5000000}
              step={10000}
              onChange={setLoanAmount}
              adornment={currency}
              adornmentPosition="start"
            />

            <InputSlider
              label="Interest Rate (p.a)"
              value={interestRate}
              min={5}
              max={25}
              step={0.1}
              onChange={setInterestRate}
              adornment="%"
              adornmentPosition="end"
            />

            <InputSlider
              label="Tenure (Years)"
              value={tenure}
              min={1}
              max={15}
              step={1}
              onChange={setTenure}
              adornment="YRS"
              adornmentPosition="end"
            />
          </Stack>
        </Grid>

        {/* Right Side: Dynamic Status Output Terminal */}
        <Grid item xs={12} md={5}>
          <LoanSummaryTerminal
            title="Loan Summary"
            monthlyEmi={details.monthlyEmi}
            totalInterest={details.totalInterest}
            totalPayable={details.totalPayment}
            currency={currency}
            loading={loading}
          >
            {/* Placeholder for Chart */}
            <Box
              sx={{
                mt: 4,
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
                bgcolor: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Chart Visualization Region
              </Typography>
            </Box>
          </LoanSummaryTerminal>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalLoanCalculator;
