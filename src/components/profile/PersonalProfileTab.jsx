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
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import EditableIncomeExpenseItem from "../common/EditableIncomeExpenseItem";
import BasicInfoDisplay from "./BasicInfoDisplay";
import BasicInfoEdit from "./BasicInfoEdit";
import SliderInput from "../common/SliderInput";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIncomes,
  selectProfileExpenses,
  selectCurrentAge,
  selectRetirementAge,
  addIncome,
  deleteIncome,
  updateIncome,
  addExpense,
  deleteExpense,
  updateExpense,
  setCurrentAge,
  setRetirementAge,
  selectTotalMonthlyIncome, // Import new selector
  selectTotalMonthlyExpenses, // Import new selector
  selectCurrentSurplus, // Import new selector
  selectCareerGrowthRate, // Changed from selectExpectedAnnualSalaryHike
  setCareerGrowthRate, // Changed from setExpectedAnnualSalaryHike
} from "../../store/profileSlice";
import { selectCurrency } from "../../store/emiSlice";
import { selectCalculatedValues } from "../../utils/emiCalculator"; // Corrected import path
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import ExpenseReadOnlyItem from "../common/ExpenseReadOnlyItem";

const COLORS = ["#ff6b6b", "#4ecdc4", "#9c27b0", "#2ecc71"];

