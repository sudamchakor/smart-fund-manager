import React from 'react';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  alpha,
  useTheme,
  Stack,
} from '@mui/material';
import {
  AutoFixHigh as MagicIcon,
  ErrorOutline as WarningIcon,
} from '@mui/icons-material';
import SliderInput from '../../../components/common/SliderInput';
import InvestmentSummary from './InvestmentSummary';
import { labelStyle, getWellInputStyle } from '../../../styles/formStyles';

const GoalFormHeader = ({
  editedGoal,
  setEditedGoal,
  currentYear,
  retirementYear,
  handleGenerateInvestmentPlans,
  plans,
}) => {
  const theme = useTheme();

  const isTargetYearInvalid = editedGoal.targetYear > retirementYear;

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {/* 1. Goal Name - High Density */}
        <Grid item xs={12} md={6}>
          <Typography sx={labelStyle}>Goal Name</Typography>
          <TextField
            fullWidth
            variant="standard"
            size="small"
            placeholder="e.g., Retirement, Education..."
            value={editedGoal.name || ''}
            onChange={(e) =>
              setEditedGoal({ ...editedGoal, name: e.target.value })
            }
            InputProps={{
              disableUnderline: true,
              sx: getWellInputStyle(theme),
            }}
          />
        </Grid>

        {/* 2. Target Amount Slider */}
        <Grid item xs={12} md={6}>
          <SliderInput
            label="Target Amount"
            value={Number(editedGoal.targetAmount) || 0}
            onChange={(val) =>
              setEditedGoal({ ...editedGoal, targetAmount: val })
            }
            min={0}
            max={100000000}
            step={100000}
            showInput={true}
          />
        </Grid>

        {/* 3. Start Year */}
        <Grid item xs={12} md={6}>
          <SliderInput
            label="Start Year"
            value={Number(editedGoal.startYear) || currentYear}
            onChange={(val) => setEditedGoal({ ...editedGoal, startYear: val })}
            min={currentYear}
            max={currentYear + 50}
            step={1}
            showInput={true}
          />
        </Grid>

        {/* 4. Target Year with Technical Warning */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <SliderInput
              label="Target Year"
              value={Number(editedGoal.targetYear) || currentYear}
              onChange={(val) =>
                setEditedGoal({ ...editedGoal, targetYear: val })
              }
              min={currentYear}
              max={currentYear + 50}
              step={1}
              showInput={true}
              warning={isTargetYearInvalid}
            />
            {isTargetYearInvalid && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  border: `1px dashed ${alpha(theme.palette.error.main, 0.3)}`,
                }}
              >
                <WarningIcon
                  sx={{ fontSize: '1rem', color: theme.palette.error.main }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.error.dark, fontWeight: 700 }}
                >
                  Exceeds retirement year ({retirementYear}).
                </Typography>
              </Box>
            )}
          </Stack>
        </Grid>

        {/* 5. Action Bar - Generate Button */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              pt: 1,
            }}
          >
            {editedGoal.targetYear > currentYear && (
              <Button
                variant="contained"
                disableElevation
                startIcon={<MagicIcon />}
                onClick={handleGenerateInvestmentPlans}
                disabled={editedGoal.targetAmount < 500}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 800,
                  textTransform: 'none',
                  letterSpacing: 0.5,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                }}
              >
                Auto-Generate Strategies
              </Button>
            )}
          </Box>
        </Grid>

        {/* 6. Investment Summary Display */}
        {plans && plans.length > 0 && (
          <Grid item xs={12}>
            <InvestmentSummary
              plans={plans}
              targetAmount={editedGoal.targetAmount}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default GoalFormHeader;
