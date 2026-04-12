import React, { useMemo } from "react";
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
} from "recharts";
import { useEmiContext } from "../../context/EmiContext";
import { Box, Typography, Skeleton, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const BarChartComponent = () => {
  const { calculatedValues, currency, isCalculating } = useEmiContext();
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const data = useMemo(() => {
    const schedule = calculatedValues.schedule;
    if (!schedule || schedule.length === 0) return [];

    const maxBars = isMobile ? 6 : isTablet ? 10 : 15;
    const totalMonths = schedule.length;
    
    // Determine chunk size in months
    let chunkSize = Math.ceil(totalMonths / maxBars);
    // If chunk size is more than a year, try to make it a multiple of 12 for nicer groupings
    if (chunkSize > 12) {
      chunkSize = Math.ceil(chunkSize / 12) * 12;
    } else if (chunkSize > 1 && chunkSize < 12) {
       // if we can fit into months, but >1
       // leave it as is or round to 3, 6
    }

    const groupedData = [];
    
    for (let i = 0; i < totalMonths; i += chunkSize) {
      const chunk = schedule.slice(i, i + chunkSize);
      
      const sumPrincipal = chunk.reduce((sum, item) => sum + item.principal, 0);
      const sumInterest = chunk.reduce((sum, item) => sum + item.interest, 0);
      const sumPrepayment = chunk.reduce((sum, item) => sum + item.prepayment, 0);
      const sumTaxes = chunk.reduce((sum, item) => sum + item.taxes, 0);
      const sumHomeInsurance = chunk.reduce((sum, item) => sum + item.homeInsurance, 0);
      const sumMaintenance = chunk.reduce((sum, item) => sum + item.maintenance, 0);
      const lastBalance = chunk[chunk.length - 1].balance;
      
      let label = chunk[0].date;
      if (chunk.length > 1) {
        label = `${chunk[0].date} - ${chunk[chunk.length - 1].date}`;
      }

      groupedData.push({
        label,
        principal: sumPrincipal,
        interest: sumInterest,
        prepayment: sumPrepayment,
        taxes: sumTaxes,
        homeInsurance: sumHomeInsurance,
        maintenance: sumMaintenance,
        balance: lastBalance,
      });
    }

    return groupedData;
  }, [calculatedValues.schedule, isMobile, isTablet]);

  if (isCalculating) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Payment Progression & Balance
        </Typography>
        <Box sx={{ width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Box>
      </Box>
    );
  }

  const formatCurrency = (value) => {
    if (value >= 10000000) return `${currency} ${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `${currency} ${(value / 100000).toFixed(2)}L`;
    if (value >= 1000) return `${currency} ${(value / 1000).toFixed(2)}K`;
    return `${currency} ${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: '1px solid #ccc', borderRadius: 1, boxShadow: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>{label}</Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>{currency} {entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Progression & Balance
      </Typography>
      <ResponsiveContainer width="100%" height={450}>
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 12 }} 
            angle={isMobile ? -45 : 0} 
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 60 : 30}
          />
          <YAxis 
            yAxisId="left" 
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }} 
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
          
          <Bar yAxisId="left" dataKey="principal" name="Principal" stackId="a" fill={theme.palette.primary.main} />
          <Bar yAxisId="left" dataKey="interest" name="Interest" stackId="a" fill={theme.palette.secondary.main} />
          <Bar yAxisId="left" dataKey="prepayment" name="Prepayments" stackId="a" fill={theme.palette.success.main} />
          <Bar yAxisId="left" dataKey="taxes" name="Taxes" stackId="a" fill={theme.palette.warning.main} />
          <Bar yAxisId="left" dataKey="homeInsurance" name="Home Insurance" stackId="a" fill={theme.palette.info.main} />
          <Bar yAxisId="left" dataKey="maintenance" name="Maintenance" stackId="a" fill={theme.palette.grey[500]} />
          
          <Line yAxisId="right" type="monotone" dataKey="balance" name="Balance" stroke={theme.palette.error.main} strokeWidth={3} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChartComponent;
