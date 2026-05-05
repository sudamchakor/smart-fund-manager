import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCurrency } from '../../store/emiSlice';
import { formatCurrency } from '../../utils/formatting';

const TaxBreakdownChart = ({ taxComparison, calculatedSalary }) => {
  const theme = useTheme();
  const currency = useSelector(selectCurrency) || '₹';

  const barData = [
    {
      name: 'Old Regime',
      'Basic Tax': taxComparison.oldRegime.tax,
      'Education Cess': taxComparison.oldRegime.tax * 0.04,
      Surcharge: 0, // Assuming no surcharge for now
    },
    {
      name: 'New Regime',
      'Basic Tax': taxComparison.newRegime.tax,
      'Education Cess': taxComparison.newRegime.tax * 0.04,
      Surcharge: 0, // Assuming no surcharge for now
    },
  ];

  const totalTax = taxComparison.oldRegime.tax + taxComparison.newRegime.tax;
  const takeHomePay =
    calculatedSalary.annual.totalIncome - totalTax - calculatedSalary.annual.pf;

  const pieData = [
    { name: 'Take Home Pay', value: takeHomePay },
    { name: 'Total Tax', value: totalTax },
    { name: 'Forced Savings (PF)', value: calculatedSalary.annual.pf },
  ];

  const COLORS = [
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Tax Breakdown
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
        <Box sx={{ width: '50%' }}>
          <Typography variant="subtitle1" align="center">
            Regime Comparison
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={alpha(theme.palette.divider, 0.1)}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => formatCurrency(val, currency)}
                tick={{ fontSize: 11, fontWeight: 700 }}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(value, currency),
                  name,
                ]}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black || '#000', 0.12)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(8px)',
                }}
              />
              <Legend />
              <Bar
                dataKey="Basic Tax"
                stackId="a"
                fill={theme.palette.primary.main}
              />
              <Bar
                dataKey="Education Cess"
                stackId="a"
                fill={alpha(theme.palette.primary.main, 0.5)}
              />
              <Bar
                dataKey="Surcharge"
                stackId="a"
                fill={alpha(theme.palette.primary.main, 0.2)}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ width: '50%' }}>
          <Typography variant="subtitle1" align="center">
            Gross Income Composition
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(value, currency),
                  name,
                ]}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black || '#000', 0.12)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(8px)',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default TaxBreakdownChart;
