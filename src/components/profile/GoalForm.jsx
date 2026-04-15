import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete"; // Import DeleteIcon

import SliderInput from "../common/SliderInput";
import {
  calculateSip,
  calculateLumpsum,
  calculateStepUpSip,
  calculateSwp,
  calculateFd,
} from "./investmentCalculations";
import GeneratedInvestmentPlans from "./GeneratedInvestmentPlans";

// Import calculator forms
import SipCalculatorForm from "../calculators/investment/SipCalculatorForm";
import LumpsumCalculatorForm from "../calculators/investment/LumpsumCalculatorForm";
import StepUpSipCalculatorForm from "../calculators/investment/LumpsumCalculatorForm";
import SwpCalculatorForm from "../calculators/investment/SwpCalculatorForm";
import FdCalculatorForm from "../calculators/investment/FdCalculatorForm";

// Helper function to generate plan summary
const generatePlanSummary = (plan) => {
  const formatAmount = (amount) =>
    (amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  const formatRate = (rate) => rate || 0;
  const formatTime = (time) => time || 0;

  switch (plan.type) {
    case "sip":
      return `Monthly ₹${formatAmount(plan.monthlyInvestment)} for ${formatTime(plan.timePeriod)} years @ ${formatRate(plan.expectedReturnRate)}% p.a.`;
    case "lumpsum":
      return `One-time ₹${formatAmount(plan.totalInvestment)} for ${formatTime(plan.timePeriod)} years @ ${formatRate(plan.expectedReturnRate)}% p.a.`;
    case "stepUpSip":
      return `Monthly ₹${formatAmount(plan.monthlyInvestment)} with ${formatRate(plan.stepUpPercentage)}% annual step-up for ${formatTime(plan.timePeriod)} years @ ${formatRate(plan.expectedReturnRate)}% p.a.`;
    case "swp":
      return `Start with ₹${formatAmount(plan.totalInvestment)}, withdraw ₹${formatAmount(plan.withdrawalPerMonth)}/month for ${formatTime(plan.timePeriod)} years @ ${formatRate(plan.expectedReturnRate)}% p.a.`;
    case "fd":
      return `One-time ₹${formatAmount(plan.principalAmount)} for ${formatTime(plan.timePeriod)} years @ ${formatRate(plan.interestRate)}% p.a. (${plan.compoundingFrequency} Compounded)`;
    default:
      return "Unknown Plan Type";
  }
};

export const GoalForm = ({ goal, currentYear, onSave }) => {
  const getDefaultPlanState = (type, targetAmount = 0, timePeriod = 10) => {
    const defaultTimePeriodFromGoal = goal?.targetYear
      ? goal.targetYear - currentYear
      : 10;
    const effectiveTimePeriod = Math.max(
      1,
      timePeriod > 0 ? timePeriod : defaultTimePeriodFromGoal,
    );

    // Calculate a base amount for initial suggestions, ensuring a minimum of 500
    // These are heuristics to provide a reasonable starting point for the user
    const baseAmountForSip = Math.max(
      500,
      Math.round(targetAmount / (effectiveTimePeriod * 12 * 2)),
    ); // Aim for SIP to cover half of target over time
    const baseAmountForLumpsum = Math.max(500, Math.round(targetAmount / 2)); // Aim for lumpsum to cover half of target
    const baseAmountForFd = Math.max(500, Math.round(targetAmount / 2)); // Aim for FD to cover half of target

    let plan = {};
    switch (type) {
      case "sip":
        plan = {
          id: Date.now().toString(),
          type: "sip",
          monthlyInvestment: baseAmountForSip,
          expectedReturnRate: 12,
          timePeriod: effectiveTimePeriod,
          isSafe: false,
        };
        break;
      case "lumpsum":
        plan = {
          id: Date.now().toString(),
          type: "lumpsum",
          totalInvestment: baseAmountForLumpsum,
          expectedReturnRate: 12,
          timePeriod: effectiveTimePeriod,
          isSafe: false,
        };
        break;
      case "stepUpSip":
        plan = {
          id: Date.now().toString(),
          type: "stepUpSip",
          monthlyInvestment: baseAmountForSip, // Using SIP base for step-up
          stepUpPercentage: 10,
          expectedReturnRate: 12,
          timePeriod: effectiveTimePeriod,
          isSafe: false,
        };
        break;
      case "swp":
        plan = {
          id: Date.now().toString(),
          type: "swp",
          totalInvestment: baseAmountForLumpsum, // Using lumpsum base for SWP
          withdrawalPerMonth: Math.max(
            500,
            Math.round(baseAmountForLumpsum / (effectiveTimePeriod * 12)),
          ),
          expectedReturnRate: 8,
          timePeriod: effectiveTimePeriod,
          isSafe: false,
        };
        break;
      case "fd":
        plan = {
          id: Date.now().toString(),
          type: "fd",
          principalAmount: baseAmountForFd,
          interestRate: 7,
          timePeriod: effectiveTimePeriod,
          compoundingFrequency: "annually",
          isSafe: true, // FD is generally considered safe
        };
        break;
      default:
        plan = {
          id: Date.now().toString(),
          type: "sip",
          monthlyInvestment: baseAmountForSip,
          expectedReturnRate: 12,
          timePeriod: effectiveTimePeriod,
          isSafe: false,
        };
        break;
    }
    return { ...plan, details: generatePlanSummary(plan) };
  };

  // Helper function to calculate results and generate full summary for a single plan
  const calculatePlanResults = (plan) => {
    let result = {};
    let investedAmount = 0;
    let estimatedReturns = 0;
    let totalValue = 0;

    const formatAmount = (amount) =>
      (amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

    switch (plan.type) {
      case "sip":
        result = calculateSip(
          plan.monthlyInvestment,
          plan.expectedReturnRate,
          plan.timePeriod,
        );
        investedAmount = result.investedAmount;
        estimatedReturns = result.estimatedReturns;
        totalValue = result.totalValue;
        break;
      case "lumpsum":
        result = calculateLumpsum(
          plan.totalInvestment,
          plan.expectedReturnRate,
          plan.timePeriod,
        );
        investedAmount = result.investedAmount;
        estimatedReturns = result.estimatedReturns;
        totalValue = result.totalValue;
        break;
      case "stepUpSip":
        result = calculateStepUpSip(
          plan.monthlyInvestment,
          plan.expectedReturnRate,
          plan.timePeriod,
          plan.stepUpPercentage,
        );
        investedAmount = result.investedAmount;
        estimatedReturns = result.estimatedReturns;
        totalValue = result.totalValue;
        break;
      case "swp":
        result = calculateSwp(
          plan.totalInvestment,
          plan.expectedReturnRate,
          plan.timePeriod,
          plan.withdrawalPerMonth,
        );
        investedAmount = result.principal; // For SWP, principal is the invested amount
        estimatedReturns = result.totalWithdrawn - result.principal; // Returns are total withdrawn minus principal
        totalValue = result.totalValue; // Remaining balance
        break;
      case "fd":
        result = calculateFd(
          plan.principalAmount,
          plan.interestRate,
          plan.timePeriod,
          plan.compoundingFrequency,
        );
        investedAmount = result.investedAmount;
        estimatedReturns = result.estimatedReturns;
        totalValue = result.totalValue;
        break;
      default:
        break;
    }

    let fullSummary = "";
    if (Object.keys(result).length > 0) {
      const details = generatePlanSummary(plan); // Ensure details are up-to-date
      fullSummary = `${details}\n\nInvested Amount: ₹${formatAmount(investedAmount)}\n\nEst. Returns: ₹${formatAmount(estimatedReturns)}\n\nTotal Value: ₹${formatAmount(totalValue)}`;
    }

    return {
      ...plan,
      ...result, // Spread result to include calculated values
      investedAmount,
      estimatedReturns,
      totalValue,
      fullSummary,
    };
  };

  const [editedGoal, setEditedGoal] = useState(() => {
    const initialTargetAmount = goal?.targetAmount || 0;
    const initialTimePeriod = goal?.targetYear
      ? goal.targetYear - currentYear
      : 10;

    if (goal && goal.investmentPlans && goal.investmentPlans.length > 0) {
      return {
        ...goal,
        investmentPlans: goal.investmentPlans.map((plan) => {
          const planWithDetails = {
            ...plan,
            details: generatePlanSummary(plan),
          };
          return calculatePlanResults(planWithDetails); // Ensure fullSummary is generated
        }),
      };
    } else if (goal && goal.investmentType) {
      // If an old goal has investmentType, convert it to a plan
      const defaultPlan = getDefaultPlanState(
        goal.investmentType,
        initialTargetAmount,
        initialTimePeriod,
      );
      return {
        ...goal,
        investmentPlans: [calculatePlanResults(defaultPlan)], // Ensure fullSummary is generated
      };
    }
    const defaultPlan = getDefaultPlanState(
      "sip",
      initialTargetAmount,
      initialTimePeriod,
    );
    return {
      ...goal,
      investmentPlans: [calculatePlanResults(defaultPlan)], // Ensure fullSummary is generated
    };
  });

  const [generatedInvestmentPlans, setGeneratedInvestmentPlans] = useState([]);
  const [totalInvestedAmount, setTotalInvestedAmount] = useState(0);
  const [totalEstimatedReturns, setTotalEstimatedReturns] = useState(0);
  const [totalCurrentValue, setTotalCurrentValue] = useState(0);
  const [overallROI, setOverallROI] = useState(null);

  useEffect(() => {
    // This effect ensures that if the 'goal' prop changes, the editedGoal state is updated.
    // It also handles the conversion of old 'investmentType' to new 'investmentPlans' structure.
    setEditedGoal((prevGoal) => {
      const currentTargetAmount = goal?.targetAmount || 0;
      const currentTimePeriod = goal?.targetYear
        ? goal.targetYear - currentYear
        : 10;

      let newEditedGoal;
      if (goal && goal.investmentPlans && goal.investmentPlans.length > 0) {
        newEditedGoal = {
          ...goal,
          investmentPlans: goal.investmentPlans.map((plan) => {
            const planWithDetails = {
              ...plan,
              details: generatePlanSummary(plan),
            };
            return calculatePlanResults(planWithDetails); // Ensure fullSummary is generated
          }),
        };
      } else if (goal && goal.investmentType) {
        const defaultPlan = getDefaultPlanState(
          goal.investmentType,
          currentTargetAmount,
          currentTimePeriod,
        );
        newEditedGoal = {
          ...goal,
          investmentPlans: [calculatePlanResults(defaultPlan)], // Ensure fullSummary is generated
        };
      } else {
        const defaultPlan = getDefaultPlanState(
          "sip",
          currentTargetAmount,
          currentTimePeriod,
        );
        newEditedGoal = {
          ...goal,
          investmentPlans: [calculatePlanResults(defaultPlan)], // Ensure fullSummary is generated
        };
      }
      return newEditedGoal;
    });
  }, [goal, currentYear]); // Added currentYear to dependency array

  useEffect(() => {
    onSave(editedGoal);
  }, [editedGoal, onSave]);

  const handleAddPlan = () => {
    const currentTargetAmount = editedGoal.targetAmount || 0;
    const currentTimePeriod = editedGoal.targetYear
      ? editedGoal.targetYear - currentYear
      : 10;
    setEditedGoal((prev) => ({
      ...prev,
      investmentPlans: [
        ...prev.investmentPlans,
        calculatePlanResults(
          getDefaultPlanState("sip", currentTargetAmount, currentTimePeriod),
        ), // Add a default SIP plan with full summary
      ],
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
          let updatedPlan = { ...plan, [field]: value };

          if (field === "type") {
            // When type changes, get default values for the new type
            const currentTargetAmount = prev.targetAmount || 0;
            const currentTimePeriod = prev.targetYear
              ? prev.targetYear - currentYear
              : 10;
            const newDefaultPlan = getDefaultPlanState(
              value,
              currentTargetAmount,
              currentTimePeriod,
            );
            // Merge new default values, but keep the original ID
            updatedPlan = { ...newDefaultPlan, id: plan.id, type: value };
          }

          // Recalculate details string and full summary after updating the plan
          const planWithDetails = {
            ...updatedPlan,
            details: generatePlanSummary(updatedPlan),
          };
          return calculatePlanResults(planWithDetails);
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

    // Always generate a new set of plans with all available types
    const newPlans = [
      getDefaultPlanState("sip", targetAmount, totalTimePeriod),
      getDefaultPlanState("lumpsum", targetAmount, totalTimePeriod),
      getDefaultPlanState("stepUpSip", targetAmount, totalTimePeriod),
      getDefaultPlanState("swp", targetAmount, totalTimePeriod),
      getDefaultPlanState("fd", targetAmount, totalTimePeriod),
    ];

    // Calculate results and full summary for each new plan
    const updatedInvestmentPlans = newPlans.map((plan) =>
      calculatePlanResults(plan),
    );

    // Update the editedGoal state with these newly generated plans
    setEditedGoal((prev) => ({
      ...prev,
      investmentPlans: updatedInvestmentPlans,
    }));

    // Now, aggregate totals and prepare data for GeneratedInvestmentPlans component
    const generatedPlansForSummary = [];
    let calculatedTotalInvestedAmount = 0;
    let calculatedTotalEstimatedReturns = 0;
    let calculatedTotalCurrentValue = 0;

    updatedInvestmentPlans.forEach((plan) => {
      // Only aggregate if calculation was successful (plan.fullSummary exists)
      if (plan.fullSummary) {
        const planResult = {
          id: plan.id,
          type: plan.type,
          name: plan.type.toUpperCase(),
          investedAmount: plan.investedAmount,
          estimatedReturns: plan.estimatedReturns,
          totalValue: plan.totalValue,
          details: plan.details,
          fullSummary: plan.fullSummary,
          isSafe: plan.isSafe,
          principal: plan.principal, // For SWP
          totalWithdrawn: plan.totalWithdrawn, // For SWP
        };
        generatedPlansForSummary.push(planResult);

        if (plan.type === "swp") {
          calculatedTotalInvestedAmount += plan.principal || 0;
          calculatedTotalCurrentValue += plan.totalValue || 0;
        } else {
          calculatedTotalInvestedAmount += plan.investedAmount || 0;
          calculatedTotalEstimatedReturns += plan.estimatedReturns || 0;
          calculatedTotalCurrentValue += plan.totalValue || 0;
        }
      }
    });

    setGeneratedInvestmentPlans(generatedPlansForSummary); // Update the state for the summary component
    setTotalInvestedAmount(calculatedTotalInvestedAmount);
    setTotalEstimatedReturns(calculatedTotalEstimatedReturns);
    setTotalCurrentValue(calculatedTotalCurrentValue);

    if (calculatedTotalInvestedAmount > 0) {
      const roi =
        ((calculatedTotalCurrentValue - calculatedTotalInvestedAmount) /
          calculatedTotalInvestedAmount) *
        100;
      setOverallROI(roi);
    } else {
      setOverallROI(null);
    }
  };

  const totalTimePeriod = editedGoal.targetYear
    ? editedGoal.targetYear - currentYear
    : 0;

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
              >
                Generate Investment Plans
              </Button>
            )}
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Investment Plans
      </Typography>
      <Grid container spacing={2}>
        {" "}
        {/* Added Grid container here */}
        {editedGoal.investmentPlans.map((plan, index) => (
          <Grid item xs={6} key={plan.id}>
            {/* Changed to xs={12} for full width */}
            <Box
              sx={{ border: "1px solid #ddd", p: 2, mb: 2, borderRadius: 2 }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Plan Type</InputLabel>
                    <Select
                      value={plan.type}
                      label="Plan Type"
                      onChange={(e) =>
                        handlePlanChange(plan.id, "type", e.target.value)
                      }
                    >
                      <MenuItem value="sip">SIP</MenuItem>
                      <MenuItem value="lumpsum">Lumpsum</MenuItem>
                      <MenuItem value="stepUpSip">Step-Up SIP</MenuItem>
                      <MenuItem value="swp">SWP</MenuItem>
                      <MenuItem value="fd">Fixed Deposit</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={2} sx={{ textAlign: "right" }}>
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleRemovePlan(plan.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    {plan.details && ( // Display the summary if it exists
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        {plan.fullSummary ? (
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 1,
                              whiteSpace: "pre-line",
                              fontWeight: 500,
                            }}
                          >
                            {plan.fullSummary}
                          </Typography>
                        ) : (
                          plan.details
                        )}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Box>

              <Box sx={{ mt: 2 }}>
                {plan.type === "sip" && (
                  <SipCalculatorForm
                    sharedState={plan}
                    onSharedStateChange={(field, value) =>
                      handlePlanChange(plan.id, field, value)
                    }
                    onCalculate={() => {}} // Placeholder, actual calculation happens on button click
                  />
                )}
                {plan.type === "lumpsum" && (
                  <LumpsumCalculatorForm
                    sharedState={plan}
                    onSharedStateChange={(field, value) =>
                      handlePlanChange(plan.id, field, value)
                    }
                    onCalculate={() => {}}
                  />
                )}
                {plan.type === "stepUpSip" && (
                  <StepUpSipCalculatorForm
                    sharedState={plan}
                    onSharedStateChange={(field, value) =>
                      handlePlanChange(plan.id, field, value)
                    }
                    onCalculate={() => {}}
                  />
                )}
                {plan.type === "swp" && (
                  <SwpCalculatorForm
                    sharedState={plan}
                    onSharedStateChange={(field, value) =>
                      handlePlanChange(plan.id, field, value)
                    }
                    onCalculate={() => {}}
                  />
                )}
                {plan.type === "fd" && (
                  <FdCalculatorForm
                    sharedState={plan}
                    onSharedStateChange={(field, value) =>
                      handlePlanChange(plan.id, field, value)
                    }
                    onCalculate={() => {}}
                  />
                )}
              </Box>
            </Box>
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
