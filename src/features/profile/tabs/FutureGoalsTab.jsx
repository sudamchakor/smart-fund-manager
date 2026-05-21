import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Slide,
  useMediaQuery,
  useTheme,
  alpha,
  Stack,
  IconButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  School as SchoolIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  ListAlt as ListIcon,
  AutoGraph as GraphIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Redux & Selectors
import { useSelector, useDispatch } from 'react-redux';
import {
  selectGoals,
  selectConsiderInflation,
  selectCurrentAge,
  selectRetirementAge,
  selectProfileExpenses,
  addGoal,
  updateGoal,
  deleteGoal,
  setConsiderInflation,
  selectGeneralInflationRate,
  selectEducationInflationRate,
  selectCurrentSurplus,
  selectTotalMonthlyGoalContributions,
  selectPrioritizedGoalFunding,
} from '../../../store/profileSlice';
import { selectCurrency } from '../../../store/emiSlice';
import { selectCalculatedValues } from '../../emiCalculator/utils/emiCalculator';

// Components
import EditableGoalItem from '../../../components/common/EditableGoalItem';
import GoalForm from '../components/GoalForm';
import BridgeGapModal from '../components/BridgeGapModal';
import StyledPaper from '../../../components/common/StyledPaper';
import SectionHeader from '../../../components/common/SectionHeader';
import ActionSpeedDial from '../../../components/common/ActionSpeedDial';
import IndividualGoalTimelineChart from '../components/IndividualGoalTimelineChart';
import GoalDistributionChart from '../components/GoalDistributionChart'; // Import the new component
import GoalCoverage from '../components/GoalCoverage';

// Charts
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Helper for Indian currency formatting
const formatIndianCurrency = (value, currency) => {
  const num = Number(value);
  if (isNaN(num)) return `${currency}0`;
  // Use Intl.NumberFormat for Lakhs and Crores formatting
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(num)
    .replace('₹', currency);
};

