import React from "react";
import { Card, CardContent, Typography, Box, Grid } from "@mui/material";

const InvestmentSummary = ({ plans, targetAmount }) => {
  // Use plan.totalValue for totalAmount
  const totalAmount = plans.reduce(
    (sum, plan) => sum + (plan.totalValue || 0),
    0,
  );
  // Use plan.timePeriod for totalTime
  const totalTime = plans.reduce(
    (sum, plan) => sum + (plan.timePeriod || 0),
    0,
  );
  // Use plan.estimatedReturns for totalReturns
  const totalReturns = plans.reduce(
    (sum, plan) => sum + (plan.estimatedReturns || 0),
    0,
  );

  const isMismatch = totalAmount !== (targetAmount || 0); // Ensure targetAmount is treated as a number

  return (
    <Card sx={{ mt: 2, border: isMismatch ? "2px solid red" : "none" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Investment Summary
        </Typography>
        {isMismatch && (
          <Typography color="error" variant="body2" gutterBottom>
            Warning: The total investment amount does not match the target
            amount.
          </Typography>
        )}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
              <Typography variant="subtitle1" align="center">
                Total Investment
              </Typography>
              <Typography
                variant="h5"
                align="center"
                color={isMismatch ? "error" : "text.primary"}
                sx={{ fontWeight: "bold" }}
              >
                {totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
              <Typography variant="subtitle1" align="center">
                Total Period
              </Typography>
              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                {totalTime.toFixed(0)} years
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
              <Typography variant="subtitle1" align="center">
                Total Returns
              </Typography>
              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                {totalReturns.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default InvestmentSummary;
