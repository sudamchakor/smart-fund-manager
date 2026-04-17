import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel,
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Grid, IconButton, List, ListItem, ListItemText, Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch } from "react-redux";
import { addIncome, addExpense, addTemplateGoal } from "../store/profileSlice";

const steps = ["Add Income", "Add Expenses", "Set Goals"];

export default function OnboardingModal({ open, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();

  const [income, setIncome] = useState({ name: "", amount: "", frequency: "monthly" });
  const [incomesList, setIncomesList] = useState([]);

  const [expense, setExpense] = useState({ name: "", amount: "", category: "basic", frequency: "monthly" });
  const [expensesList, setExpensesList] = useState([]);

  const currentYear = new Date().getFullYear();

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleFinish = () => {
    incomesList.forEach((inc) =>
      dispatch(addIncome({ ...inc, id: Date.now() + Math.random(), startYear: currentYear, endYear: currentYear + 10 }))
    );
    expensesList.forEach((exp) =>
      dispatch(addExpense({ ...exp, id: Date.now() + Math.random(), startYear: currentYear, endYear: currentYear + 10 }))
    );
    onClose();
  };

  const handleAddIncome = () => {
    if (income.name && income.amount) {
      setIncomesList([...incomesList, { ...income, amount: Number(income.amount) }]);
      setIncome({ name: "", amount: "", frequency: "monthly" });
    }
  };

  const handleAddExpense = () => {
    if (expense.name && expense.amount) {
      setExpensesList([...expensesList, { ...expense, amount: Number(expense.amount) }]);
      setExpense({ name: "", amount: "", category: "basic", frequency: "monthly" });
    }
  };

  const handleAddPredefinedGoal = (type, expensesAmt) => {
    dispatch(addTemplateGoal({ type, monthlyExpenses: expensesAmt || 30000 }));
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Add your main income sources to get started.</Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Grid item xs={12} sm={5}>
                <TextField fullWidth size="small" label="Income Source (e.g., Salary)" value={income.name} onChange={(e) => setIncome({ ...income, name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" type="number" label="Amount" value={income.amount} onChange={(e) => setIncome({ ...income, amount: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button variant="contained" fullWidth onClick={handleAddIncome} disabled={!income.name || !income.amount}>Add</Button>
              </Grid>
            </Grid>
            {incomesList.length > 0 && (
              <List dense sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                {incomesList.map((inc, index) => (
                  <ListItem key={index} secondaryAction={
                    <IconButton edge="end" color="error" onClick={() => setIncomesList(incomesList.filter((_, i) => i !== index))}><DeleteIcon /></IconButton>
                  }>
                    <ListItemText primary={inc.name} secondary={`${inc.amount} (${inc.frequency})`} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Add your monthly expenses to calculate your investable surplus.</Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" label="Expense Name" value={expense.name} onChange={(e) => setExpense({ ...expense, name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth size="small" type="number" label="Amount" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={expense.category} label="Category" onChange={(e) => setExpense({ ...expense, category: e.target.value })}>
                    <MenuItem value="basic">Basic Need</MenuItem>
                    <MenuItem value="discretionary">Discretionary</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button variant="contained" fullWidth onClick={handleAddExpense} disabled={!expense.name || !expense.amount}>Add</Button>
              </Grid>
            </Grid>
            {expensesList.length > 0 && (
              <List dense sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                {expensesList.map((exp, index) => (
                  <ListItem key={index} secondaryAction={
                    <IconButton edge="end" color="error" onClick={() => setExpensesList(expensesList.filter((_, i) => i !== index))}><DeleteIcon /></IconButton>
                  }>
                    <ListItemText primary={exp.name} secondary={`${exp.amount} (${exp.category})`} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Select a predefined goal to fast-track your profile setup.</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" fullWidth onClick={() => handleAddPredefinedGoal("emergencyFund", 30000)} sx={{ height: "100%", py: 2 }}>
                  Add Emergency Fund (6x Monthly Basic Expenses)
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" fullWidth onClick={() => handleAddPredefinedGoal("vacation")} sx={{ height: "100%", py: 2 }}>
                  Add Vacation Goal (General)
                </Button>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Welcome! Let's Setup Your Profile</DialogTitle>
      <Divider />
      <DialogContent sx={{ minHeight: 280 }}>
        <Stepper activeStep={activeStep} alternativeLabel>{steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}</Stepper>
        {renderStepContent(activeStep)}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">Skip</Button>
        <Box sx={{ flex: "1 1 auto" }} />
        {activeStep > 0 && <Button onClick={handleBack} sx={{ mr: 1 }}>Back</Button>}
        {activeStep === steps.length - 1 ? (<Button onClick={handleFinish} variant="contained" color="primary">Finish</Button>) : (<Button onClick={handleNext} variant="contained">Next</Button>)}
      </DialogActions>
    </Dialog>
  );
}