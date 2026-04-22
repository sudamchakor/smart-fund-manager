import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip,
  Collapse,
  IconButton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandMore"; // Corrected: Should be ExpandLessIcon
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import EditableIncomeExpenseItem from "../../../components/common/EditableIncomeExpenseItem";
import SliderInput from "../../../components/common/SliderInput";
import ExpenseReadOnlyItem from "../../../components/common/ExpenseReadOnlyItem";
import { useDispatch, useSelector } from "react-redux";
import {
  selectProfileExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
  selectTotalMonthlyExpenses,
  selectTotalMonthlyGoalContributions,
  selectIndividualGoalInvestmentContributions,
  selectGoals,
  selectCurrentSurplus,
  selectTotalMonthlyIncome,
} from "../../../store/profileSlice";
import { selectCurrency } from "../../../store/emiSlice";
import { selectCalculatedValues } from "../../emiCalculator/utils/emiCalculator";

const currentYear = new Date().getFullYear();

export default function ExpenseSection({ onEditGoal }) {
  const dispatch = useDispatch();

  const expenses = useSelector(selectProfileExpenses) || [];
  const totalProfileExpenses = useSelector(selectTotalMonthlyExpenses);
  const totalMonthlyGoalContributions = useSelector(selectTotalMonthlyGoalContributions);
  const individualGoalInvestments = useSelector(selectIndividualGoalInvestmentContributions);
  const goals = useSelector(selectGoals) || [];
  const investableSurplus = useSelector(selectCurrentSurplus);
  const totalIncome = useSelector(selectTotalMonthlyIncome);
  const currency = useSelector(selectCurrency);
  const { emi: monthlyEmi } = useSelector(selectCalculatedValues);

  const totalExpensesIncludingLoanAndGoals = totalProfileExpenses + (monthlyEmi || 0) + totalMonthlyGoalContributions;

  const isBudgetExceeded = investableSurplus < 0;
  const budgetWarning = isBudgetExceeded
    ? `Your spending (${currency}${totalExpensesIncludingLoanAndGoals.toLocaleString("en-IN", { maximumFractionDigits: 0 })}) exceeds income (${currency}${totalIncome.toLocaleString("en-IN", { maximumFractionDigits: 0 })}) by ${currency}${Math.abs(investableSurplus).toLocaleString("en-IN", { maximumFractionDigits: 0 })}. Consider reducing expenses or increasing income.`
    : "";

  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    category: "basic",
    frequency: "monthly",
    startYear: currentYear,
    endYear: currentYear + 10,
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseStartYearOpen, setExpenseStartYearOpen] = useState(false);
  const [expenseEndYearOpen, setExpenseEndYearOpen] = useState(false);
  const [expandedGoals, setExpandedGoals] = useState({});

  const toggleGoalExpanded = (goalId) => {
    setExpandedGoals((prev) => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const handleEditExpense = (expense) => {
    setEditingExpenseId(expense.id);
    setNewExpense({
      ...expense,
      amount: String(expense.amount),
      category: expense.category || "basic",
      frequency: expense.frequency || "monthly",
      startYear: expense.startYear || currentYear,
      endYear: expense.endYear || currentYear + 10,
    });
  };

  const handleCancelEditExpense = () => {
    setEditingExpenseId(null);
    setNewExpense({
      name: "",
      amount: "",
      category: "basic",
      frequency: "monthly",
      startYear: currentYear,
      endYear: currentYear + 10,
    });
  };

  const handleAddOrUpdateExpense = () => {
    if (newExpense.name && newExpense.amount) {
      const payload = {
        ...newExpense,
        amount: Number(newExpense.amount),
      };
      if (editingExpenseId) {
        dispatch(updateExpense({ ...payload, id: editingExpenseId }));
      } else {
        dispatch(addExpense({ ...payload, id: Date.now() }));
      }
      handleCancelEditExpense();
    }
  };

  const formatCurrency = (val) =>
    `${currency}${Number(val || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const handleHomeLoanEmiClick = () => {
    alert("Navigating to Home Loan EMI edit mode (requires further implementation)");
  };

  const handleReadOnlyDelete = (id) => {
    alert(`Deletion of item with ID ${id} is not directly supported from this view.`);
  };

  const groupedGoalInvestments = individualGoalInvestments.reduce((acc, inv) => {
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
    <Grid container spacing={3}> {/* Added Grid container for responsiveness and spacing */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Expenses Details
            {isBudgetExceeded && (
              <Tooltip title={budgetWarning}>
                <InfoIcon
                  fontSize="small"
                  sx={{ color: "error.main", cursor: "help" }}
                />
              </Tooltip>
            )}
          </Typography>
          <Box sx={{ maxHeight: 400, overflowY: "auto", pr: 1 }}>
            {monthlyEmi > 0 && (
              <ExpenseReadOnlyItem
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
                formatCurrency={formatCurrency}
                onConfirmDelete={handleReadOnlyDelete}
                deletionImpactMessage="Deleting Home Loan EMI will remove it from your expenses and cash flow calculations. To adjust the EMI, please use the EMI Calculator tab."
                isReadOnly={true}
                onClick={handleHomeLoanEmiClick}
              />
            )}
            {individualGoalInvestments.length > 0 && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Goal Investments
                </Typography>
                <Grid container spacing={1} sx={{ mt: 1 }}> {/* Changed Box to Grid container */}
                  {Object.values(groupedGoalInvestments).map((group) => {
                      const groupMonthlyTotal = group.investments.reduce((sum, inv) => {
                        let monthly = inv.amount || 0;
                        if (inv.frequency === 'yearly') monthly /= 12;
                        else if (inv.frequency === 'quarterly') monthly /= 3;
                        return sum + monthly;
                      }, 0);
                      const isExpanded = expandedGoals[group.goalId];

                      return (
                        <Grid item xs={12} key={group.goalId}> {/* Wrapped group in Grid item */}
                          <Box sx={{ mb: 0, p: 1.5, bgcolor: "rgba(0,0,0,0.02)", borderRadius: 2 }}>
                            <Grid
                              container
                              spacing={1} // Add some spacing between rows on small screens
                              alignItems="center"
                              onClick={() => toggleGoalExpanded(group.goalId)}
                              sx={{
                                cursor: "pointer",
                                "&:hover": { opacity: 0.8 },
                              }}
                            >
                              <Grid item xs={12} sm={8}> {/* Goal Name */}
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                  {group.goalName} ({group.investments.length} {group.investments.length === 1 ? 'plan' : 'plans'})
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={3} sx={{ textAlign: { xs: 'left', sm: 'right' } }}> {/* Monthly Total */}
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                  {formatCurrency(groupMonthlyTotal)} / mo
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={1} sx={{ textAlign: { xs: 'left', sm: 'right' } }}> {/* Icon */}
                                <IconButton size="small" disableRipple sx={{ p: 0 }}>
                                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                              </Grid>
                            </Grid>
                            <Collapse in={isExpanded}>
                              <Box sx={{ mt: 1.5 }}>
                                {group.investments.map((investment) => {
                            const expenseRatio =
                              investment.frequency === "yearly" && totalIncome > 0
                                ? (investment.amount / (totalIncome * 12)) * 100
                                : totalIncome > 0
                                ? (investment.amount / totalIncome) * 100
                                : 0;
                            return (
                              <ExpenseReadOnlyItem
                                key={investment.id}
                                item={investment}
                                currency={currency}
                                isExpense={true}
                                totalIncome={totalIncome}
                                expenseRatio={expenseRatio}
                                getExpenseColor={() => {
                                  const ratio = expenseRatio;
                                  if (ratio > 40) return "error.main";
                                  if (ratio > 30) return "warning.main";
                                  return "success.main";
                                }}
                                formatCurrency={formatCurrency}
                                onConfirmDelete={handleReadOnlyDelete}
                                deletionImpactMessage={`To stop this investment, please edit or delete the associated goal in the Future Goals tab.`}
                                isReadOnly={true}
                                onClick={() => onEditGoal(investment.goalId)}
                              />
                            );
                          })}
                              </Box>
                            </Collapse>
                        </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
              </Box>
            )}

            {expenses &&
              expenses.map((exp) => {
                return (
                  <EditableIncomeExpenseItem
                    key={exp.id}
                    item={exp}
                    currency={currency}
                    onEdit={() => handleEditExpense(exp)}
                    onUpdate={(updatedExp) => dispatch(updateExpense(updatedExp))}
                    onDelete={(id) => dispatch(deleteExpense(id))}
                    isExpense={true}
                    isBudgetExceeded={isBudgetExceeded}
                    budgetWarning={budgetWarning}
                    totalIncome={totalIncome}
                    totalExpenses={totalProfileExpenses}
                  />
                );
              })}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Total Monthly Expenses
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: isBudgetExceeded ? "error.main" : "text.primary",
                fontSize: isBudgetExceeded ? "1.2rem" : "1rem",
              }}
            >
              {formatCurrency(totalExpensesIncludingLoanAndGoals.toFixed(0))}
            </Typography>
          </Box>
          {isBudgetExceeded && (
            <Paper
              sx={{
                mt: 2,
                p: 1.5,
                backgroundColor: "#ffebee",
                borderLeft: "4px solid #f44336",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#c62828", fontWeight: 600 }}
              >
                ⚠️ {budgetWarning}
              </Typography>
            </Paper>
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {editingExpenseId ? "Edit Expense" : "Add New Expense"}
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
            To add an "initial funding" source, simply use this form to add a new income stream with a descriptive name (e.g., "Starting Capital") and its monthly amount.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 2,
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Expense Name"
                  value={newExpense.name}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SliderInput
                  label="Amount"
                  value={Number(newExpense.amount) || 0}
                  onChange={(val) =>
                    setNewExpense({ ...newExpense, amount: val })
                  }
                  min={0}
                  max={1000000}
                  step={500}
                  showInput={true}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newExpense.category}
                    label="Category"
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, category: e.target.value })
                    }
                  >
                    <MenuItem value="basic">Basic Need</MenuItem>
                    <MenuItem value="discretionary">Discretionary</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={newExpense.frequency}
                    label="Frequency"
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        frequency: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Year"
                  views={['year', 'month']}
                  openTo="month"
                  open={expenseStartYearOpen}
                  onOpen={() => setExpenseStartYearOpen(true)}
                  onClose={() => setExpenseStartYearOpen(false)}
                  value={dayjs(`${newExpense.startYear}-01-01`)}
                  onChange={(newValue) =>
                    setNewExpense({ ...newExpense, startYear: newValue ? newValue.year() : currentYear })
                  }
                  slotProps={{ textField: { size: 'small', fullWidth: true, onClick: () => setExpenseStartYearOpen(true) } }}
                  minDate={dayjs(`${currentYear}-01-01`)}
                  maxDate={dayjs(`${currentYear + 50}-12-31`)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Year"
                  views={['year', 'month']}
                  openTo="month"
                  open={expenseEndYearOpen}
                  onOpen={() => setExpenseEndYearOpen(true)}
                  onClose={() => setExpenseEndYearOpen(false)}
                  value={dayjs(`${newExpense.endYear}-01-01`)}
                  onChange={(newValue) =>
                    setNewExpense({ ...newExpense, endYear: newValue ? newValue.year() : currentYear + 10 })
                  }
                  slotProps={{ textField: { size: 'small', fullWidth: true, onClick: () => setExpenseEndYearOpen(true) } }}
                  minDate={dayjs(`${newExpense.startYear}-01-01`)}
                  maxDate={dayjs(`${currentYear + 50}-12-31`)}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "flex-end" }}
              >
                {editingExpenseId && (
                  <Button onClick={handleCancelEditExpense}>Cancel</Button>
                )}
                <Button variant="contained" onClick={handleAddOrUpdateExpense}>
                  {editingExpenseId ? "Update" : "Add"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
