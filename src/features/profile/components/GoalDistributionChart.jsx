import React from 'react';
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  alpha,
  Stack,
  Divider,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import StyledPaper from '../../../components/common/StyledPaper';
import SectionHeader from '../../../components/common/SectionHeader';
import { PieChart as PieIcon } from '@mui/icons-material';

// Helper for Indian currency formatting
const formatIndianCurrency = (value, currency) => {
  const num = Number(value);
  if (isNaN(num)) return `${currency}0`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(num)
    .replace('₹', currency);
};

const CustomPieTooltip = ({ active, payload, currency }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const rawValue = payload[0].value;
    const tooltipFormatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return (
      <StyledPaper
        sx={{
          p: 1.5,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(5px)',
        }}
      >
        <Typography
          variant="body2"
          fontWeight="bold"
          sx={{ color: theme.palette.text.primary }}
        >
          {data.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, display: 'block' }}
        >
          {tooltipFormatter.format(rawValue).replace('₹', currency)} (
          {data.percentage.toFixed(1)}%)
        </Typography>
      </StyledPaper>
    );
  }
  return null;
};

export default function GoalDistributionChart({
  goalDistributionData,
  totalAggregateGoalsValue,
  currency,
}) {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <StyledPaper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'auto', // Allow height to be determined by content
        overflow: 'hidden',
        p: 0, // Remove default padding from StyledPaper
      }}
    >
      <Box sx={{ p: 2.5, pb: 0 }}>
        <SectionHeader
          title="Goal Distribution"
          icon={<PieIcon />}
          color={theme.palette.warning.main}
        />
      </Box>
      <Box
        sx={{
          p: 2.5,
          pt: 1,
          flexGrow: 1,
        }}
      >
        {goalDistributionData.length > 0 ? (
          <Stack spacing={2} alignItems="center">
            <Box sx={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={goalDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMediumScreen ? 80 : 100}
                    innerRadius={0} // This makes it a pie chart
                    fill={theme.palette.primary.light}
                    paddingAngle={2}
                  >
                    {goalDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={<CustomPieTooltip currency={currency} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Stack spacing={1} sx={{ width: '100%' }}>
              {goalDistributionData.map((goal, index) => (
                <React.Fragment key={goal.name}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ py: 0.5 }}
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '4px',
                        backgroundColor: goal.color,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ flexGrow: 1, fontWeight: 500 }}
                    >
                      {goal.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {formatIndianCurrency(goal.value, currency)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ width: '50px', textAlign: 'right' }}
                    >
                      ({goal.percentage.toFixed(1)}%)
                    </Typography>
                  </Stack>
                  {index < goalDistributionData.length - 1 && (
                    <Divider sx={{ borderStyle: 'dashed' }} />
                  )}
                </React.Fragment>
              ))}
            </Stack>
          </Stack>
        ) : (
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            sx={{ py: 4, width: '100%' }}
          >
            No goals to display distribution.
          </Typography>
        )}
      </Box>
      {goalDistributionData.length > 0 && (
        <Box
          sx={{
            p: 2.5,
            mt: 'auto',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body1" fontWeight="bold">
              Total Goal Value
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatIndianCurrency(totalAggregateGoalsValue, currency)}
            </Typography>
          </Stack>
        </Box>
      )}
    </StyledPaper>
  );
}