import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Menu,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HomeIcon from "@mui/icons-material/Home";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MoneyIcon from "@mui/icons-material/Money";
import SavingsIcon from "@mui/icons-material/Savings";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { useEmiContext } from "../context/EmiContext";
import "./Header.css";
import { SettingsRounded } from "@mui/icons-material";

const calculators = [
  { path: "/", label: "Home Loan EMI Calculator", icon: <HomeIcon fontSize="small" style={{ marginRight: 8 }} /> },
  { path: "/credit-card-emi", label: "Credit Card EMI Calculator", icon: <CreditCardIcon fontSize="small" style={{ marginRight: 8 }} /> },
  { path: "/investment", label: "Investment Calculators", icon: <TrendingUpIcon fontSize="small" style={{ marginRight: 8 }} /> },
  { path: "/personal-loan", label: "Personal Loan & BNPL Calculator", icon: <MoneyIcon fontSize="small" style={{ marginRight: 8 }} /> },
];

const Header = () => {
  const { calculatedValues, currency, setCurrency, themeMode, setThemeMode } =
    useEmiContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

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

  const handleCalculatorSelect = (path) => {
    navigate(path);
    handleMenuClose();
  };

  // Determine current active calculator for display in header
  const currentCalculator = calculators.find(
    (calc) => location.pathname.startsWith(calc.path) && calc.path !== "/"
  ) || calculators[0];

  // Fix for exact match on home route
  const activeCalculator = location.pathname === "/" 
    ? calculators[0] 
    : currentCalculator;


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

        {/* Spacer to push calculator selector to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Calculator Selector - Moved to Right */}
        <Typography
          variant="body2"
          component="div"
          className="header-calculator-selector"
          onClick={handleMenuOpen}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          {activeCalculator.label} <ArrowDropDownIcon fontSize="small" />
        </Typography>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {calculators.map((calc) => (
            <MenuItem
              key={calc.path}
              selected={
                calc.path === "/" 
                  ? location.pathname === "/" 
                  : location.pathname.startsWith(calc.path)
              }
              onClick={() => handleCalculatorSelect(calc.path)}
            >
              {calc.icon}
              {calc.label}
            </MenuItem>
          ))}
        </Menu>

        <Box className="header-actions">
          <FormControl variant="standard" sx={{ m: 1, minWidth: 100 }}>
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

          <Typography variant="button">
            <Link to="/faq" className="header-link">
              FAQ
            </Link>
          </Typography>

          <Typography variant="button">
            <Link to="/settings" className="header-link">
              <SettingsRounded
                className="header-icon"
                style={{ marginBottom: "-6px" }}
              />
            </Link>
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
