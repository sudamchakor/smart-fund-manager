import React from 'react';
import {
  Box,
  Typography,
  Stack,
  alpha,
  useTheme,
  Divider,
} from '@mui/material'; // Import Divider
import { useSelector } from 'react-redux';
import { selectCalculatedValues } from '../utils/emiCalculator';
import { selectCurrency, selectExpenses } from '../../../store/emiSlice';
import { formatCurrency } from '../../../utils/formatting';
import DetailRow from '../../../components/common/DetailRow';

/**
 * Custom Row for the Total section.
 * Aligns with the 'Grand Total' style from Payment Breakdown.
 */
const TotalOutflowRow = ({ label, value }) => {
  const theme = useTheme();
  return (
    <Box sx={{ px: 2, mt: 1 }}>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          border: '1px dashed',
          borderColor: alpha(theme.palette.primary.main, 0.3),
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap" // Auto-splits into two rows if space is insufficient
          gap={1}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700, // Matches 'Grand Total' label weight
              color: 'text.primary',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h5" // Uses H5 to match the prominence of the Pie Chart's 'Total Cost'
            sx={{
              fontWeight: 900, // Same weight as other totals for visual consistency
              color: 'text.primary', // Matches the black/dark text in screenshot
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              textAlign: 'right',
            }}
          >
            {value}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

// Add onOpenAccelerator prop
const TotalMonthlyPayment = ({ onOpenAccelerator }) => {
  const theme = useTheme();
  const calculatedValues = useSelector(selectCalculatedValues);
  const currency = useSelector(selectCurrency);
  const expenses = useSelector(selectExpenses);

  // Core Calculations
  const emi = Math.round(calculatedValues.emi || 0);
  const monthlyTaxes = Math.round((calculatedValues.taxesYearlyInRs || 0) / 12);
  const monthlyInsurance = Math.round(
    (calculatedValues.homeInsYearlyInRs || 0) / 12,
  );
  const monthlyMaintenance = Math.round(expenses.maintenance || 0);
  const tenureInMonths = calculatedValues.tenureInMonths || 1;
  const averageMonthlyPrepayment =
    Math.round((calculatedValues.totalPrepayments || 0) / tenureInMonths) || 0;

  const totalMonthlyPayment =
    emi +
    monthlyTaxes +
    monthlyInsurance +
    monthlyMaintenance +
    averageMonthlyPrepayment;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Upper Breakdown List */}
      <Box sx={{ p: 2.5, pb: 0 }}>
        <Typography
          variant="caption"
          sx={{
            mb: 1.5,
            fontWeight: 800,
            color: 'text.disabled',
            textTransform: 'uppercase',
            display: 'block',
            letterSpacing: 1.2,
          }}
        >
          Breakdown
        </Typography>
        <Stack spacing={0.5}>
          <DetailRow
            label="Monthly EMI"
            value={formatCurrency(emi, currency)}
          />
          <DetailRow
            label="Property Taxes"
            value={formatCurrency(monthlyTaxes, currency)}
          />
          <DetailRow
            label="Home Insurance"
            value={formatCurrency(monthlyInsurance, currency)}
          />
          <DetailRow
            label="Maintenance"
            value={formatCurrency(monthlyMaintenance, currency)}
          />
          <DetailRow
            label="Avg. Prepayment"
            value={formatCurrency(averageMonthlyPrepayment, currency)}
          />
        </Stack>
      </Box>
      {/* Styled Total Row aligned with Payment Breakdown */}
      <TotalOutflowRow
        label="Total Monthly Outflow"
        value={formatCurrency(totalMonthlyPayment, currency)}
      />
      {/* Interactive Divider and Optimization Row */}
      <Divider
        sx={{ my: 2, mx: 2, borderColor: alpha(theme.palette.divider, 0.1) }}
      />{' '}
      {/* Styled Divider */}
      <Box
        onClick={onOpenAccelerator} // Action: open the modal
        sx={{
          px: 2,
          py: 1.5,
          mt: 1,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: alpha(theme.palette.common.white, 0.05), // Subtle hover effect
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            mr: 1, // Margin right for spacing
          }}
        >
          Got an extra {formatCurrency(2000, currency)} -{' '}
          {formatCurrency(5000, currency)} / month?
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'primary.main', // Accent color
            fontWeight: 700,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          Test Accelerator{' '}
          <span role="img" aria-label="rocket">
            🚀
          </span>
        </Typography>
      </Box>
    </Box>
  );
};

export default TotalMonthlyPayment;
