import React from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

export default function FloatingStatusIsland({
  investableSurplus,
  debtFreeCountdown,
  currency,
}) {
  const theme = useTheme();
  const isDeficit = investableSurplus < 0;

  // Dynamically select the correct contrast text color based on the current background state
  const contrastTextColor = isDeficit
    ? theme.palette.error.contrastText
    : theme.palette.primary.contrastText;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 20, sm: 60 },
        left: 0,
        right: 0,
        zIndex: 1300,
        px: { xs: 2, sm: 2 },
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none', // Lets clicks pass through the invisible full-width box
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ p: '0 !important', pointerEvents: 'auto' }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: { xs: 1, sm: 4 },
            py: { xs: 1.5, sm: 2 },
            px: 4,
            borderRadius: { xs: 4, sm: 12 },
            background: isDeficit
              ? `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            backdropFilter: 'blur(12px)',
            boxShadow: `0 12px 40px ${alpha(isDeficit ? theme.palette.error.main : theme.palette.primary.main, 0.4)}`,
            border: `1px solid ${alpha(contrastTextColor, 0.2)}`, // Themed border
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography
              variant="caption"
              sx={{
                color: alpha(contrastTextColor, 0.8), // Theme contrast color
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Monthly Surplus
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: contrastTextColor, // Theme contrast color
                fontWeight: 900,
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
              }}
            >
              {currency} {Math.round(investableSurplus).toLocaleString('en-IN')}
            </Typography>
          </Stack>

          <Box
            sx={{
              width: '1px',
              height: '24px',
              bgcolor: alpha(contrastTextColor, 0.3), // Themed divider
              display: { xs: 'none', sm: 'block' },
            }}
          />

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography
              variant="caption"
              sx={{
                color: alpha(contrastTextColor, 0.8), // Theme contrast color
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Debt-Free In
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: contrastTextColor, // Theme contrast color
                fontWeight: 900,
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
              }}
            >
              {debtFreeCountdown}
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
