import React, { useState, useMemo } from 'react';
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
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  KeyboardArrowDown as ArrowDownIcon,
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as TaxIcon,
  AccountCircle as ProfileIcon,
  Menu as MenuIcon,
  FileDownload as ExportIcon,
  HelpOutline as HelpIcon,
  Person as PersonIcon,
  EmojiEvents as GoalsIcon,
  Settings as SettingsIcon,
  RestartAlt as ResetIcon,
  ExpandLess,
  ExpandMore,
  Payments as PersonalLoanIcon,
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';

import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCalculatedValues } from '../../features/emiCalculator/utils/emiCalculator';
import { resetEmiState } from '../../store/emiSlice';
import { useSnackbar } from 'notistack';
import storage from 'redux-persist/lib/storage';

const CALCULATORS = [
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
  const { enqueueSnackbar } = useSnackbar();
  const calculatedValues = useSelector(selectCalculatedValues);

  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openCalculators, setOpenCalculators] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const currentCalc = useMemo(
    () =>
      CALCULATORS.find((c) => location.pathname.startsWith(c.path)) ||
      CALCULATORS[0],
    [location.pathname],
  );

  const showExport = useMemo(() => {
    const allowed = ['/calculator', '/profile', '/tax-calculator'];
    return allowed.some((path) => location.pathname.startsWith(path));
  }, [location.pathname]);

  const handleExport = async (format) => {
    setExportAnchorEl(null);
    if (format === 'pdf') {
      window.print();
    } else if (format === 'excel') {
      if (!calculatedValues?.schedule || calculatedValues.schedule.length === 0)
        return enqueueSnackbar('No data to export', { variant: 'info' });
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(calculatedValues.schedule);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
      XLSX.writeFile(wb, 'SmartFund_Export.xlsx');
    }
  };

  const handleResetData = async () => {
    if (window.confirm('This will clear all your data. Continue?')) {
      dispatch(resetEmiState());
      await storage.removeItem('persist:app_v1');
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
    setAnchorEl(null);
    setProfileAnchorEl(null);
  };

  // const handleLogout = () => { // No longer needed in public header
  //   logout();
  //   setProfileAnchorEl(null);
  //   setDrawerOpen(false);
  //   navigate('/');
  // };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        zIndex: theme.zIndex.drawer + 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ flexGrow: 1 }}
        >
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
              gap: theme.spacing(1),
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                p: 0.5,
                borderRadius: `${theme.shape.borderRadius}px`,
                bgcolor: 'background.paper',
                color: 'primary.main',
              }}
            >
              <DashboardIcon sx={{ fontSize: theme.spacing(3.5) }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}
            >
              SmartFund Manager
            </Typography>
          </Box>

          {!isMobile && (
            <>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 2, bgcolor: 'primary.light' }}
              />
              <Button
                onClick={(e) => setAnchorEl(e.currentTarget)}
                endIcon={<ArrowDownIcon />}
                sx={{
                  color: 'inherit',
                  textTransform: 'none',
                  fontWeight: 'medium',
                  fontSize: '1rem',
                  borderRadius: theme.shape.borderRadius,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {currentCalc.label}
              </Button>

              <Button
                onClick={() => handleNavigation('/articles')}
                sx={{
                  color: 'inherit',
                  textTransform: 'none',
                  fontWeight: 'medium',
                  fontSize: '1rem',
                  borderRadius: theme.shape.borderRadius,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                Articles
              </Button>
            </>
          )}
        </Stack>

        <Stack direction="row" spacing={theme.spacing(1.5)} alignItems="center">
          {!isMobile && (
            <>
              {showExport && (
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={(e) => setExportAnchorEl(e.currentTarget)}
                  sx={{
                    color: 'inherit',
                    borderColor: 'primary.light',
                    borderRadius: theme.shape.borderRadius,
                    '&:hover': {
                      borderColor: 'inherit',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  Export
                </Button>
              )}

              <Tooltip title="Help & FAQ">
                <IconButton
                  onClick={() => handleNavigation('/faq')}
                  color="inherit"
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </>
          )}

          {/* Profile Icon for public users, leads to generic profile or login */}
          <IconButton
            onClick={(e) => setProfileAnchorEl(e.currentTarget)}
            color="inherit"
            sx={{ borderRadius: theme.shape.borderRadius }}
          >
            <ProfileIcon />
          </IconButton>
        </Stack>

        {/* CALCULATORS DROPDOWN */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          disableScrollLock
          PaperProps={{
            elevation: 0,
            sx: { mt: 1, minWidth: 220 },
          }}
        >
          {CALCULATORS.map((calc) => (
            <MenuItem
              key={calc.path}
              onClick={() => handleNavigation(calc.path)}
              selected={location.pathname.startsWith(calc.path)}
              sx={{ py: theme.spacing(1.5), gap: 2 }}
            >
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 'auto' }}>
                {calc.icon}
              </ListItemIcon>
              <ListItemText
                primary={calc.label}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </MenuItem>
          ))}
        </Menu>

        {/* PROFILE DROPDOWN (Public) */}
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={() => setProfileAnchorEl(null)}
          disableScrollLock
          PaperProps={{ elevation: 0, sx: { mt: 1, minWidth: 240 } }}
        >
          <MenuItem onClick={() => handleNavigation('/profile?tab=personal')}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>{' '}
            Personal Profile
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/profile?tab=goals')}>
            <ListItemIcon>
              <GoalsIcon fontSize="small" />
            </ListItemIcon>{' '}
            Financial Goals
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/profile?tab=wealth')}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>{' '}
            Wealth Dashboard
          </MenuItem>

          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={() => handleNavigation('/settings')}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>{' '}
            Global Settings
          </MenuItem>
          <Divider sx={{ my: 1 }} />

          <MenuItem onClick={handleResetData} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <ResetIcon fontSize="small" color="error" />
            </ListItemIcon>{' '}
            Reset All Data
          </MenuItem>
          {/* No Login/Logout here, handled by AdminHeader or direct route */}
        </Menu>

        {/* EXPORT MENU */}
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={() => setExportAnchorEl(null)}
        >
          <MenuItem onClick={() => handleExport('pdf')}>Download PDF</MenuItem>
          <MenuItem onClick={() => handleExport('excel')}>
            Download Excel
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* DRAWER - Public */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ elevation: 0, sx: { width: theme.spacing(35) } }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              p: theme.spacing(3),
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'black' }}>
              SmartFund Manager
            </Typography>
          </Box>

          <List sx={{ p: theme.spacing(1.5) }}>
            <ListItemButton
              onClick={() => setOpenCalculators(!openCalculators)}
              sx={{ borderRadius: theme.shape.borderRadius, mb: 0.5 }}
            >
              <ListItemIcon>
                <CalculateIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Calculators"
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
              {openCalculators ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openCalculators} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {CALCULATORS.map((calc) => (
                  <ListItemButton
                    key={calc.path}
                    sx={{
                      pl: 4,
                      borderRadius: theme.shape.borderRadius,
                      mb: 0.5,
                    }}
                    onClick={() => handleNavigation(calc.path)}
                    selected={location.pathname.startsWith(calc.path)}
                  >
                    <ListItemIcon sx={{ minWidth: theme.spacing(5) }}>
                      {calc.icon}
                    </ListItemIcon>
                    <ListItemText primary={calc.label} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>

            <Divider sx={{ my: theme.spacing(1) }} />

            <ListItemButton
              onClick={() => handleNavigation('/articles')}
              sx={{ borderRadius: theme.shape.borderRadius }}
            >
              <ListItemIcon>
                <ArticleIcon />
              </ListItemIcon>
              <ListItemText primary="Articles" />
            </ListItemButton>

            <Divider sx={{ my: theme.spacing(1) }} />

            <ListItemButton
              onClick={() => setOpenProfile(!openProfile)}
              sx={{ borderRadius: theme.shape.borderRadius }}
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText
                primary="My Account"
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
              {openProfile ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openProfile} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{ pl: 4, borderRadius: theme.shape.borderRadius }}
                  onClick={() => handleNavigation('/profile?tab=personal')}
                >
                  <ListItemText primary="Profile Details" />
                </ListItemButton>
                <ListItemButton
                  sx={{ pl: 4, borderRadius: theme.shape.borderRadius }}
                  onClick={() => handleNavigation('/profile?tab=wealth')}
                >
                  <ListItemText primary="Wealth Dashboard" />
                </ListItemButton>
              </List>
            </Collapse>

            <ListItemButton
              onClick={() => handleNavigation('/settings')}
              sx={{ borderRadius: theme.shape.borderRadius }}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigation('/faq')}
              sx={{ borderRadius: theme.shape.borderRadius }}
            >
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="Help & FAQ" />
            </ListItemButton>

            <Divider sx={{ my: theme.spacing(1) }} />

            <ListItemButton
              onClick={handleResetData}
              sx={{
                color: 'error.main',
                borderRadius: theme.shape.borderRadius,
              }}
            >
              <ListItemIcon>
                <ResetIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Clear All Data" />
            </ListItemButton>
            {/* No Login/Logout here, handled by AdminHeader or direct route */}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header;