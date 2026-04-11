import React from "react";
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
import { useTheme } from "@mui/material/styles";

const InvestmentChart = ({ data }) => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="year" 
          label={{ value: "Years", position: "insideBottom", offset: -5 }} 
        />
        <YAxis 
          tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} 
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === "invested") return [`₹${value.toLocaleString()}`, "Amount Invested"];
            if (name === "returns") return [`₹${value.toLocaleString()}`, "Est. Returns"];
            if (name === "withdrawn") return [`₹${value.toLocaleString()}`, "Amount Withdrawn"];
            if (name === "total") return [`₹${value.toLocaleString()}`, "Total Value"];
            return [value, name];
          }}
          labelFormatter={(label) => `Year ${label}`}
        />
        <Legend verticalAlign="top" height={36}/>
        
        {/* We use different colors depending on the chart structure. SWP has "withdrawn" */}
        <Bar dataKey="invested" stackId="a" fill={theme.palette.primary.main} name="Invested Amount" />
        
        {data.length > 0 && data[0].hasOwnProperty("returns") && (
          <Bar dataKey="returns" stackId="a" fill={theme.palette.success.main} name="Est. Returns" />
        )}

        {/* SWP specific bars */}
        {data.length > 0 && data[0].hasOwnProperty("withdrawn") && (
          <Bar dataKey="total" stackId="a" fill={theme.palette.success.main} name="Final Balance" />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default InvestmentChart;
