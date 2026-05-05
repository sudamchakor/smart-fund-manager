import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Typography,
  Box,
  Button,
  useTheme,
  alpha,
  Stack,
  Grid,
} from '@mui/material';
import {
  AutoFixHigh as AutoFixIcon,
  CheckCircleOutline as SuccessIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';

import {
  selectCurrentSurplus,
  selectProfileExpenses,
  selectStepUpPercentage,
  updateExpense,
  setStepUpPercentage,
} from '../../../store/profileSlice';
import { selectCurrency } from '../../../store/emiSlice';
import { formatCurrency } from '../../../utils/formatting';
import SectionHeader from '../../../components/common/SectionHeader';

const CorrectionEngine = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const surplus = useSelector(selectCurrentSurplus);
  const expenses = useSelector(selectProfileExpenses);
  const currentStepUp = useSelector(selectStepUpPercentage);
  const currency = useSelector(selectCurrency);

  const [hasSucceeded, setHasSucceeded] = useState(false);

  const recommendation = useMemo(() => {
    if (surplus >= 0) return null;

    const deficit = Math.abs(surplus);
    const discretionaryExpenses = expenses.filter(
      (e) => e.category === 'discretionary',
    );
    const totalDiscretionary = discretionaryExpenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    );

    if (totalDiscretionary === 0) {
      return {
        message:
          'Deficit detected. No discretionary expenses available to reduce. Consider increasing income or using the Auto-Balancer for basic needs.',
        actionable: false,
      };
    }

    let reductionNeededRatio = deficit / totalDiscretionary;
    let reductionPercentage = 0;
    let newStepUp = currentStepUp;
    let message = '';

    if (reductionNeededRatio <= 1) {
      reductionPercentage = Math.ceil(reductionNeededRatio * 100);
      message = `To reach a positive surplus, reduce your Discretionary spending by ${reductionPercentage}%.`;

      if (currentStepUp < 0.08) {
        newStepUp = 0.08;
        message += ` System also recommends increasing your Step-up SIP to ${newStepUp * 100}% to accelerate future wealth.`;
      }
    } else {
      reductionPercentage = 100;
      message = `Even cutting 100% of Discretionary spending leaves a deficit. You must reduce Basic Needs or Goal Contributions.`;
    }

    return {
      message,
      reductionPercentage,
      newStepUp,
      actionable: reductionNeededRatio <= 1,
      discretionaryExpenses,
      deficit,
    };
  }, [surplus, expenses, currentStepUp]);

  const applyRecommendation = () => {
    if (!recommendation || !recommendation.actionable) return;

    // Apply expense reductions
    const reductionMultiplier = 1 - recommendation.reductionPercentage / 100;
    recommendation.discretionaryExpenses.forEach((exp) => {
      dispatch(
        updateExpense({
          ...exp,
          amount: Math.max(0, Math.round(exp.amount * reductionMultiplier)),
        }),
      );
    });

    // Apply Step-up increase
    if (recommendation.newStepUp !== currentStepUp) {
      dispatch(setStepUpPercentage(recommendation.newStepUp));
    }

    setHasSucceeded(true);
    setTimeout(() => setHasSucceeded(false), 5000);
  };

  if (surplus >= 0 && !hasSucceeded) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.warning.main, 0.3),
        bgcolor: alpha(theme.palette.warning.main, 0.02),
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
      }}
    >
      <SectionHeader
        title="Discretionary Correction Engine"
        icon={<AutoFixIcon />}
        color={theme.palette.warning.main}
      />

      {hasSucceeded ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 3,
            bgcolor: alpha(theme.palette.success.main, 0.05),
            border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`,
            borderRadius: 2,
          }}
        >
          <SuccessIcon
            sx={{ fontSize: 40, mb: 1, color: theme.palette.success.main }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              color: theme.palette.success.dark,
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
          >
            Correction Applied
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            Discretionary expenses have been successfully optimized.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Grid container alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  border: `1px dashed ${alpha(theme.palette.warning.main, 0.4)}`,
                }}
              >
                <WarningIcon sx={{ color: theme.palette.warning.dark }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: 'warning.dark' }}
                >
                  Current Deficit: {currency}
                  {formatCurrency(recommendation?.deficit || Math.abs(surplus))}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          {recommendation && (
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 2,
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  lineHeight: 1.6,
                }}
              >
                {recommendation.message}
              </Typography>

              {recommendation.actionable && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={applyRecommendation}
                  fullWidth
                  disableElevation
                  startIcon={<AutoFixIcon />}
                  sx={{
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`,
                    },
                  }}
                >
                  Execute Auto-Correction
                </Button>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CorrectionEngine;
