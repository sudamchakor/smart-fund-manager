import { useState, useEffect, useCallback } from 'react';
import {
  getDefaultPlanState,
  calculatePlanResults,
} from "./goalFormUtils"; // Import the new utility functions

const useGoalForm = (initialGoal, currentYear, onSave) => {
  const [editedGoal, setEditedGoal] = useState(() => {
    const initialTargetAmount = initialGoal?.targetAmount || 0;
    const initialStartYear = initialGoal?.startYear || currentYear; // Initialize startYear
    const initialTimePeriod = initialGoal?.targetYear
      ? initialGoal.targetYear - initialStartYear
      : 10;

    if (initialGoal && initialGoal.investmentPlans && initialGoal.investmentPlans.length > 0) {
      // If goal has existing plans, recalculate them to ensure consistency
      return {
        ...initialGoal,
        investmentPlans: initialGoal.investmentPlans.map(calculatePlanResults),
      };
    }
    // When no plans exist, create a default SIP plan targeting the full amount
    const defaultPlan = getDefaultPlanState(
      "sip",
      initialTargetAmount,
      initialTimePeriod,
      initialStartYear, // Pass initialStartYear
      initialGoal,
    );
    return {
      ...initialGoal,
      startYear: initialStartYear, // Ensure startYear is set
      investmentPlans: [calculatePlanResults(defaultPlan)],
    };
  });

  // Automatically call onSave when editedGoal changes to keep parent in sync
  useEffect(() => {
    if (onSave) {
      onSave(editedGoal);
    }
  }, [editedGoal, onSave]);

  // Update editedGoal when initialGoal prop changes (e.g., when editing a different goal)
  useEffect(() => {
    // Only update if the initialGoal ID is different, to prevent unnecessary re-renders
    // and loss of unsaved edits if the same goal object reference is passed.
    if (initialGoal?.id !== editedGoal?.id) {
      const initialTargetAmount = initialGoal?.targetAmount || 0;
      const initialStartYear = initialGoal?.startYear || currentYear; // Initialize startYear
      const initialTimePeriod = initialGoal?.targetYear
        ? initialGoal.targetYear - initialStartYear
        : 10;

      if (initialGoal && initialGoal.investmentPlans && initialGoal.investmentPlans.length > 0) {
        setEditedGoal({
          ...initialGoal,
          investmentPlans: initialGoal.investmentPlans.map(calculatePlanResults),
        });
      } else {
        const defaultPlan = getDefaultPlanState(
          "sip",
          initialTargetAmount,
          initialTimePeriod,
          initialStartYear, // Pass initialStartYear
          initialGoal,
        );
        setEditedGoal({
          ...initialGoal,
          startYear: initialStartYear, // Ensure startYear is set
          investmentPlans: [calculatePlanResults(defaultPlan)],
        });
      }
    }
  }, [initialGoal, editedGoal?.id, currentYear]);

  // Helper to calculate the sum of totalValue from all plans
  const calculateTotalFutureValue = useCallback((plans) => {
    return plans.reduce((sum, plan) => sum + (plan.totalValue || 0), 0);
  }, []);

  // Effect to detect if total plans value deviates from target amount
  useEffect(() => {
    const totalFutureValue = calculateTotalFutureValue(editedGoal.investmentPlans);
    const targetAmount = editedGoal.targetAmount || 0;
    const deviation = Math.abs(totalFutureValue - targetAmount);

    // Define a small tolerance for floating point comparisons
    const tolerance = 0.01;

    if (targetAmount > 0 && deviation > tolerance) {
      console.warn(
        `Target Drift detected! Total Future Value (${totalFutureValue.toFixed(2)}) ` +
        `does not match Target Amount (${targetAmount.toFixed(2)}). Deviation: ${deviation.toFixed(2)}`
      );
      // TODO: Implement auto-adjustment logic here if required, e.g.,
      // adjust the last plan or prompt the user. For now, it just warns.
    }
  }, [editedGoal.investmentPlans, editedGoal.targetAmount, calculateTotalFutureValue]);

  const handleGoalFieldChange = useCallback((field, value) => {
    setEditedGoal(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAddPlan = useCallback(() => {
    const currentTargetAmount = editedGoal.targetAmount || 0;
    const currentStartYear = editedGoal.startYear || currentYear; // Use editedGoal.startYear
    const currentTimePeriod = editedGoal.targetYear
      ? editedGoal.targetYear - currentStartYear
      : 10;

    const totalFutureValueOfExistingPlans = calculateTotalFutureValue(editedGoal.investmentPlans);
    const remainingBalance = Math.max(0, currentTargetAmount - totalFutureValueOfExistingPlans);

    setEditedGoal(prev => {
      // When adding a new plan manually, it should target the remaining balance
      const newPlan = getDefaultPlanState(
        "sip", // Default to SIP
        remainingBalance,
        currentTimePeriod,
        currentStartYear, // Pass currentStartYear
        editedGoal,
      );
      // Perform initial calculation for the new plan
      const calculatedNewPlan = calculatePlanResults(newPlan);

      return {
        ...prev,
        investmentPlans: [
          ...prev.investmentPlans,
          calculatedNewPlan,
        ],
      };
    });
  }, [editedGoal, currentYear, calculateTotalFutureValue]);

  const handleRemovePlan = useCallback((planId) => {
    setEditedGoal(prev => ({
      ...prev,
      investmentPlans: prev.investmentPlans.filter(plan => plan.id !== planId),
    }));
  }, []); // No dependencies needed for filter

  const handlePlanChange = useCallback((planId, field, value) => {
    setEditedGoal(prevGoal => {
      const updatedPlans = prevGoal.investmentPlans.map(plan => {
        if (plan.id === planId) {
          let tempUpdatedPlan;
          if (field === "type") {
            const currentTargetAmount = prevGoal.targetAmount || 0;
            const currentStartYear = prevGoal.startYear || currentYear; // Use prevGoal.startYear
            const currentTimePeriod = prevGoal.targetYear
              ? prevGoal.targetYear - currentStartYear
              : 10;

            // Calculate total future value of OTHER plans
            const otherPlans = prevGoal.investmentPlans.filter(p => p.id !== planId);
            const totalFutureValueOfOtherPlans = calculateTotalFutureValue(otherPlans);
            const remainingBalance = Math.max(0, currentTargetAmount - totalFutureValueOfOtherPlans);

            // When changing plan type, recalculate based on the remaining balance
            const newDefaultPlan = getDefaultPlanState(
              value, // New type
              remainingBalance,
              currentTimePeriod,
              currentStartYear, // Pass currentStartYear
              prevGoal,
            );
            tempUpdatedPlan = { ...newDefaultPlan, id: plan.id }; // Keep original ID
          } else {
            tempUpdatedPlan = { ...plan, [field]: value };
          }
          // Recalculate the plan after the field change or type change
          return calculatePlanResults(tempUpdatedPlan);
        }
        return plan;
      });
      return { ...prevGoal, investmentPlans: updatedPlans };
    });
  }, [currentYear, calculateTotalFutureValue]);

  const handleGenerateInvestmentPlans = useCallback(() => {
    const { targetAmount, targetYear, startYear } = editedGoal; // Destructure startYear
    const planStartYear = startYear || currentYear; // Use startYear from editedGoal

    if (!targetAmount || !targetYear || targetYear <= planStartYear) {
      alert("Please set a valid Target Amount and Target Year (must be after Start Year).");
      return;
    }

    const totalTimePeriod = targetYear - planStartYear;

    // Define plan types that accumulate towards a target
    const accumulatingPlanTypes = ["sip", "lumpsum", "stepUpSip", "fd"];
    const numberOfPlans = accumulatingPlanTypes.length;

    if (numberOfPlans === 0) {
      return;
    }

    const portionOfTarget = targetAmount / numberOfPlans;

    // Generate and calculate the first N-1 plans
    const firstPlansRaw = accumulatingPlanTypes
      .slice(0, -1)
      .map((type) =>
        getDefaultPlanState(
          type,
          portionOfTarget,
          totalTimePeriod,
          planStartYear, // Pass planStartYear
          editedGoal
        )
      );
    const calculatedFirstPlans = firstPlansRaw.map(calculatePlanResults);

    // Calculate the total value from the first N-1 plans and determine the remainder for the last plan
    const totalFromFirstPlans = calculateTotalFutureValue(calculatedFirstPlans);
    const remainingTarget = targetAmount - totalFromFirstPlans;
    const lastPlanType = accumulatingPlanTypes[numberOfPlans - 1];

    // Generate and calculate the last plan to precisely meet the remaining target
    const lastPlanRaw = getDefaultPlanState(
      lastPlanType,
      remainingTarget,
      totalTimePeriod,
      planStartYear, // Pass planStartYear
      editedGoal
    );
    const calculatedLastPlan = calculatePlanResults(lastPlanRaw);

    const allGeneratedPlans = [...calculatedFirstPlans, calculatedLastPlan];
    // Ensure all generated plans have a unique ID to prevent issues with keys and deletion.
    const updatedInvestmentPlans = allGeneratedPlans.map((plan, index) => ({
      ...plan,
      id: `${Date.now()}-${index}`, // Simple unique ID generation
    }));

    setEditedGoal(prevGoal => {
      return { ...prevGoal, investmentPlans: updatedInvestmentPlans };
    });
  }, [editedGoal, currentYear, calculateTotalFutureValue]);

  const handleSaveGoal = useCallback(() => {
    onSave(editedGoal);
  }, [editedGoal, onSave]);

  return {
    editedGoal,
    setEditedGoal, // Expose setEditedGoal for direct updates if needed (e.g., in GoalFormHeader)
    handleGoalFieldChange,
    handleAddPlan,
    handleRemovePlan,
    handlePlanChange,
    handleGenerateInvestmentPlans,
    handleSaveGoal,
  };
};

export default useGoalForm;
