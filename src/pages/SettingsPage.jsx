import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Stack,
  Typography,
  useTheme,
  alpha,
  Grid,
  Button,
  Slide,
  Paper,
  Select,
  MenuItem,
  Switch,
  Divider,
} from '@mui/material';
import {
  SettingsOutlined as SettingsIcon,
  SaveOutlined as SaveIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

import {
  setThemeMode,
  setDesignSystem,
  setVisualStyle,
  setCurrency,
  setAutoSave,
} from '../store/emiSlice';

import { themePresets } from '../theme/ThemeConfig';
import ThemeSelector from '../components/common/ThemeSelector';
import PageHeader from '../components/common/PageHeader';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const theme = useTheme();

  const globalSettings = useSelector((state) => state.emi);
  const originalSettings = useRef({ ...globalSettings });
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    return () => {
      if (!hasSaved) {
        const orig = originalSettings.current;
        dispatch(setThemeMode(orig.themeMode));
        dispatch(setDesignSystem(orig.designSystem));
        dispatch(setVisualStyle(orig.visualStyle));
        dispatch(setCurrency(orig.currency));
        dispatch(setAutoSave(orig.autoSave));
      }
    };
  }, [hasSaved, dispatch]);

  const isDirty =
    JSON.stringify(globalSettings) !== JSON.stringify(originalSettings.current);

  const handleSave = () => {
    originalSettings.current = { ...globalSettings };
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 500);
  };

  const handleUndo = () => {
    const orig = originalSettings.current;
    dispatch(setThemeMode(orig.themeMode));
    dispatch(setDesignSystem(orig.designSystem));
    dispatch(setVisualStyle(orig.visualStyle));
  };

  return (
    <Box
      sx={{
        width: '100%',
        p: { xs: 2, md: 3 },
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 700 }}>
        <PageHeader
          title="Settings"
          subtitle="Configure your workspace environment."
          icon={SettingsIcon}
        />

        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Section 1: Appearance */}
          <Box>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 800,
                color: 'primary.main',
                letterSpacing: 1.2,
              }}
            >
              Appearance
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  Layout Style
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={
                    Object.keys(themePresets).find(
                      (k) =>
                        themePresets[k].arch === globalSettings.designSystem &&
                        themePresets[k].style === globalSettings.visualStyle,
                    ) || 'custom'
                  }
                  onChange={(e) => {
                    const p = themePresets[e.target.value];
                    if (p) {
                      dispatch(setDesignSystem(p.arch));
                      dispatch(setVisualStyle(p.style));
                    }
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  {Object.entries(themePresets).map(([key, p]) => (
                    <MenuItem key={key} value={key}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  Color Theme
                </Typography>
                <ThemeSelector
                  selectedTheme={globalSettings.themeMode}
                  onThemeChange={(v) => dispatch(setThemeMode(v))}
                />
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ opacity: 0.6 }} />

          {/* Section 2: Regional & Sync */}
          <Box>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 800,
                color: 'primary.main',
                letterSpacing: 1.2,
              }}
            >
              Preferences
            </Typography>
            <Grid container spacing={4} alignItems="center" sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  Currency
                </Typography>
                <Select
                  value={globalSettings.currency}
                  onChange={(e) => dispatch(setCurrency(e.target.value))}
                  fullWidth
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="₹">Rupee (₹)</MenuItem>
                  <MenuItem value="$">Dollar ($)</MenuItem>
                  <MenuItem value="€">Euro (€)</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Cloud Sync
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Auto-save data
                    </Typography>
                  </Box>
                  <Switch
                    size="small"
                    checked={globalSettings.autoSave}
                    onChange={(e) => dispatch(setAutoSave(e.target.checked))}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Stack>

        {/* Minimal Action Bar */}
        <Slide direction="up" in={isDirty}>
          <Paper
            elevation={6}
            sx={{
              position: 'fixed',
              bottom: 30,
              left: '50%',
              transform: 'translateX(-50%) !important',
              p: 0.8,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              px: 2,
              zIndex: 3000,
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, opacity: 0.8 }}
            >
              Unsaved Preview
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                onClick={handleUndo}
                sx={{
                  color: alpha(theme.palette.primary.contrastText, 0.7),
                  fontSize: '0.7rem',
                }}
              >
                Discard
              </Button>
              <Button
                size="small"
                onClick={handleSave}
                variant="contained"
                startIcon={<SaveIcon sx={{ fontSize: '0.9rem !important' }} />}
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 2,
                  bgcolor: theme.palette.primary.contrastText,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.contrastText, 0.9),
                  },
                }}
              >
                Save
              </Button>
            </Stack>
          </Paper>
        </Slide>
      </Box>
    </Box>
  );
}