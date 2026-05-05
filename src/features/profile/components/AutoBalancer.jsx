import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Typography,
  Box,
  Button,
  Slider,
  useTheme,
  alpha,
  Stack,
  Grid,
} from '@mui/material';
import {
  BuildCircle as BuildIcon,
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
import { labelStyle } from '../../../styles/formStyles';

const AutoBalancer = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const surplus = useSelector(selectCurrentSurplus);
  const expenses = useSelector(selectProfileExpenses);
  const currentStepUp = useSelector(selectStepUpPercentage);
  const currency = useSelector(selectCurrency);

  const [maxReductionPercent, setMaxReductionPercent] = useState(20);
  const [hasSucceeded, setHasSucceeded] = useState(false);

  const simulation = useMemo(() => {
    if (surplus >= 0) return null;

    const deficit = Math.abs(surplus);
    const basicExpenses = expenses.filter((e) => e.category === 'basic');
    const totalBasic = basicExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (totalBasic === 0) {
      return {
        achievable: false,
        message:
          "Deficit detected, but no 'Basic Needs' expenses found to reduce. System cannot auto-balance. Adjust other parameters manually.",
        deficit,
        requiredReduction: 0,
        newStepUp: currentStepUp,
        basicExpenses: [],
        totalBasic: 0,
      };
    }

    const maxAllowedReduction = totalBasic * (maxReductionPercent / 100);

    let newStepUp = currentStepUp;
    let requiredReduction = 0;
    let achievable = false;
    let message = '';

    if (maxAllowedReduction >= deficit) {
      requiredReduction = deficit;
      achievable = true;
      const reductionPercentNeeded = (
        (requiredReduction / totalBasic) *
        100
      ).toFixed(1);

      message = `Positive surplus achievable by reducing Basic Needs by ${reductionPercentNeeded}% (${currency}${formatCurrency(requiredReduction)}).`;

      if (currentStepUp < 0.1) {
        newStepUp = 0.1;
        message += ` System also recommends increasing Step-up to 10% for aggressive wealth recovery.`;
      }
    } else {
      requiredReduction = maxAllowedReduction;
      achievable = false;
      message = `Max reduction (${maxReductionPercent}%) insufficient. Deficit of ${currency}${formatCurrency(deficit - requiredReduction)} remains. Manual intervention required.`;
    }

    return {
      deficit,
      requiredReduction,
      achievable,
      message,
      newStepUp,
      basicExpenses,
      totalBasic,
    };
  }, [surplus, expenses, currentStepUp, maxReductionPercent, currency]);

  const applySimulation = () => {
    if (!simulation || !simulation.achievable) return;

    const { totalBasic, basicExpenses, requiredReduction, newStepUp } =
      simulation;

    if (totalBasic > 0) {
      basicExpenses.forEach((exp) => {
        const proportion = exp.amount / totalBasic;
        const reductionForThisExp = requiredReduction * proportion;

        dispatch(
          updateExpense({
            ...exp,
            amount: Math.max(0, Math.round(exp.amount - reductionForThisExp)),
          }),
        );
      });
    }

    if (newStepUp !== currentStepUp) {
      dispatch(setStepUpPercentage(newStepUp));
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
        borderColor: alpha(theme.palette.secondary.main, 0.2),
        bgcolor: alpha(theme.palette.secondary.main, 0.02),
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
      }}
    >
      <SectionHeader
        title="Deficit Resolution Engine"
        icon={<BuildIcon />}
        color={theme.palette.secondary.main}
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
            System Optimized
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            Budget balanced successfully. Parameters updated.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 2,
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            System detected a negative cash flow. Use this diagnostic tool to
            simulate auto-reductions to your Basic Needs to achieve a positive
            surplus.
          </Typography>

          <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography sx={labelStyle}>Max Reduction Limit</Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 900, color: 'secondary.main' }}
              >
                {maxReductionPercent}%
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Slider
                value={maxReductionPercent}
                min={5}
                max={50}
                step={5}
                onChange={(e, val) => setMaxReductionPercent(val)}
                color="secondary"
                sx={{
                  '& .MuiSlider-thumb': { width: 14, height: 14 },
                  '& .MuiSlider-track': { height: 4 },
                  '& .MuiSlider-rail': { height: 4, opacity: 0.2 },
                }}
              />
            </Grid>
          </Grid>

          {simulation && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: simulation.achievable
                  ? alpha(theme.palette.info.main, 0.05)
                  : alpha(theme.palette.error.main, 0.05),
                border: '1px dashed',
                borderColor: simulation.achievable
                  ? alpha(theme.palette.info.main, 0.3)
                  : alpha(theme.palette.error.main, 0.3),
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="flex-start"
                sx={{ mb: simulation.achievable ? 2 : 0 }}
              >
                {simulation.achievable ? (
                  <BuildIcon
                    sx={{
                      fontSize: '1.2rem',
                      color: theme.palette.info.main,
                      mt: 0.2,
                    }}
                  />
                ) : (
                  <WarningIcon
                    sx={{
                      fontSize: '1.2rem',
                      color: theme.palette.error.main,
                      mt: 0.2,
                    }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: simulation.achievable ? 'info.dark' : 'error.dark',
                    lineHeight: 1.5,
                  }}
                >
                  {simulation.message}
                </Typography>
              </Stack>

              {simulation.achievable && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={applySimulation}
                  fullWidth
                  disableElevation
                  sx={{
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    },
                  }}
                >
                  Execute Auto-Balance
                </Button>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AutoBalancer;
