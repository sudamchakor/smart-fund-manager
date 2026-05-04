import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Article as ArticleIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminHeader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate('/admin/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'primary.dark',
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
          {/* HIDE MOBILE HAMBURGER IF NOT LOGGED IN */}
          {isMobile && user && (
            <IconButton onClick={() => setDrawerOpen(true)} color="inherit">
              <MenuIcon />
            </IconButton>
          )}

          <Box
            onClick={() => handleNavigation(user ? '/admin/articles' : '/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              gap: theme.spacing(1),
            }}
          >
            <DashboardIcon sx={{ fontSize: theme.spacing(4) }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}
            >
              Admin Dashboard
            </Typography>
          </Box>

          {/* HIDE DESKTOP NAV LINKS IF NOT LOGGED IN */}
          {!isMobile && user && (
            <>
              <Button
                onClick={() => handleNavigation('/admin/articles')}
                sx={{ color: 'inherit', textTransform: 'none' }}
              >
                Manage Articles
              </Button>
              <Button
                onClick={() => handleNavigation('/admin/articles/new')}
                startIcon={<AddIcon />}
                sx={{ color: 'inherit', textTransform: 'none' }}
              >
                Create Article
              </Button>
              <Button
                onClick={() => handleNavigation('/admin/profile')}
                sx={{ color: 'inherit', textTransform: 'none' }}
              >
                My Author Profile
              </Button>
              <Button
                onClick={() => handleNavigation('/')}
                startIcon={<HomeIcon />}
                sx={{ color: 'inherit', textTransform: 'none' }}
              >
                Go to App
              </Button>
            </>
          )}
        </Stack>

        {/* LOGOUT SECTION */}
        {!isMobile && user && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" color="inherit">
              {user.displayName || user.email}
            </Typography>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Stack>
        )}

        {/* DRAWER (Only logic for when user is logged in) */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: 280 } }}
        >
          <Box sx={{ p: 2, bgcolor: 'primary.dark', color: 'white' }}>
            <Typography variant="h6">Admin Menu</Typography>
          </Box>
          <List>
            <ListItemButton onClick={() => handleNavigation('/admin/articles')}>
              <ListItemIcon>
                <ArticleIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Articles" />
            </ListItemButton>
            <ListItemButton
              onClick={() => handleNavigation('/admin/articles/new')}
            >
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Create Article" />
            </ListItemButton>
            <Divider />
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
