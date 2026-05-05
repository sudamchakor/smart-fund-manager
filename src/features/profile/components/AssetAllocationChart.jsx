import React, { useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Typography, Box, useTheme, alpha, Stack } from '@mui/material';
import { DonutLarge as AllocationIcon } from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  selectCurrentAge,
  selectRetirementAge,
} from '../../../store/profileSlice';
import SectionHeader from '../../../components/common/SectionHeader';
import ChartTooltip from '../../../components/common/ChartTooltip';

const AssetAllocationChart = forwardRef((props, ref) => {
  const currentAge = useSelector(selectCurrentAge);
  const retirementAge = useSelector(selectRetirementAge);
  const theme = useTheme();
  const componentRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getRef: () => componentRef,
  }));

  const glidePathData = useMemo(() => {
    const data = [];
    const maxAge = retirementAge;
    const startAge = currentAge;

    for (let age = startAge; age <= maxAge; age++) {
      const yearsToRetirement = maxAge - age;
      const totalYears = maxAge - startAge;

      // Linear interpolation: 80% Equity at start -> 40% Equity at retirement
      const equityStart = 80;
      const equityEnd = 40;

      let equityPercent = equityEnd;
      if (totalYears > 0) {
        equityPercent =
          equityEnd +
          (yearsToRetirement / totalYears) * (equityStart - equityEnd);
      }

      const debtPercent = 100 - equityPercent;

      data.push({
        age,
        Equity: Number(equityPercent.toFixed(2)),
        Debt: Number(debtPercent.toFixed(2)),
      });
    }
    return data;
  }, [currentAge, retirementAge]);

  return (
    <Box
      ref={componentRef}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        bgcolor: theme.palette.background.paper,
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
        height: '100%',
        mb: 2.5,
      }}
    >
      <SectionHeader
        title="Asset Allocation Glide Path"
        subtitle={`Visualizing the shift from high-growth Equity (12% expected return) to safer Debt (7% expected return) as you approach age ${retirementAge} to protect your accumulated wealth.`}
        icon={<AllocationIcon />}
        color={theme.palette.secondary.main}
      />

      {/* High-Density Chart */}
      <Box sx={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={glidePathData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={alpha(theme.palette.divider, 0.1)}
            />
            <XAxis
              dataKey="age"
              tick={{ fontSize: 10, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              minTickGap={5}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              tick={{ fontSize: 10, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip valueFormatter={(val) => `${val}%`} />}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', fontWeight: 700 }}
            />

            {/* Debt - Bottom Layer (Safer) */}
            <Area
              type="monotone"
              dataKey="Debt"
              stackId="1"
              stroke={theme.palette.info.main}
              fill={alpha(theme.palette.info.main, 0.15)}
              strokeWidth={2}
              name="Debt (7% Return)"
            />

            {/* Equity - Top Layer (Riskier) */}
            <Area
              type="monotone"
              dataKey="Equity"
              stackId="1"
              stroke={theme.palette.secondary.main}
              fill={alpha(theme.palette.secondary.main, 0.15)}
              strokeWidth={2}
              name="Equity (12% Return)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
});

export default AssetAllocationChart;
