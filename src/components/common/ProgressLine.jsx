import React from 'react';
import { Box, Tooltip, useTheme, alpha, Typography } from '@mui/material';
import { formatCurrency } from '../../utils/formatting'; // Import formatCurrency

const ProgressLine = ({ plans, targetAmount, currency }) => {
  const theme = useTheme();

  // Ensure plans is an array and targetAmount is a valid number
  if (
    !plans ||
    !Array.isArray(plans) ||
    plans.length === 0 ||
    !targetAmount ||
    targetAmount <= 0
  ) {
    return null; // Render nothing if no valid plans or targetAmount
  }

  const colors = [
    theme.palette.success.main, // Green
    theme.palette.info.main, // Blue
    theme.palette.warning.main, // Orange
    theme.palette.error.main, // Red
    theme.palette.primary.main, // Primary theme color
    theme.palette.secondary.main, // Secondary theme color
    theme.palette.text.secondary, // Text secondary color
  ];

  const progressSegments = [];
  let actualTotalFundedValue = 0;

  // Calculate initial percentages for each plan
  plans.forEach((plan, index) => {
    const planValue = plan.totalValue || 0;
    actualTotalFundedValue += planValue;

    const percentage = (planValue / targetAmount) * 100;
    if (percentage > 0) {
      progressSegments.push({
        name: plan.type.charAt(0).toUpperCase() + plan.type.slice(1), // Capitalize plan type
        fundedValue: planValue, // Store funded value for tooltip
        percentage: percentage,
        color: colors[index % colors.length], // Cycle through predefined colors
      });
    }
  });

  let actualTotalFundedPercentage = progressSegments.reduce(
    (sum, segment) => sum + segment.percentage,
    0,
  );

  // Adjust segments based on total funding
  if (actualTotalFundedPercentage < 100) {
    // Add an "Unfunded" segment if there's a shortfall
    progressSegments.push({
      name: 'Unfunded',
      fundedValue: targetAmount - actualTotalFundedValue, // Calculate unfunded amount
      percentage: 100 - actualTotalFundedPercentage,
      color: theme.palette.grey[400], // Grey color for unfunded portion
    });
  } else if (actualTotalFundedPercentage > 100) {
    // If overfunded, scale down all funded segments proportionally to sum to 100%
    const scaleFactor = 100 / actualTotalFundedPercentage;
    progressSegments.forEach((segment) => {
      segment.percentage *= scaleFactor;
      // Recalculate fundedValue based on scaled percentage for overfunded scenario
      segment.fundedValue = (segment.percentage / 100) * targetAmount;
    });
  }

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: 12,
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
        boxShadow: `inset 0 1px 2px ${alpha(theme.palette.common.black || '#000', 0.1)}`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        my: 1.25,
      }}
    >
      {progressSegments.map((segment, idx) => (
        <Tooltip
          key={idx}
          title={
            <>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, display: 'block' }}
              >
                {segment.name}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                {formatCurrency(segment.fundedValue, currency)} (
                {segment.percentage.toFixed(1)}%)
              </Typography>
            </>
          }
          arrow
          placement="top"
          enterDelay={100}
          leaveDelay={100}
        >
          <Box
            sx={{
              width: `${segment.percentage}%`,
              backgroundColor: segment.color,
              cursor: 'pointer',
              transition: `all ${theme.transitions.duration.standard}ms ease-in-out`,
              '&:hover': {
                filter: 'brightness(1.15)',
                transform: 'scaleY(1.1)',
              },
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
};

export default ProgressLine;