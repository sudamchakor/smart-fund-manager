import React from 'react';
import { Box, Typography, useTheme, alpha, Stack } from '@mui/material';
import { PieChart as PieChartIcon } from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Label,
} from 'recharts';
import { useSelector } from 'react-redux';
import { selectCurrency } from '../../../store/emiSlice';
import { selectCurrentSurplus } from '../../../store/profileSlice';
import SectionHeader from '../../../components/common/SectionHeader';

// STRICT THEME: Replaced hardcoded #fff and #ccc with background.paper and divider
const CustomTooltip = ({ active, payload, currency, theme }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    return (
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.9), // STRICT THEME
          backdropFilter: 'blur(8px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, // STRICT THEME
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black || '#000', 0.12)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: 'text.secondary',
            textTransform: 'uppercase',
            display: 'block',
            mb: 0.5,
          }}
        >
          {data.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 900, color: payload[0].payload.fill }}
        >
          {currency}
          {Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </Typography>
      </Box>
    );
  }
  return null;
};

// STRICT THEME: Replaced hardcoded #f44336 and #2ecc71 with error.main and success.main
const CustomLabel = ({ viewBox, surplusValue, surplusFormatted, theme }) => {
  const { cx, cy } = viewBox;
  const isDeficit = surplusValue < 0;
  const valueColor = isDeficit
    ? theme.palette.error.main
    : theme.palette.success.main;

  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan
        x={cx}
        dy="-0.5em"
        fill={theme.palette.text.secondary} // STRICT THEME
        style={{
          fontSize: '0.65rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {isDeficit ? 'Current Deficit' : 'Current Surplus'}
      </tspan>
      <tspan
        x={cx}
        dy="1.6em"
        fill={valueColor} // STRICT THEME
        style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: -0.5 }}
      >
        {surplusFormatted}
      </tspan>
    </text>
  );
};

export default function CashFlowDonutChart({ donutData }) {
  const theme = useTheme();
  const currency = useSelector(selectCurrency);
  const investableSurplus = useSelector(selectCurrentSurplus);

  // STRICT THEME: Replaced the static PIE_CHART_COLORS array with contextual theme mapping
  const getColorForCategory = (name) => {
    switch (name) {
      case 'Needs':
        return theme.palette.info.main;
      case 'Wants':
        return theme.palette.warning.main;
      case 'Loan EMIs':
        return theme.palette.error.main;
      case 'Future Wealth (Goals)':
        return theme.palette.primary.main;
      case 'Surplus':
        return theme.palette.success.main;
      default:
        return theme.palette.secondary.main;
    }
  };

  const formatCurrency = (val) =>
    `${currency}${Math.abs(Number(val || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  let surplusFormatted;
  const absSurplus = Math.abs(investableSurplus);

  // Compact formatting for the center of the donut
  if (absSurplus >= 100000) {
    surplusFormatted = `${investableSurplus < 0 ? '-' : ''}${currency}${(absSurplus / 100000).toFixed(1)}L`;
  } else if (absSurplus >= 1000) {
    surplusFormatted = `${investableSurplus < 0 ? '-' : ''}${currency}${(absSurplus / 1000).toFixed(0)}k`;
  } else {
    surplusFormatted = `${investableSurplus < 0 ? '-' : ''}${formatCurrency(absSurplus)}`;
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Chart Container */}
      <Box sx={{ flexGrow: 1, minHeight: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
              innerRadius={80}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelStyle={{
                fontSize: '10px',
                fontWeight: 700,
                fill: theme.palette.text.secondary,
              }} // STRICT THEME
            >
              {donutData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorForCategory(entry.name)} // STRICT THEME
                />
              ))}
              <Label
                content={
                  <CustomLabel
                    surplusValue={investableSurplus}
                    surplusFormatted={surplusFormatted}
                    theme={theme} // Pass theme down to CustomLabel
                  />
                }
                position="center"
              />
            </Pie>
            <RechartsTooltip
              content={<CustomTooltip currency={currency} theme={theme} />}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
