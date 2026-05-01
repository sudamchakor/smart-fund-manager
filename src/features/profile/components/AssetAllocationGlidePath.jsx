import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

// --- MOCK COMPONENT ---
// Replace this with your actual Asset Allocation Glide Path chart component.
const AssetAllocationGlidePath = ({ profile }) => (
  <Paper elevation={2} sx={{ p: 2, mt: 2, bgcolor: '#fafafa' }}>
    <Typography variant="h6" gutterBottom>Asset Allocation Glide Path</Typography>
    <Typography variant="body2" paragraph>
      This is a placeholder for your glide path chart. It would typically show how the asset mix (e.g., equity vs. debt) changes over time as you approach your financial goals.
    </Typography>
    <Box sx={{ height: 200, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1, borderRadius: 1 }}>
      <Typography color="text.secondary">Chart Placeholder</Typography>
    </Box>
  </Paper>
);

export default AssetAllocationGlidePath;