import React, { useMemo } from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Helper for Indian currency formatting
const formatIndianCurrency = (value, currency) => {
    const num = Number(value);
    if (isNaN(num)) return `${currency}0`;
    if (num >= 10000000) return `${currency}${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `${currency}${(num / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num).replace('₹', currency);
};

const IndividualGoalTimelineChart = ({ goals, selectedGoalId, currency }) => {
  const theme = useTheme();

  const CustomTooltipContent = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <Box sx={{ p: 1, bgcolor: alpha(theme.palette.background.paper, 0.9), borderRadius: 1, boxShadow: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>{label}</Typography>
            {payload.sort((a, b) => b.value - a.value).map((entry, index) => {
              const isSelected = entry.dataKey === `goal_${selectedGoalId}`;
              const isCombined = entry.dataKey === 'combinedTotal';
              if (entry.value === 0 && !isSelected && !isCombined) return null; // Hide 0 values for non-selected
              
              const goalName = goals.find(g => `goal_${g.id}` === entry.dataKey)?.name || 'Combined Total';
              
              return (
                <Typography key={index} variant="caption" sx={{ color: entry.color || theme.palette.text.primary, display: 'block', fontWeight: isSelected || isCombined ? 'bold' : 'normal' }}>
                  {goalName}: {formatIndianCurrency(entry.value, currency)}
                </Typography>
              )
            })}
          </Box>
        );
      }
      return null;
  };

  const chartData = useMemo(() => {
    if (!goals || goals.length === 0) return [];

    const currentYear = new Date().getFullYear();
    const startYear = Math.min(...goals.map(g => Math.min(currentYear, g.startYear)));
    const endYear = Math.max(...goals.map(g => g.targetYear));

    const data = [];
    const investmentReturnRate = 0.08;
    
    let accumulatedValues = new Map(goals.map(g => [g.id, g.fundedAmount || 0]));

    for (let year = startYear; year <= endYear; year++) {
        const yearData = { year };
        let combinedTotal = 0;
        
        goals.forEach(goal => {
            let currentAccumulated = accumulatedValues.get(goal.id);
            
            if (year > currentYear && year <= goal.targetYear) {
                const annualContribution = (goal.requiredSip || 0) * 12;
                currentAccumulated = (currentAccumulated + annualContribution) * (1 + investmentReturnRate);
                accumulatedValues.set(goal.id, currentAccumulated);
            }
            
            if (year >= Math.min(currentYear, goal.startYear) && year <= goal.targetYear) {
               yearData[`goal_${goal.id}`] = Math.round(currentAccumulated);
            } else {
               yearData[`goal_${goal.id}`] = null;
            }
            combinedTotal += yearData[`goal_${goal.id}`] || 0;
        });

        yearData['combinedTotal'] = Math.round(combinedTotal);
        data.push(yearData);
    }

    return data;
  }, [goals]);

  if (!goals || goals.length === 0) return null;

  const inactiveGoals = goals.filter(g => g.id !== selectedGoalId);
  const selectedGoal = goals.find(g => g.id === selectedGoalId);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.1)} />
        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: theme.palette.text.secondary }} domain={['dataMin', 'dataMax']} interval="preserveStartEnd" />
        <YAxis tickFormatter={(val) => formatIndianCurrency(val, currency)} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: theme.palette.text.secondary }} />
        <Tooltip content={<CustomTooltipContent />} />
        <Legend iconSize={10} wrapperStyle={{ color: theme.palette.text.primary }} />
        
        {/* Combined Total Line: Neutral, dashed benchmark */}
        <Line
            type="monotone"
            dataKey="combinedTotal"
            name="Combined Total"
            stroke={theme.palette.text.secondary}
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 6 }}
        />

        {/* Inactive Goal Lines: De-emphasized */}
        {inactiveGoals.map((goal) => (
            <Line
                key={goal.id}
                type="monotone"
                dataKey={`goal_${goal.id}`}
                name={goal.name}
                stroke={theme.palette.grey[400]}
                strokeWidth={1.5}
                strokeOpacity={0.15}
                dot={false}
                activeDot={false}
                connectNulls={false}
                hide={true} // Hides from legend
            />
        ))}

        {/* Selected Individual Goal Line: Prominent */}
        {selectedGoal && (
            <Line
                key={selectedGoal.id}
                type="monotone"
                dataKey={`goal_${selectedGoal.id}`}
                name={selectedGoal.name}
                stroke={theme.palette.primary.main}
                strokeWidth={3.5}
                strokeOpacity={1}
                dot={false}
                activeDot={{ r: 6 }}
                connectNulls={false}
                animationDuration={theme.transitions.duration.complex}
            />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default IndividualGoalTimelineChart;