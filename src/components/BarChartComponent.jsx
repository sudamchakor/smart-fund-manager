import React, { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from "recharts";
import { useEmiContext } from "../context/EmiContext";
import { useTheme } from "@mui/material/styles";
import { Typography, Box } from "@mui/material";

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
        Prepayments: item.prepayment,
        "Taxes, Home Insurance & Maintenance":
          item.taxes + item.homeInsurance + item.maintenance,
        Balance: item.balance,
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
          Prepayments: 0,
          "Taxes, Home Insurance & Maintenance": 0,
          Balance: 0,
        };
      }
      yearlyData[year].Principal += row.principal;
      yearlyData[year].Interest += row.interest;
      yearlyData[year].Prepayments += row.prepayment;
      yearlyData[year]["Taxes, Home Insurance & Maintenance"] +=
        row.taxes + row.homeInsurance + row.maintenance;
      yearlyData[year].Balance = row.balance; // Take the last balance of the year
    });

    return Object.values(yearlyData);
  }, [schedule]);

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      {schedule.length > 36 && (
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
          Data has been aggregated yearly as the tenure is longer than 36
          months.
        </Typography>
      )}
      <Box sx={{ height: { xs: 400, md: 500 }, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 25,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={60} 
              tick={{ fontSize: 12 }} 
            />
            <YAxis
              yAxisId="left"
              label={{
                value: "Payments",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{
                value: "Balance",
                angle: -90,
                position: "insideRight",
                style: { textAnchor: "middle" },
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              trigger="click"
              formatter={(value, name) => {
                if (name === "Balance") {
                  return [`${currency}${value.toFixed(2)}`, name];
                }
                return `${currency}${value.toFixed(2)}`;
              }}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              yAxisId="left"
              dataKey="Principal"
              stackId="a"
              fill={theme.palette.primary.main}
            />
            <Bar
              yAxisId="left"
              dataKey="Interest"
              stackId="a"
              fill={theme.palette.secondary.main}
            />
            <Bar
              yAxisId="left"
              dataKey="Prepayments"
              stackId="a"
              fill={theme.palette.success.main}
            />
            <Bar
              yAxisId="left"
              dataKey="Taxes, Home Insurance & Maintenance"
              stackId="b"
              fill={theme.palette.info.main}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Balance"
              stroke={theme.palette.warning.main}
              strokeWidth={3}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default BarChartComponent;