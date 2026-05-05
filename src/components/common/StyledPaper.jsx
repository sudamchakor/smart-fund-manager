import React from 'react';
import { Paper } from '@mui/material';

export default function StyledPaper({ children, sx = {} }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
        bgcolor: 'background.paper',
        height: '100%',
        ...sx,
      }}
      data-testid="styled-paper"
    >
      {children}
    </Paper>
  );
}
