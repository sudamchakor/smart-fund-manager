import React, { useState, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Menu,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Divider, // Import Divider
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HomeIcon from "@mui/icons-material/Home";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MoneyIcon from "@mui/icons-material/Money";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrency,
  selectThemeMode,
  setCurrency,
  setThemeMode,
  resetEmiState,
} from "../../store/emiSlice";
import { selectCalculatedValues } from "../../utils/emiCalculator"; // Corrected import path
import { useSnackbar } from "notistack";
import storage from "redux-persist/lib/storage"; // Import storage
import "./Header.css";
import OnboardingModal from "../../pages/OnboardingModal";

const calculators = [
  {
    path: "/",
    label: "Home",
    icon: <HomeIcon fontSize="small" style={{ marginRight: 8 }} />,
  },
  {
    path: "/calculator",
    label: "Home Loan EMI Calculator",
    icon: <CalculateIcon fontSize="small" style={{ marginRight: 8 }} />,
  },
  {
    path: "/credit-card-emi",
    label: "Credit Card EMI Calculator",
    icon: <CreditCardIcon fontSize="small" style={{ marginRight: 8 }} />,
  },
  {
    path: "/investment",
    label: "Investment Calculators",
    icon: <TrendingUpIcon fontSize="small" style={{ marginRight: 8 }} />,
  },
  {
    path: "/personal-loan",
    label: "Personal Loan & BNPL Calculator",
    icon: <MoneyIcon fontSize="small" style={{ marginRight: 8 }} />,
  },
  {
    path: "/tax-calculator",
    label: "Tax Calculator",
    icon: (
      <AccountBalanceWalletIcon fontSize="small" style={{ marginRight: 8 }} />
    ),
  },
];

const Header = () => {
  const calculatedValues = useSelector(selectCalculatedValues);
  const currency = useSelector(selectCurrency);
  const themeMode = useSelector(selectThemeMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const handleExport = (event) => {
    const value = event.target.value;
    if (value === "pdf") {
      window.print();
    } else if (value === "excel") {
      if (!calculatedValues || !calculatedValues.schedule) return;
      const tableData = calculatedValues.schedule.map((row) => ({
        Month: row.month,
        Date: row.date,
        Principal: row.principal.toFixed(2),
        Interest: row.interest.toFixed(2),
        Prepayment: row.prepayment.toFixed(2),
        Balance: row.balance.toFixed(2),
      }));

      const ws = XLSX.utils.json_to_sheet(tableData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Schedule");
      XLSX.writeFile(wb, "emi_schedule.xlsx");
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleCalculatorSelect = (path) => {
    navigate(path);
    setAnchorEl(null);
  };

  const handleProfileSelect = (tab) => {
    navigate(`/profile?tab=${tab}`);
    setProfileAnchorEl(null);
  };

  const handleResetLocalData = async () => {
    dispatch(resetEmiState()); // Reset the Redux state for emi slice
    await storage.removeItem("persist:app_v1"); // Clear the persisted state from localStorage
    localStorage.removeItem("hasOnboarded"); // Allow onboarding to show again

    enqueueSnackbar("All the local data has been reset.", {
      variant: "success",
    });
    handleProfileMenuClose();
    window.location.reload(); // Force a full page reload to rehydrate with default state
  };

  // Determine current active calculator for display in header
  const currentCalculator =
    calculators.find(
      (calc) => location.pathname.startsWith(calc.path) && calc.path !== "/",
    ) || calculators[0];

  // Fix for exact match on home route
  const activeCalculator =
    location.pathname === "/" ? calculators[0] : currentCalculator;

  return (
    <AppBar position="fixed" className="header-appbar">
      <Toolbar>
        {/* Logo and Home Link */}
        <Box
          className="header-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <CalculateIcon className="header-icon" />
          <Typography variant="h6" component="div" className="header-brand">
            EMI Calculator
          </Typography>
        </Box>

        {/* Spacer to push items to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Calculator Selector */}
        <Typography
          variant="body2"
          component="div"
          className="header-calculator-selector"
          onClick={handleMenuOpen}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            marginRight: "32px",
            padding: "8px 0",
          }}
        >
          {activeCalculator.label} <ArrowDropDownIcon fontSize="small" />
        </Typography>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {calculators
            .filter((calc) => calc.path !== "/")
            .map((calc) => (
              <MenuItem
                key={calc.path}
                selected={location.pathname.startsWith(calc.path)}
                onClick={() => handleCalculatorSelect(calc.path)}
              >
                {calc.icon}
                {calc.label}
              </MenuItem>
            ))}
        </Menu>

        <Box
          className="header-actions"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <FormControl variant="standard" sx={{ minWidth: 70, mr: 2 }}>
            <Select
              value=""
              onChange={handleExport}
              displayEmpty
              className="header-select"
              disableUnderline
            >
              <MenuItem value="" disabled>
                Export
              </MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="button" sx={{ mr: 2 }}>
            <Link
              to="/faq"
              className="header-link"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              FAQ
            </Link>
          </Typography>

          {/* Profile Menu Icon */}
          <Box>
            <IconButton
              color="inherit"
              sx={{ padding: "8px" }}
              onClick={handleProfileMenuOpen}
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={() => { setOnboardingOpen(true); handleProfileMenuClose(); }}>
                Create Profile
              </MenuItem>
              <MenuItem onClick={() => handleProfileSelect("personal")}>
                Personal Profile
              </MenuItem>
              <MenuItem onClick={() => handleProfileSelect("goals")}>
                Future Goals
              </MenuItem>
              <MenuItem onClick={() => handleProfileSelect("settings")}>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleResetLocalData}>Reset Data</MenuItem>
            </Menu>
          </Box>
        </Box>
        <OnboardingModal open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
