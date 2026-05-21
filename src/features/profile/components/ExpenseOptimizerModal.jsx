import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  useTheme,
  alpha,
  Stack,
  Paper,
  TextField,
  InputAdornment,
  Grid,
} from '@mui/material';
import { Tune as OptimizeIcon } from '@mui/icons-material';
import { getModalStyle, getDialogTitleStyle, getDialogContentStyle, getDialogActionsStyle } from '../../../theme/modalStyles';

export default function ExpenseOptimizerModal({
  open,
  onClose,
  currentIncome,
  flexibleExpenses,
  currency,
  onApply,
}) {
  const theme = useTheme();

  // Local state to hold simulated expenses
  const [localExpenses, setLocalExpenses] = useState([]);

  // When the modal opens, reset the simulation state to the current saved expenses
  useEffect(() => {
    if (open) {
      setLocalExpenses(flexibleExpenses);
    }
  }, [open, flexibleExpenses]);

  // Handlers for adjusting values
  const handleSliderChange = (expenseId, newValue) => {
    const updated = localExpenses.map((exp) =>
      exp.id === expenseId ? { ...exp, amount: newValue } : exp,
    );
    setLocalExpenses(updated);
  };

  const handleInputChange = (expenseId, event) => {
    const value = parseInt(event.target.value, 10);
    const updated = localExpenses.map((exp) =>
      exp.id === expenseId ? { ...exp, amount: isNaN(value) ? 0 : value } : exp,
    );
    setLocalExpenses(updated);
  };

  // Calculations for the Summary Panel
  const simulatedFlexibleTotal = localExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0,
  );
  const initialFlexibleTotal = flexibleExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0,
  );

  const baselineSurplus = currentIncome - initialFlexibleTotal;
  const simulatedSurplus = currentIncome - simulatedFlexibleTotal;
  const isImproved = simulatedSurplus > baselineSurplus;
  const isDeficit = simulatedSurplus < 0;

  // Theming Helpers
  const getSliderThemeColor = (category) => {
    if (category === 'basic') return 'info';
    if (category === 'discretionary') return 'warning';
    return 'primary';
  };

  const getLabelColor = (category) => {
    if (category === 'basic') return theme.palette.info.main;
    if (category === 'discretionary') return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Submit Handler
  const handleApply = () => {
    onApply(localExpenses);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: getModalStyle(theme),
      }}
    >
      <DialogTitle sx={getDialogTitleStyle()}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <OptimizeIcon color="secondary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Expense Optimizer Sandbox
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Simulate adjustments to your flexible expenses to see the real-time
          impact on your monthly cash flow.
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={getDialogContentStyle()}>
        <Box sx={{ py: 1 }}>
          {localExpenses.map((expense) => {
            const initialExpense =
              flexibleExpenses.find((e) => e.id === expense.id) || expense;
            const initialAmount = initialExpense.amount;

            // Dynamic cap logic based on the user's current metrics
            let maxLimit;
            if (expense.category === 'basic') {
              maxLimit = Math.max(
                currentIncome * 1.5,
                initialAmount * 1.5,
                500000,
              );
            } else if (expense.category === 'discretionary') {
              maxLimit = Math.max(currentIncome, initialAmount * 2, 200000);
            } else {
              maxLimit = Math.max(currentIncome, initialAmount * 2, 500000);
            }

            const labelColor = getLabelColor(expense.category);

            return (
              <Box key={expense.id} sx={{ mb: 4 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'text.primary',
                      letterSpacing: 0.5,
                    }}
                  >
                    {expense.name}{' '}
                    <Box
                      component="span"
                      sx={{
                        color: labelColor,
                        opacity: 0.8,
                        fontSize: '0.75rem',
                      }}
                    >
                      ({expense.category})
                    </Box>
                  </Typography>
                  <TextField
                    size="small"
                    variant="outlined"
                    type="number"
                    value={expense.amount === 0 ? '' : expense.amount}
                    onChange={(e) => handleInputChange(expense.id, e)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {currency}
                        </InputAdornment>
                      ),
                      sx: { fontWeight: 700, width: 120 },
                    }}
                  />
                </Stack>
                <Slider
                  color={getSliderThemeColor(expense.category)}
                  value={expense.amount}
                  min={0}
                  max={maxLimit}
                  step={100}
                  onChange={(e, val) => handleSliderChange(expense.id, val)}
                  sx={{
                    py: 1,
                    '& .MuiSlider-thumb': { width: 16, height: 16 },
                    '& .MuiSlider-track': { height: 6 },
                    '& .MuiSlider-rail': { height: 6, opacity: 0.2 },
                  }}
                />
              </Box>
            );
          })}
        </Box>

        {/* Real-time Calculation Panel */}
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.2),
            bgcolor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                Current Monthly Cash Left
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: 'text.primary' }}
              >
                {currency}
                {formatCurrency(baselineSurplus)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                Simulated Monthly Cash Left
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: isDeficit
                    ? theme.palette.error.main
                    : isImproved
                      ? theme.palette.success.main
                      : 'text.primary',
                }}
              >
                {currency}
                {formatCurrency(simulatedSurplus)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>

      <DialogActions sx={getDialogActionsStyle()}>
        <Button
          onClick={onClose}
          sx={{ fontWeight: 600, color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          color="primary"
          sx={{ fontWeight: 700 }}
        >
          Apply Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}