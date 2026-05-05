import React from 'react';
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Slider,
  useTheme,
  alpha,
} from '@mui/material';

export default function InputSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  adornment,
  adornmentPosition = 'start',
}) {
  const theme = useTheme();

  const handleInputChange = (e) => {
    let val = e.target.value === '' ? '' : Number(e.target.value);
    onChange(val);
  };

  const handleSliderChange = (e, val) => {
    onChange(val);
  };

  const labelStyle = {
    fontWeight: 800,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    color: 'text.secondary',
    letterSpacing: 0.5,
  };

  const inputWellStyle = {
    fontWeight: 900,
    fontSize: '0.95rem',
    bgcolor: alpha(theme.palette.primary.main, 0.05),
    color: 'primary.main',
    px: 1.5,
    py: 0.5,
    borderRadius: 2,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
      >
        <Typography sx={labelStyle} id={`${label}-slider-label`}>
          {label}
        </Typography>
        <TextField
          variant="standard"
          size="small"
          value={value}
          onChange={handleInputChange}
          aria-labelledby={`${label}-slider-label`}
          InputProps={{
            startAdornment:
              adornmentPosition === 'start' && adornment ? (
                <InputAdornment
                  position="start"
                  sx={{ '& p': { fontWeight: 900, color: 'primary.main' } }}
                >
                  {adornment}
                </InputAdornment>
              ) : null,
            endAdornment:
              adornmentPosition === 'end' && adornment ? (
                <InputAdornment
                  position="end"
                  sx={{ '& p': { fontWeight: 900, color: 'primary.main' } }}
                >
                  {adornment}
                </InputAdornment>
              ) : null,
            disableUnderline: true,
            sx: inputWellStyle,
          }}
          sx={{ width: 140 }}
        />
      </Stack>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleSliderChange}
        color="primary"
        aria-labelledby={`${label}-slider-label`}
        sx={{
          py: 1,
          '& .MuiSlider-thumb': { width: 14, height: 14 },
          '& .MuiSlider-track': { height: 4 },
          '& .MuiSlider-rail': { height: 4, opacity: 0.2 },
        }}
      />
    </Box>
  );
}
