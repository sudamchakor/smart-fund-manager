import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEmiContext } from "../context/EmiContext";
import { useTheme } from "@mui/material/styles";
import { Typography } from "@mui/material";

const BarChartComponent = () => {
  const { calculatedValues, currency } = useEmiContext();
  const theme = useTheme();
  const schedule = calculatedValues.schedule;

  const chartData = useMemo(() => {
    if (schedule.length <= 36) {
      return schedule.map((item) => ({
        name: item.date,
        Principal: item.principal,
        Interest: item.interest,
      }));
    }

    const yearlyData = {};
    schedule.forEach((row) => {
      const year = row.date.split(" ")[1]; // Extracting year from 'MMM YYYY'
      if (!yearlyData[year]) {
        yearlyData[year] = {
          name: year,
          Principal: 0,
          Interest: 0,
        };
      }
      yearlyData[year].Principal += row.principal;
      yearlyData[year].Interest += row.interest;
    });

    return Object.values(yearlyData);
  }, [schedule]);

  return (
    <>
      {schedule.length > 36 && (
        <Typography variant="caption" color="textSecondary">
          Data has been aggregated yearly as the tenure is longer than 36
          months.
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value) => `${currency}${value.toFixed(2)}`}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
            }}
          />
          <Legend />
          <Bar
            dataKey="Principal"
            stackId="a"
            fill={theme.palette.primary.main}
          />
          <Bar
            dataKey="Interest"
            stackId="a"
            fill={theme.palette.secondary.main}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default BarChartComponent;