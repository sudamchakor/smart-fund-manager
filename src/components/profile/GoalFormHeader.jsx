import React from "react";
import { Grid, TextField, Button } from "@mui/material";
import SliderInput from "../common/SliderInput";
import InvestmentSummary from "./InvestmentSummary";

const GoalFormHeader = ({
  editedGoal,
  setEditedGoal,
  currentYear,
  handleGenerateInvestmentPlans,
  plans,
  handleSaveGoal,
}) => {
  // Updated to use plan.totalValue for consistency with InvestmentSummary
  const totalAmount = plans.reduce(
    (sum, plan) => sum + (plan.totalValue || 0),
    0,
  );
  const isMismatch = totalAmount !== editedGoal.targetAmount;

  const onSave = () => {
    if (isMismatch) {
      alert(
        "Warning: The total investment amount does not match the target amount.",
      );
    }
    handleSaveGoal();
  };

  return (
    <Grid container xs={12} spacing={2}>
      <Grid container xs={12} spacing={2}>
        <Grid item xs={12} sm={6} md={6} lg={6} xl={4}>
          <TextField
            fullWidth
            label="Goal Name"
            size="small"
            value={editedGoal.name || ""}
            onChange={(e) =>
              setEditedGoal({ ...editedGoal, name: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={6} xl={4}>
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
        <Grid item xs={12} sm={6} md={6} lg={6} xl={4}>
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
          />
        </Grid>
      </Grid>
      <Grid container xs={12} spacing={2}>
        <Grid item xs={12} sm={6} md={6} lg={6} xl={4}>
          {editedGoal.targetAmount && editedGoal.targetYear > currentYear && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateInvestmentPlans}
              sx={{ mt: 3 }}
              disabled={editedGoal.targetAmount < 500}
            >
              Generate Investment Plans
            </Button>
          )}
        </Grid>
      </Grid>
      {plans && plans.length > 0 && (
        <Grid item xs={12}>
          <InvestmentSummary
            plans={plans}
            targetAmount={editedGoal.targetAmount}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default GoalFormHeader;
