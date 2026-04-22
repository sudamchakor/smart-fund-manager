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
  Divider,
  Drawer, // New import
  List, // New import
  ListItem, // New import
  ListItemButton, // New import
  ListItemIcon, // New import
  ListItemText, // New import
  useMediaQuery, // New import
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HomeIcon from "@mui/icons-material/Home";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MoneyIcon from "@mui/icons-material/Money";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu"; // New import
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // For Export
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"; // For FAQ
import PersonIcon from "@mui/icons-material/Person"; // For Personal Profile
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // For Future Goals
import SettingsIcon from "@mui/icons-material/Settings"; // For Settings
import RestartAltIcon from "@mui/icons-material/RestartAlt"; // For Reset Data

import { Link, useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrency,
  selectThemeMode,
  resetEmiState,
}
from "../../store/emiSlice";
import { selectCalculatedValues } from "../../features/emiCalculator/utils/emiCalculator";
import { useSnackbar } from "notistack";
import storage from "redux-persist/lib/storage";
import { useTheme } from "@mui/material/styles"; // New import
import "./Header.css";

const calculators = [
  {
    path: "/calculator",
    label: "Home Loan EMI Calculator",
    icon: <CalculateIcon fontSize="small" />,
  },
  {
    path: "/credit-card-emi",
    label: "Credit Card EMI Calculator",
    icon: <CreditCardIcon fontSize="small" />,
  },
  {
    path: "/investment",
    label: "Investment Calculators",
    icon: <TrendingUpIcon fontSize="small" />,
  },
  {
    path: "/personal-loan",
    label: "Personal Loan & BNPL Calculator",
    icon: <MoneyIcon fontSize="small" />,
  },
  {
    path: "/tax-calculator",
    label: "Tax Calculator",
    icon: <AccountBalanceWalletIcon fontSize="small" />,
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
  const theme = useTheme(); // Initialize useTheme
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Check for mobile screens

  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false); // State for mobile drawer

  const handleExport = (value) => {
    if (value === "pdf") {
      window.print();
    } else if (value === "excel") {
      if (!calculatedValues || !calculatedValues.schedule) {
        enqueueSnackbar("No data to export.", { variant: "info" });
        return;
      }
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
    setDrawerOpen(false); // Close drawer after export
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
    setDrawerOpen(false); // Close drawer after selection
  };

  const handleProfileSelect = (tab) => {
    navigate(`/profile?tab=${tab}`);
    setProfileAnchorEl(null);
    setDrawerOpen(false); // Close drawer after selection
  };

  const handleResetLocalData = async () => {
    dispatch(resetEmiState());
    await storage.removeItem("persist:app_v1");
    localStorage.removeItem("hasOnboarded");
    localStorage.removeItem("isProfileCreated");

    enqueueSnackbar("All the local data has been reset.", {
      variant: "success",
    });
    handleProfileMenuClose();
    setDrawerOpen(false); // Close drawer
    window.location.reload();
  };

  // Determine current active calculator for display in header
  const currentCalculator =
    calculators.find(
      (calc) => location.pathname.startsWith(calc.path) && calc.path !== "/",
    ) || calculators[0];

  // Fix for exact match on home route
  const activeCalculator =
    location.pathname === "/" ? calculators[0] : currentCalculator;

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      // Removed redundant onClick and onKeyDown as Drawer's onClose handles it
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/")}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="Calculators" />
        </ListItem>
        {calculators.map((calc) => (
          <ListItem key={calc.path} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(calc.path)}
              onClick={() => handleCalculatorSelect(calc.path)}
            >
              <ListItemIcon>{calc.icon}</ListItemIcon>
              <ListItemText primary={calc.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider />
        <ListItem>
          <ListItemText primary="Actions" />
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleExport("pdf")}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Export to PDF" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleExport("excel")}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Export to Excel" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/faq")}>
            <ListItemIcon>
              <HelpOutlineIcon />
            </ListItemIcon>
            <ListItemText primary="FAQ" />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleProfileSelect("personal")}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Personal Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleProfileSelect("goals")}>
            <ListItemIcon>
              <EmojiEventsIcon />
            </ListItemIcon>
            <ListItemText primary="Future Goals" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleProfileSelect("settings")}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton onClick={handleResetLocalData}>
            <ListItemIcon>
              <RestartAltIcon />
            </ListItemIcon>
            <ListItemText primary="Reset Data" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="fixed" className="header-appbar">
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo and Home Link */}
        <Box
          className="header-logo"
          onClick={() => navigate("/")}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <CalculateIcon className="header-icon" />
          <Typography variant="h6" component="div" className="header-brand">
            EMI Calculator
          </Typography>
        </Box>

        {/* Spacer to push items to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {!isMobile && (
          <>
            {/* Calculator Selector */}
            <Typography
              variant="body2"
              component="div"
              className="header-calculator-selector"
              onClick={handleMenuOpen}
              sx={{
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
              {calculators.map((calc) => (
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
                  onChange={(e) => handleExport(e.target.value)}
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
            </Box>
          </>
        )}

        {/* Profile Menu Icon (always visible) */}
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
      </Toolbar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawerContent}
      </Drawer>
    </AppBar>
  );
};

export default Header;