export default function PersonalProfileTab() {
  const dispatch = useDispatch();

  const incomes = useSelector(selectIncomes) || [];
  const expenses = useSelector(selectProfileExpenses) || [];
  const currentAge = useSelector(selectCurrentAge) || 30;
  const retirementAge = useSelector(selectRetirementAge) || 60;
  const careerGrowthRate = useSelector(selectCareerGrowthRate); // Get hike rate

  const { emi: monthlyEmi } = useSelector(selectCalculatedValues); // Get EMI from emiSlice
  const currency = useSelector(selectCurrency);

  // Use derived selectors for consistency
  const totalIncome = useSelector(selectTotalMonthlyIncome);
  const totalProfileExpenses = useSelector(selectTotalMonthlyExpenses);
  const investableSurplus = useSelector(selectCurrentSurplus);

  // totalMonthlyPayment now only refers to the EMI part, as other expenses are in profileSlice
  const totalMonthlyPayment = monthlyEmi;

  const totalExpensesIncludingLoan = totalProfileExpenses + (monthlyEmi || 0); // Ensure monthlyEmi defaults to 0 for calculation

  const isBudgetExceeded = investableSurplus < 0;
  const budgetWarning = isBudgetExceeded
    ? `Your spending (${currency}${totalExpensesIncludingLoan.toLocaleString("en-IN", { maximumFractionDigits: 0 })}) exceeds income (${currency}${totalIncome.toLocaleString("en-IN", { maximumFractionDigits: 0 })}) by ${currency}${Math.abs(investableSurplus).toLocaleString("en-IN", { maximumFractionDigits: 0 })}. Consider reducing expenses or increasing income.`
    : "";

  const [newIncome, setNewIncome] = useState({
    name: "",
    amount: "",
    frequency: "monthly",
  });
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    category: "basic",
    frequency: "monthly",
  });
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);

  const handleAddIncome = () => {
    if (newIncome.name && newIncome.amount) {
      dispatch(
        addIncome({
          id: Date.now(),
          name: newIncome.name,
          amount: Number(newIncome.amount),
          type: "monthly", // Assuming all added incomes are monthly for now
          frequency: newIncome.frequency,
        }),
      );
      setNewIncome({ name: "", amount: "", frequency: "monthly" });
    }
  };

  const handleAddExpense = () => {
    if (newExpense.name && newExpense.amount) {
      dispatch(
        addExpense({
          id: Date.now(),
          name: newExpense.name,
          amount: Number(newExpense.amount),
          type: "monthly", // Assuming all added expenses are monthly for now
          category: newExpense.category,
          frequency: newExpense.frequency,
        }),
      );
      setNewExpense({
        name: "",
        amount: "",
        category: "basic",
        frequency: "monthly",
      });
    }
  };

  const handleSaveBasicInfo = (newCurrentAge, newRetirementAge) => {
    dispatch(setCurrentAge(newCurrentAge));
    dispatch(setRetirementAge(newRetirementAge));
    setEditingBasicInfo(false);
  };

  const donutData = [
    {
      name: "Needs",
      value: useSelector((state) =>
        state.profile.expenses
          .filter((e) => e.category === "basic")
          .reduce((acc, curr) => acc + curr.amount, 0),
      ),
    },
    {
      name: "Wants",
      value: useSelector((state) =>
        state.profile.expenses
          .filter((e) => e.category === "discretionary")
          .reduce((acc, curr) => acc + curr.amount, 0),
      ),
    },
    { name: "Loan EMIs", value: monthlyEmi || 0 }, // Ensure monthlyEmi defaults to 0 for chart
    {
      name: "Future Wealth (Goals)",
      value: useSelector((state) =>
        state.profile.goals.reduce(
          (acc, curr) => acc + curr.monthlyContribution,
          0,
        ),
      ),
    },
    {
      name: "Surplus",
      value: investableSurplus > 0 ? investableSurplus : 0,
    },
  ].filter((item) => item.value > 0); // Filter out zero values for cleaner chart

  const formatCurrency = (val) =>
    `${currency}${Number(val || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; // Ensure val defaults to 0

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {editingBasicInfo ? (
          <BasicInfoEdit
            currentAge={currentAge}
            retirementAge={retirementAge}
            onSave={handleSaveBasicInfo}
            onCancel={() => setEditingBasicInfo(false)}
          />
        ) : (
          <BasicInfoDisplay
            currentAge={currentAge}
            retirementAge={retirementAge}
            onEdit={() => setEditingBasicInfo(true)}
          />
        )}
      </Grid>
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
            Income Details
            <InfoIcon fontSize="small" sx={{ opacity: 0.6 }} />
          </Typography>
          {incomes &&
            incomes.map((inc) => (
              <EditableIncomeExpenseItem
                key={inc.id}
                item={inc}
                currency={currency}
                onUpdate={(updated) => dispatch(updateIncome(updated))}
                onDelete={(id) => dispatch(deleteIncome(id))}
                totalIncome={totalIncome}
                isIncome={true}
              />
            ))}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Source"
                  value={newIncome.name}
                  onChange={(e) =>
                    setNewIncome({ ...newIncome, name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <SliderInput
                  label="Amount"
                  value={Number(newIncome.amount) || 0}
                  onChange={(val) =>
                    setNewIncome({ ...newIncome, amount: val })
                  }
                  min={0}
                  max={10000000}
                  step={1000}
                  showInput={true}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={newIncome.frequency}
                    label="Frequency"
                    onChange={(e) =>
                      setNewIncome({ ...newIncome, frequency: e.target.value })
                    }
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 2,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleAddIncome}
                  fullWidth
                  sx={{
                    width: "auto",
                  }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "success.main" }}
          >
            Total Monthly Income: {formatCurrency(totalIncome)}
          </Typography>
          <Divider sx={{ my: 2 }} />
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
            Career Growth
          </Typography>
          <SliderInput
            label="Expected Annual Salary Hike (%)"
            value={(careerGrowthRate * 100).toFixed(2)}
            onChange={(val) => dispatch(setCareerGrowthRate(val / 100))}
            min={0}
            max={30}
            step={0.1}
            showInput={true}
            unit="%"
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" align="center" gutterBottom>
            Cash Flow (Monthly)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={donutData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {donutData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
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
          {monthlyEmi > 0 && (
            <ExpenseReadOnlyItem
              item={{
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
              onDelete={() => {}} // Read only
              setIsEditing={() => {}} // Read only
              isReadOnly={true}
            />
          )}
          {expenses &&
            expenses.map((exp) => {
              return (
                <EditableIncomeExpenseItem
                  key={exp.id}
                  item={exp}
                  currency={currency}
                  onUpdate={(updated) => dispatch(updateExpense(updated))}
                  onDelete={(id) => dispatch(deleteExpense(id))}
                  isExpense={true}
                  isBudgetExceeded={isBudgetExceeded}
                  budgetWarning={budgetWarning}
                  totalIncome={totalIncome}
                  totalExpenses={totalProfileExpenses}
                />
              );
            })}

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
              {formatCurrency(totalExpensesIncludingLoan.toFixed(0))}
            </Typography>
          </Box>
        </Paper>
      </Grid>
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
            Add New Expense
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
              <Grid item xs={12}>
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
              <Grid item xs={12}>
                <SliderInput
                  label="Amount"
                  value={Number(newExpense.amount) || 0}
                  onChange={(val) =>
                    setNewExpense({ ...newExpense, amount: val })
                  }
                  min={0}
                  max={10000000}
                  step={1000}
                  showInput={true}
                />
              </Grid>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
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
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 2,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleAddExpense}
                  fullWidth
                  sx={{
                    width: "auto",
                  }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
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
    </Grid>
  );
}
