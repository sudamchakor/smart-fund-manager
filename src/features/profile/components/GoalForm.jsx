import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Grid,
  Card,
  alpha,
  useTheme,
  Stack,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccountTreeIcon from '@mui/icons-material/AccountTree'; // Technical icon for strategies
import GoalFormHeader from './GoalFormHeader';
import InvestmentPlanCard from './InvestmentPlanCard';
import useGoalForm from './useGoalForm';
import SectionHeader from '../../../components/common/SectionHeader';

export const GoalForm = ({ goal, currentYear, onSave, retirementYear }) => {
  const theme = useTheme();
  const {
    editedGoal,
    setEditedGoal,
    handleAddPlan,
    handleRemovePlan,
    handlePlanChange,
    handleGenerateInvestmentPlans,
    handleSaveGoal,
  } = useGoalForm(goal, currentYear, onSave);

  const formatAmount = (amount) =>
    (amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: { xs: 0, md: 1 }, // Tightened padding for density
        overflowX: 'hidden',
      }}
    >
      {/* 1. Main Goal Settings */}
      <GoalFormHeader
        editedGoal={editedGoal}
        setEditedGoal={setEditedGoal}
        currentYear={currentYear}
        retirementYear={retirementYear}
        handleGenerateInvestmentPlans={handleGenerateInvestmentPlans}
        plans={editedGoal.investmentPlans}
        handleSaveGoal={handleSaveGoal}
      />

      <Divider sx={{ my: 3, borderStyle: 'dashed', opacity: 0.5 }} />

      {/* 2. Investment Strategies Section */}
      <SectionHeader
        title="Investment Strategy & Plans"
        icon={<AccountTreeIcon />}
        color={theme.palette.secondary.main}
      />

      <Grid container spacing={2}>
        {editedGoal.investmentPlans.map((plan) => {
          return (
            <Grid item xs={12} lg={6} key={plan.id}>
              {/* Ensure InvestmentPlanCard also uses StyledPaper/Card logic internally */}
              <InvestmentPlanCard
                plan={plan}
                targetAmount={editedGoal.targetAmount}
                handlePlanChange={handlePlanChange}
                handleRemovePlan={handleRemovePlan}
                formatAmount={formatAmount}
              />
            </Grid>
          );
        })}

        {/* 3. The "Add Strategy" Placeholder */}
        <Grid item xs={12} lg={6}>
          <Card
            onClick={handleAddPlan}
            elevation={0}
            sx={{
              height: '100%',
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: 3,
              border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
              },
            }}
          >
            <AddCircleOutlineIcon
              sx={{
                fontSize: '2.5rem',
                mb: 1,
                color: theme.palette.primary.main,
                opacity: 0.7,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Add New Strategy
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              (SIP, Lumpsum, or Custom Plan)
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GoalForm;
