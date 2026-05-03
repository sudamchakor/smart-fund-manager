import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Collapse,
  Button,
  Stack,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  KeyboardArrowDown as ArrowDownIcon,
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as TaxIcon,
  Payments as PersonalLoanIcon,
  Menu as MenuIcon,
  FileDownload as ExportIcon,
  AccountCircle as ProfileIcon,
  Person as PersonIcon,
  EmojiEvents as GoalsIcon,
  Dashboard as WealthIcon,
  Settings as SettingsIcon,
  RestartAlt as ResetIcon,
  ExpandLess,
  ExpandMore,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetEmiState } from '../../store/emiSlice';
import storage from 'redux-persist/lib/storage';

const calculators = [
  { path: '/calculator', label: 'Home Loan EMI', icon: <CalculateIcon /> },
  {
    path: '/credit-card-emi',
    label: 'Credit Card EMI',
    icon: <CreditCardIcon />,
  },
  { path: '/investment', label: 'Investment', icon: <TrendingUpIcon /> },
  {
    path: '/personal-loan',
    label: 'Personal Loan',
    icon: <PersonalLoanIcon />,
  },
  { path: '/tax-calculator', label: 'Tax Calculator', icon: <TaxIcon /> },
];

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // State Management
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openCalculators, setOpenCalculators] = useState(true);
  const [openAccount, setOpenAccount] = useState(false);
  const [calcAnchorEl, setCalcAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
    setCalcAnchorEl(null);
    setProfileAnchorEl(null);
  };

  const handleResetData = async () => {
    if (window.confirm('This will clear all your data. Continue?')) {
      dispatch(resetEmiState());
      await storage.removeItem('persist:app_v1');
      localStorage.clear();
      window.location.reload();
    }
  };

  const currentCalc =
    calculators.find((c) => location.pathname.startsWith(c.path)) ||
    calculators[0];

  // Consistent Menu Styling
  const menuStyle = {
    paper: {
      elevation: 0,
      sx: {
        mt: 1.5,
        minWidth: 240,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[8],
        '& .MuiMenuItem-root': {
          typography: 'body2',
          py: 1.2,
          borderRadius: 1,
          mx: 0.5,
        },
      },
    },
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          zIndex: theme.zIndex.drawer + 1,
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {isMobile && (
                <IconButton onClick={() => setDrawerOpen(true)} color="inherit">
                  <MenuIcon />
                </IconButton>
              )}

              <Box
                onClick={() => handleNavigation('/')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: 1.5,
                }}
              >
                <CalculateIcon sx={{ fontSize: 32 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, display: { xs: 'none', sm: 'block' } }}
                >
                  SmartFund Manager
                </Typography>
              </Box>

              {!isMobile && (
                <Button
                  color="inherit"
                  endIcon={<ArrowDownIcon />}
                  onClick={(e) => setCalcAnchorEl(e.currentTarget)}
                  sx={{
                    ml: 2,
                    textTransform: 'none',
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                    },
                  }}
                >
                  {currentCalc.label}
                </Button>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {!isMobile && (
              <Tooltip title="Help & FAQ">
                <IconButton
                  color="inherit"
                  onClick={() => handleNavigation('/faq')}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            )}

            <IconButton
              onClick={(e) => setProfileAnchorEl(e.currentTarget)}
              sx={{
                bgcolor: alpha(theme.palette.common.white, 0.1),
                color: 'inherit',
              }}
            >
              <ProfileIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* --- DESKTOP CALCULATOR MENU --- */}
      <Menu
        anchorEl={calcAnchorEl}
        open={Boolean(calcAnchorEl)}
        onClose={() => setCalcAnchorEl(null)}
        SlotProps={menuStyle}
        disableScrollLock // Prevents layout shifting
      >
        <Typography
          variant="overline"
          sx={{ px: 2, fontWeight: 800, color: 'text.secondary' }}
        >
          Select Calculator
        </Typography>
        {calculators.map((calc) => (
          <MenuItem
            key={calc.path}
            onClick={() => handleNavigation(calc.path)}
            selected={location.pathname === calc.path}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>
              {calc.icon}
            </ListItemIcon>
            {calc.label}
          </MenuItem>
        ))}
      </Menu>

      {/* --- DESKTOP PROFILE MENU --- */}
      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={() => setProfileAnchorEl(null)}
        SlotProps={menuStyle}
        disableScrollLock // Prevents layout shifting
      >
        <MenuItem onClick={() => handleNavigation('/profile?tab=personal')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Personal Profile
        </MenuItem>
        <MenuItem onClick={() => handleNavigation('/profile?tab=goals')}>
          <ListItemIcon>
            <GoalsIcon fontSize="small" />
          </ListItemIcon>
          Financial Goals
        </MenuItem>
        <MenuItem onClick={() => handleNavigation('/profile?tab=wealth')}>
          <ListItemIcon>
            <WealthIcon fontSize="small" />
          </ListItemIcon>
          Wealth Dashboard
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={() => console.log('Exporting...')}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          Export Reports
        </MenuItem>
        <MenuItem onClick={() => handleNavigation('/settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={() => handleNavigation('/faq')}>
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          Help & Support
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleResetData} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <ResetIcon fontSize="small" color="error" />
          </ListItemIcon>
          Reset Application Data
        </MenuItem>
      </Menu>

      {/* --- MOBILE DRAWER --- */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        disableScrollLock // Prevents layout shifting
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: 'background.default',
            backgroundImage: 'none',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CalculateIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            SmartFund{' '}
            <span style={{ color: theme.palette.primary.main }}>Manager</span>
          </Typography>
        </Box>
        <Divider />

        <List sx={{ p: 1 }}>
          <ListItemButton onClick={() => setOpenCalculators(!openCalculators)}>
            <ListItemIcon>
              <CalculateIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Calculators"
              primaryTypographyProps={{ fontWeight: 700 }}
            />
            {openCalculators ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openCalculators} timeout="auto">
            <List disablePadding>
              {calculators.map((calc) => (
                <ListItemButton
                  key={calc.path}
                  sx={{ pl: 4, borderRadius: 2 }}
                  onClick={() => handleNavigation(calc.path)}
                  selected={location.pathname === calc.path}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{calc.icon}</ListItemIcon>
                  <ListItemText primary={calc.label} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>

          <Divider sx={{ my: 1 }} />

          <ListItemButton onClick={() => setOpenAccount(!openAccount)}>
            <ListItemIcon>
              <ProfileIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="My Account"
              primaryTypographyProps={{ fontWeight: 700 }}
            />
            {openAccount ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openAccount} timeout="auto">
            <List disablePadding>
              <ListItemButton
                sx={{ pl: 4, borderRadius: 2 }}
                onClick={() => handleNavigation('/profile?tab=personal')}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Personal Profile" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4, borderRadius: 2 }}
                onClick={() => console.log('Exporting...')}
              >
                <ListItemIcon>
                  <ExportIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Export Data" />
              </ListItemButton>
            </List>
          </Collapse>

          <Divider sx={{ my: 1 }} />

          <ListItemButton onClick={() => handleNavigation('/settings')}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Global Settings" />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigation('/faq')}>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Help & FAQ" />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
};

export default Header;
