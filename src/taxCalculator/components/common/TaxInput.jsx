import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

const TaxInput = ({ label, value, onChange, prefix = '₹', ...props }) => {
  const handleChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    onChange(val);
  };

  const handleFocus = (event) => event.target.select();

  return (
    <TextField
      label={label}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      fullWidth
      variant="outlined"
      margin="normal"
      InputProps={{
        startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null,
      }}
      {...props}
    />
  );
};

export default TaxInput;
