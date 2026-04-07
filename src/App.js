import React, { useState, useMemo, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Context
import { EmiProvider, useEmiContext } from "./context/EmiContext";

// Components
import Header from "./components/Header";
import Calculator from "./pages/Calculator";
import FAQ from "./pages/FAQ";
import Settings from "./components/Settings";

// Styles
import "./App.css";

const AppContent = () => {
  const { themeMode } = useEmiContext();
  const [muiTheme, setMuiTheme] = useState(() => createTheme());

  useEffect(() => {
    // Set the data-theme attribute on the body
    document.body.setAttribute("data-theme", themeMode);

    // After setting the attribute, the new CSS variables are active.
    // Read the computed values of the CSS variables.
    const computedStyle = getComputedStyle(document.body);
    const primaryColor = computedStyle.getPropertyValue('--primary-color').trim();
    const secondaryColor = computedStyle.getPropertyValue('--secondary-color').trim();
    const backgroundColor = computedStyle.getPropertyValue('--background-color').trim();
    const surfaceColor = computedStyle.getPropertyValue('--surface-color').trim();
    const textPrimaryColor = computedStyle.getPropertyValue('--text-primary-color').trim();
    const textSecondaryColor = computedStyle.getPropertyValue('--text-secondary-color').trim();

    // Create a new MUI theme with the computed values
    const newTheme = createTheme({
      palette: {
        mode: themeMode === 'dark' ? 'dark' : 'light',
        primary: { main: primaryColor || '#000' },
        secondary: { main: secondaryColor || '#000' },
        background: {
          default: backgroundColor,
          paper: surfaceColor,
        },
        text: {
          primary: textPrimaryColor,
          secondary: textSecondaryColor,
        },
      },
    });

    setMuiTheme(newTheme);
  }, [themeMode]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box className="app-container">
        <Header />
        <Box component="main" className="main-content">
          <Routes>
            <Route path="/" element={<Calculator />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <EmiProvider>
        <AppContent />
      </EmiProvider>
    </LocalizationProvider>
  );
}

export default App;