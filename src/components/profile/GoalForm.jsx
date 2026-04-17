import React from "react";
import {
  Box,
  Button,
  Typography,
  Divider,
  Grid,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import GoalFormHeader from "./GoalFormHeader";
import InvestmentPlanCard from "./InvestmentPlanCard";
import useGoalForm from "./useGoalForm";

export const GoalForm = ({ goal, currentYear, onSave }) => {
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
    (amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        padding: 3,
        overflowX: "hidden",
      }}
    >
      <GoalFormHeader
        editedGoal={editedGoal}
        setEditedGoal={setEditedGoal}
        currentYear={currentYear}
        handleGenerateInvestmentPlans={handleGenerateInvestmentPlans}
        plans={editedGoal.investmentPlans}
        handleSaveGoal={handleSaveGoal}
      />

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Investment Plans
      </Typography>
      <Grid container spacing={2}>
        {editedGoal.investmentPlans.map((plan) => (
          <Grid item xs={6} key={plan.id}>
            <InvestmentPlanCard
              plan={plan}
              targetAmount={editedGoal.targetAmount}
              handlePlanChange={handlePlanChange}
              handleRemovePlan={handleRemovePlan}
              formatAmount={formatAmount}
            />
          </Grid>
        ))}
      </Grid>
      <Button
        startIcon={<AddCircleOutlineIcon />}
        onClick={handleAddPlan}
        variant="outlined"
        sx={{ mt: 2 }}
      >
        Add Investment Plan
      </Button>
    </Box>
  );
};

export default GoalForm;
