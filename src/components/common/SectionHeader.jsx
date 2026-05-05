import React from 'react';
import { Stack, Box, Typography, alpha, useTheme } from '@mui/material';

export default function SectionHeader({
  icon,
  title,
  subtitle,
  color,
  action,
}) {
  const theme = useTheme();

  // Resolve the color directly from the theme to prevent alpha() parsing errors
  const resolvedColor =
    !color || color === 'primary.main' ? theme.palette.primary.main : color;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      sx={{ mb: 2.5 }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems={subtitle ? 'flex-start' : 'center'}
      >
        <Box
          sx={{
            display: 'flex',
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(resolvedColor, 0.1),
            color: resolvedColor,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: '1.1rem',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                display: 'block',
                mt: 0.5,
              }}
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
