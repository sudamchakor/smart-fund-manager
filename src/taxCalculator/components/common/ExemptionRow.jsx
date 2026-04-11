import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const ExemptionRow = ({ label, produced, limited }) => {
  return (
    <Box sx={{ my: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body1" color="text.secondary">
          {label}
        </Typography>
        <Box textAlign="right">
          <Typography variant="body2" color="text.disabled">
            Produced: ₹{produced || 0}
          </Typography>
          <Typography variant="body1" fontWeight="bold" color={limited > 0 ? "success.main" : "text.primary"}>
            Limited: ₹{limited || 0}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
};

export default ExemptionRow;
