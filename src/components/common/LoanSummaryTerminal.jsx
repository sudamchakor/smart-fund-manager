import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Divider,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';

export default function LoanSummaryTerminal({
  title = 'Loan Summary',
  monthlyEmi,
  totalInterest,
  totalPayable,
  currency = '₹',
  interestColor = 'warning.main',
  loading = false,
  children,
}) {
  const theme = useTheme();
  // Helper function to safely format numbers, defaulting to 0 if null/undefined
  const formatNumber = (num) => (num ?? 0).toLocaleString('en-IN');


  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        borderRadius: 3,
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: '1px dashed',
        borderColor: alpha(theme.palette.primary.main, 0.2),
        overflow: 'hidden',
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(4px)',
            zIndex: 10,
          }}
        >
          <CircularProgress color="primary" data-testid="loading-indicator" />
        </Box>
      )}

      <Typography
        variant="caption"
        align="center"
        sx={{
          fontWeight: 800,
          textTransform: 'uppercase',
          color: 'text.secondary',
          letterSpacing: 1,
        }}
        gutterBottom
      >
        {title}
      </Typography>

      <Box textAlign="center" sx={{ my: 3 }}>
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'text.disabled',
            letterSpacing: 0.5,
            display: 'block',
            mb: 0.5,
          }}
        >
          Monthly EMI
        </Typography>
        <Typography
          variant="h3"
          sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -1 }}
        >
          {currency} {formatNumber(monthlyEmi)}
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: 'text.secondary' }}
          >
            Total Interest Burden
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 900, color: interestColor }}
          >
            {currency} {formatNumber(totalInterest)}
          </Typography>
        </Stack>
        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, color: 'text.primary' }}
          >
            Total Amount Payable
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, color: 'text.primary' }}
          >
            {currency} {formatNumber(totalPayable)}
          </Typography>
        </Stack>
      </Stack>

      {children}
    </Box>
  );
}
