import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  Grid,
  InputAdornment,
  alpha,
  useTheme,
} from '@mui/material';

export const investmentLabelStyle = {
  fontWeight: 800,
  textTransform: 'uppercase',
  fontSize: '0.65rem',
  color: 'text.disabled',
  letterSpacing: 1,
  mb: 0.5,
};

export default function InvestmentSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  color = 'primary',
  adornment,
  adornmentPosition = 'start',
}) {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={1} alignItems="flex-end" sx={{ mb: 0.5 }}>
        <Grid item xs={7}>
          <Typography
            sx={investmentLabelStyle}
            id={`${label}-investment-slider-label`}
          >
            {label}
          </Typography>
        </Grid>
        <Grid item xs={5}>
          <TextField
            variant="standard"
            size="small"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-labelledby={`${label}-investment-slider-label`}
            InputProps={{
              startAdornment:
                adornmentPosition === 'start' && adornment ? (
                  <InputAdornment
                    position="start"
                    sx={{
                      '& p': {
                        fontWeight: 900,
                        fontSize: '0.8rem',
                        color: `${color}.main`,
                      },
                    }}
                  >
                    {adornment}
                  </InputAdornment>
                ) : null,
              endAdornment:
                adornmentPosition === 'end' && adornment ? (
                  <InputAdornment
                    position="end"
                    sx={{
                      '& p': {
                        fontWeight: 900,
                        fontSize: '0.8rem',
                        color: `${color}.main`,
                      },
                    }}
                  >
                    {adornment}
                  </InputAdornment>
                ) : null,
              disableUnderline: true,
              sx: {
                fontWeight: 900,
                fontSize: '0.9rem',
                bgcolor: alpha(theme.palette[color].main, 0.05),
                px: 1,
                borderRadius: 1,
                '& input': { textAlign: 'right' },
              },
            }}
            fullWidth
          />
        </Grid>
      </Grid>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e, val) => onChange(val)}
        color={color}
        aria-labelledby={`${label}-investment-slider-label`}
        sx={{
          py: 1,
          '& .MuiSlider-thumb': { width: 12, height: 12 },
          '& .MuiSlider-track': { height: 4 },
          '& .MuiSlider-rail': { height: 4, opacity: 0.2 },
        }}
      />
    </Box>
  );
}
