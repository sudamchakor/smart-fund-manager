import React from "react";
import { Grid, Box, Paper, Typography } from "@mui/material";
import HomeLoanForm from "../components/HomeLoanForm";
import PrepaymentsForm from "../components/PrepaymentsForm";
import AnalyticsCard from "../components/AnalyticsCard";
import PaymentScheduleTable from "../components/PaymentScheduleTable";
import TotalMonthlyPayment from "../components/TotalMonthlyPayment";
import "./Calculator.scss";
import { useEmiContext } from "../context/EmiContext";

const Calculator = () => {
  const { calculatedValues } = useEmiContext();

  const schedule = calculatedValues.schedule;
  const startMonthYear = schedule.length > 0 ? schedule[0].date : "";
  const endMonthYear =
    schedule.length > 0 ? schedule[schedule.length - 1].date : "";

  return (
    <Box className="calculator-container">
      <Grid container spacing={3}>
        {/* Full Width Row: Inputs (Home Loan + Expenses) */}
        <Grid item xs={12}>
          <HomeLoanForm />
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} className="calculator-paper">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <PrepaymentsForm />
              </Grid>
              <Grid item xs={12} md={6}>
                <TotalMonthlyPayment />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <AnalyticsCard />
        </Grid>

        {/* Full Width Row: Payment Schedule */}
        <Grid item xs={12}>
          <Paper elevation={3} className="calculator-paper">
            <Box className="calculator-schedule-header">
              <Typography variant="h6">
                Home Loan Payment Schedule ({startMonthYear} - {endMonthYear})
              </Typography>
            </Box>
            <PaymentScheduleTable />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Calculator;