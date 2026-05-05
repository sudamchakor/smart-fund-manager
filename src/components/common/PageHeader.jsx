import React from 'react';
import { Box, Stack, Typography, useTheme, alpha } from '@mui/material';

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'primary',
  action,
}) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems={action ? 'flex-end' : 'center'}
      sx={{ mb: 4 }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {Icon && ( // Conditionally render the icon box only if Icon is provided
          <Box
            sx={{
              display: 'flex',
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette[iconColor].main, 0.1),
              color: `${iconColor}.main`,
            }}
          >
            <Icon fontSize="medium" />
          </Box>
        )}
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              letterSpacing: -0.5,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: 'text.secondary' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {action && <Box>{action}</Box>}
    </Stack>
  );
}
