import React from 'react';
import { Box, Card, CardContent, Typography, Grid, alpha } from '@mui/material';
import {
  AccountBalanceWallet,
  MapsHomeWork,
  CreditCard,
  AutoGraph,
  Payments,
  Description
} from '@mui/icons-material';

const features = [
  {
    title: 'Wealth Dashboard',
    description: 'Track and manage your entire portfolio in one unified dashboard.',
    icon: AccountBalanceWallet,
    color: '#3f51b5', // Indigo
  },
  {
    title: 'Home Loan EMI',
    description: 'Calculate your home loan EMIs and plan your prepayments.',
    icon: MapsHomeWork,
    color: '#00796B', // Teal
  },
  {
    title: 'Credit Card EMI',
    description: 'Manage your credit card debt and optimize your repayments.',
    icon: CreditCard,
    color: '#7B1FA2', // Purple
  },
  {
    title: 'SIP & Investment',
    description: 'Project your mutual fund returns and plan for the long term.',
    icon: AutoGraph,
    color: '#2E7D32', // Green
  },
  {
    title: 'Personal Loan',
    description: 'Evaluate personal loan offers and compare interest rates.',
    icon: Payments,
    color: '#F57C00', // Amber
  },
  {
    title: 'Income Tax Planner',
    description: 'Estimate your tax liability and discover tax-saving strategies.',
    icon: Description,
    color: '#455A64', // Slate
  },
];

const LandingPageCards = () => {
  return (
    <Box sx={{ flexGrow: 1, py: 6, px: { xs: 2, md: 4 } }}>
      <Grid container spacing={4} justifyContent="center">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  border: 'none',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      backgroundColor: alpha(feature.color, 0.1),
                      mb: 3,
                    }}
                  >
                    <IconComponent sx={{ color: feature.color, fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1.5 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default LandingPageCards;