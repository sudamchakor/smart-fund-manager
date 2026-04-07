import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Stack,
  Divider,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEmiContext } from "../context/EmiContext";
import ThemeSelector from "./ThemeSelector";

const Settings = () => {
  const {
    currency,
    setCurrency,
    themeMode,
    setThemeMode,
    autoSave,
    setAutoSave,
    saveSettingsToLocal,
    saveTrigger,
  } = useEmiContext();

  const [useSystemDefault, setUseSystemDefault] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    if (useSystemDefault) setThemeMode(prefersDarkMode ? "dark" : "light");
  }, [useSystemDefault, prefersDarkMode, setThemeMode]);

  useEffect(() => {
    if (autoSave) saveSettingsToLocal({ currency, themeMode, autoSave });
  }, [currency, themeMode, autoSave, saveSettingsToLocal]);

  useEffect(() => {
    if (saveTrigger > 0) setOpenToast(true);
  }, [saveTrigger]);

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="700" gutterBottom>
            Settings
          </Typography>

          <Stack spacing={4} sx={{ mt: 3 }}>
            {/* Theme Section - Single Line */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  THEME SELECTION
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={useSystemDefault}
                      onChange={(e) => setUseSystemDefault(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">System Default</Typography>
                  }
                />
              </Stack>

              <ThemeSelector
                selectedTheme={themeMode}
                onThemeChange={setThemeMode}
                disabled={useSystemDefault}
              />
            </Box>

            <Divider />

            {/* Currency - Full Width */}
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                CURRENCY
              </Typography>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Preferred Currency</InputLabel>
                <Select
                  value={currency}
                  label="Preferred Currency"
                  variant="outlined"
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <MenuItem value="₹">INR - Indian Rupee (₹)</MenuItem>
                  <MenuItem value="$">USD - US Dollar ($)</MenuItem>
                  <MenuItem value="€">EUR - Euro (€)</MenuItem>
                  <MenuItem value="£">GBP - British Pound (£)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Autosave Toggle */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="600">
                  Autosave
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Always syncs with local storage
                </Typography>
              </Box>
              <Switch
                checked={!!autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={openToast}
        autoHideDuration={1500}
        onClose={() => setOpenToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          Settings Updated
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;