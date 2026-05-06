import React from 'react';
import { Box, Grid, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, icon: IconComponent, action }) => {
  return (
    <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
      <Grid item>
        <Box display="flex" alignItems="center">
          {IconComponent && ( // Check if IconComponent is provided
            <Box
              sx={{
                mr: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Correct: Render the component type passed as a prop */}
              <IconComponent fontSize="medium" data-testid="page-header-icon" />
            </Box>
          )}
          <Box>
            <Typography variant="h5" component="h5"> {/* This renders an h5 */}
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </Grid>
      {action && <Grid item>{action}</Grid>}
    </Grid>
  );
};

export default PageHeader;