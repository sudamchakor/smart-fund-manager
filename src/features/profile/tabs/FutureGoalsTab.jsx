import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  Menu,
  MenuItem,
  Fab,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddIcon from "@mui/icons-material/Add";
import EditableGoalItem from "../../../components/common/EditableGoalItem";
import GoalForm from "../components/GoalForm";
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
} from "../../../store/profileSlice";
import { selectCurrency } from "../../../store/emiSlice";
import { selectCalculatedValues } from "../../emiCalculator/utils/emiCalculator";
import { useSelector, useDispatch } from "react-redux";
import {
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import CloseIcon from "@mui/icons-material/Close";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
];

const Transition = React.forwardRef(function Transition(props, ref) {
  const { children, ...other } = props;
  return (
    <Slide direction="up" ref={ref} {...other} timeout={500}>
      {children}
    </Slide>
  );
});

export default function FutureGoalsTab({ goalToEditId }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
  const totalMonthlyGoalContributions =
    useSelector(selectTotalMonthlyGoalContributions) || 0;
  const { emi: monthlyEmi } = useSelector(selectCalculatedValues);
  const emiState = useSelector(
    (state) => state.emi || state.emiCalculator || {},
  );
  const currency = useSelector(selectCurrency);

  const currentSurplus = useSelector(selectCurrentSurplus) || 0;

  const [realValueToggle, setRealValueToggle] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [modalTitle, setModalTitle] = useState("Add New Goal");
  const [fabAnchorEl, setFabAnchorEl] = useState(null); // State for FAB menu anchor
  const openFabMenu = Boolean(fabAnchorEl); // State for FAB menu open/close

  const [currentGoalFormData, setCurrentGoalFormData] = useState(null);

  const formatCurrency = (val) =>
    `${currency}${Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (goalToEditId) {
      const goal = goals.find((g) => g.id === goalToEditId);
      if (goal) {
        handleOpenModalForEdit(goal);
      }
    }
  }, [goalToEditId, goals]);

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
  }, [dispatch, editingGoal, currentGoalFormData]);

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
      targetYear: currentYear + 5,
      category: "general",
      investmentPlans: [],
    });
    setModalTitle("Add New Goal");
    setOpenModal(true);
    handleCloseFabMenu(); // Close the FAB menu after selecting "New Goal"
  }, [currentYear]);

  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
    setEditingGoal(null);
    setCurrentGoalFormData(null);
    setModalTitle("Add New Goal");
  }, []);

  const handleOpenFabMenu = (event) => {
    setFabAnchorEl(event.currentTarget);
  };

  const handleCloseFabMenu = () => {
    setFabAnchorEl(null);
  };

  const handleSelectTemplate = (templateFunction) => {
    templateFunction();
    handleCloseFabMenu(); // Close the FAB menu after selecting a template
  };

  const applyRetirementGoal = useCallback(() => {
    const yearsToRetirement = retirementAge - currentAge;
    if (yearsToRetirement < 0) {
      alert(
        "Retirement age is in the past. Please adjust your retirement age.",
      );
      return;
    }

    const monthlyBasicExpenses = profileExpenses
      .filter((e) => e.category === "basic")
      .reduce((sum, e) => sum + e.amount, 0);
    let yearlyExpenses = monthlyBasicExpenses * 12;

    let targetAmount = Math.round(yearlyExpenses / 0.04);

    if (considerInflation && yearsToRetirement > 0) {
      targetAmount =
        targetAmount * Math.pow(1 + generalInflationRate, yearsToRetirement);
    }

    setEditingGoal(null);
    setCurrentGoalFormData({
      name: "Retirement",
      targetAmount: targetAmount,
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
    const yearsToCollege = 18;
    let targetAmount = 5000000;

    if (considerInflation && yearsToCollege > 0) {
      targetAmount =
        targetAmount * Math.pow(1 + educationInflationRate, yearsToCollege);
    }

    setEditingGoal(null);
    setCurrentGoalFormData({
      name: "Child's Higher Education",
      targetAmount: Math.round(targetAmount),
      targetYear: currentYear + (yearsToCollege > 0 ? yearsToCollege : 1),
      category: "education",
      investmentPlans: [],
    });
    setModalTitle("Add Child's Higher Education Goal");
    setOpenModal(true);
  }, [considerInflation, educationInflationRate, currentYear]);

  const applyEmergencyFundGoal = useCallback(() => {
    const totalMonthlyOutflow =
      profileExpenses.reduce((sum, e) => sum + e.amount, 0) +
      monthlyEmi +
      totalMonthlyGoalContributions;
    const targetAmount = Math.round(totalMonthlyOutflow * 6);

    const yearsToGoal = 1;

    setEditingGoal(null);
    setCurrentGoalFormData({
      name: "Emergency Fund",
      targetAmount: targetAmount,
      targetYear: currentYear + yearsToGoal,
      category: "safety",
      investmentPlans: [],
    });
    setModalTitle("Add Emergency Fund Goal");
    setOpenModal(true);
  }, [profileExpenses, monthlyEmi, totalMonthlyGoalContributions, currentYear]);

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

    let currentPrincipalInvested = 0;
    let currentMarketGains = 0;
    let currentBonusGains = 0;
    let currentTotalWealth = 0;

    const data = [];

    const totalActiveGoalSips = goals.reduce((acc, goal) => {
      return (
        acc +
        (goal.investmentPlans || []).reduce((planAcc, plan) => {
          if (plan.type !== "lumpsum" && plan.monthlyContribution > 0) {
            return planAcc + plan.monthlyContribution;
          }
          return planAcc;
        }, 0)
      );
    }, 0);

    let currentMonthlyIncome = totalMonthlyIncome;
    let currentMonthlyOutflowExcludingGoals =
      profileExpenses.reduce((acc, exp) => acc + exp.amount, 0) + monthlyEmi;

    let loanTenureMonths = 0;
    if (emiState && emiState.tenure) {
      loanTenureMonths =
        emiState.tenureType === "years"
          ? Number(emiState.tenure) * 12
          : Number(emiState.tenure);
    }

    for (let year = currentYear; year <= endYear; year++) {
      const yearsFromNow = year - currentYear;
      const annualInvestmentReturn = 0.08;
      const annualBonusReturn = 0.02;

      let previousYearMonthlyIncome = currentMonthlyIncome;

      if (yearsFromNow > 0 && yearsFromNow % 1 === 0) {
        if (careerGrowthType === "percentage") {
          currentMonthlyIncome *= 1 + careerGrowthRate;
        } else {
          currentMonthlyIncome += careerGrowthRate / 12;
        }
      }

      const annualInvestableSurplus =
        (currentMonthlyIncome -
          currentMonthlyOutflowExcludingGoals -
          totalActiveGoalSips) *
        12;

      if (yearsFromNow > 0) {
        currentMarketGains = currentTotalWealth * annualInvestmentReturn;

        const incomeIncreaseThisYear =
          (currentMonthlyIncome - previousYearMonthlyIncome) * 12;
        currentBonusGains = incomeIncreaseThisYear * annualBonusReturn;

        currentPrincipalInvested = annualInvestableSurplus;

        currentTotalWealth =
          (currentTotalWealth + currentPrincipalInvested) *
          (1 + annualInvestmentReturn);
      } else {
        currentPrincipalInvested =
          (currentMonthlyIncome -
            currentMonthlyOutflowExcludingGoals -
            totalActiveGoalSips) *
          12;
        currentTotalWealth = currentPrincipalInvested;
      }

      let displayWealth = currentTotalWealth;
      let displayPrincipal = currentPrincipalInvested;
      let displayMarketGains = currentMarketGains;
      let displayBonusGains = currentBonusGains;

      if (realValueToggle && yearsFromNow > 0) {
        displayWealth =
          currentTotalWealth / Math.pow(1 + generalInflationRate, yearsFromNow);
        displayPrincipal =
          currentPrincipalInvested /
          Math.pow(1 + generalInflationRate, yearsFromNow);
        displayMarketGains =
          currentMarketGains / Math.pow(1 + generalInflationRate, yearsFromNow);
        displayBonusGains =
          currentBonusGains / Math.pow(1 + generalInflationRate, yearsFromNow);
      }

      const cumulativeLoanCost =
        monthlyEmi * Math.min(yearsFromNow * 12, loanTenureMonths);

      const totalGoalsThisYear = goals.reduce((sum, g) => {
        if (g.targetYear === year) {
          let target = g.targetAmount;
          if (considerInflation && g.category === "education") {
            target =
              target * Math.pow(1 + educationInflationRate, yearsFromNow);
          } else if (considerInflation) {
            target = target * Math.pow(1 + generalInflationRate, yearsFromNow);
          }
          return sum + target;
        }
        return sum;
      }, 0);

      data.push({
        year,
        "Principal Invested": Math.round(displayPrincipal),
        "Market Gains": Math.round(displayMarketGains),
        "Bonus Gains": Math.round(displayBonusGains),
        "Total Wealth": Math.round(displayWealth),
        "Loan Cost": Math.round(cumulativeLoanCost),
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
    emiState,
    careerGrowthRate,
    careerGrowthType,
    realValueToggle,
    considerInflation,
    generalInflationRate,
    educationInflationRate,
  ]);

  const breakEvenYear = useMemo(() => {
    const breakEvenPoint = wealthData.find(
      (d) => d["Total Wealth"] >= d["Goals Target"],
    );
    return breakEvenPoint ? breakEvenPoint.year : null;
  }, [wealthData]);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        {currentSurplus < 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Cannot add new goals. Your current surplus is negative.
          </Alert>
        )}
      </Grid>

      {!isSmallScreen && (
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <TrendingUpIcon /> Smart Goal Templates
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Button variant="outlined" onClick={applyRetirementGoal}>
                  🎯 Retirement
                </Button>
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Button variant="outlined" onClick={applyEducationGoal}>
                  🎓 Child's Education
                </Button>
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Button variant="outlined" onClick={applyEmergencyFundGoal}>
                  🛟 Emergency Fund (6M)
                </Button>
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Button
                  variant="contained"
                  onClick={handleOpenModalForNew}
                  disabled={currentSurplus < 0}
                >
                  New Goal
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      )}

      <Grid item xs={12} md={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Your Goals ({goals.length})
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={considerInflation}
                    onChange={(e) =>
                      dispatch(setConsiderInflation(e.target.checked))
                    }
                  />
                }
                label={
                  <Typography variant="caption">
                    Inflation ({generalInflationRate * 100}%)
                  </Typography>
                }
              />
            </Box>

            {goals && goals.length > 0 ? (
              goals.map((g) => (
                <EditableGoalItem
                  key={g.id}
                  goal={g}
                  currency={currency}
                  currentYear={currentYear}
                  considerInflation={considerInflation}
                  onEdit={handleOpenModalForEdit}
                  onDelete={(id) => dispatch(deleteGoal(id))}
                  investmentAmount={(g.investmentPlans || []).reduce(
                    (sum, plan) => sum + (plan.monthlyContribution || 0),
                    0,
                  )}
                />
              ))
            ) : (
              <Paper
                sx={{ p: 2, textAlign: "center", backgroundColor: "#f5f5f5" }}
              >
                <Typography variant="body2" color="textSecondary">
                  No goals yet. Create one or use a template!
                </Typography>
              </Paper>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid item xs={12} md={8}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Wealth Projection vs Goals
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={realValueToggle}
                      onChange={(e) => setRealValueToggle(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="caption">
                      Show Real Value (Inflation Adjusted)
                    </Typography>
                  }
                />
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={wealthData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis
                    tickFormatter={(val) => `${currency}${val / 100000}L`}
                  />
                  <RechartsTooltip
                    formatter={(value, name) => {
                      if (name === "Goals Target")
                        return [formatCurrency(value), "Goals Target"];
                      return [formatCurrency(value), name];
                    }}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Principal Invested"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                  <Area
                    type="monotone"
                    dataKey="Market Gains"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                  <Area
                    type="monotone"
                    dataKey="Bonus Gains"
                    stackId="1"
                    stroke="#ffc658"
                    fill="#ffc658"
                  />
                  <Line
                    type="monotone"
                    dataKey="Goals Target"
                    stroke="#ff7c7c"
                    strokeWidth={2}
                    dot={false}
                  />

                  {breakEvenYear ? (
                    <ReferenceLine
                      x={breakEvenYear}
                      stroke="green"
                      strokeDasharray="3 3"
                      label="Breakeven Point"
                    />
                  ) : null}
                </AreaChart>
              </ResponsiveContainer>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 2, display: "block" }}
              >
                * Projected wealth assumes annual investment return of 8%. Bonus
                gains from income increments are estimated.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Goal Distribution & Investments
              </Typography>
              {goals.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={goals.map((g) => ({
                      name: g.name.substring(0, 10),
                      amount: g.targetAmount,
                      inflated:
                        considerInflation && g.targetYear > currentYear
                          ? g.targetAmount *
                            Math.pow(
                              1 +
                                (g.category === "education"
                                  ? educationInflationRate
                                  : generalInflationRate),
                              g.targetYear - currentYear,
                            )
                          : g.targetAmount,
                      monthlyContribution: (g.investmentPlans || []).reduce(
                        (sum, plan) => sum + (plan.monthlyContribution || 0),
                        0,
                      ),
                      year: g.targetYear,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      tickFormatter={(val) => `${currency}${val / 100000}L`}
                    />
                    <RechartsTooltip
                      formatter={(value, name) => {
                        if (name === "amount")
                          return [formatCurrency(value), "Target Amount"];
                        if (name === "inflated")
                          return [formatCurrency(value), "Inflation-Adjusted"];
                        if (name === "monthlyContribution")
                          return [formatCurrency(value), "Monthly Investment"];
                        return [formatCurrency(value), name];
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      fill={COLORS[0]}
                      name="Target Amount"
                    />
                    {considerInflation && (
                      <Bar
                        dataKey="inflated"
                        fill={COLORS[1]}
                        name="Inflation-Adjusted"
                      />
                    )}
                    {goals.some((g) =>
                      (g.investmentPlans || []).some(
                        (plan) => (plan.monthlyContribution || 0) > 0,
                      ),
                    ) && (
                      <Bar
                        dataKey="monthlyContribution"
                        fill={COLORS[2]}
                        name="Monthly Investment"
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                  sx={{ py: 4 }}
                >
                  No goals added yet
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Grid>

      {isSmallScreen && (
        <>
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: 99999, // Added zIndex
            }}
            onClick={handleOpenFabMenu}
            disabled={currentSurplus < 0}
          >
            <AddIcon />
          </Fab>
          <Menu
            anchorEl={fabAnchorEl}
            open={openFabMenu}
            onClose={handleCloseFabMenu}
            MenuListProps={{
              "aria-labelledby": "fab-add-button",
            }}
          >
            <MenuItem onClick={handleOpenModalForNew}>
              <AddIcon sx={{ mr: 1 }} /> New Goal
            </MenuItem>
            <MenuItem onClick={() => handleSelectTemplate(applyRetirementGoal)}>
              🎯 Retirement
            </MenuItem>
            <MenuItem onClick={() => handleSelectTemplate(applyEducationGoal)}>
              🎓 Child's Education
            </MenuItem>
            <MenuItem
              onClick={() => handleSelectTemplate(applyEmergencyFundGoal)}
            >
              🛟 Emergency Fund (6M)
            </MenuItem>
          </Menu>
        </>
      )}

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        slots={{
          transition: Transition,
        }}
        fullScreen
        sx={{
          ...(isSmallScreen ? {} : { marginTop: 10 }),
        }}
      >
        <DialogTitle>
          {modalTitle}{" "}
          <CloseIcon onClick={handleCloseModal} sx={{ float: "right" }} />
        </DialogTitle>

        <DialogContent dividers>
          {currentGoalFormData && (
            <GoalForm
              goal={currentGoalFormData}
              currentYear={currentYear}
              onSave={setCurrentGoalFormData}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleModalSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
