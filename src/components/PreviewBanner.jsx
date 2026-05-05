import React from 'react';
import { Alert, Link, alpha, useTheme } from '@mui/material';

export default function PreviewBanner({ onOpenOnboarding }) {
  const theme = useTheme();

  return (
    <Alert
      severity="warning"
      variant="outlined"
      sx={{
        mb: 3,
        borderRadius: 3,
        border: '1px dashed',
        borderColor: 'warning.main',
        bgcolor: alpha(theme.palette.warning.main, 0.05),
        fontWeight: 600,
      }}
    >
      Your dashboard is in preview mode.{' '}
      <Link
        component="button"
        onClick={onOpenOnboarding}
        sx={{
          fontWeight: 800,
          color: 'warning.dark',
          textDecoration: 'underline',
        }}
      >
        Create your full profile
      </Link>{' '}
      to unlock wealth projections.
    </Alert>
  );
}
