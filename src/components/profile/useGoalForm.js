import { useState, useEffect } from "react";
import {
  getDefaultPlanState,
  calculatePlanResults,
} from "./goalFormUtils";

const useGoalForm = (goal, currentYear, onSave) => {
  const [editedGoal, setEditedGoal] = useState(() => {
    const initialTargetAmount = goal?.targetAmount || 0;
    const initialTimePeriod = goal?.targetYear
      ? goal.targetYear - currentYear
      : 10;

    if (goal && goal.investmentPlans && goal.investmentPlans.length > 0) {
      return {
        ...goal,
        investmentPlans: goal.investmentPlans.map(calculatePlanResults),
      };
    }
    const defaultPlan = getDefaultPlanState(
      "sip",
      initialTargetAmount,
      initialTimePeriod,
      currentYear,
      goal,
    );
    return {
      ...goal,
      investmentPlans: [calculatePlanResults(defaultPlan)],
    };
  });

  useEffect(() => {
    setEditedGoal((prevGoal) => {
      const currentTargetAmount = goal?.targetAmount || 0;
      const currentTimePeriod = goal?.targetYear
        ? goal.targetYear - currentYear
        : 10;

      let newEditedGoal;
      if (goal && goal.investmentPlans && goal.investmentPlans.length > 0) {
        newEditedGoal = {
          ...goal,
          investmentPlans: goal.investmentPlans.map(calculatePlanResults),
        };
      } else {
        const defaultPlan = getDefaultPlanState(
          "sip",
          currentTargetAmount,
          currentTimePeriod,
          currentYear,
          goal,
        );
        newEditedGoal = {
          ...goal,
          investmentPlans: [calculatePlanResults(defaultPlan)],
        };
      }
      return newEditedGoal;
    });
  }, [goal, currentYear]);

  const handleSaveGoal = () => {
    onSave(editedGoal);
  };

  const handleAddPlan = () => {
    const currentTargetAmount = editedGoal.targetAmount || 0;
    const currentTimePeriod = editedGoal.targetYear
      ? editedGoal.targetYear - currentYear
      : 10;
    const newPlan = getDefaultPlanState(
      "sip",
      currentTargetAmount,
      currentTimePeriod,
      currentYear,
      editedGoal,
    );
    setEditedGoal((prev) => ({
      ...prev,
      investmentPlans: [...prev.investmentPlans, calculatePlanResults(newPlan)],
    }));
  };

  const handleRemovePlan = (idToRemove) => {
    setEditedGoal((prev) => ({
      ...prev,
      investmentPlans: prev.investmentPlans.filter(
        (plan) => plan.id !== idToRemove,
      ),
    }));
  };

  const handlePlanChange = (id, field, value) => {
    setEditedGoal((prev) => {
      const updatedPlans = prev.investmentPlans.map((plan) => {
        if (plan.id === id) {
          let updatedPlan;
          if (field === "type") {
            const currentTargetAmount = prev.targetAmount || 0;
            const currentTimePeriod = prev.targetYear
              ? prev.targetYear - currentYear
              : 10;
            const newDefaultPlan = getDefaultPlanState(
              value,
              currentTargetAmount,
              currentTimePeriod,
              currentYear,
              prev,
            );
            updatedPlan = { ...newDefaultPlan, id: plan.id };
          } else {
            updatedPlan = { ...plan, [field]: value };
          }
          return calculatePlanResults(updatedPlan);
        }
        return plan;
      });
      return { ...prev, investmentPlans: updatedPlans };
    });
  };

  const handleGenerateInvestmentPlans = () => {
    const { targetAmount, targetYear } = editedGoal;
    if (!targetAmount || !targetYear || targetYear <= currentYear) {
      alert("Please set a valid Target Amount and Target Year.");
      return;
    }

    const totalTimePeriod = targetYear - currentYear;

    const planTypes = ["sip", "lumpsum", "stepUpSip", "fd"];
    const newPlans = planTypes.map((type) =>
      getDefaultPlanState(
        type,
        targetAmount,
        totalTimePeriod,
        currentYear,
        editedGoal,
      ),
    );

    const updatedInvestmentPlans = newPlans
      .map(calculatePlanResults)
      .filter((plan) => {
        switch (plan.type) {
          case "sip":
          case "stepUpSip":
            return plan.monthlyInvestment >= 500;
          case "lumpsum":
            return plan.totalInvestment >= 500;
          case "fd":
            return plan.principalAmount >= 500;
          default:
            return false;
        }
      });

    setEditedGoal((prev) => ({
      ...prev,
      investmentPlans: updatedInvestmentPlans,
    }));
  };

  return {
    editedGoal,
    setEditedGoal,
    handleAddPlan,
    handleRemovePlan,
    handlePlanChange,
    handleGenerateInvestmentPlans,
    handleSaveGoal,
  };
};

export default useGoalForm;