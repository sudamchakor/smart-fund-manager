import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  LinearProgress,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { TrackChanges as TargetIcon } from '@mui/icons-material';
import { selectGoals } from '../../../store/profileSlice';
import { selectCurrency } from '../../../store/emiSlice';
import SectionHeader from '../../../components/common/SectionHeader';

const GoalCoverage = forwardRef((props, ref) => {
  const theme = useTheme();
  const componentRef = useRef(null);
  const goals = useSelector(selectGoals) || [];
  const currency = useSelector(selectCurrency);

  useImperativeHandle(ref, () => ({
    getRef: () => componentRef,
  }));

  // Match the color mapping logic from your other components
  const getColorForCategory = (category) => {
    switch (category?.toLowerCase()) {
      case 'retirement':
        return theme.palette.primary.main;
      case 'education':
        return theme.palette.info.main;
      case 'safety':
        return theme.palette.warning.main;
      default:
        return theme.palette.secondary.main;
    }
  };

  const formatAmount = (val) => {
    const absVal = Math.abs(val || 0);
    if (absVal >= 100000) return `${(absVal / 100000).toFixed(1)}L`;
    if (absVal >= 1000) return `${(absVal / 1000).toFixed(0)}k`;
    return absVal.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <Box
      ref={componentRef}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        bgcolor: theme.palette.background.paper,
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black || '#000', 0.02)}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SectionHeader
        title="Goal Coverage Status"
        icon={<TargetIcon />}
        color={theme.palette.success.main}
      />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
        {goals.length > 0 ? (
          <Stack spacing={3}>
            {goals.map((goal) => {
              const targetAmount = goal.targetAmount || 1;
              const fundedAmount = (goal.investmentPlans || []).reduce(
                (sum, plan) => sum + (plan.totalValue || 0),
                0,
              );

              const percentage = Math.min(
                (fundedAmount / targetAmount) * 100,
                100,
              );
              const isFullyFunded = percentage >= 100;
              const barColor = getColorForCategory(goal.category);

              return (
                <Box key={goal.id}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-end"
                    sx={{ mb: 0.8 }}
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
                      {goal.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 900,
                        color: isFullyFunded
                          ? theme.palette.success.main
                          : 'text.primary',
                      }}
                    >
                      {currency}
                      {formatAmount(fundedAmount)} / {currency}
                      {formatAmount(targetAmount)}
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ flexGrow: 1, position: 'relative' }}>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(barColor, 0.15),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: isFullyFunded
                              ? theme.palette.success.main
                              : barColor,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 900,
                        minWidth: '40px',
                        textAlign: 'right',
                        color: isFullyFunded
                          ? theme.palette.success.main
                          : barColor,
                      }}
                    >
                      {percentage.toFixed(0)}%
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Box
            sx={{
              height: '100%',
              minHeight: 150,
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
              No Active Goals Detected
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
});

export default GoalCoverage;
