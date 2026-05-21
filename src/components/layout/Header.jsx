import React, { useState, useMemo, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  KeyboardArrowDown as ArrowDownIcon,
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
  Article as ArticleIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';

import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCalculatedValues } from '../../features/emiCalculator/utils/emiCalculator';
import { resetEmiState, selectEmiState, setEmiState } from '../../store/emiSlice';
import { selectProfileState, setProfileState } from '../../store/profileSlice';
import { useSnackbar } from 'notistack';
import storage from 'redux-persist/lib/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { getAuthentication } from '../../firebaseConfig';
import {
  CALCULATORS,
  exportSchedule,
  isCloudPage,
  isExportPage,
  loadUserDataFromFirestore,
  saveUserDataToFirestore,
} from './headerHelpers';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [authUser, setAuthUser] = useState(null);
  const calculatedValues = useSelector(selectCalculatedValues);
  const emiState = useSelector(selectEmiState);
  const profileState = useSelector(selectProfileState);

  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openCalculators, setOpenCalculators] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    isDestructive: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuthentication(), setAuthUser);
    return () => unsubscribe();
  }, []);

  const currentCalc = useMemo(
    () =>
      CALCULATORS.find((c) => location.pathname.startsWith(c.path)) || {
        label: 'Select Calculator',
        path: '',
      },
    [location.pathname],
  );

  const showExport = useMemo(() => isExportPage(location.pathname), [
    location.pathname,
  ]);

  const showCloudActions = useMemo(
    () => isCloudPage(location.pathname) && Boolean(authUser),
    [location.pathname, authUser],
  );

  const handleSaveToFirestore = async () => {
    if (!authUser) {
      enqueueSnackbar('Sign in to save data', { variant: 'warning' });
      return;
    }

    setCloudBusy(true);
    try {
      await saveUserDataToFirestore({
        user: authUser,
        emiState,
        profileState,
        enqueueSnackbar,
      });
    } catch (error) {
      console.error('Firestore save error:', error);
      enqueueSnackbar(
        error?.message || 'Unable to save data to Firestore',
        {
          variant: 'error',
        },
      );
    } finally {
      setCloudBusy(false);
    }
  };

  const handleLoadFromFirestore = async () => {
    if (!authUser) {
      enqueueSnackbar('Sign in to load data', { variant: 'warning' });
      return;
    }

    setDialogConfig({
      title: 'Load Data from Cloud',
      message:
        'Loading data from Firestore will replace your current EMI and profile values. Continue?',
      confirmText: 'Load',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setDialogOpen(false);
        setCloudBusy(true);
        try {
          const loadedData = await loadUserDataFromFirestore({
            user: authUser,
            enqueueSnackbar,
          });

          if (loadedData?.profileData) {
            dispatch(setProfileState(loadedData.profileData));
          }
          if (loadedData?.emiData) {
            dispatch(setEmiState(loadedData.emiData));
          }
        } catch (error) {
          console.error('Firestore load error:', error);
          enqueueSnackbar(
            error?.message || 'Unable to load data from Firestore',
            {
              variant: 'error',
            },
          );
        } finally {
          setCloudBusy(false);
        }
      },
      isDestructive: false,
    });
    setDialogOpen(true);
  };

  const handleExport = async (format) => {
    setExportAnchorEl(null);
    await exportSchedule({
      format,
      calculatedValues,
      enqueueSnackbar,
    });
  };

  const handleResetData = () => {
    setDialogConfig({
      title: 'Reset All Data',
      message:
        'This action will permanently clear all your data including EMI calculations, profile information, and local storage. This cannot be undone. Continue?',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setDialogOpen(false);
        try {
          dispatch(resetEmiState());
          await storage.removeItem('persist:app_v1');
          localStorage.clear();
          enqueueSnackbar('All data cleared successfully', {
            variant: 'success',
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          console.error('Error resetting data:', error);
          enqueueSnackbar(
            error?.message || 'Unable to reset data. Please try again.',
            {
              variant: 'error',
            },
          );
        }
      },
      isDestructive: true,
    });
    setDialogOpen(true);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
    setAnchorEl(null);
    setProfileAnchorEl(null);
  };

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
        borderRadius: 0,
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
                borderRadius: '4px',
                bgcolor: 'background.paper',
                color: 'primary.main',
              }}
            >
              <img
                src={`${process.env.PUBLIC_URL}/android-chrome-192x192.png`}
                alt="Logo"
                width="28"
                height="28"
                style={{ borderRadius: '4px' }}
              />
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
          <IconButton
            onClick={(e) => setProfileAnchorEl(e.currentTarget)}
            color="inherit"
            sx={{ borderRadius: theme.shape.borderRadius }}
          >
            <ProfileIcon />
          </IconButton>
        </Stack>

        {/* 🟢 CALCULATORS MENU */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          disableScrollLock
          PaperProps={{ sx: { minWidth: 260, overflow: 'hidden' } }}
          transformOrigin={{ horizontal: 'center', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        >
          {CALCULATORS.map((calc) => (
            <MenuItem
              key={calc.path}
              onClick={() => handleNavigation(calc.path)}
              selected={location.pathname.startsWith(calc.path)}
            >
              <ListItemIcon>
                <calc.icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={calc.label} />
            </MenuItem>
          ))}
        </Menu>

        {/* 🟢 PROFILE MENU */}
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={() => setProfileAnchorEl(null)}
          disableScrollLock
          PaperProps={{ sx: { minWidth: 260, overflow: 'hidden' } }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
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
              <img
                src={`${process.env.PUBLIC_URL}/android-chrome-192x192.png`}
                alt="Logo"
                width="20"
                height="20"
                style={{ borderRadius: '4px' }}
              />
            </ListItemIcon>{' '}
            Wealth Dashboard
          </MenuItem>
          {showCloudActions && (
            <>
              <Divider sx={{ my: 1 }} />
              <MenuItem
                onClick={() => {
                  handleSaveToFirestore();
                  setProfileAnchorEl(null);
                }}
                disabled={cloudBusy}
              >
                <ListItemIcon>
                  <CloudUploadIcon fontSize="small" />
                </ListItemIcon>{' '}
                Save to Cloud
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleLoadFromFirestore();
                  setProfileAnchorEl(null);
                }}
                disabled={cloudBusy}
              >
                <ListItemIcon>
                  <CloudDownloadIcon fontSize="small" />
                </ListItemIcon>{' '}
                Load from Cloud
              </MenuItem>
            </>
          )}
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
        </Menu>

        {/* 🟢 EXPORT MENU */}
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={() => setExportAnchorEl(null)}
          disableScrollLock
          PaperProps={{ sx: { minWidth: 200, overflow: 'hidden' } }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => handleExport('pdf')}>
            <ListItemIcon>
              <ExportIcon fontSize="small" />
            </ListItemIcon>{' '}
            Download PDF
          </MenuItem>
          <MenuItem onClick={() => handleExport('excel')}>
            <ListItemIcon>
              <ExportIcon fontSize="small" />
            </ListItemIcon>{' '}
            Download Excel
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* DRAWER CODE REMAINS UNCHANGED */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: theme.spacing(35) } }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Toolbar>
              <Typography variant="h6" sx={{ fontWeight: 'black' }}>
                SmartFund Manager
              </Typography>
            </Toolbar>
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
                      <calc.icon />
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
            <Divider sx={{ my: theme.spacing(1) }} />
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
          </List>
        </Box>
      </Drawer>

      {/* CONFIRMATION DIALOG */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            fontSize: '1.25rem',
            color: dialogConfig.isDestructive ? 'error.main' : 'primary.main',
            borderBottom: `2px solid ${dialogConfig.isDestructive ? theme.palette.error.light : theme.palette.primary.light}`,
          }}
        >
          {dialogConfig.title}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <DialogContentText sx={{ color: 'text.primary', fontSize: '1rem' }}>
            {dialogConfig.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            {dialogConfig.cancelText}
          </Button>
          <Button
            onClick={dialogConfig.onConfirm}
            variant="contained"
            sx={{
              bgcolor: dialogConfig.isDestructive ? 'error.main' : 'primary.main',
              '&:hover': {
                bgcolor: dialogConfig.isDestructive
                  ? 'error.dark'
                  : 'primary.dark',
              },
            }}
          >
            {dialogConfig.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Header;