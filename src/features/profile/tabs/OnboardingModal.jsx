import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  alpha,
  Stack,
} from "@mui/material";
import {
  DeleteOutline as DeleteIcon,
  FlagCircle as GoalIcon,
  Speed as SpeedIcon,
  AccountBalanceWallet as IncomeIcon,
  ReceiptLong as ExpenseIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  addIncome,
  addExpense,
  addGoal,
  setBasicInfo,
  setCurrentAge,
  setRetirementAge,
  setCareerGrowthRate,
  setGeneralInflationRate,
  selectEducationInflationRate,
} from "../../../store/profileSlice";
import SliderInput from "../../../components/common/SliderInput";
import GoalForm from "../components/GoalForm";

const steps = [
  "System Parameters",
  "Income Streams",
  "Fixed Liabilities",
  "Capital Goals",
];

export default function OnboardingModal({ open, onClose }) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();
  const educationInflationRate = useSelector(selectEducationInflationRate);

  const currentYear = new Date().getFullYear();

  const [basicInfo, setBasicInfoState] = useState({
    name: "",
    age: 30,
    occupation: "",
    riskTolerance: "medium",
    retirementAge: 60,
    careerGrowthRate: 0.08,
    generalInflationRate: 0.06,
  });

  const [income, setIncome] = useState({
    name: "",
    amount: 0,
    frequency: "monthly",
    startYear: currentYear,
    endYear: currentYear + 10,
  });
  const [incomesList, setIncomesList] = useState([]);

  const [expense, setExpense] = useState({
    name: "",
    amount: 0,
    category: "basic",
    frequency: "monthly",
    startYear: currentYear,
    endYear: currentYear + 10,
  });
  const [expensesList, setExpensesList] = useState([]);

  const [goalsList, setGoalsList] = useState([]);
  const [showCustomGoalForm, setShowCustomGoalForm] = useState(false);
  const [customGoalData, setCustomGoalData] = useState({
    name: "",
    targetAmount: 0,
    targetYear: currentYear + 5,
    category: "general",
    investmentPlans: [],
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleFinish = () => {
    dispatch(
      setBasicInfo({
        name: basicInfo.name,
        age: basicInfo.age,
        occupation: basicInfo.occupation,
        riskTolerance: basicInfo.riskTolerance,
      }),
    );
    dispatch(setCurrentAge(basicInfo.age));
    dispatch(setRetirementAge(basicInfo.retirementAge));
    dispatch(setCareerGrowthRate(basicInfo.careerGrowthRate));
    dispatch(setGeneralInflationRate(basicInfo.generalInflationRate));

    incomesList.forEach((inc) =>
      dispatch(addIncome({ ...inc, id: Date.now() + Math.random() })),
    );
    expensesList.forEach((exp) =>
      dispatch(addExpense({ ...exp, id: Date.now() + Math.random() })),
    );
    goalsList.forEach((goal) => {
      dispatch(addGoal({ ...goal, id: Date.now() + Math.random() }));
    });
    localStorage.setItem("isProfileCreated", "true");
    onClose();
  };

  const handleAddIncome = () => {
    if (income.name && income.amount) {
      setIncomesList([
        ...incomesList,
        { ...income, amount: Number(income.amount) },
      ]);
      setIncome({
        name: "",
        amount: 0,
        frequency: "monthly",
        startYear: currentYear,
        endYear: currentYear + 10,
      });
    }
  };

  const handleAddExpense = () => {
    if (expense.name && expense.amount) {
      setExpensesList([
        ...expensesList,
        { ...expense, amount: Number(expense.amount) },
      ]);
      setExpense({
        name: "",
        amount: 0,
        category: "basic",
        frequency: "monthly",
        startYear: currentYear,
        endYear: currentYear + 10,
      });
    }
  };

  const applyRetirementGoal = () => {
    const yearsToRetirement = basicInfo.retirementAge - basicInfo.age;
    const monthlyBasicExpenses = expensesList
      .filter((e) => e.category === "basic")
      .reduce((sum, e) => sum + e.amount, 0);
    let yearlyExpenses = monthlyBasicExpenses * 12;
    let targetAmount = Math.round(yearlyExpenses / 0.04);
    if (yearsToRetirement > 0) {
      targetAmount =
        targetAmount *
        Math.pow(1 + basicInfo.generalInflationRate, yearsToRetirement);
    }
    setGoalsList([
      ...goalsList,
      {
        name: "Retirement Phase",
        targetAmount: targetAmount,
        targetYear:
          currentYear + (yearsToRetirement > 0 ? yearsToRetirement : 1),
        category: "retirement",
        investmentPlans: [],
      },
    ]);
  };

  const applyEducationGoal = () => {
    const yearsToCollege = 18;
    let targetAmount = 5000000;
    if (yearsToCollege > 0) {
      targetAmount =
        targetAmount * Math.pow(1 + educationInflationRate, yearsToCollege);
    }
    setGoalsList([
      ...goalsList,
      {
        name: "Higher Education Core",
        targetAmount: Math.round(targetAmount),
        targetYear: currentYear + (yearsToCollege > 0 ? yearsToCollege : 1),
        category: "education",
        investmentPlans: [],
      },
    ]);
  };

  const applyEmergencyFundGoal = () => {
    const totalMonthlyOutflow = expensesList.reduce(
      (sum, e) => sum + e.amount,
      0,
    );
    const targetAmount = Math.round(totalMonthlyOutflow * 6);
    setGoalsList([
      ...goalsList,
      {
        name: "Emergency Reserve",
        targetAmount: targetAmount > 0 ? targetAmount : 500000, // Fallback if no expenses
        targetYear: currentYear + 1,
        category: "safety",
        investmentPlans: [],
      },
    ]);
  };

  const handleAddCustomGoal = (goalData) => {
    setGoalsList([...goalsList, { ...goalData, isCustom: true }]);
    setShowCustomGoalForm(false);
    setCustomGoalData({
      name: "",
      targetAmount: 0,
      targetYear: currentYear + 5,
      category: "general",
      investmentPlans: [],
    });
  };

  // Shared Styles
  const labelStyle = {
    fontWeight: 800,
    textTransform: "uppercase",
    fontSize: "0.65rem",
    color: "text.secondary",
    letterSpacing: 0.5,
    display: "block",
    mb: 0.5,
  };

  const wellInputStyle = {
    fontWeight: 800,
    fontSize: "0.9rem",
    bgcolor: alpha(theme.palette.primary.main, 0.05),
    color: "primary.main",
    px: 1.5,
    py: 0.5,
    borderRadius: 1,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <SpeedIcon sx={{ fontSize: "1.2rem", color: "primary.main" }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                System & Demographics
              </Typography>
            </Stack>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography sx={labelStyle}>User Identity</Typography>
                <TextField
                  variant="standard"
                  fullWidth
                  size="small"
                  value={basicInfo.name}
                  onChange={(e) =>
                    setBasicInfoState({ ...basicInfo, name: e.target.value })
                  }
                  InputProps={{ disableUnderline: true, sx: wellInputStyle }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={labelStyle}>Professional Sector</Typography>
                <TextField
                  variant="standard"
                  fullWidth
                  size="small"
                  value={basicInfo.occupation}
                  onChange={(e) =>
                    setBasicInfoState({
                      ...basicInfo,
                      occupation: e.target.value,
                    })
                  }
                  InputProps={{ disableUnderline: true, sx: wellInputStyle }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <SliderInput
                  label="Current Age"
                  value={basicInfo.age}
                  onChange={(val) =>
                    setBasicInfoState({ ...basicInfo, age: val })
                  }
                  min={18}
                  max={100}
                  step={1}
                  isInline={false}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SliderInput
                  label="Retirement Target"
                  value={basicInfo.retirementAge}
                  onChange={(val) =>
                    setBasicInfoState({ ...basicInfo, retirementAge: val })
                  }
                  min={basicInfo.age}
                  max={100}
                  step={1}
                  color="warning"
                  isInline={false}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <SliderInput
                  label="Career Growth (p.a)"
                  value={(basicInfo.careerGrowthRate * 100).toFixed(1)}
                  onChange={(val) =>
                    setBasicInfoState({
                      ...basicInfo,
                      careerGrowthRate: val / 100,
                    })
                  }
                  min={0}
                  max={20}
                  step={0.1}
                  color="success"
                  isInline={false}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SliderInput
                  label="General Inflation"
                  value={(basicInfo.generalInflationRate * 100).toFixed(1)}
                  onChange={(val) =>
                    setBasicInfoState({
                      ...basicInfo,
                      generalInflationRate: val / 100,
                    })
                  }
                  min={0}
                  max={20}
                  step={0.1}
                  color="error"
                  isInline={false}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography sx={labelStyle}>
                  Calculated Risk Tolerance
                </Typography>
                <FormControl variant="standard" fullWidth>
                  <Select
                    value={basicInfo.riskTolerance}
                    onChange={(e) =>
                      setBasicInfoState({
                        ...basicInfo,
                        riskTolerance: e.target.value,
                      })
                    }
                    disableUnderline
                    sx={wellInputStyle}
                  >
                    <MenuItem value="low" sx={{ fontWeight: 700 }}>
                      Conservative (Capital Preservation)
                    </MenuItem>
                    <MenuItem value="medium" sx={{ fontWeight: 700 }}>
                      Moderate (Balanced Growth)
                    </MenuItem>
                    <MenuItem value="high" sx={{ fontWeight: 700 }}>
                      Aggressive (Maximum Yield)
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <IncomeIcon sx={{ fontSize: "1.2rem", color: "success.main" }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "success.main",
                }}
              >
                Primary Capital Inflows
              </Typography>
            </Stack>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.03),
                border: `1px dashed ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelStyle}>Source Designation</Typography>
                  <TextField
                    variant="standard"
                    fullWidth
                    size="small"
                    value={income.name}
                    onChange={(e) =>
                      setIncome({ ...income, name: e.target.value })
                    }
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        ...wellInputStyle,
                        color: "success.main",
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                        borderColor: alpha(theme.palette.success.main, 0.1),
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SliderInput
                    label="Amount"
                    value={Number(income.amount) || 0}
                    onChange={(val) => setIncome({ ...income, amount: val })}
                    min={0}
                    max={10000000}
                    step={1000}
                    color="success"
                    showInput={true}
                    isInline={false}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography sx={labelStyle}>Frequency</Typography>
                  <FormControl variant="standard" fullWidth>
                    <Select
                      value={income.frequency}
                      onChange={(e) =>
                        setIncome({ ...income, frequency: e.target.value })
                      }
                      disableUnderline
                      sx={{
                        ...wellInputStyle,
                        color: "success.main",
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                        borderColor: alpha(theme.palette.success.main, 0.1),
                      }}
                    >
                      <MenuItem value="monthly" sx={{ fontWeight: 700 }}>
                        Monthly
                      </MenuItem>
                      <MenuItem value="quarterly" sx={{ fontWeight: 700 }}>
                        Quarterly
                      </MenuItem>
                      <MenuItem value="yearly" sx={{ fontWeight: 700 }}>
                        Yearly
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <SliderInput
                    label="Start Year"
                    value={income.startYear}
                    onChange={(val) => setIncome({ ...income, startYear: val })}
                    min={currentYear}
                    max={currentYear + 50}
                    step={1}
                    color="success"
                    isInline={false}
                    showInput={true}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <SliderInput
                    label="End Year"
                    value={income.endYear}
                    onChange={(val) => setIncome({ ...income, endYear: val })}
                    min={income.startYear}
                    max={currentYear + 50}
                    step={1}
                    color="success"
                    isInline={false}
                    showInput={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleAddIncome}
                    disabled={!income.name || income.amount === 0}
                    sx={{ fontWeight: 800, px: 4 }}
                  >
                    Inject Capital Stream
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {incomesList.length > 0 && (
              <List
                dense
                sx={{
                  mt: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                }}
              >
                {incomesList.map((inc, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() =>
                          setIncomesList(
                            incomesList.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 800 }}>
                          {inc.name}
                        </Typography>
                      }
                      secondary={`${inc.amount} (${inc.frequency})`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <ExpenseIcon sx={{ fontSize: "1.2rem", color: "warning.main" }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "warning.main",
                }}
              >
                Operational Liabilities
              </Typography>
            </Stack>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.03),
                border: `1px dashed ${alpha(theme.palette.warning.main, 0.2)}`,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelStyle}>Liability Identifier</Typography>
                  <TextField
                    variant="standard"
                    fullWidth
                    size="small"
                    value={expense.name}
                    onChange={(e) =>
                      setExpense({ ...expense, name: e.target.value })
                    }
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        ...wellInputStyle,
                        color: "warning.main",
                        bgcolor: alpha(theme.palette.warning.main, 0.05),
                        borderColor: alpha(theme.palette.warning.main, 0.1),
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SliderInput
                    label="Amount"
                    value={Number(expense.amount) || 0}
                    onChange={(val) => setExpense({ ...expense, amount: val })}
                    min={0}
                    max={1000000}
                    step={500}
                    color="warning"
                    showInput={true}
                    isInline={false}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelStyle}>Classification</Typography>
                  <FormControl variant="standard" fullWidth>
                    <Select
                      value={expense.category}
                      onChange={(e) =>
                        setExpense({ ...expense, category: e.target.value })
                      }
                      disableUnderline
                      sx={{
                        ...wellInputStyle,
                        color: "warning.main",
                        bgcolor: alpha(theme.palette.warning.main, 0.05),
                        borderColor: alpha(theme.palette.warning.main, 0.1),
                      }}
                    >
                      <MenuItem value="basic" sx={{ fontWeight: 700 }}>
                        Mandatory Need
                      </MenuItem>
                      <MenuItem value="discretionary" sx={{ fontWeight: 700 }}>
                        Discretionary Want
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={labelStyle}>Frequency</Typography>
                  <FormControl variant="standard" fullWidth>
                    <Select
                      value={expense.frequency}
                      onChange={(e) =>
                        setExpense({ ...expense, frequency: e.target.value })
                      }
                      disableUnderline
                      sx={{
                        ...wellInputStyle,
                        color: "warning.main",
                        bgcolor: alpha(theme.palette.warning.main, 0.05),
                        borderColor: alpha(theme.palette.warning.main, 0.1),
                      }}
                    >
                      <MenuItem value="monthly" sx={{ fontWeight: 700 }}>
                        Monthly
                      </MenuItem>
                      <MenuItem value="quarterly" sx={{ fontWeight: 700 }}>
                        Quarterly
                      </MenuItem>
                      <MenuItem value="yearly" sx={{ fontWeight: 700 }}>
                        Yearly
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SliderInput
                    label="Start Year"
                    value={expense.startYear}
                    onChange={(val) =>
                      setExpense({ ...expense, startYear: val })
                    }
                    min={currentYear}
                    max={currentYear + 50}
                    step={1}
                    color="warning"
                    isInline={false}
                    showInput={true}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SliderInput
                    label="End Year"
                    value={expense.endYear}
                    onChange={(val) => setExpense({ ...expense, endYear: val })}
                    min={expense.startYear}
                    max={currentYear + 50}
                    step={1}
                    color="warning"
                    isInline={false}
                    showInput={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleAddExpense}
                    disabled={!expense.name || expense.amount === 0}
                    sx={{ fontWeight: 800, px: 4 }}
                  >
                    Log Liability
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {expensesList.length > 0 && (
              <List
                dense
                sx={{
                  mt: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                }}
              >
                {expensesList.map((exp, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() =>
                          setExpensesList(
                            expensesList.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 800 }}>
                          {exp.name}
                        </Typography>
                      }
                      secondary={`${exp.amount} (${exp.category})`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <GoalIcon sx={{ fontSize: "1.2rem", color: "info.main" }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "info.main",
                }}
              >
                Future Capital Goals
              </Typography>
            </Stack>

            {showCustomGoalForm ? (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <GoalForm
                  goal={customGoalData}
                  currentYear={currentYear}
                  onSave={setCustomGoalData}
                />
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  spacing={2}
                  sx={{ mt: 3 }}
                >
                  <Button
                    onClick={() => setShowCustomGoalForm(false)}
                    sx={{ fontWeight: 700 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleAddCustomGoal(customGoalData)}
                    disabled={
                      !customGoalData.name || !customGoalData.targetAmount
                    }
                    sx={{ fontWeight: 800 }}
                  >
                    Compile Goal
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {/* Styled Goal Tiles */}
                <Grid item xs={12} sm={3}>
                  <Box
                    onClick={applyRetirementGoal}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: "pointer",
                      textAlign: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      🎯
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, display: "block" }}
                    >
                      Retirement
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box
                    onClick={applyEducationGoal}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: "pointer",
                      textAlign: "center",
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                      },
                    }}
                  >
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      🎓
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, display: "block" }}
                    >
                      Education
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box
                    onClick={applyEmergencyFundGoal}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: "pointer",
                      textAlign: "center",
                      bgcolor: alpha(theme.palette.error.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                      },
                    }}
                  >
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      🛟
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, display: "block" }}
                    >
                      Safety Net
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box
                    onClick={() => setShowCustomGoalForm(true)}
                    sx={{
                      p: 2,
                      height: "100%",
                      borderRadius: 2,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      border: `1px dashed ${alpha(theme.palette.secondary.main, 0.4)}`,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.secondary.main, 0.15),
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 900,
                        color: "secondary.main",
                        textTransform: "uppercase",
                      }}
                    >
                      + Custom
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}

            {goalsList.length > 0 && (
              <List
                dense
                sx={{
                  mt: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                }}
              >
                {goalsList.map((goal, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() =>
                          setGoalsList(goalsList.filter((_, i) => i !== index))
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 800 }}>
                          {goal.name}
                        </Typography>
                      }
                      secondary={`Target Corpus: ₹${goal.targetAmount.toLocaleString("en-IN")}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: `0 24px 64px ${alpha(theme.palette.common.black || "#000", 0.2)}`,
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
          Initialize Profile Protocol
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: "text.secondary" }}
        >
          Configure base system parameters to unlock predictive wealth mapping.
        </Typography>
      </DialogTitle>

      <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />

      <DialogContent sx={{ minHeight: 400, p: { xs: 2, sm: 4 } }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 4,
            "& .MuiStepLabel-label": { fontWeight: 700, fontSize: "0.75rem" },
            "& .MuiStepIcon-root": {
              color: alpha(theme.palette.primary.main, 0.2),
            },
            "& .MuiStepIcon-root.Mui-active": { color: "primary.main" },
            "& .MuiStepIcon-root.Mui-completed": { color: "success.main" },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent(activeStep)}
      </DialogContent>

      {!showCustomGoalForm && (
        <>
          <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />
          <DialogActions
            sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}
          >
            <Button
              onClick={onClose}
              sx={{ color: "text.secondary", fontWeight: 700 }}
            >
              Bypass Initialization
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ fontWeight: 700, mr: 1 }}>
                Previous Step
              </Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Button
                onClick={handleFinish}
                variant="contained"
                color="primary"
                sx={{ fontWeight: 800, px: 4 }}
              >
                Engage System
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                sx={{ fontWeight: 800, px: 4 }}
              >
                Proceed
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
