import React, {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Slider,
  Grid,
  Divider,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  MoneyOff as MoneyOffIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { selectCalculatedValues } from '../../emiCalculator/utils/emiCalculator';
import { selectExpectedReturnRate } from '../../../store/profileSlice';
import { selectCurrency } from '../../../store/emiSlice';
import { formatCurrency as utilFormatCurrency } from '../../../utils/formatting';
import SectionHeader from '../../../components/common/SectionHeader';

const DebtAccelerator = forwardRef((props, ref) => {
  const theme = useTheme();
  const calculatedValues = useSelector(selectCalculatedValues);
  const expectedReturnRate = useSelector(selectExpectedReturnRate);
  const currency = useSelector(selectCurrency);

  const [extraPayment, setExtraPayment] = useState(10000);

  const baseEmi = calculatedValues.emi || 0;
  const loanAmount = calculatedValues.loanAmount || 0;
  const monthlyInterestRate = (calculatedValues.interestRate || 8.5) / 12 / 100;

  // Safe formatting wrapper
  const formatCurrency = (val) => `${currency}${utilFormatCurrency(val)}`;

  const calculatePrepaymentImpact = (extraMonthly) => {
    let balance = loanAmount;
    let totalInterest = 0;
    let months = 0;

    if (balance <= 0 || baseEmi + extraMonthly <= 0)
      return { months: 0, interest: 0 };

    while (balance > 0 && months < 1200) {
      const interestForMonth = balance * monthlyInterestRate;
      totalInterest += interestForMonth;

      let principalForMonth = baseEmi + extraMonthly - interestForMonth;

      if (principalForMonth <= 0) {
        return { months: Infinity, interest: Infinity };
      }

      if (balance < principalForMonth) {
        principalForMonth = balance;
      }

      balance -= principalForMonth;
      months++;
    }

    return { months, interest: totalInterest };
  };

  const impactData = useMemo(() => {
    const baseImpact = calculatePrepaymentImpact(0);
    const newImpact = calculatePrepaymentImpact(extraPayment);

    const monthsSaved = Math.max(0, baseImpact.months - newImpact.months);
    const yearsSaved = (monthsSaved / 12).toFixed(1);
    const interestSaved = Math.max(0, baseImpact.interest - newImpact.interest);

    let investmentValue = 0;
    const monthlyReturnRate = expectedReturnRate / 12;
    for (let i = 0; i < baseImpact.months; i++) {
      investmentValue =
        (investmentValue + extraPayment) * (1 + monthlyReturnRate);
    }

    const investmentGains = investmentValue - extraPayment * baseImpact.months;

    return {
      yearsSaved,
      interestSaved,
      investmentGains,
      netDifference: investmentGains - interestSaved,
    };
  }, [
    extraPayment,
    loanAmount,
    baseEmi,
    monthlyInterestRate,
    expectedReturnRate,
  ]);

  const verdictData = useMemo(() => {
    const isInvestingBetter = impactData.netDifference > 0;
    return {
      isInvestingBetter,
      text: isInvestingBetter
        ? `Investing yields ${formatCurrency(Math.abs(impactData.netDifference))} more than prepaying.`
        : `Prepaying saves ${formatCurrency(Math.abs(impactData.netDifference))} more than investing.`,
      colorToken: isInvestingBetter
        ? theme.palette.success
        : theme.palette.info,
    };
  }, [impactData, theme]);

  useImperativeHandle(ref, () => ({
    getVerdict: () => verdictData.text,
  }));

  if (loanAmount <= 0) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        bgcolor: theme.palette.background.paper,
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black || '#000', 0.02)}`,
      }}
    >
      <SectionHeader
        title="Debt Accelerator"
        subtitle="Simulate the financial impact of paying extra towards your loan principal versus investing that surplus in the market."
        icon={<SpeedIcon />}
        color={theme.palette.primary.main}
      />

      {/* Input Configuration */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-end"
          sx={{ mb: 0.5 }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'text.secondary',
              letterSpacing: 0.5,
            }}
          >
            Extra Monthly Allocation
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 900, color: 'secondary.main' }}
          >
            {formatCurrency(extraPayment)}
          </Typography>
        </Stack>
        <Slider
          value={extraPayment}
          min={0}
          max={50000}
          step={1000}
          onChange={(e, val) => setExtraPayment(val)}
          color="secondary"
          sx={{
            py: 1,
            '& .MuiSlider-thumb': { width: 14, height: 14 },
            '& .MuiSlider-track': { height: 4 },
            '& .MuiSlider-rail': { height: 4, opacity: 0.2 },
          }}
        />
      </Box>

      {/* Comparison Engine */}
      <Grid container spacing={2}>
        {/* Invest Option */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.03),
              border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <TrendingUpIcon
                sx={{ color: 'success.main', fontSize: '1.2rem' }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: 'success.dark',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Invest in Market
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                display: 'block',
                mb: 2,
                lineHeight: 1.5,
              }}
            >
              Investing {formatCurrency(extraPayment)} monthly at an expected{' '}
              {Math.round(expectedReturnRate * 100)}% annualized return.
            </Typography>
            <Divider
              sx={{
                mb: 2,
                borderColor: alpha(theme.palette.success.main, 0.1),
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: 'text.disabled',
                textTransform: 'uppercase',
              }}
            >
              Total Estimated Gains
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: 'success.main',
                letterSpacing: -0.5,
                mt: 0.5,
              }}
            >
              +{formatCurrency(impactData.investmentGains)}
            </Typography>
          </Box>
        </Grid>

        {/* Prepay Option */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.03),
              border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
              position: 'relative',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <MoneyOffIcon sx={{ color: 'info.main', fontSize: '1.2rem' }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: 'info.dark',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Prepay Loan Principal
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                display: 'block',
                mb: 2,
                lineHeight: 1.5,
              }}
            >
              Directing {formatCurrency(extraPayment)} extra towards your
              outstanding loan balance.
            </Typography>
            <Divider
              sx={{ mb: 2, borderColor: alpha(theme.palette.info.main, 0.1) }}
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-end"
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: 'text.disabled',
                    textTransform: 'uppercase',
                  }}
                >
                  Total Interest Saved
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: 'info.main',
                    letterSpacing: -0.5,
                    mt: 0.5,
                  }}
                >
                  {formatCurrency(impactData.interestSaved)}
                </Typography>
              </Box>
              {impactData.yearsSaved > 0 && (
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 900, color: 'info.dark' }}
                  >
                    {impactData.yearsSaved} YRS SOONER
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* Dynamic Status Output Terminal */}
      <Box
        sx={{
          mt: 2.5,
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(verdictData.colorToken.main, 0.05),
          border: '1px dashed',
          borderColor: alpha(verdictData.colorToken.main, 0.3),
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            p: 0.5,
            borderRadius: 1,
            bgcolor: alpha(verdictData.colorToken.main, 0.1),
          }}
        >
          {verdictData.isInvestingBetter ? (
            <TrendingUpIcon
              sx={{ color: verdictData.colorToken.main }}
              fontSize="small"
            />
          ) : (
            <MoneyOffIcon
              sx={{ color: verdictData.colorToken.main }}
              fontSize="small"
            />
          )}
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              textTransform: 'uppercase',
              color: verdictData.colorToken.dark,
              letterSpacing: 0.5,
              display: 'block',
            }}
          >
            System Verdict
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: 'text.primary' }}
          >
            {verdictData.text}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

export default DebtAccelerator;
