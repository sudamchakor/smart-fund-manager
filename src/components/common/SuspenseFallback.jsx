import React from 'react';
import { Box, Typography, useTheme, keyframes } from '@mui/material';

// The Zoom + Glow animation for the keys
const popAndGlow = keyframes`
  0%, 100% { transform: scale(0.9); opacity: 0.4; filter: blur(1px); }
  50% { transform: scale(1.15); opacity: 1; filter: blur(0px); }
`;

// Enter animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const SuspenseFallback = ({
  message = 'Calculating wealth projections...',
}) => {
  const theme = useTheme();

  const keys = [
    { symbol: '+', color: theme.palette.primary.main }, // Logic
    { symbol: '−', color: theme.palette.error.main }, // Expenses
    { symbol: '×', color: theme.palette.success.main }, // Growth
    { symbol: '%', color: theme.palette.warning.main }, // Tax/Interest
  ];

  return (
    <Box
      sx={{
        // Apply enter animation
        animation: `${fadeIn} 0.3s ease-out`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          width: '100%',
          gap: 4,
        }}
      >
        {/* 2x2 Calculator Key Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}
        >
          {keys.map((key, i) => (
            <Box
              key={i}
              sx={{
                width: '45px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: key.color,
                borderRadius: '10px',
                color: '#fff',
                fontSize: '1.4rem',
                fontWeight: 'bold',
                boxShadow: `0 8px 20px ${key.color}50`,
                animation: `${popAndGlow} 1.5s infinite ease-in-out`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              {key.symbol}
            </Box>
          ))}
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '1px',
              mb: 1,
            }}
          >
            SMART ENGINE ACTIVE
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontFamily: 'monospace',
            }}
            data-testid="suspense-message"
          >
            {message}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SuspenseFallback;
