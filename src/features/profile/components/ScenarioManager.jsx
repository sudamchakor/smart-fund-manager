import React from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { AltRoute as RouteIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setScenario, selectScenario } from '../../../store/profileSlice';

const ScenarioManager = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const currentScenario = useSelector(selectScenario);

  const handleScenarioChange = (event, newScenario) => {
    if (newScenario !== null) {
      dispatch(setScenario(newScenario));
    }
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        {/* Technical Header */}
        <Stack direction="row" spacing={1} alignItems="center">
          <RouteIcon sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Scenario Mode
          </Typography>
        </Stack>

        {/* High-Density Mode Switcher */}
        <ToggleButtonGroup
          value={currentScenario}
          exclusive
          onChange={handleScenarioChange}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 2,
            boxShadow: `inset 0 2px 4px ${alpha(theme.palette.common.black || '#000', 0.02)}`,
            p: 0.5,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            '& .MuiToggleButton-root': {
              fontWeight: 700,
              textTransform: 'none',
              px: { xs: 2, sm: 3 },
              py: 0.5,
              fontSize: '0.85rem',
              border: 'none',
              borderRadius: 1.5,
              color: 'text.secondary',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            },
            '& .Mui-selected': {
              bgcolor: `${theme.palette.primary.main} !important`,
              color: `${theme.palette.primary.contrastText} !important`,
              fontWeight: 800,
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
              zIndex: 1,
            },
          }}
        >
          <ToggleButton value="current">Current Path</ToggleButton>
          <ToggleButton value="frugal">Frugal Mode</ToggleButton>
          <ToggleButton value="aggressive">Aggressive Growth</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Box>
  );
};

export default ScenarioManager;
