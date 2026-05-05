import React from 'react';
import { Box, Typography, Stack, useTheme, alpha } from '@mui/material';

export default function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}) {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: 'blur(8px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black || '#000', 0.12)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            display: 'block',
            mb: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            pb: 0.5,
          }}
        >
          AGE: {label}
        </Typography>
        <Stack spacing={0.5}>
          {payload.map((p) => (
            <Box
              key={p.name}
              sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: 'text.secondary' }}
              >
                {p.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 900, color: p.color }}
              >
                {valueFormatter ? valueFormatter(p.value) : p.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }
  return null;
}
