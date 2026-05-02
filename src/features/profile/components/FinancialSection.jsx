import React from "react";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Divider,
  CardHeader,
  Button,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MoneyOffIcon from "@mui/icons-material/MoneyOff"; // Keep this icon
import ReadOnlyItem from "../../../components/common/ReadOnlyItem";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIncomes,
  deleteIncome,
  selectTotalMonthlyIncome,
  selectProfileExpenses,
  deleteExpense,
  selectTotalMonthlyExpenses,
  selectTotalMonthlyGoalContributions,
  selectIndividualGoalInvestmentContributions,
  selectGoals,
  selectCurrentSurplus,
} from "../../../store/profileSlice";
import {
  resetHomeLoanForm,
  selectCurrency,
  selectIsLoanActive,
} from "../../../store/emiSlice";
import { selectTaxComparison } from "../../../store/taxSlice";
import { selectCalculatedValues } from "../../emiCalculator/utils/emiCalculator";
import { formatCurrency } from "../../../utils/formatting";
import { useNavigate } from "react-router-dom";

export default function FinancialSection({
  isIncome,
  onEditGoal,
  onOpenModal,
}) {
  const dispatch = useDispatch();
  const currency = useSelector(selectCurrency);
  const navigate = useNavigate();

  const incomes = useSelector(selectIncomes) || [];
  const totalIncome = useSelector(selectTotalMonthlyIncome);
  const expenses = useSelector(selectProfileExpenses) || [];
  const totalProfileExpenses = useSelector(selectTotalMonthlyExpenses);
  const totalMonthlyGoalContributions = useSelector(
    selectTotalMonthlyGoalContributions,
  );
  const individualGoalInvestments = useSelector(
    selectIndividualGoalInvestmentContributions,
  );
  const goals = useSelector(selectGoals) || [];
  const investableSurplus = useSelector(selectCurrentSurplus);
  const { emi: monthlyEmi } = useSelector(selectCalculatedValues);
  const isLoanActive = useSelector(selectIsLoanActive);
  const taxComparison = useSelector(selectTaxComparison);

  const totalAmount = isIncome
    ? totalIncome
    : totalProfileExpenses +
      (isLoanActive ? monthlyEmi || 0 : 0) +
      totalMonthlyGoalContributions;
  const isBudgetExceeded = !isIncome && investableSurplus < 0;

  // Grouping logic to pass investments into the subItems prop
  const groupedGoals = individualGoalInvestments.reduce((acc, inv) => {
    if (!acc[inv.goalId]) {
      const goal = goals.find((g) => g.id === inv.goalId);
      acc[inv.goalId] = {
        id: inv.goalId,
        name: goal?.name || "Goal",
        amount: 0,
        frequency: "monthly",
        investments: [],
      };
    }
    let monthly = inv.amount || 0;
    if (inv.frequency === "yearly") monthly /= 12;
    else if (inv.frequency === "quarterly") monthly /= 3;

    acc[inv.goalId].amount += monthly;
    acc[inv.goalId].investments.push(inv);
    return acc;
  }, {});

  // Helper function to determine expense item color for text
  const getExpenseItemColor = (category) => {
    if (category === "basic") return "#0288d1";
    if (category === "discretionary") return "#ed6c02";
    return "primary.main"; // Default if no category match
  };

  const getCurrentTaxSlab = () => {
    if (!taxComparison) return 0;
    const taxableIncome =
      taxComparison.optimal === "Old Regime"
        ? taxComparison.oldRegime.taxableIncome
        : taxComparison.newRegime.taxableIncome;

    if (taxableIncome > 1000000) return 0.3;
    if (taxableIncome > 500000) return 0.2;
    if (taxableIncome > 250000) return 0.05;
    return 0;
  };

  const taxRate = getCurrentTaxSlab();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: 1,
        overflow: "hidden",
      }}
    >
      <CardHeader
        sx={{ py: 1.5, px: 2 }}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            {isIncome ? (
              <AttachMoneyIcon color="primary" fontSize="small" />
            ) : (
              <MoneyOffIcon color="primary" fontSize="small" />
            )}
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {isIncome ? "Income Details" : "Expense Details"}
            </Typography>
          </Stack>
        }
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onOpenModal(isIncome ? "income" : "expense")}
            sx={{ borderRadius: 1.5 }}
          >
            Add
          </Button>
        }
      />
      <Divider />

      <CardContent
        sx={{
          flexGrow: 1,
          p: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          "&:last-child": { pb: 0 },
        }}
      >
        <Box
          sx={{
            p: 2,
            flexGrow: 1,
            overflowY: "auto",
            maxHeight: "340px",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#ccc",
              borderRadius: "10px",
            },
          }}
        >
          <Stack spacing={1.5}>
            {isIncome ? (
              incomes.map((item) => (
                <ReadOnlyItem
                  key={item.id}
                  item={item}
                  currency={currency}
                  isIncome={true}
                  isReadOnly={false} // Ensure edit button is visible
                  onDelete={(id) => dispatch(deleteIncome(id))}
                  onEdit={(itemId) =>
                    onOpenModal(
                      "income",
                      incomes.find((inc) => inc.id === itemId),
                      "edit",
                    )
                  }
                  formatCurrency={formatCurrency}
                  totalIncome={totalIncome}
                />
              ))
            ) : (
              <>
                {isLoanActive && monthlyEmi > 0 && (
                  <ReadOnlyItem
                    item={{
                      id: "home-loan-emi",
                      name: "Home Loan EMI",
                      amount: monthlyEmi,
                    }}
                    currency={currency}
                    isExpense={true}
                    totalIncome={totalIncome}
                    expenseRatio={(monthlyEmi / totalIncome) * 100}
                    formatCurrency={formatCurrency}
                    onConfirmDelete={() => dispatch(resetHomeLoanForm())}
                    isReadOnly={true}
                    deletionImpactMessage="This will clear your EMI calculator data."
                    onClick={() => navigate("/calculator")}
                  />
                )}
                {Object.values(groupedGoals).map((goal) => (
                  <ReadOnlyItem
                    key={goal.id}
                    item={goal}
                    subItems={goal.investments} // investments passed to subItems
                    currency={currency}
                    isExpense={true}
                    totalIncome={totalIncome}
                    expenseRatio={(goal.amount / totalIncome) * 100}
                    formatCurrency={formatCurrency}
                    isGoal={true}
                    onEditGoal={() => onEditGoal(goal.id)}
                  />
                ))}
                {expenses.map((item) => (
                  <ReadOnlyItem
                    key={item.id}
                    item={item}
                    currency={currency}
                    isExpense={true}
                    isReadOnly={false} // Ensure edit button is visible
                    onDelete={(id) => dispatch(deleteExpense(id))}
                    onEdit={(itemId) =>
                      onOpenModal(
                        "expense",
                        expenses.find((exp) => exp.id === itemId),
                        "edit",
                      )
                    }
                    formatCurrency={formatCurrency}
                    totalIncome={totalIncome}
                    getExpenseColor={() => getExpenseItemColor(item.category)}
                    taxRate={taxRate}
                  />
                ))}
              </>
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2,
            background: (theme) =>
              `linear-gradient(135deg, ${
                isBudgetExceeded
                  ? theme.palette.error.main
                  : theme.palette.primary.main
              } 0%, ${
                isBudgetExceeded
                  ? theme.palette.error.dark
                  : theme.palette.primary.dark
              } 100%)`,
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "auto",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {isIncome ? "Total Income" : "Total Expenses"}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {formatCurrency(totalAmount)}
            </Typography>
            {isBudgetExceeded && (
              <Tooltip title="Spending exceeds income">
                <InfoIcon fontSize="small" sx={{ color: "white" }} />
              </Tooltip>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
