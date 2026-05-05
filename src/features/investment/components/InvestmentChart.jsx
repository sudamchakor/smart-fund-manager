import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme, alpha } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCurrency } from '../../../store/emiSlice';

const InvestmentChart = ({ data }) => {
  const theme = useTheme();
  const currency = useSelector(selectCurrency) || '₹';

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
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={alpha(theme.palette.divider, 0.1)}
        />
        <XAxis
          dataKey="year"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fontWeight: 700 }}
        />
        <YAxis
          tickFormatter={(value) =>
            `${currency}${(value / 100000).toFixed(1)}L`
          }
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fontWeight: 700 }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black || '#000', 0.12)}`,
          }}
          formatter={(value, name) => {
            if (name === 'invested')
              return [
                `${currency} ${value.toLocaleString('en-IN')}`,
                'Amount Invested',
              ];
            if (name === 'returns')
              return [
                `${currency} ${value.toLocaleString('en-IN')}`,
                'Est. Returns',
              ];
            if (name === 'withdrawn')
              return [
                `${currency} ${value.toLocaleString('en-IN')}`,
                'Amount Withdrawn',
              ];
            if (name === 'total')
              return [
                `${currency} ${value.toLocaleString('en-IN')}`,
                'Total Value',
              ];
            return [value, name];
          }}
          labelFormatter={(label) => `Year ${label}`}
        />
        <Legend verticalAlign="top" height={36} />

        {/* We use different colors depending on the chart structure. SWP has "withdrawn" */}
        <Bar
          dataKey="invested"
          stackId="a"
          fill={theme.palette.primary.main}
          name="Invested Amount"
        />

        {data.length > 0 && data[0].hasOwnProperty('returns') && (
          <Bar
            dataKey="returns"
            stackId="a"
            fill={theme.palette.success.main}
            name="Est. Returns"
          />
        )}

        {/* SWP specific bars */}
        {data.length > 0 && data[0].hasOwnProperty('withdrawn') && (
          <Bar
            dataKey="total"
            stackId="a"
            fill={theme.palette.success.main}
            name="Final Balance"
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default InvestmentChart;
