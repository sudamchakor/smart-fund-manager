import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { HelmetProvider } from "react-helmet-async";

// Context
import { EmiProvider, useEmiContext } from "./context/EmiContext";

// Components
import Header from "./components/Header";
import Calculator from "./pages/Calculator";
import FAQ from "./pages/FAQ";
import Settings from "./components/Settings";
import { themes } from "./components/ThemeSelector";

// Styles
import "./App.css";

const AppContent = () => {
  const { themeMode } = useEmiContext();
  const [muiTheme, setMuiTheme] = useState(() => createTheme());

  useEffect(() => {
    let currentThemeValue = themeMode;
    if (currentThemeValue === "light") {
      currentThemeValue = "dodgerblue";
    }

    const selectedTheme = themes.find((t) => t.value === currentThemeValue) || themes[0];
    const [primary, secondary, background, textPrimary, textSecondary] = selectedTheme.colors;

    document.body.setAttribute("data-theme", String(currentThemeValue));
    
    // Set variables to ensure any vanilla CSS gets updated immediately
    document.body.style.setProperty("--primary-color", primary);
    document.body.style.setProperty("--secondary-color", secondary);
    document.body.style.setProperty("--background-color", background);
    document.body.style.setProperty("--surface-color", currentThemeValue === "dark" ? "#1C1B1F" : "#ffffff");
    document.body.style.setProperty("--text-primary-color", textPrimary);
    document.body.style.setProperty("--text-secondary-color", textSecondary);

    const newTheme = createTheme({
      palette: {
        mode: currentThemeValue === "dark" ? "dark" : "light",
        primary: { main: primary },
        secondary: { main: secondary },
        background: {
          default: background,
          paper: currentThemeValue === "dark" ? "#1C1B1F" : "#ffffff",
        },
        text: {
          primary: textPrimary,
          secondary: textSecondary,
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
        <HelmetProvider>
          <AppContent />
        </HelmetProvider>
      </EmiProvider>
    </LocalizationProvider>
  );
}

export default App;
