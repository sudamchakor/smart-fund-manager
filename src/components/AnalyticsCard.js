import React from "react";
import { Grid, Paper } from "@mui/material";
import PieChartComponent from "./PieChartComponent";
import BarChartComponent from "./BarChartComponent";

const AnalyticsCard = () => {
  return (
    <Paper elevation={3} className="calculator-paper">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <PieChartComponent />
        </Grid>
        <Grid item xs={12} md={6}>
          <BarChartComponent />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AnalyticsCard;