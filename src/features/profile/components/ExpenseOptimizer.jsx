import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Slider, useTheme, alpha, Stack } from '@mui/material';
import { Tune as OptimizeIcon } from '@mui/icons-material';
import {
  selectProfileExpenses,
  selectTotalMonthlyIncome,
  selectTotalMonthlyGoalContributions,
  updateExpense,
} from '../../../store/profileSlice';
import { selectCalculatedValues } from '../../emiCalculator/utils/emiCalculator';
import { selectCurrency } from '../../../store/emiSlice';
import { formatCurrency } from '../../../utils/formatting';
import SectionHeader from '../../../components/common/SectionHeader';

const ExpenseOptimizer = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const currency = useSelector(selectCurrency);

  const expenses = useSelector(selectProfileExpenses) || [];
  const totalIncome = useSelector(selectTotalMonthlyIncome);
  const goalContributions = useSelector(selectTotalMonthlyGoalContributions);
  const { emi: monthlyEmi } = useSelector(selectCalculatedValues);

  const [localExpenses, setLocalExpenses] = useState(expenses);
  const [initialExpenses] = useState(expenses);

  useEffect(() => {
    setLocalExpenses(expenses);
  }, [expenses]);

  const handleSliderChange = (expenseId, newValue) => {
    const updatedExpenses = localExpenses.map((exp) =>
      exp.id === expenseId ? { ...exp, amount: newValue } : exp,
    );
    setLocalExpenses(updatedExpenses);
  };

  const handleSliderChangeCommitted = (expenseId) => {
    const expenseToUpdate = localExpenses.find((exp) => exp.id === expenseId);
    if (expenseToUpdate) {
      dispatch(updateExpense(expenseToUpdate));
    }
  };

  const totalLocalExpenses = localExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0,
  );
  const currentDynamicSurplus =
    totalIncome - totalLocalExpenses - goalContributions - (monthlyEmi || 0);
  const isDeficit = currentDynamicSurplus < 0;

  // Map slider colors to themes based on expense category
  const getSliderThemeColor = (category) => {
    switch (category) {
      case 'basic':
        return 'info';
      case 'discretionary':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getLabelColor = (category) => {
    switch (category) {
      case 'basic':
        return theme.palette.info.main;
      case 'discretionary':
        return theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Box
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
        title="Expense Optimizer"
        subtitle="Simulate adjustments to your current expenses to see the real-time impact on your monthly cash flow."
        icon={<OptimizeIcon />}
        color={theme.palette.secondary.main}
      />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', pr: 1 }}>
        {localExpenses.map((expense) => {
          const initialExpense =
            initialExpenses.find((e) => e.id === expense.id) || expense;
          const initialAmount = initialExpense.amount;

          let maxLimit;
          if (expense.category === 'basic') {
            maxLimit = Math.max(totalIncome * 2, initialAmount * 1.5, 500000);
          } else if (expense.category === 'discretionary') {
            maxLimit = Math.max(totalIncome, initialAmount * 2, 200000);
          } else {
            maxLimit = Math.max(totalIncome * 2, initialAmount * 2, 500000);
          }

          const labelColor = getLabelColor(expense.category);

          return (
            <Box key={expense.id} sx={{ mb: 2.5 }}>
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
                  {expense.name}{' '}
                  <Box
                    component="span"
                    sx={{ color: labelColor, opacity: 0.8 }}
                  >
                    ({expense.category})
                  </Box>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 900, color: labelColor }}
                >
                  {currency}
                  {formatCurrency(expense.amount)}
                </Typography>
              </Stack>
              <Slider
                color={getSliderThemeColor(expense.category)}
                value={expense.amount}
                min={0}
                max={maxLimit}
                step={100}
                onChange={(e, val) => handleSliderChange(expense.id, val)}
                onChangeCommitted={() =>
                  handleSliderChangeCommitted(expense.id)
                }
                sx={{
                  py: 1,
                  '& .MuiSlider-thumb': { width: 14, height: 14 },
                  '& .MuiSlider-track': { height: 4 },
                  '& .MuiSlider-rail': { height: 4, opacity: 0.2 },
                }}
              />
            </Box>
          );
        })}

        {/* Fixed EMI Reference */}
        <Box sx={{ mb: 2 }}>
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
                color: 'text.disabled',
                letterSpacing: 0.5,
              }}
            >
              Loan EMIs (Fixed)
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 900, color: 'text.disabled' }}
            >
              {currency}
              {formatCurrency(monthlyEmi || 0)}
            </Typography>
          </Stack>
          <Slider
            value={monthlyEmi || 0}
            disabled
            max={Math.max(totalIncome * 2, (monthlyEmi || 0) * 2, 500000)}
            sx={{
              py: 1,
              '& .MuiSlider-thumb': { width: 12, height: 12 },
              '& .MuiSlider-track': { height: 4 },
            }}
          />
        </Box>
      </Box>

      {/* Dynamic Status Output Terminal */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(
            isDeficit ? theme.palette.error.main : theme.palette.success.main,
            0.05,
          ),
          border: '1px dashed',
          borderColor: alpha(
            isDeficit ? theme.palette.error.main : theme.palette.success.main,
            0.3,
          ),
          transition: 'all 0.3s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: isDeficit
              ? theme.palette.error.dark
              : theme.palette.success.dark,
          }}
        >
          {isDeficit ? 'Current Deficit' : 'Current Surplus'}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            letterSpacing: -0.5,
            color: isDeficit
              ? theme.palette.error.main
              : theme.palette.success.main,
          }}
        >
          {isDeficit ? '-' : ''}
          {currency}
          {formatCurrency(Math.abs(currentDynamicSurplus))}
        </Typography>
      </Box>
    </Box>
  );
};

export default ExpenseOptimizer;
