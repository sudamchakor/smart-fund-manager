import React, { useState } from "react";
import {
  TextField,
  InputAdornment,
  Box,
  Paper,
  Typography,
  Grid,
  MenuItem,
  Select,
  FormControl,
  Collapse,
  IconButton,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useEmiContext } from "../context/EmiContext";
import "./HomeLoanForm.css";

const HomeLoanForm = () => {
  const {
    loanDetails,
    updateLoanDetails,
    changeLoanUnit,
    expenses,
    updateExpenses,
    changeExpenseUnit,
    calculatedValues,
    currency,
  } = useEmiContext();

  const handleUnitChange = (unitField, amountField, event) => {
    changeLoanUnit(unitField, amountField, event.target.value);
  };

  const handleChange = (field, event) => {
    let value = parseFloat(event.target.value);
    if (isNaN(value)) value = 0;
    updateLoanDetails(field, value);
  };

  const handleExpenseUnitChange = (unitField, amountField, event) => {
    changeExpenseUnit(unitField, amountField, event.target.value);
  };

  const handleExpenseChange = (field, event) => {
    let value = parseFloat(event.target.value);
    if (isNaN(value)) value = 0;
    updateExpenses(field, value);
  };

  return (
    <Paper elevation={3} className="home-loan-paper">
      <Typography variant="h6" gutterBottom>
        Home Loan Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Home Value (HV)"
            type="number"
            value={loanDetails.homeValue || ""}
            onChange={(e) => handleChange("homeValue", e)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">{currency}</InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Box className="home-loan-input-group">
            <TextField
              sx={{ flex: 1 }}
              fullWidth
              label="Margin / Down Payment"
              type="number"
              value={loanDetails.marginAmount || ""}
              onChange={(e) => handleChange("marginAmount", e)}
            />
            <FormControl className="home-loan-form-control">
              <Select
                value={loanDetails.marginUnit}
                onChange={(e) =>
                  handleUnitChange("marginUnit", "marginAmount", e)
                }
              >
                <MenuItem value="Rs">{currency}</MenuItem>
                <MenuItem value="%">%</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Typography variant="caption" color="textSecondary">
            Value in {currency}: {calculatedValues.marginInRs.toFixed(2)}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Loan Insurance (LI)"
            type="number"
            value={loanDetails.loanInsurance || ""}
            onChange={(e) => handleChange("loanInsurance", e)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">{currency}</InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            disabled
            label="Loan Amount"
            value={calculatedValues.loanAmount.toFixed(2)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">{currency}</InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Interest Rate"
            type="number"
            value={loanDetails.interestRate || ""}
            onChange={(e) => handleChange("interestRate", e)}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Box className="home-loan-input-group">
            <TextField
              sx={{ flex: 1 }}
              fullWidth
              label="Loan Tenure"
              type="number"
              value={loanDetails.loanTenure || ""}
              onChange={(e) => handleChange("loanTenure", e)}
            />
            <FormControl className="home-loan-form-control">
              <Select
                value={loanDetails.tenureUnit}
                onChange={(e) =>
                  handleUnitChange("tenureUnit", "loanTenure", e)
                }
              >
                <MenuItem value="years">Y</MenuItem>
                <MenuItem value="months">M</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Box className="home-loan-input-group">
            <TextField
              sx={{ flex: 1 }}
              fullWidth
              label="Loan Fees & Charges"
              type="number"
              value={loanDetails.loanFees || ""}
              onChange={(e) => handleChange("loanFees", e)}
            />
            <FormControl className="home-loan-form-control">
              <Select
                value={loanDetails.feesUnit}
                onChange={(e) => handleUnitChange("feesUnit", "loanFees", e)}
              >
                <MenuItem value="Rs">{currency}</MenuItem>
                <MenuItem value="%">%</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} sm={3}>
          <DatePicker
            label="Start Month & Year"
            views={["year", "month"]}
            value={loanDetails.startDate}
            onChange={(newValue) => updateLoanDetails("startDate", newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
      </Grid>

      <Box mt={3} mb={1}>
        <Divider />
      </Box>

      <Box
        className="expenses-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <Typography variant="h6">Homeowner Expenses</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <Box className="home-loan-input-group">
            <TextField
              sx={{ flex: 1 }}
              fullWidth
              label="One-time Expenses"
              type="number"
              value={expenses.oneTimeExpenses || ""}
              onChange={(e) => handleExpenseChange("oneTimeExpenses", e)}
            />
            <FormControl className="home-loan-form-control">
              <Select
                value={expenses.oneTimeUnit}
                onChange={(e) =>
                  handleExpenseUnitChange("oneTimeUnit", "oneTimeExpenses", e)
                }
              >
                <MenuItem value="Rs">{currency}</MenuItem>
                <MenuItem value="%">%</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Box className="home-loan-input-group">
            <TextField
              sx={{ flex: 1 }}
              fullWidth
              label="Property Taxes / year"
              type="number"
              value={expenses.propertyTaxes || ""}
              onChange={(e) => handleExpenseChange("propertyTaxes", e)}
            />
            <FormControl className="home-loan-form-control">
              <Select
                value={expenses.taxesUnit}
                onChange={(e) =>
                  handleExpenseUnitChange("taxesUnit", "propertyTaxes", e)
                }
              >
                <MenuItem value="Rs">{currency}</MenuItem>
                <MenuItem value="%">%</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Box className="home-loan-input-group">
            <TextField
              sx={{ flex: 1 }}
              fullWidth
              label="Home Insurance / year"
              type="number"
              value={expenses.homeInsurance || ""}
              onChange={(e) => handleExpenseChange("homeInsurance", e)}
            />
            <FormControl className="home-loan-form-control">
              <Select
                value={expenses.homeInsUnit}
                onChange={(e) =>
                  handleExpenseUnitChange("homeInsUnit", "homeInsurance", e)
                }
              >
                <MenuItem value="Rs">{currency}</MenuItem>
                <MenuItem value="%">%</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Maintenance Expenses / month"
            type="number"
            value={expenses.maintenance || ""}
            onChange={(e) => handleExpenseChange("maintenance", e)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">{currency}</InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default HomeLoanForm;
