import React from 'react';
import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';

export default function DetailRow({ label, value, indicatorColor }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.2,
        px: 1.5,
        borderRadius: 1.5,
        '&:nth-of-type(odd)': {
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        },
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
        transition: 'background-color 0.2s',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        {indicatorColor && (
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: indicatorColor,
            }}
          />
        )}
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="body1"
        sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.9rem' }}
      >
        {value}
      </Typography>
    </Box>
  );
}
