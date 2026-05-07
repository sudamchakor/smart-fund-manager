import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
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
} from '@mui/material'; // Added for Ripple Effect
import { Link } from 'react-router-dom';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  MapsHomeWork as MapsHomeWorkIcon,
  CreditCard as CreditCardIcon,
  AutoGraph as AutoGraphIcon,
  Payments as PaymentsIcon,
  Description as DescriptionIcon,
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
    title: 'Wealth Dashboard',
    description: 'Track financial health, monitor net worth, and set clear goals for a secure future.',
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#3f51b5' }} />,
    path: '/profile',
    colorHex: '#3f51b5', // Indigo
  },
  {
    title: 'Home Loan EMI',
    description: 'View amortization schedule, home loan interest, and plan prepayment savings easily.',
    icon: <MapsHomeWorkIcon sx={{ fontSize: 32, color: '#00796B' }} />,
    path: '/calculator',
    colorHex: '#00796B', // Teal
  },
  {
    title: 'Credit Card EMI',
    description: 'Compare interest rates, avoid hidden costs, and accelerate your debt reduction.',
    icon: <CreditCardIcon sx={{ fontSize: 32, color: '#7B1FA2' }} />,
    path: '/credit-card-emi',
    colorHex: '#7B1FA2', // Purple
  },
  {
    title: 'SIP & Investment',
    description: 'Project mutual fund returns, harness compound interest, and drive wealth growth.',
    icon: <AutoGraphIcon sx={{ fontSize: 32, color: '#2E7D32' }} />,
    path: '/investment/sip',
    colorHex: '#2E7D32', // Green
  },
  {
    title: 'Personal Loan',
    description: 'Check instant loan EMI options and generate a detailed repayment schedule instantly.',
    icon: <PaymentsIcon sx={{ fontSize: 32, color: '#F57C00' }} />,
    path: '/personal-loan',
    colorHex: '#F57C00', // Amber
  },
  {
    title: 'Income Tax Planner',
    description: 'Compare Old vs New tax regime, explore Section 80C, and get tax saving tips for 2026.',
    icon: <DescriptionIcon sx={{ fontSize: 32, color: '#455A64' }} />,
    path: '/tax-calculator',
    colorHex: '#455A64', // Slate
  },
];

export default function Home() {
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
      <Helmet>
        <title>SmartFund Manager - Free EMI Calculator, Tax Planner & SIP Projector</title>
        <meta
          name="description"
          content="Free financial tools to easily calculate Home Loan EMIs, compare New vs Old income tax regimes, and project your SIP investment growth."
        />
      </Helmet>
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
        <Typography variant="h3" component="h1" sx={{ fontWeight: 900, mb: 1.5 }}>
          SmartFund{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            Manager
          </Box>
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}
        >
          Free financial tools in India to calculate EMIs, plan SIPs, and optimize taxes.
        </Typography>
      </Box>

      {/* Grid Modules */}
      <Grid container spacing={4}>
        {systemModules.map((module, index) => {
          const colorHex = module.colorHex;

          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ButtonBase
                component={Link}
                to={module.path}
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
                  boxShadow: `0 4px 20px ${alpha(theme.palette.text.primary, 0.05)}`,
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
                    borderColor: alpha(colorHex, 0.4),
                    transform: 'translateY(-8px)', // Hover lift
                    boxShadow: `0 12px 28px ${alpha(colorHex, 0.18)}`, // Slightly more pronounced shadow matching theme glow
                    '& .arrow-icon': {
                      transform: 'translateX(6px)',
                      opacity: 1,
                    },
                    '& .icon-well': {
                      bgcolor: alpha(colorHex, 0.15),
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
                      bgcolor: alpha(colorHex, 0.4),
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
                      borderRadius: `${theme.shape.borderRadius}px`, // Reverted from 50% to theme corner radius
                      bgcolor: alpha(colorHex, 0.08), // Slightly reduced opacity
                      mb: 4,
                      transition: theme.transitions.create(['all']),
                    }}
                  >
                    {module.icon}
                  </Box>

                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1.5 }} // Spacing between title and description
                    >
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{ fontWeight: 800, color: 'text.primary' }}
                      >
                        {module.title}
                      </Typography>
                      <ChevronRightIcon
                        className="arrow-icon"
                        sx={{
                          fontSize: 22,
                          color: colorHex,
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
