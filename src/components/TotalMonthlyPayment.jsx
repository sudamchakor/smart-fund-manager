import React from "react";
import { Paper, Typography, Box, Grid, Divider } from "@mui/material";
import { useEmiContext } from "../context/EmiContext";
import "./TotalMonthlyPayment.scss";
import CalcGrid from "./CalcGrid";

const TotalMonthlyPayment = () => {
  const { calculatedValues, expenses, currency } = useEmiContext();

  const emi = Math.round(calculatedValues.emi) || 0;
  const monthlyTaxes = Math.round((calculatedValues.taxesYearlyInRs || 0) / 12);
  const monthlyInsurance = Math.round(
    (calculatedValues.homeInsYearlyInRs || 0) / 12,
  );
  const monthlyMaintenance = Math.round(expenses.maintenance) || 0;

  const totalMonthlyPayment =
    emi + monthlyTaxes + monthlyInsurance + monthlyMaintenance;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Total Monthly Payment Calculation
      </Typography>
      <Box className="total-monthly-box">
        <Grid container spacing={2}>
          <CalcGrid
            label={"Monthly EMI"}
            currency={currency}
            value={emi}
            variant={"body1"}
          />
          <CalcGrid
            label={"Property Taxes"}
            currency={currency}
            value={monthlyTaxes}
            variant={"body1"}
          />
          <CalcGrid
            label={"Home Insurance"}
            currency={currency}
            value={monthlyInsurance}
            variant={"body1"}
          />
          <CalcGrid
            label={"Maintenance"}
            currency={currency}
            value={monthlyMaintenance}
            variant={"body1"}
          />
        </Grid>

        <Divider className="total-monthly-divider" />

        <Grid container spacing={2}>
          <CalcGrid
            label={"Total Monthly Payment"}
            currency={currency}
            value={totalMonthlyPayment}
            variant="h6"
            color="primary"
          />
        </Grid>
      </Box>
    </Box>
  );
};

export default TotalMonthlyPayment;
