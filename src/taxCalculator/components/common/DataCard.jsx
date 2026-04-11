import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const DataCard = ({ title, children }) => {
  return (
    <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
};

export default DataCard;
