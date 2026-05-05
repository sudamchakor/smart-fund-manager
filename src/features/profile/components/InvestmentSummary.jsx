import React from 'react';
import { Box, Typography, Grid, alpha, useTheme } from '@mui/material';
import {
  ErrorOutline as WarningIcon,
  CheckCircleOutline as SuccessIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCurrency } from '../../../store/emiSlice';

const DataPoint = ({ label, value, color, isLast }) => {
  const theme = useTheme();
  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={3}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'column' },
        justifyContent: { xs: 'space-between', sm: 'center' },
        alignItems: { xs: 'center', sm: 'center' },
        py: { xs: 1, sm: 0 },
        // Zebra striping for mobile view
        borderBottom: {
          xs: isLast
            ? 'none'
            : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          sm: 'none',
        },
        px: 2,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: 'text.disabled',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          fontSize: '0.65rem',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: '1rem',
          color: color || 'text.primary',
          letterSpacing: -0.2,
        }}
      >
        {value}
      </Typography>
    </Grid>
  );
};

const InvestmentSummary = ({ plans, targetAmount }) => {
  const theme = useTheme();
  const currency = useSelector(selectCurrency) || '₹';

  const totalInvested = plans.reduce(
    (sum, p) => sum + (p.investedAmount || 0),
    0,
  );
  const totalReturns = plans.reduce(
    (sum, p) => sum + (p.estimatedReturns || 0),
    0,
  );
  const totalValue = plans.reduce((sum, p) => sum + (p.totalValue || 0), 0);
  const maxTime = plans.reduce((max, p) => Math.max(max, p.timePeriod || 0), 0);

  // Mismatch logic: Highlight if we are short of the target
  const isShort = totalValue < (targetAmount || 0);

  const formatAmount = (amount) =>
    `${currency} ${(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <Box
      sx={{
        mt: 2,
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: isShort
          ? alpha(theme.palette.error.main, 0.3)
          : alpha(theme.palette.divider, 0.1),
        bgcolor: isShort
          ? alpha(theme.palette.error.main, 0.02)
          : alpha(theme.palette.background.paper, 0.5),
        transition: 'all 0.3s ease',
      }}
    >
      {/* 1. Technical Alert Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: isShort
            ? alpha(theme.palette.error.main, 0.05)
            : alpha(theme.palette.success.main, 0.05),
          borderBottom: '1px solid',
          borderColor: isShort
            ? alpha(theme.palette.error.main, 0.1)
            : alpha(theme.palette.success.main, 0.1),
        }}
      >
        {isShort ? (
          <WarningIcon
            sx={{ fontSize: '1rem', color: theme.palette.error.main }}
          />
        ) : (
          <SuccessIcon
            sx={{ fontSize: '1rem', color: theme.palette.success.main }}
          />
        )}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: isShort
              ? theme.palette.error.dark
              : theme.palette.success.dark,
          }}
        >
          {isShort
            ? `Funding Gap: ${formatAmount(targetAmount - totalValue)} remaining`
            : 'Strategy Fully Funded'}
        </Typography>
      </Box>

      {/* 2. Data Grid */}
      <Box sx={{ p: { xs: 0, sm: 2 } }}>
        <Grid container>
          <DataPoint label="Invested" value={formatAmount(totalInvested)} />
          <DataPoint
            label="Est. Returns"
            value={formatAmount(totalReturns)}
            color={theme.palette.success.main}
          />
          <DataPoint
            label="Projected Value"
            value={formatAmount(totalValue)}
            color={
              isShort ? theme.palette.error.main : theme.palette.primary.main
            }
          />
          <DataPoint label="Horizon" value={`${maxTime} Years`} isLast={true} />
        </Grid>
      </Box>

      {/* 3. Real-time Status Bar (Optional) */}
      {isShort && (
        <Box
          sx={{
            width: '100%',
            height: 4,
            bgcolor: alpha(theme.palette.error.main, 0.1),
          }}
        >
          <Box
            sx={{
              width: `${Math.min((totalValue / targetAmount) * 100, 100)}%`,
              height: '100%',
              bgcolor: theme.palette.error.main,
              transition: 'width 0.5s ease-out',
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default InvestmentSummary;
