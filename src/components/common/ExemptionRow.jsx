import React from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Stack,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';

const ExemptionRow = ({ label, produced, limited, tooltip }) => {
  const theme = useTheme();

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <Box display="flex" alignItems="center">
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            {label}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip} placement="top" arrow>
              <IconButton size="small" sx={{ p: 0.2, ml: 0.5 }}>
                <InfoIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ minWidth: 100 }}>{produced}</Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              minWidth: 80,
              textAlign: 'right',
            }}
          >
            ₹{Math.round(limited).toLocaleString('en-IN')}
          </Typography>
        </Stack>
      </Stack>
      <Divider
        sx={{ my: 1.5, borderColor: alpha(theme.palette.divider, 0.1) }}
      />
    </Box>
  );
};

export default ExemptionRow;
