import React, { useState, lazy, Suspense } from 'react';
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
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
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
} from '../../../store/profileSlice';

const SystemParameters = lazy(
  () => import('./OnboardingSteps/SystemParameters'),
);
const IncomeStreams = lazy(() => import('./OnboardingSteps/IncomeStreams'));
const FixedLiabilities = lazy(
  () => import('./OnboardingSteps/FixedLiabilities'),
);
const CapitalGoals = lazy(() => import('./OnboardingSteps/CapitalGoals'));

const steps = [
  'System Parameters',
  'Income Streams',
  'Fixed Liabilities',
  'Capital Goals',
];

export default function OnboardingModal({ open, onClose }) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();
  const educationInflationRate = useSelector(selectEducationInflationRate);

  const currentYear = new Date().getFullYear();

  const [basicInfo, setBasicInfoState] = useState({
    name: '',
    age: 30,
    occupation: '',
    riskTolerance: 'medium',
    retirementAge: 60,
    careerGrowthRate: 0.08,
    generalInflationRate: 0.06,
  });

  const [income, setIncome] = useState({
    name: '',
    amount: 0,
    frequency: 'monthly',
    startYear: currentYear,
    endYear: currentYear + 10,
  });
  const [incomesList, setIncomesList] = useState([]);

  const [expense, setExpense] = useState({
    name: '',
    amount: 0,
    category: 'basic',
    frequency: 'monthly',
    startYear: currentYear,
    endYear: currentYear + 10,
  });
  const [expensesList, setExpensesList] = useState([]);

  const [goalsList, setGoalsList] = useState([]);
  const [showCustomGoalForm, setShowCustomGoalForm] = useState(false);
  const [customGoalData, setCustomGoalData] = useState({
    name: '',
    targetAmount: 0,
    targetYear: currentYear + 5,
    category: 'general',
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
    localStorage.setItem('isProfileCreated', 'true');
    onClose();
  };

  const handleAddIncome = () => {
    if (income.name && income.amount) {
      setIncomesList([
        ...incomesList,
        { ...income, amount: Number(income.amount) },
      ]);
      setIncome({
        name: '',
        amount: 0,
        frequency: 'monthly',
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
        name: '',
        amount: 0,
        category: 'basic',
        frequency: 'monthly',
        startYear: currentYear,
        endYear: currentYear + 10,
      });
    }
  };

  const applyRetirementGoal = () => {
    const yearsToRetirement = basicInfo.retirementAge - basicInfo.age;
    const monthlyBasicExpenses = expensesList
      .filter((e) => e.category === 'basic')
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
        name: 'Retirement Phase',
        targetAmount: targetAmount,
        targetYear:
          currentYear + (yearsToRetirement > 0 ? yearsToRetirement : 1),
        category: 'retirement',
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
        name: 'Higher Education Core',
        targetAmount: Math.round(targetAmount),
        targetYear: currentYear + (yearsToCollege > 0 ? yearsToCollege : 1),
        category: 'education',
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
        name: 'Emergency Reserve',
        targetAmount: targetAmount > 0 ? targetAmount : 500000, // Fallback if no expenses
        targetYear: currentYear + 1,
        category: 'safety',
        investmentPlans: [],
      },
    ]);
  };

  const handleAddCustomGoal = (goalData) => {
    setGoalsList([...goalsList, { ...goalData, isCustom: true }]);
    setShowCustomGoalForm(false);
    setCustomGoalData({
      name: '',
      targetAmount: 0,
      targetYear: currentYear + 5,
      category: 'general',
      investmentPlans: [],
    });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <SystemParameters
            basicInfo={basicInfo}
            setBasicInfoState={setBasicInfoState}
          />
        );
      case 1:
        return (
          <IncomeStreams
            income={income}
            setIncome={setIncome}
            incomesList={incomesList}
            setIncomesList={setIncomesList}
            handleAddIncome={handleAddIncome}
          />
        );
      case 2:
        return (
          <FixedLiabilities
            expense={expense}
            setExpense={setExpense}
            expensesList={expensesList}
            setExpensesList={setExpensesList}
            handleAddExpense={handleAddExpense}
          />
        );
      case 3:
        return (
          <CapitalGoals
            goalsList={goalsList}
            setGoalsList={setGoalsList}
            showCustomGoalForm={showCustomGoalForm}
            setShowCustomGoalForm={setShowCustomGoalForm}
            customGoalData={customGoalData}
            setCustomGoalData={setCustomGoalData}
            applyRetirementGoal={applyRetirementGoal}
            applyEducationGoal={applyEducationGoal}
            applyEmergencyFundGoal={applyEmergencyFundGoal}
            handleAddCustomGoal={handleAddCustomGoal}
          />
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
          boxShadow: `0 24px 64px ${alpha(
            theme.palette.common.black || '#000',
            0.2,
          )}`,
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle sx={{ p: 3 }}>
        <Typography
          component="h2"
          variant="h5"
          sx={{ fontWeight: 900, letterSpacing: -0.5 }}
        >
          Initialize Profile Protocol
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: 'text.secondary' }}
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
            '& .MuiStepLabel-label': { fontWeight: 700, fontSize: '0.75rem' },
            '& .MuiStepIcon-root': {
              color: alpha(theme.palette.primary.main, 0.2),
            },
            '& .MuiStepIcon-root.Mui-active': { color: 'primary.main' },
            '& .MuiStepIcon-root.Mui-completed': { color: 'success.main' },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Suspense fallback={<div>Loading...</div>}>
          {renderStepContent(activeStep)}
        </Suspense>
      </DialogContent>

      {!showCustomGoalForm && (
        <>
          <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />
          <DialogActions
            sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}
          >
            <Button
              onClick={onClose}
              sx={{ color: 'text.secondary', fontWeight: 700 }}
            >
              Bypass Initialization
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
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
