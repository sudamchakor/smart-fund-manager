import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { labelStyle, getWellInputStyle } from '../../styles/formStyles';

export const AmountInput = ({
  label,
  value,
  onChange,
  currency,
  disabled,
  placeholder,
}) => {
  const theme = useTheme();
  const isPercentage = currency === '%';

  return (
    <Box sx={{ width: '100%', opacity: disabled ? 0.6 : 1 }}>
      {label && (
        <Typography sx={labelStyle} id={`${label}-amount-input-label`}>
          {label}
        </Typography>
      )}
      <TextField
        variant="standard"
        fullWidth
        disabled={disabled}
        type="number"
        value={value || ''}
        onChange={onChange}
        onFocus={(e) => e.target.select()}
        placeholder={placeholder}
        aria-labelledby={`${label}-amount-input-label`}
        inputProps={{
          min: '0',
          step: '0.01',
        }}
        InputProps={{
          disableUnderline: true,
          startAdornment:
            !isPercentage && currency ? (
              <InputAdornment
                position="start"
                sx={{
                  '& p': {
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    color: 'primary.main',
                  },
                }}
              >
                {currency}
              </InputAdornment>
            ) : null,
          endAdornment: isPercentage ? (
            <InputAdornment
              position="end"
              sx={{
                '& p': {
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  color: 'primary.main',
                },
              }}
            >
              %
            </InputAdornment>
          ) : null,
          sx: {
            ...getWellInputStyle(theme),
            '&.Mui-focused': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderColor: alpha(theme.palette.primary.main, 0.3),
            },
          },
        }}
        sx={{
          '& input': { textAlign: 'right' },
          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
            { display: 'none' },
          MozAppearance: 'textfield',
        }}
      />
    </Box>
  );
};

export const AmountWithUnitInput = ({
  label,
  value,
  onAmountChange,
  unitValue,
  onUnitChange,
  unitOptions,
  placeholder,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography sx={labelStyle} id={`${label}-amount-unit-input-label`}>
          {label}
        </Typography>
      )}

      {/* Unified Control Strip */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: 1.5,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          overflow: 'hidden',
          transition: 'all 0.2s',
          '&:focus-within': {
            borderColor: alpha(theme.palette.primary.main, 0.3),
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        <TextField
          variant="standard"
          sx={{
            flex: 1,
            minWidth: 0,
            '& input': {
              textAlign: 'right',
              px: 1.5,
              py: 1,
              fontWeight: 900,
              color: 'primary.main',
            },
            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
              { display: 'none' },
            MozAppearance: 'textfield',
          }}
          type="number"
          value={value || ''}
          onChange={onAmountChange}
          onFocus={(e) => e.target.select()}
          placeholder={placeholder}
          aria-labelledby={`${label}-amount-unit-input-label`}
          inputProps={{ min: '0', step: '0.01' }}
          InputProps={{ disableUnderline: true }}
        />

        <ToggleButtonGroup
          value={unitValue}
          exclusive
          onChange={(e, newUnit) => {
            if (newUnit !== null) {
              onUnitChange({ target: { value: newUnit } });
            }
          }}
          sx={{
            borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: 0,
              px: 2,
              fontWeight: 800,
              fontSize: '0.75rem',
              color: 'text.secondary',
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: 'primary.main',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              },
            },
          }}
        >
          {unitOptions.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

export const DatePickerInput = ({ label, value, onChange }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const dayjsValue = value
    ? typeof value === 'string'
      ? dayjs(value)
      : value
    : null;

  const handleChange = (newValue) => {
    if (newValue) {
      onChange(newValue.toISOString());
    } else {
      onChange(null);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography sx={labelStyle} id={`${label}-date-picker-label`}>
          {label}
        </Typography>
      )}
      <DatePicker
        label={label}
        views={['year', 'month']}
        openTo="month"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={dayjsValue}
        onChange={handleChange}
        slotProps={{
          textField: {
            variant: 'standard',
            fullWidth: true,
            onClick: () => setOpen(true),
            'aria-labelledby': `${label}-date-picker-label`,
            InputProps: {
              disableUnderline: true,
              sx: {
                ...getWellInputStyle(theme),
                cursor: 'pointer',
                '& input': { cursor: 'pointer', textAlign: 'right' },
              },
            },
          },
        }}
      />
    </Box>
  );
};
