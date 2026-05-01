import React from 'react';
import { Typography, Paper, Box, LinearProgress } from '@mui/material';

// --- MOCK COMPONENT ---
// Replace this with your actual Goal Coverage component.
const GoalCoverage = ({ goals }) => (
  <Paper elevation={2} sx={{ p: 2, mt: 2, bgcolor: '#fafafa' }}>
    <Typography variant="h6" gutterBottom>Goal Coverage Status</Typography>
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1">Retirement</Typography>
      <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
      <Typography variant="caption" display="block" sx={{ textAlign: 'right' }}>75% Funded</Typography>
    </Box>
    <Box>
      <Typography variant="subtitle1">Child's Education</Typography>
      <LinearProgress variant="determinate" value={40} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
      <Typography variant="caption" display="block" sx={{ textAlign: 'right' }}>40% Funded</Typography>
    </Box>
    <Typography variant="body2" sx={{mt: 2, color: 'text.secondary'}}>
        This is a placeholder. You should feed this component with real goal data.
    </Typography>
  </Paper>
);

export default GoalCoverage;