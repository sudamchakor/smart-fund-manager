import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Paper,
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
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  IconButton,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  School as SchoolIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  ListAlt as ListIcon,
  AutoGraph as GraphIcon,
  PieChart as PieIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

// Redux & Selectors
import { useSelector, useDispatch } from "react-redux";
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
  selectCareerGrowthRate,
  selectCurrentSurplus,
  selectTotalMonthlyIncome,
  selectTotalMonthlyGoalContributions,
  selectPrioritizedGoalFunding,
} from "../../../store/profileSlice";
import { selectCurrency } from "../../../store/emiSlice";
import { selectCalculatedValues } from "../../emiCalculator/utils/emiCalculator";

// Components
import EditableGoalItem from "../../../components/common/EditableGoalItem";
import GoalForm from "../components/GoalForm";
import BridgeGapModal from "../components/BridgeGapModal";

// Charts
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
} from "recharts";

const StyledPaper = ({ children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
      bgcolor: "background.paper",
      height: "100%",
      ...sx,
    }}
  >
    {children}
  </Paper>
);

const SectionHeader = ({ icon, title, color }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
    <Box
      sx={{
        display: "flex",
        p: 1,
        borderRadius: 2,
        bgcolor: alpha(color || "#1976d2", 0.1),
        color: color || "primary.main",
      }}
    >
      {icon}
    </Box>
    <Typography
      variant="h6"
      sx={{ fontWeight: 800, color: "#1a1a1a", fontSize: "1.1rem" }}
    >
      {title}
    </Typography>
  </Stack>
);

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FutureGoalsTab({ goalToEditId }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const currency = useSelector(selectCurrency);

  // Redux State
  const goalsWithFunding = useSelector(selectPrioritizedGoalFunding) || [];
  const goals = useSelector(selectGoals) || [];
  const considerInflation = useSelector(selectConsiderInflation) || false;
  const currentAge = useSelector(selectCurrentAge) || 30;
  const retirementAge = useSelector(selectRetirementAge) || 60;
  const profileExpenses = useSelector(selectProfileExpenses) || [];
  const generalInflationRate = useSelector(selectGeneralInflationRate) || 0;
  const educationInflationRate = useSelector(selectEducationInflationRate) || 0;
  const careerGrowthRaw = useSelector(selectCareerGrowthRate);
  const careerGrowthRate =
    typeof careerGrowthRaw === "object"
      ? careerGrowthRaw.value
      : careerGrowthRaw || 0;
  const careerGrowthType =
    typeof careerGrowthRaw === "object" ? careerGrowthRaw.type : "percentage";
  const totalMonthlyIncome = useSelector(selectTotalMonthlyIncome) || 0;
  const currentSurplus = useSelector(selectCurrentSurplus) || 0;
  const totalMonthlyGoalContributions =
    useSelector(selectTotalMonthlyGoalContributions) || 0;
  const { emi: monthlyEmi } = useSelector(selectCalculatedValues);

  // UI State
  const [realValueToggle, setRealValueToggle] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [modalTitle, setModalTitle] = useState("Add New Goal");
  const [currentGoalFormData, setCurrentGoalFormData] = useState(null);
  const [bridgeGapModalOpen, setBridgeGapModalOpen] = useState(false);
  const [selectedGoalForGap, setSelectedGoalForGap] = useState(null);

  const currentYear = new Date().getFullYear();
  const calculatedRetirementYear = currentYear + (retirementAge - currentAge);


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
      category: currentGoalFormData.category || "general",
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
      name: "",
      targetAmount: 0,
      startYear: currentYear,
      targetYear: currentYear + 5,
      category: "general",
      investmentPlans: [],
    });
    setModalTitle("Add New Goal");
    setOpenModal(true);
  }, [currentYear]);

  // --- Template Applications ---
  const applyRetirementGoal = useCallback(() => {
    const yearsToRetirement = retirementAge - currentAge;
    const monthlyBasicExpenses = profileExpenses
      .filter((e) => e.category === "basic")
      .reduce((sum, e) => sum + e.amount, 0);
    let targetAmount = Math.round((monthlyBasicExpenses * 12) / 0.04);
    if (considerInflation && yearsToRetirement > 0) {
      targetAmount *= Math.pow(1 + generalInflationRate, yearsToRetirement);
    }
    setCurrentGoalFormData({
      name: "Retirement",
      targetAmount,
      startYear: currentYear,
      targetYear: currentYear + (yearsToRetirement > 0 ? yearsToRetirement : 1),
      category: "retirement",
      investmentPlans: [],
    });
    setModalTitle("Add Retirement Goal");
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
      category: "education",
      investmentPlans: [],
    });
    setModalTitle("Add Higher Education Goal");
    setOpenModal(true);
  }, [considerInflation, educationInflationRate, currentYear]);

  const applyEmergencyFundGoal = useCallback(() => {
    const totalOutflow =
      profileExpenses.reduce((sum, e) => sum + e.amount, 0) +
      monthlyEmi +
      totalMonthlyGoalContributions;
    setCurrentGoalFormData({
      name: "Emergency Fund",
      targetAmount: Math.round(totalOutflow * 6),
      startYear: currentYear,
      targetYear: currentYear + 1,
      category: "safety",
      investmentPlans: [],
    });
    setModalTitle("Add Emergency Fund Goal");
    setOpenModal(true);
  }, [profileExpenses, monthlyEmi, totalMonthlyGoalContributions, currentYear]);

  const actions = [
    {
      icon: <HealthAndSafetyIcon />,
      name: "Emergency Fund",
      handler: applyEmergencyFundGoal,
    },
    {
      icon: <SchoolIcon />,
      name: "Child's Education",
      handler: applyEducationGoal,
    },
    {
      icon: <TrendingUpIcon />,
      name: "Retirement",
      handler: applyRetirementGoal,
    },
    {
      icon: <AddIcon />,
      name: "New Custom Goal",
      handler: handleOpenModalForNew,
    },
  ];

  // --- Wealth Calculation Logic ---
  const wealthData = useMemo(() => {
    const maxGoalYear = goals.reduce(
      (max, g) => Math.max(max, g.targetYear),
      currentYear + 10,
    );
    const endYear = Math.max(
      maxGoalYear,
      currentYear + (retirementAge - currentAge),
      currentYear + 10,
    );
    let currentTotalWealth = 0;
    let currentMonthlyIncome = totalMonthlyIncome;
    let outflowExGoals =
      profileExpenses.reduce((acc, exp) => acc + exp.amount, 0) + monthlyEmi;
    const data = [];

    for (let year = currentYear; year <= endYear; year++) {
      const yearsFromNow = year - currentYear;
      if (yearsFromNow > 0) {
        currentMonthlyIncome *=
          1 + (careerGrowthType === "percentage" ? careerGrowthRate : 0);
      }
      const annualSurplus =
        (currentMonthlyIncome -
          outflowExGoals -
          totalMonthlyGoalContributions) *
        12;
      currentTotalWealth = (currentTotalWealth + annualSurplus) * 1.08;

      let displayWealth = currentTotalWealth;
      if (realValueToggle && yearsFromNow > 0)
        displayWealth /= Math.pow(1 + generalInflationRate, yearsFromNow);

      const totalGoalsThisYear = goals.reduce((sum, g) => {
        if (g.targetYear === year) {
          let target = g.targetAmount;
          if (considerInflation)
            target *= Math.pow(
              1 +
                (g.category === "education"
                  ? educationInflationRate
                  : generalInflationRate),
              yearsFromNow,
            );
          return sum + target;
        }
        return sum;
      }, 0);

      data.push({
        year,
        "Total Wealth": Math.round(displayWealth),
        "Goals Target":
          totalGoalsThisYear > 0 ? Math.round(totalGoalsThisYear) : null,
      });
    }
    return data;
  }, [
    goals,
    currentYear,
    retirementAge,
    totalMonthlyIncome,
    profileExpenses,
    monthlyEmi,
    careerGrowthRate,
    careerGrowthType,
    realValueToggle,
    considerInflation,
    generalInflationRate,
    educationInflationRate,
    totalMonthlyGoalContributions,
  ]);

  const breakEvenYear = useMemo(() => {
    const point = wealthData.find(
      (d) => d["Total Wealth"] >= d["Goals Target"],
    );
    return point ? point.year : null;
  }, [wealthData]);

  return (
    <Grid container spacing={2.5}>
      {currentSurplus < 0 && (
        <Grid item xs={12}>
          <Alert
            severity="warning"
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Goal funding is restricted due to negative surplus.
          </Alert>
        </Grid>
      )}

      {!isMediumScreen && (
        <Grid item xs={12}>
          <StyledPaper sx={{ p: 2 }}>
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
        </Grid>
      )}

      <Grid item xs={12} md={4}>
        <StyledPaper>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <SectionHeader
              title={`Your Goals (${goalsWithFunding.length})`}
              icon={<ListIcon />}
              color="#7b1fa2"
            />
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={considerInflation}
                  onChange={(e) =>
                    dispatch(setConsiderInflation(e.target.checked))
                  }
                />
              }
              label={
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  Inflation
                </Typography>
              }
            />
          </Stack>
          <Stack spacing={1.5}>
            {goalsWithFunding.length > 0 ? (
              goalsWithFunding.map((g) => (
                <EditableGoalItem
                  key={g.id}
                  goal={g}
                  currency={currency}
                  currentYear={currentYear}
                  considerInflation={considerInflation}
                  onEdit={handleOpenModalForEdit}
                  onDelete={(id) => dispatch(deleteGoal(id))}
                  onOpenBridgeGapModal={(goal) => {
                    setSelectedGoalForGap(goal);
                    setBridgeGapModalOpen(true);
                  }}
                />
              ))
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                align="center"
                sx={{ py: 4 }}
              >
                No active goals.
              </Typography>
            )}
          </Stack>
        </StyledPaper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Stack spacing={2.5}>
          <StyledPaper>
            <Stack direction="row" justifyContent="space-between">
              <SectionHeader
                title="Wealth Projection"
                icon={<GraphIcon />}
                color="#2e7d32"
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={realValueToggle}
                    onChange={(e) => setRealValueToggle(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>
                    Real Value
                  </Typography>
                }
              />
            </Stack>
            <Box sx={{ height: 350 }}>
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
                    tick={{ fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis
                    tickFormatter={(val) => `${currency}${val / 100000}L`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      backdropFilter: "blur(8px)",
                      backgroundColor: alpha("#fff", 0.8),
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Total Wealth"
                    stroke={theme.palette.primary.main}
                    fill={alpha(theme.palette.primary.main, 0.2)}
                  />
                  <Line
                    type="monotone"
                    dataKey="Goals Target"
                    stroke="#ff7c7c"
                    strokeWidth={3}
                    dot={false}
                  />
                  {breakEvenYear && (
                    <ReferenceLine
                      x={breakEvenYear}
                      stroke="green"
                      strokeDasharray="3 3"
                      label={{
                        value: "Breakeven",
                        position: "top",
                        fill: "green",
                        fontWeight: 800,
                      }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </StyledPaper>

          <StyledPaper>
            <SectionHeader
              title="Goal Distribution"
              icon={<PieIcon />}
              color="#ed6c02"
            />
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={goals.map((g) => ({
                    name: g.name.substring(0, 10),
                    amount: g.targetAmount,
                  }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={alpha(theme.palette.divider, 0.1)}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis
                    tickFormatter={(val) => `${currency}${val / 100000}L`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </StyledPaper>
        </Stack>
      </Grid>

      {isMediumScreen && (
        <SpeedDial
          ariaLabel="Goal Actions"
          sx={{
            position: "fixed",
            // FIX: Lifted to 100px on mobile, 130px on tablet/desktop to clear the footer
            bottom: { xs: 100, sm: 130 },
            right: { xs: 16, sm: 24 },
            zIndex: 1400, // FIX: Ensures it floats above the footer (which is 1300)
          }}
          icon={<SpeedDialIcon />}
        >
          {actions.map((a) => (
            <SpeedDialAction
              key={a.name}
              icon={a.icon}
              tooltipTitle={a.name}
              onClick={a.handler}
            />
          ))}
        </SpeedDial>
      )}

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullScreen
        TransitionComponent={Transition}
        sx={{ mt: "5rem" }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {modalTitle}{" "}
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
    </Grid>
  );
}
