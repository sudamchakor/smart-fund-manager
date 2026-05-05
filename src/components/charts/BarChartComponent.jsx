import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSelector } from 'react-redux';
import { selectCalculatedValues } from '../../features/emiCalculator/utils/emiCalculator';
import { selectCurrency } from '../../store/emiSlice';
import {
  Box,
  Typography,
  Skeleton,
  useMediaQuery,
  alpha,
  Stack,
  useTheme,
} from '@mui/material';
import { formatCurrency } from '../../utils/formatting';

const BarChartComponent = () => {
  const theme = useTheme();
  const calculatedValues = useSelector(selectCalculatedValues);
  const currency = useSelector(selectCurrency);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  /**
   * THEME-STRICT COLOR MAPPING
   * Aligned with PieChart and Commitment card for visual consistency
   */
  const COLORS = {
    principal: theme.palette.success.main, // Green (Value)
    interest: theme.palette.error.main, // Red (Cost)
    prepayment: theme.palette.warning.main, // Orange (Action)
    taxes: theme.palette.info.main, // Cyan (Extra)
    insurance: theme.palette.primary.main, // Blue (Brand)
    maintenance: theme.palette.grey[400], // Neutral
    balance: theme.palette.text.primary, // Dark (Debt Line)
  };

  const data = useMemo(() => {
    const schedule = calculatedValues.schedule;
    if (!schedule || schedule.length === 0) return [];

    const maxBars = isMobile ? 6 : isTablet ? 10 : 15;
    const totalMonths = schedule.length;
    let chunkSize = Math.ceil(totalMonths / maxBars);

    if (chunkSize > 12) {
      chunkSize = Math.ceil(chunkSize / 12) * 12;
    }

    const groupedData = [];
    for (let i = 0; i < totalMonths; i += chunkSize) {
      const chunk = schedule.slice(i, i + chunkSize);
      groupedData.push({
        label:
          chunk.length > 1
            ? `${chunk[0].date} - ${chunk[chunk.length - 1].date}`
            : chunk[0].date,
        principal: chunk.reduce((sum, item) => sum + item.principal, 0),
        interest: chunk.reduce((sum, item) => sum + item.interest, 0),
        prepayment: chunk.reduce((sum, item) => sum + item.prepayment, 0),
        taxes: chunk.reduce((sum, item) => sum + item.taxes, 0),
        homeInsurance: chunk.reduce((sum, item) => sum + item.homeInsurance, 0),
        maintenance: chunk.reduce((sum, item) => sum + item.maintenance, 0),
        balance: chunk[chunk.length - 1].balance,
      });
    }
    return groupedData;
  }, [calculatedValues.schedule, isMobile, isTablet]);

  const formatYAxis = (value) => {
    if (value >= 10000000)
      return `${currency}${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${currency}${(value / 100000).toFixed(1)}L`;
    return `${currency}${value / 1000}k`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            p: 2,
            borderRadius: 3,
            boxShadow: theme.shadows[10],
            border: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(8px)',
            minWidth: 220,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1,
              fontWeight: 900,
              color: 'text.primary',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Typography>
          <Stack spacing={0.5}>
            {payload.map((entry, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: entry.color,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: 'text.secondary' }}
                  >
                    {entry.name}
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, color: 'text.primary' }}
                >
                  {formatCurrency(entry.value, currency)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      );
    }
    return null;
  };

  if (!calculatedValues?.schedule?.length) {
    return (
      <Skeleton
        variant="rectangular"
        width="100%"
        height={400}
        sx={{ borderRadius: 4 }}
      />
    );
  }

  return (
    <Box sx={{ width: '100%', height: { xs: 350, md: 400 }, mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 0, bottom: 0, left: -20 }}
        >
          <CartesianGrid
            vertical={false}
            stroke={alpha(theme.palette.divider, 0.08)}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 10,
              fontWeight: 600,
              fill: theme.palette.text.disabled,
            }}
            dy={10}
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tickFormatter={formatYAxis}
            tick={{
              fontSize: 10,
              fontWeight: 600,
              fill: theme.palette.text.disabled,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tickFormatter={formatYAxis}
            tick={{
              fontSize: 10,
              fontWeight: 600,
              fill: theme.palette.text.disabled,
            }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: alpha(theme.palette.primary.main, 0.04) }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{
              paddingBottom: 25,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          />

          <Bar
            yAxisId="left"
            dataKey="principal"
            name="Principal"
            stackId="a"
            fill={COLORS.principal}
          />
          <Bar
            yAxisId="left"
            dataKey="interest"
            name="Interest"
            stackId="a"
            fill={COLORS.interest}
          />
          <Bar
            yAxisId="left"
            dataKey="prepayment"
            name="Prepayments"
            stackId="a"
            fill={COLORS.prepayment}
          />
          <Bar
            yAxisId="left"
            dataKey="taxes"
            name="Taxes"
            stackId="a"
            fill={COLORS.taxes}
          />
          <Bar
            yAxisId="left"
            dataKey="homeInsurance"
            name="Insurance"
            stackId="a"
            fill={COLORS.insurance}
          />
          <Bar
            yAxisId="left"
            dataKey="maintenance"
            name="Maint."
            stackId="a"
            fill={COLORS.maintenance}
            radius={[3, 3, 0, 0]}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="balance"
            name="Balance"
            stroke={COLORS.balance}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0, fill: COLORS.balance }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChartComponent;
