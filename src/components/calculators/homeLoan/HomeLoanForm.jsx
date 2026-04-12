import React from "react";
import styled from "styled-components";
import { Box, Paper, Typography, Grid, Divider } from "@mui/material";
import { useSelector, useDispatch } from 'react-redux';
import { selectLoanDetails, selectExpenses, selectCalculatedValues, selectCurrency, updateLoanDetails, updateExpenses, changeLoanUnit, changeExpenseUnit } from "../../../store/emiSlice";
import { AmountInput, AmountWithUnitInput, DatePickerInput } from "../../common/CommonComponents";

const StyledPaper = styled(Paper)`
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const HomeLoanForm = () => {
  const dispatch = useDispatch();
  const loanDetails = useSelector(selectLoanDetails);
  const expenses = useSelector(selectExpenses);
  const calculatedValues = useSelector(selectCalculatedValues);
  const currency = useSelector(selectCurrency);

  const handleUnitChange = (unitField, amountField, event) => {
    dispatch(changeLoanUnit({ unitField, amountField, newUnit: event.target.value }));
  };

  const handleChange = (field, event) => {
    let value = parseFloat(event.target.value);
    if (isNaN(value)) value = 0;
    dispatch(updateLoanDetails({ key: field, value }));
  };

  const handleExpenseUnitChange = (unitField, amountField, event) => {
    dispatch(changeExpenseUnit({ unitField, amountField, newUnit: event.target.value }));
  };

  const handleExpenseChange = (field, event) => {
    let value = parseFloat(event.target.value);
    if (isNaN(value)) value = 0;
    dispatch(updateExpenses({ key: field, value }));
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.primary" }}>
        Home Loan Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <AmountInput
            label="Home Value (HV)"
            value={loanDetails.homeValue}
            onChange={(e) => handleChange("homeValue", e)}
            currency={currency}
            placeholder="Enter home value"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <AmountWithUnitInput
            label="Margin / Down Payment"
            value={loanDetails.marginAmount}
            onAmountChange={(e) => handleChange("marginAmount", e)}
            unitValue={loanDetails.marginUnit}
            onUnitChange={(e) => handleUnitChange("marginUnit", "marginAmount", e)}
            unitOptions={[
              { value: "Rs", label: currency },
              { value: "%", label: "%" },
            ]}
            placeholder="Enter margin amount"
          />
          <Typography variant="caption" color="textSecondary">
            Value in {currency}: {calculatedValues.marginInRs.toFixed(2)}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <AmountInput
            label="Loan Insurance (LI)"
            value={loanDetails.loanInsurance}
            onChange={(e) => handleChange("loanInsurance", e)}
            currency={currency}
            placeholder="Enter loan insurance"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <AmountInput
            label="Loan Amount"
            value={calculatedValues.loanAmount.toFixed(2)}
            disabled={true}
            currency={currency}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <AmountInput
            label="Interest Rate"
            value={loanDetails.interestRate}
            onChange={(e) => handleChange("interestRate", e)}
            currency="%"
            placeholder="Enter interest rate"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <AmountWithUnitInput
            label="Loan Tenure"
            value={loanDetails.loanTenure}
            onAmountChange={(e) => handleChange("loanTenure", e)}
            unitValue={loanDetails.tenureUnit}
            onUnitChange={(e) => handleUnitChange("tenureUnit", "loanTenure", e)}
            unitOptions={[
              { value: "years", label: "Y" },
              { value: "months", label: "M" },
            ]}
            placeholder="Enter tenure"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <AmountWithUnitInput
            label="Loan Fees & Charges"
            value={loanDetails.loanFees}
            onAmountChange={(e) => handleChange("loanFees", e)}
            unitValue={loanDetails.feesUnit}
            onUnitChange={(e) => handleUnitChange("feesUnit", "loanFees", e)}
            unitOptions={[
              { value: "Rs", label: currency },
              { value: "%", label: "%" },
            ]}
            placeholder="Enter fees"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <DatePickerInput
            label="Start Month & Year"
            value={loanDetails.startDate}
            onChange={(newValue) => dispatch(updateLoanDetails({ key: "startDate", value: newValue }))}
          />
        </Grid>
      </Grid>

      <Box mt={3} mb={1}>
        <Divider />
      </Box>

      <SectionHeader>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>Homeowner Expenses</Typography>
      </SectionHeader>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <AmountWithUnitInput
            label="One-time Expenses"
            value={expenses.oneTimeExpenses}
            onAmountChange={(e) => handleExpenseChange("oneTimeExpenses", e)}
            unitValue={expenses.oneTimeUnit}
            onUnitChange={(e) => handleExpenseUnitChange("oneTimeUnit", "oneTimeExpenses", e)}
            unitOptions={[
              { value: "Rs", label: currency },
              { value: "%", label: "%" },
            ]}
            placeholder="Enter one-time expenses"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <AmountWithUnitInput
            label="Property Taxes / year"
            value={expenses.propertyTaxes}
            onAmountChange={(e) => handleExpenseChange("propertyTaxes", e)}
            unitValue={expenses.taxesUnit}
            onUnitChange={(e) => handleExpenseUnitChange("taxesUnit", "propertyTaxes", e)}
            unitOptions={[
              { value: "Rs", label: currency },
              { value: "%", label: "%" },
            ]}
            placeholder="Enter property taxes"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <AmountWithUnitInput
            label="Home Insurance / year"
            value={expenses.homeInsurance}
            onAmountChange={(e) => handleExpenseChange("homeInsurance", e)}
            unitValue={expenses.homeInsUnit}
            onUnitChange={(e) => handleExpenseUnitChange("homeInsUnit", "homeInsurance", e)}
            unitOptions={[
              { value: "Rs", label: currency },
              { value: "%", label: "%" },
            ]}
            placeholder="Enter home insurance"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <AmountInput
            label="Maintenance / month"
            value={expenses.maintenance}
            onChange={(e) => handleExpenseChange("maintenance", e)}
            currency={currency}
            placeholder="Enter maintenance cost"
          />
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default HomeLoanForm;
