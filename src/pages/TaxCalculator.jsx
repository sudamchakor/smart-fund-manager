import React, { Suspense, lazy } from 'react';
import { Box, CssBaseline } from '@mui/material';
import SuspenseFallback from '../components/common/SuspenseFallback';

const TaxDashboard = lazy(() => import('./TaxDashboard'));

const TaxCalculator = () => {
  return (
    <Box>
      <CssBaseline />
      <Suspense fallback={<SuspenseFallback />}>
        <TaxDashboard />
      </Suspense>
    </Box>
  );
};

export default TaxCalculator;
