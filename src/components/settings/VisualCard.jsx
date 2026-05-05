import React from 'react';
import {
  alpha,
  Box,
  ButtonBase,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';

const VisualCard = ({ label, value, active, onClick, colors, subtext }) => {
  const theme = useTheme();
  const isSelected = active === value;

  return (
    <ButtonBase
      onClick={() => onClick(value)}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        p: 2.5,
        borderRadius: `${theme.shape.borderRadius}px`,
        border: '2px solid',
        borderColor: isSelected
          ? 'primary.main'
          : alpha(theme.palette.divider, 0.08),
        bgcolor: isSelected
          ? alpha(theme.palette.primary.main, 0.03)
          : 'background.paper',
        transition: 'all 0.3s ease',
        textAlign: 'left',
        '&:hover': { transform: 'translateY(-2px)' },
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: isSelected ? 'primary.main' : 'text.primary',
          }}
        >
          {label}
        </Typography>
        {isSelected && <CheckIcon color="primary" sx={{ fontSize: '1rem' }} />}
      </Box>
      <Box
        sx={{
          width: '100%',
          height: 60,
          borderRadius: 1,
          mb: 1.5,
          bgcolor: alpha(theme.palette.divider, 0.05),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
        }}
      >
        <Box
          sx={{
            width: '70%',
            height: '30px',
            borderRadius: `${theme.shape.borderRadius / 2}px`,
            bgcolor: colors[0],
          }}
        />
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: '0.7rem', lineHeight: 1.3 }}
      >
        {subtext}
      </Typography>
    </ButtonBase>
  );
};

export default VisualCard;
