import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { HelmetProvider } from "react-helmet-async";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store";
import { selectThemeMode } from "./store/emiSlice";

// Layout & Common
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer"; // Import the Footer component
import { themes } from "./components/common/ThemeSelector";

// Feature Pages
import Home from "./pages/Home";
import Calculator from "./pages/Calculator";
import UserProfile from "./pages/UserProfile";
import CreditCardEmiCalculator from "./pages/CreditCardEmiCalculator";
import PersonalLoanCalculator from "./pages/PersonalLoanCalculator";
import TaxCalculator from "./pages/TaxCalculator";
import FAQ from "./pages/FAQ";
import InvestmentCalculator from "./pages/InvestmentCalculator";
import PrivacyPolicy from "./pages/PrivacyPolicy"; // Import PrivacyPolicy
import TermsOfService from "./pages/TermsOfService"; // Import TermsOfService
import ContactUs from "./pages/ContactUs"; // Import ContactUs
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Styles
import "./App.css";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ padding: 4, color: "red" }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </Box>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const themeMode = useSelector(selectThemeMode);
  const [muiTheme, setMuiTheme] = useState(() => createTheme());

  useEffect(() => {
    try {
      const currentThemeValue = themeMode || "dodgerblue";

      const selectedTheme = themes.find((t) => t.value === currentThemeValue);
      if (!selectedTheme) {
        console.warn(`Theme not found: ${currentThemeValue}, using default`);
        return;
      }

      const [primary, secondary, background, textPrimary, textSecondary] =
        selectedTheme.colors;

      document.body.setAttribute("data-theme", String(currentThemeValue));

      // Set CSS variables to ensure any vanilla CSS gets updated immediately
      document.body.style.setProperty("--primary-color", primary);
      document.body.style.setProperty("--secondary-color", secondary);
      document.body.style.setProperty("--background-color", background);
      document.body.style.setProperty(
        "--surface-color",
        currentThemeValue === "dark" ? "#1C1B1F" : "#ffffff",
      );
      document.body.style.setProperty("--text-primary-color", textPrimary);
      document.body.style.setProperty("--text-secondary-color", textSecondary);

      const isDarkMode = currentThemeValue === "dark";
      const newTheme = createTheme({
        palette: {
          mode: isDarkMode ? "dark" : "light",
          primary: { main: primary },
          secondary: { main: secondary },
          background: {
            default: background,
            paper: isDarkMode ? "#1C1B1F" : "#ffffff",
          },
          text: {
            primary: textPrimary,
            secondary: textSecondary,
          },
        },
      });

      setMuiTheme(newTheme);
    } catch (error) {
      console.error("Error setting theme:", error);
    }
  }, [themeMode]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box className="app-container">
        <Header />
        <Box component="main" className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/credit-card-emi"
              element={<CreditCardEmiCalculator />}
            />

            {/* The single unified InvestmentCalculator page */}
            <Route path="/investment" element={<InvestmentCalculator />} />
            <Route path="/investment/sip" element={<InvestmentCalculator />} />
            <Route
              path="/investment/lumpsum"
              element={<InvestmentCalculator />}
            />
            <Route
              path="/investment/step-up-sip"
              element={<InvestmentCalculator />}
            />
            <Route path="/investment/swp" element={<InvestmentCalculator />} />
            <Route path="/investment/fd" element={<InvestmentCalculator />} /> {/* Changed to InvestmentCalculator */}

            <Route path="/personal-loan" element={<PersonalLoanCalculator />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/tax-calculator" element={<TaxCalculator />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} /> {/* New route */}
            <Route path="/terms-of-service" element={<TermsOfService />} /> {/* New route */}
            <Route path="/contact-us" element={<ContactUs />} /> {/* New route */}
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Box>
        <Footer /> {/* Add the Footer component here */}
      </Box>
    </ThemeProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            Loading...
          </Box>
        }
        persistor={persistor}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <HelmetProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </HelmetProvider>
        </LocalizationProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
