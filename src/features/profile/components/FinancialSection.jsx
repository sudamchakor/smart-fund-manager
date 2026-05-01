import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Tooltip,
  useTheme,
  Card,
  CardContent,
  Paper,
  Button,
  useMediaQuery,
  Divider,
  CardHeader,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";
import EditableIncomeExpenseItem from "../../../components/common/EditableIncomeExpenseItem";
import ReadOnlyItem from "../../../components/common/ReadOnlyItem";
import { useDispatch, useSelector } from "react-redux";
import Collapse from "@mui/material/Collapse";
import {
  selectIncomes,
  deleteIncome,
  updateIncome,
  selectTotalMonthlyIncome,
  selectProfileExpenses,
  deleteExpense,
  updateExpense,
  selectTotalMonthlyExpenses,
  selectTotalMonthlyGoalContributions,
  selectIndividualGoalInvestmentContributions,
  selectGoals,
  selectCurrentSurplus,
} from "../../../store/profileSlice";
import { selectCurrency } from "../../../store/emiSlice";
import { selectCalculatedValues } from "../../emiCalculator/utils/emiCalculator";
import { formatCurrency } from "../../../utils/formatting";

export default function FinancialSection({
  isIncome,
  onEditGoal,
  onOpenModal,
}) {
  const dispatch = useDispatch();
  const currency = useSelector(selectCurrency);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const incomes = useSelector(selectIncomes) || [];
  const totalIncome = useSelector(selectTotalMonthlyIncome);
  const expenses = useSelector(selectProfileExpenses) || [];
  const totalProfileExpenses = useSelector(selectTotalMonthlyExpenses);
  const totalMonthlyGoalContributions = useSelector(
    selectTotalMonthlyGoalContributions,
  );
  const individualGoalInvestmentContributions = useSelector(
    selectIndividualGoalInvestmentContributions,
  );
  const goals = useSelector(selectGoals) || [];
  const investableSurplus = useSelector(selectCurrentSurplus);
  const { emi: monthlyEmi } = useSelector(selectCalculatedValues);

  const items = isIncome ? incomes : expenses;
  const totalAmount = isIncome
    ? totalIncome
    : totalProfileExpenses + (monthlyEmi || 0) + totalMonthlyGoalContributions;

  const [expandedGoals, setExpandedGoals] = useState({});

  const handleDelete = (id) => {
    dispatch(isIncome ? deleteIncome(id) : deleteExpense(id));
  };

  const isBudgetExceeded = !isIncome && investableSurplus < 0;
  const budgetWarning = isBudgetExceeded
    ? `Your spending (${formatCurrency(totalAmount)}) exceeds income (${formatCurrency(totalIncome)}) by ${formatCurrency(Math.abs(investableSurplus))}. Consider reducing expenses or increasing income.`
    : "";

  const sectionTitle = isIncome ? "Income Details" : "Expense Details";
  const totalLabel = isIncome
    ? "Total Monthly Income"
    : "Total Monthly Expenses";

  const toggleGoalExpanded = (goalId) => {
    setExpandedGoals((prev) => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const groupedGoalInvestmentContributions =
    individualGoalInvestmentContributions.reduce((acc, inv) => {
      const goal = goals.find((g) => g.id === inv.goalId);
      const goalName = goal ? goal.name : "Other Goal";

      if (!acc[inv.goalId]) {
        acc[inv.goalId] = {
          goalId: inv.goalId,
          goalName: goalName,
          investments: [],
        };
      }
      acc[inv.goalId].investments.push(inv);
      return acc;
    }, {});

  return (
    <>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardHeader
          title={
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {sectionTitle}
            </Typography>
          }
          action={
            !isSmallScreen && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => onOpenModal(isIncome ? "income" : "expense")}
              >
                Add
              </Button>
            )
          }
        />
        <Divider />
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ maxHeight: 300, overflowY: "auto", pr: 1 }}>
            {isIncome
              ? items.map((item) => (
                  <EditableIncomeExpenseItem
                    key={item.id}
                    item={item}
                    currency={currency}
                    onUpdate={(updatedItem) =>
                      dispatch(updateIncome(updatedItem))
                    }
                    onDelete={handleDelete}
                    isIncome={true}
                    totalIncome={totalIncome}
                  />
                ))
              : [
                  monthlyEmi > 0 && (
                    <ReadOnlyItem
                      key="home-loan-emi"
                      item={{
                        id: "home-loan-emi",
                        name: "Home Loan EMI",
                        amount: monthlyEmi,
                        frequency: "monthly",
                      }}
                      currency={currency}
                      isExpense={true}
                      totalIncome={totalIncome}
                      expenseRatio={(monthlyEmi / totalIncome) * 100}
                      getExpenseColor={() => {
                        const ratio = (monthlyEmi / totalIncome) * 100;
                        if (ratio > 40) return "error.main";
                        if (ratio > 30) return "warning.main";
                        return "success.main";
                      }}
                      formatCurrency={(val) => formatCurrency(val)}
                      onConfirmDelete={() => {}}
                      deletionImpactMessage="Deleting Home Loan EMI will remove it from your expenses and cash flow calculations. To adjust the EMI, please use the EMI Calculator tab."
                      isReadOnly={true}
                      onClick={() => {}}
                    />
                  ),
                  ...Object.values(groupedGoalInvestmentContributions).map(
                    (group) => {
                      const groupMonthlyTotal = group.investments.reduce(
                        (sum, inv) => {
                          let monthly = inv.amount || 0;
                          if (inv.frequency === "yearly") monthly /= 12;
                          else if (inv.frequency === "quarterly") monthly /= 3;
                          return sum + monthly;
                        },
                        0,
                      );
                      const isExpanded = expandedGoals[group.goalId];

                      return (
                        <Grid item xs={12} key={group.goalId}>
                          <Box
                            sx={{
                              mb: 0,
                              p: 1.5,
                              bgcolor: "rgba(0,0,0,0.02)",
                              borderRadius: 2,
                            }}
                          >
                            <Grid
                              container
                              spacing={1}
                              alignItems="center"
                              onClick={() => toggleGoalExpanded(group.goalId)}
                              sx={{
                                cursor: "pointer",
                                "&:hover": { opacity: 0.8 },
                              }}
                            >
                              <Grid item xs={12} sm={8}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 600,
                                    color: "text.secondary",
                                  }}
                                >
                                  {group.goalName} ({group.investments.length}{" "}
                                  {group.investments.length === 1
                                    ? "plan"
                                    : "plans"}
                                  )
                                </Typography>
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                sm={3}
                                sx={{
                                  textAlign: { xs: "left", sm: "right" },
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 600,
                                    color: "text.secondary",
                                  }}
                                >
                                  {formatCurrency(groupMonthlyTotal)} / mo
                                </Typography>
                              </Grid>
                            </Grid>
                            <Collapse in={isExpanded}>
                              <Box sx={{ mt: 1.5 }}>
                                {group.investments.map((investment) => (
                                  <ReadOnlyItem
                                    key={investment.id}
                                    item={investment}
                                    currency={currency}
                                    isExpense={true}
                                    totalIncome={totalIncome}
                                    expenseRatio={
                                      totalIncome > 0
                                        ? (investment.amount / totalIncome) *
                                          100
                                        : 0
                                    }
                                    getExpenseColor={() => "default"}
                                    formatCurrency={(val) =>
                                      formatCurrency(val)
                                    }
                                    onConfirmDelete={() => {}}
                                    deletionImpactMessage={`To stop this investment, please edit or delete the associated goal in the Future Goals tab.`}
                                    isReadOnly={true}
                                    onClick={() =>
                                      onEditGoal(investment.goalId)
                                    }
                                  />
                                ))}
                              </Box>
                            </Collapse>
                          </Box>
                        </Grid>
                      );
                    },
                  ),
                  ...items.map((item) => (
                    <EditableIncomeExpenseItem
                      key={item.id}
                      item={item}
                      currency={currency}
                      onUpdate={(updatedItem) =>
                        dispatch(updateExpense(updatedItem))
                      }
                      onDelete={handleDelete}
                      isExpense={true}
                      isBudgetExceeded={isBudgetExceeded}
                      budgetWarning={budgetWarning}
                      totalIncome={totalIncome}
                    />
                  )),
                ]}
          </Box>
          <Paper
            sx={{
              mt: 2,
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: isIncome
                ? "primary.main"
                : isBudgetExceeded
                  ? "error.main"
                  : "primary.main",
              color: "primary.contrastText",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="subtitle1">{totalLabel}:</Typography>
            <Typography
              variant="h6"
              component="span"
              sx={{ fontWeight: "bold" }}
            >
              {formatCurrency(totalAmount)}
            </Typography>
            {isBudgetExceeded && (
              <Tooltip title={budgetWarning}>
                <InfoIcon fontSize="small" sx={{ cursor: "help" }} />
              </Tooltip>
            )}
          </Paper>
        </CardContent>
      </Card>
    </>
  );
}
