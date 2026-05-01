import React from 'react';
import { Box, Typography, Container, Divider, Paper } from '@mui/material';
import AssetAllocationGlidePath from './AssetAllocationGlidePath';
import GoalCoverage from './GoalCoverage';

const WealthSummary = React.forwardRef((props, ref) => {
  // Assuming you pass user profile and goals data as props
  const { profile, goals } = props;

  return (
    // The ref is attached to this container
    <Paper ref={ref} sx={{ bgcolor: 'white', p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Wealth Summary Report
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Generated on: {new Date().toLocaleDateString()}
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h5" gutterBottom>
          Financial Overview
        </Typography>
        <Typography paragraph>
          This report provides a snapshot of your goal coverage and investment strategy based on your current profile.
        </Typography>

        {/* Replace these with your actual components */}
        <GoalCoverage goals={goals} />
        <AssetAllocationGlidePath profile={profile} />

        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #eee', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            This is a system-generated report. Projections are based on the data provided and are not a guarantee of future performance.
          </Typography>
        </Box>
    </Paper>
  );
});

export default WealthSummary;