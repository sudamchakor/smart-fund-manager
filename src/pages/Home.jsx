import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Grid,
  Typography,
  Box,
  Container,
  Stack,
  useTheme,
  alpha,
  keyframes,
  ButtonBase, // Added for Ripple Effect
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Calculate as CalculateIcon,
  AccountCircle as AccountCircleIcon,
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const OnboardingModal = lazy(
  () => import('../features/profile/tabs/OnboardingModal'),
);

const moduleBootUp = keyframes`
  0% { opacity: 0; transform: translateY(20px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const systemModules = [
  {
    title: 'User Profile',
    description:
      'Manage your demographics, operational liabilities, and capital goals.',
    icon: <AccountCircleIcon sx={{ fontSize: 32 }} />,
    path: '/profile',
    colorToken: 'secondary',
  },
  {
    title: 'EMI Calculator',
    description:
      'Calculate monthly amortization schedules and prepayment impacts.',
    icon: <CalculateIcon sx={{ fontSize: 32 }} />,
    path: '/calculator',
    colorToken: 'primary',
  },
  {
    title: 'Credit Card EMI',
    description: 'Simulate the exact cost of converting unsecured debt to EMI.',
    icon: <CreditCardIcon sx={{ fontSize: 32 }} />,
    path: '/credit-card-emi',
    colorToken: 'success',
  },
  {
    title: 'Investment Strategy',
    description:
      'Project long-term wealth accumulation and safe withdrawal rates.',
    icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
    path: '/investment/sip',
    colorToken: 'info',
  },
  {
    title: 'Personal Loan',
    description:
      'Configure unsecured debt parameters to calculate monthly liabilities.',
    icon: <AccountBalanceIcon sx={{ fontSize: 32 }} />,
    path: '/personal-loan',
    colorToken: 'warning',
  },
  {
    title: 'Tax Optimization',
    description: 'Compute income tax liabilities across legislative regimes.',
    icon: <ReceiptIcon sx={{ fontSize: 32 }} />,
    path: '/tax-calculator',
    colorToken: 'error',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    if (!hasOnboarded) setShowOnboarding(true);
  }, []);

  const handleCloseOnboarding = () => {
    localStorage.setItem('hasOnboarded', 'true');
    setShowOnboarding(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 }, mb: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Box
          sx={{
            display: 'inline-flex',
            p: 1.5,
            mb: 3,
            borderRadius: `${theme.shape.borderRadius}px`,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
          }}
        >
          <DashboardIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5 }}>
          SmartFund{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            Manager
          </Box>
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}
        >
          Your centralized financial command center for precision planning and
          capital growth.
        </Typography>
      </Box>

      {/* Grid Modules */}
      <Grid container spacing={3}>
        {systemModules.map((module, index) => {
          const colorToken = module.colorToken;

          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ButtonBase
                onClick={() => navigate(module.path)}
                focusRipple // Enables the Material Ripple on Click
                sx={{
                  display: 'block', // ButtonBase is inline-flex by default
                  textAlign: 'left',
                  width: '100%',
                  height: '100%',
                  borderRadius: `${theme.shape.borderRadius}px`,
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.1),
                  position: 'relative',
                  overflow: 'hidden', // Crucial for keeping the ripple inside the card
                  backdropFilter: 'blur(10px)',

                  // Animation & Transition Engine
                  animation: `${moduleBootUp} ${theme.transitions.duration.standard * 1.5}ms ${theme.transitions.easing.easeInOut} both`,
                  animationDelay: `${index * 60}ms`,
                  transition: theme.transitions.create(['all'], {
                    duration: theme.transitions.duration.standard,
                    easing: theme.transitions.easing.easeInOut,
                  }),

                  '&:hover': {
                    bgcolor: theme.palette.background.paper,
                    borderColor: alpha(theme.palette[colorToken].main, 0.4),
                    transform: 'translateY(-8px)', // More pronounced hover
                    boxShadow: `0 15px 45px ${alpha(theme.palette[colorToken].main, 0.18)}`,
                    '& .arrow-icon': {
                      transform: 'translateX(6px)',
                      opacity: 1,
                    },
                    '& .icon-well': {
                      bgcolor: alpha(theme.palette[colorToken].main, 0.18),
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              >
                {/* Content inner padding */}
                <Box sx={{ p: { xs: 3, md: 4 } }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      bgcolor: alpha(theme.palette[colorToken].main, 0.4),
                    }}
                  />

                  <Box
                    className="icon-well"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60,
                      height: 60,
                      borderRadius: `${theme.shape.borderRadius}px`,
                      bgcolor: alpha(theme.palette[colorToken].main, 0.08),
                      color: `${colorToken}.main`,
                      mb: 4,
                      transition: theme.transitions.create(['all']),
                    }}
                  >
                    {module.icon}
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: alpha(theme.palette.text.secondary, 0.5),
                        letterSpacing: 1,
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      System Module
                    </Typography>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1.5 }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, color: 'text.primary' }}
                      >
                        {module.title}
                      </Typography>
                      <ChevronRightIcon
                        className="arrow-icon"
                        sx={{
                          fontSize: 22,
                          color: `${colorToken}.main`,
                          opacity: 0,
                          transition: theme.transitions.create(['all']),
                        }}
                      />
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: 'text.secondary',
                        lineHeight: 1.6,
                      }}
                    >
                      {module.description}
                    </Typography>
                  </Box>
                </Box>
              </ButtonBase>
            </Grid>
          );
        })}
      </Grid>

      {showOnboarding && (
        <Suspense fallback={null}>
          <OnboardingModal
            open={showOnboarding}
            onClose={handleCloseOnboarding}
          />
        </Suspense>
      )}
    </Container>
  );
}