export default function FutureGoalsTab({ goalToEditId }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const currency = useSelector(selectCurrency);

  // Redux State
  const goalsWithFunding = useSelector(selectPrioritizedGoalFunding) || [];
  const goals = useSelector(selectGoals) || [];
  const considerInflation = useSelector(selectConsiderInflation) || false;
  const currentAge = useSelector(selectCurrentAge) || 30;
  const retirementAge = useSelector(selectRetirementAge) || 60;
  const profileExpenses = useSelector(selectProfileExpenses) || [];
  const generalInflationRate =
    (useSelector(selectGeneralInflationRate) || 0) / 100;
  const educationInflationRate =
    (useSelector(selectEducationInflationRate) || 0) / 100;
  const currentSurplus = useSelector(selectCurrentSurplus) || 0;
  const totalMonthlyGoalContributions =
    useSelector(selectTotalMonthlyGoalContributions) || 0;
  const { emi: monthlyEmi } = useSelector(selectCalculatedValues);

  // UI State
  const [openModal, setOpenModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [modalTitle, setModalTitle] = useState('Add New Goal');
  const [currentGoalFormData, setCurrentGoalFormData] = useState(null);
  const [bridgeGapModalOpen, setBridgeGapModalOpen] = useState(false);
  const [selectedGoalForGap, setSelectedGoalForGap] = useState(null);
  const [processedGoalId, setProcessedGoalId] = useState(null);

  // State for selected goal
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  const currentYear = new Date().getFullYear();
  const calculatedRetirementYear = currentYear + (retirementAge - currentAge);

  useEffect(() => {
    if (
      goalsWithFunding.length > 0 &&
      !goalsWithFunding.some((g) => g.id === selectedGoalId)
    ) {
      setSelectedGoalId(goalsWithFunding[0].id);
    } else if (goalsWithFunding.length === 0) {
      setSelectedGoalId(null);
    }
  }, [goalsWithFunding, selectedGoalId]);

  // --- Handlers ---
  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
    setEditingGoal(null);
    setCurrentGoalFormData(null);
  }, []);

  const handleModalSave = useCallback(() => {
    if (!currentGoalFormData) return;
    const finalGoal = {
      ...currentGoalFormData,
      category: currentGoalFormData.category || 'general',
    };
    if (editingGoal && editingGoal.id) {
      dispatch(updateGoal({ ...finalGoal, id: editingGoal.id }));
    } else {
      dispatch(addGoal({ ...finalGoal, id: Date.now() }));
    }
    handleCloseModal();
  }, [dispatch, editingGoal, currentGoalFormData, handleCloseModal]);

  const handleOpenModalForEdit = useCallback((goal) => {
    setEditingGoal(goal);
    setCurrentGoalFormData(goal);
    setModalTitle(`Edit ${goal.name}`);
    setOpenModal(true);
  }, []);

  const handleOpenModalForNew = useCallback(() => {
    setEditingGoal(null);
    setCurrentGoalFormData({
      name: '',
      targetAmount: 0,
      startYear: currentYear,
      targetYear: currentYear + 5,
      category: 'general',
      investmentPlans: [],
    });
    setModalTitle('Add New Goal');
    setOpenModal(true);
  }, [currentYear]);

  useEffect(() => {
    if (goalToEditId && goalToEditId !== processedGoalId && goals.length > 0) {
      const goal = goals.find((g) => g.id === goalToEditId);
      if (goal) {
        handleOpenModalForEdit(goal);
        setProcessedGoalId(goalToEditId);
      }
    }
  }, [goalToEditId, processedGoalId, goals, handleOpenModalForEdit]);

  // --- Template Applications ---
  const applyRetirementGoal = useCallback(() => {
    const yearsToRetirement = retirementAge - currentAge;
    const monthlyBasicExpenses = profileExpenses
      .filter((e) => e.category === 'basic')
      .reduce((sum, e) => sum + e.amount, 0);
    let targetAmount = Math.round((monthlyBasicExpenses * 12) / 0.04);
    if (considerInflation && yearsToRetirement > 0) {
      targetAmount *= Math.pow(1 + generalInflationRate, yearsToRetirement);
    }
    setCurrentGoalFormData({
      name: 'Retirement',
      targetAmount,
      startYear: currentYear,
      targetYear: currentYear + (yearsToRetirement > 0 ? yearsToRetirement : 1),
      category: 'retirement',
      investmentPlans: [],
    });
    setModalTitle('Add Retirement Goal');
    setOpenModal(true);
  }, [
    retirementAge,
    currentAge,
    profileExpenses,
    considerInflation,
    generalInflationRate,
    currentYear,
  ]);

  const applyEducationGoal = useCallback(() => {
    let targetAmount = 5000000;
    const yearsToCollege = 18;
    if (considerInflation)
      targetAmount *= Math.pow(1 + educationInflationRate, yearsToCollege);
    setCurrentGoalFormData({
      name: "Child's Higher Ed",
      targetAmount: Math.round(targetAmount),
      startYear: currentYear,
      targetYear: currentYear + yearsToCollege,
      category: 'education',
      investmentPlans: [],
    });
    setModalTitle('Add Higher Education Goal');
    setOpenModal(true);
  }, [considerInflation, educationInflationRate, currentYear]);

  const applyEmergencyFundGoal = useCallback(() => {
    const totalOutflow =
      profileExpenses.reduce((sum, e) => sum + e.amount, 0) +
      monthlyEmi +
      totalMonthlyGoalContributions;
    setCurrentGoalFormData({
      name: 'Emergency Fund',
      targetAmount: Math.round(totalOutflow * 6),
      startYear: currentYear,
      targetYear: currentYear + 1,
      category: 'safety',
      investmentPlans: [],
    });
    setModalTitle('Add Emergency Fund Goal');
    setOpenModal(true);
  }, [profileExpenses, monthlyEmi, totalMonthlyGoalContributions, currentYear]);

  const actions = [
    {
      icon: <HealthAndSafetyIcon />,
      name: 'Emergency Fund',
      handler: applyEmergencyFundGoal,
    },
    {
      icon: <SchoolIcon />,
      name: "Child's Education",
      handler: applyEducationGoal,
    },
    {
      icon: <TrendingUpIcon />,
      name: 'Retirement',
      handler: applyRetirementGoal,
    },
    {
      icon: <AddIcon />,
      name: 'New Custom Goal',
      handler: handleOpenModalForNew,
    },
  ];

  // Overall Wealth Projection Logic
  const wealthData = useMemo(() => {
    if (goals.length === 0) return [];
    const maxGoalYear = goals.reduce(
      (max, g) => Math.max(max, g.targetYear),
      currentYear,
    );
    const endYear = Math.max(
      maxGoalYear,
      calculatedRetirementYear,
      currentYear + 25,
    );

    let currentWealth = 0; // Starts from 0, projecting future wealth from surplus
    const data = [];
    const goalPayouts = new Map();
    goals.forEach((g) => {
      const currentPayout = goalPayouts.get(g.targetYear) || 0;
      goalPayouts.set(g.targetYear, currentPayout + g.targetAmount);
    });

    for (let year = currentYear; year <= endYear; year++) {
      const annualSurplus = currentSurplus * 12;
      const investmentReturnRate = 0.08; // Assumed rate of return

      // Compound the wealth annually
      currentWealth =
        currentWealth * (1 + investmentReturnRate) + annualSurplus;

      // Subtract one-time goal target amounts in their respective maturity years
      if (goalPayouts.has(year)) {
        currentWealth -= goalPayouts.get(year);
      }

      let realWealth = currentWealth;
      if (year - currentYear > 0) {
        realWealth /= Math.pow(1 + generalInflationRate, year - currentYear);
      }

      data.push({
        year,
        'Total Wealth': Math.max(0, Math.round(currentWealth)),
        'Real Value': Math.max(0, Math.round(realWealth)),
      });
    }
    return data;
  }, [
    goals,
    currentYear,
    calculatedRetirementYear,
    currentSurplus,
    generalInflationRate,
  ]);

  // Goal Distribution Pie Chart Data
  const goalDistributionData = useMemo(() => {
    const totalGoalsValue = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    if (totalGoalsValue === 0) return [];

    const chartColors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
    ];

    return goals.map((g, index) => ({
      name: g.name,
      value: g.targetAmount,
      percentage: (g.targetAmount / totalGoalsValue) * 100,
      color: chartColors[index % chartColors.length],
    }));
  }, [goals, theme]);

  const totalAggregateGoalsValue = useMemo(
    () => goals.reduce((sum, g) => sum + g.targetAmount, 0),
    [goals],
  );

  return (
    <Box>
      {currentSurplus < 0 && (
        <Alert
          severity="warning"
          variant="outlined"
          sx={{ borderRadius: 2, fontWeight: 700, mb: 2 }}
        >
          Goal funding is restricted due to negative surplus.
        </Alert>
      )}

      {!isMediumScreen && (
        <StyledPaper sx={{ p: 2, mb: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <SectionHeader
              title="Smart Goal Templates"
              icon={<TrendingUpIcon />}
              color={theme.palette.primary.main}
            />
            <Stack direction="row" spacing={1.5}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                onClick={applyRetirementGoal}
              >
                Retirement
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SchoolIcon />}
                onClick={applyEducationGoal}
              >
                Education
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<HealthAndSafetyIcon />}
                onClick={applyEmergencyFundGoal}
              >
                Emergency
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenModalForNew}
                disabled={currentSurplus < 0}
              >
                New Custom Goal
              </Button>
            </Stack>
          </Stack>
        </StyledPaper>
      )}

      {/* Horizontally Scrollable Goal List */}
      <StyledPaper sx={{ p: 2, mb: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <SectionHeader
            title={`Your Goals (${goalsWithFunding.length})`}
            icon={<ListIcon />}
            color={theme.palette.secondary.main}
          />
          {/* Removed Inflation Toggle */}
        </Stack>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.divider, 0.2),
              borderRadius: '4px',
            },
          }}
        >
          {goalsWithFunding.length > 0 ? (
            goalsWithFunding.map((g) => (
              <Box key={g.id} sx={{ flex: '0 0 300px' }}>
                <EditableGoalItem
                  goal={g}
                  currency={currency}
                  onEdit={handleOpenModalForEdit}
                  onDelete={(id) => dispatch(deleteGoal(id))}
                  onOpenBridgeGapModal={(goal) => {
                    setSelectedGoalForGap(goal);
                    setBridgeGapModalOpen(true);
                  }}
                  isSelected={g.id === selectedGoalId}
                  onSelect={setSelectedGoalId}
                />
              </Box>
            ))
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              sx={{ py: 4, width: '100%' }}
            >
              No active goals.
            </Typography>
          )}
        </Box>
      </StyledPaper>

      {/* Charts Section */}
      <Grid container spacing={2.5} alignItems="flex-start">
        <Grid item xs={12} lg={6}>
          <StyledPaper>
            <SectionHeader
              title={`Goals Timeline: ${goals.find((g) => g.id === selectedGoalId)?.name || 'All'} vs. Combined Total`}
              icon={<GraphIcon />}
              color={theme.palette.primary.main}
            />
            <Box sx={{ height: { xs: 280, md: 350 } }}>
              <IndividualGoalTimelineChart
                goals={goalsWithFunding}
                selectedGoalId={selectedGoalId}
                currency={currency}
              />
            </Box>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <StyledPaper>
            <SectionHeader
              title="Overall Wealth Projection"
              icon={<GraphIcon />}
              color={theme.palette.success.main}
            />
            <Box sx={{ height: { xs: 280, md: 350 }, p: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wealthData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={alpha(theme.palette.divider, 0.1)}
                  />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fontWeight: 700,
                      fill: theme.palette.text.secondary,
                    }}
                  />
                  <YAxis
                    tickFormatter={(val) => formatIndianCurrency(val, currency)}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fontWeight: 700,
                      fill: theme.palette.text.secondary,
                    }}
                  />
                  <RechartsTooltip
                    formatter={(value, name) => [
                      formatIndianCurrency(value, currency),
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                  <Legend
                    iconSize={10}
                    wrapperStyle={{
                      fontSize: '12px',
                      color: theme.palette.text.secondary,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Total Wealth"
                    stroke={theme.palette.success.main}
                    fill={alpha(theme.palette.success.main, 0.2)}
                    name="Nominal Value"
                  />
                  <Area
                    type="monotone"
                    dataKey="Real Value"
                    stroke={theme.palette.info.main}
                    strokeDasharray="5 5"
                    fill="transparent"
                    name="Real Value (Inflation Adjusted)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <GoalCoverage />
        </Grid>
        <Grid item xs={12} lg={6}>
          <GoalDistributionChart
            goalDistributionData={goalDistributionData}
            totalAggregateGoalsValue={totalAggregateGoalsValue}
            currency={currency}
          />
        </Grid>
      </Grid>

      {isMediumScreen && !openModal && (
        <ActionSpeedDial
          actions={actions}
          sx={{ bottom: { xs: 80, sm: 70 }, zIndex: 1400 }}
        />
      )}

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullScreen
        TransitionComponent={Transition}
        sx={{ mt: '5rem' }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {modalTitle}{' '}
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {currentGoalFormData && (
            <GoalForm
              goal={currentGoalFormData}
              currentYear={currentYear}
              onSave={setCurrentGoalFormData}
              retirementYear={calculatedRetirementYear}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            onClick={handleModalSave}
            variant="contained"
            sx={{ px: 4, borderRadius: 2 }}
          >
            Save Goal
          </Button>
        </DialogActions>
      </Dialog>
      <BridgeGapModal
        open={bridgeGapModalOpen}
        onClose={() => setBridgeGapModalOpen(false)}
        goal={selectedGoalForGap}
      />
    </Box>
  );
}