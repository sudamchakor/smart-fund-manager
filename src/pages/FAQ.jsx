import React, { useState } from 'react';
import {
  Typography,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Box,
  useTheme,
  alpha,
  Chip,
  Paper,
  Grid,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpIcon,
  Functions as MathIcon,
  Security as SecurityIcon,
  AccountBalanceWallet as WalletIcon,
  LightbulbOutlined as IdeaIcon,
  ReceiptLong as TaxIcon,
  Storage as StorageIcon,
  TrendingUp as GrowthIcon,
} from '@mui/icons-material';

const faqData = [
  {
    category: 'Privacy & Data Architecture',
    items: [
      {
        q: 'How is my data stored if there is no backend server?',
        a: "We utilize 'Local-First' architecture. Your profile, income details, and calculations are stored in your browser's LocalStorage. This data is siloed to your device and is never transmitted to our or any third-party servers.",
      },
      {
        q: 'Will I lose my profile data if I close the tab?',
        a: "No. LocalStorage persists across sessions. However, if you manually 'Clear Browser Cache' or use an Incognito window, the data will be wiped. We recommend using the 'Export' feature periodically to keep a backup file.",
      },
    ],
  },
  {
    category: 'The Profile & Tax Engine',
    items: [
      {
        q: 'How do Recurring vs. Ad-hoc expenses affect my plan?',
        a: "Precision requires distinguishing between predictable and volatile cash flow:\n• Recurring: Fixed monthly costs (Rent, EMI, Utilities).\n• Ad-hoc: Occasional costs (Annual Insurance, Vacations, Emergencies).\n\nBy categorizing these, the system calculates your 'True Monthly Surplus,' preventing you from over-leveraging based on a month where expenses were unusually low.",
      },
      {
        q: "How does the 'Tax Optimizer' work?",
        a: "When you set your Tax Slab in your profile, the engine automatically calculates the 'Tax-Shield' on your loans. It isolates the interest component (which is often deductible) to show you your 'Effective Interest Rate'—the actual cost of the loan after tax savings.",
        example:
          'With a 9% Home Loan in a 30% Tax Bracket, your effective rate is actually 6.3%.',
      },
    ],
  },
  {
    category: 'Loan & Debt Strategies',
    items: [
      {
        q: "What is the 'Reducing Balance' method?",
        a: "Unlike 'Flat Rate' loans where you pay interest on the full principal for the whole term, our engine uses the Reducing Balance method. Interest is calculated monthly on the remaining principal, meaning every prepayment you make immediately lowers your future interest cost.",
        formula: 'E = P \\cdot r \\cdot \\frac{(1 + r)^n}{(1 + r)^n - 1}',
      },
      {
        q: 'How much can I actually save with prepayments?',
        a: "Even small prepayments have a massive compounding effect on debt reduction. The '1/12 Rule' (paying one extra EMI per year) is the most popular strategy.",
        example:
          'On a $500k loan at 7% for 20 years, paying one extra EMI annually saves ~$58,000 in interest and cuts the tenure by 31 months.',
      },
    ],
  },
  {
    category: 'Wealth & Retirement Projections',
    items: [
      {
        q: "Why is 'Inflation Adjustment' necessary?",
        a: "At 6% inflation, $100 today will only buy $31 worth of goods in 20 years. Our engines allow you to toggle 'Inflation Adjusted' views so you can see the 'Real Purchasing Power' of your future corpus, rather than just a nominal high number.",
      },
      {
        q: "What is the 'Step-Up' SIP strategy?",
        a: 'A Step-Up SIP increases your investment annually by a fixed percentage (e.g., 10%) to match your salary increments. This typically results in a 40-60% larger corpus than a flat SIP over long periods.',
        formula: 'FV = P \\cdot \\frac{(1+r)^n - (1+g)^n}{r-g}',
      },
    ],
  },
];

const FAQ = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      {/* Hero Section */}
      <Stack
        spacing={2}
        sx={{ mb: 8, textAlign: 'center', alignItems: 'center' }}
      >
        <Chip
          label="Support Center"
          color="primary"
          variant="outlined"
          sx={{
            fontWeight: 700,
            borderRadius: 1,
            textTransform: 'uppercase',
            px: 1,
          }}
        />
        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1.5 }}>
          Knowledge Base
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', maxWidth: 600 }}
        >
          Master the math behind your wealth. Explore our precision engines, tax
          logic, and privacy-first architecture.
        </Typography>
      </Stack>

      {/* FAQ Sections */}
      <Stack spacing={5}>
        {faqData.map((section, sectionIndex) => (
          <Box key={sectionIndex}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: 2,
                mb: 2.5,
                pl: 1,
              }}
            >
              {section.category}
            </Typography>

            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
              }}
            >
              {section.items.map((item, itemIndex) => {
                const panelId = `panel-${sectionIndex}-${itemIndex}`;
                const isExpanded = expanded === panelId;

                return (
                  <Accordion
                    key={itemIndex}
                    expanded={isExpanded}
                    onChange={handleChange(panelId)}
                    disableGutters
                    elevation={0}
                    sx={{
                      '&:not(:last-child)': {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      },
                      '&:before': { display: 'none' },
                      transition: '0.2s',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.01),
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon
                          sx={{
                            color: isExpanded ? 'primary.main' : 'inherit',
                          }}
                        />
                      }
                      sx={{ px: 3, py: 1.5 }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: isExpanded ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {item.q}
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 3, pb: 4, pt: 0 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.8,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {item.a}
                      </Typography>

                      {/* Mathematical Logic Block */}
                      {item.formula && (
                        <Box
                          sx={{
                            mt: 3,
                            p: 3,
                            borderRadius: 3,
                            bgcolor: '#0B0E14',
                            color: '#fff',
                            border: '1px solid #1A1F26',
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mb: 2 }}
                          >
                            <MathIcon
                              sx={{ fontSize: 18, color: 'primary.light' }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 900,
                                color: 'primary.light',
                                letterSpacing: 1.5,
                              }}
                            >
                              PRECISION FORMULA
                            </Typography>
                          </Stack>
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'Monospace',
                              textAlign: 'center',
                              overflowX: 'auto',
                              py: 1,
                            }}
                          >
                            $ {item.formula} $
                          </Typography>
                        </Box>
                      )}

                      {/* Example Block */}
                      {item.example && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 2.5,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.success.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mb: 1 }}
                          >
                            <IdeaIcon
                              sx={{ fontSize: 18, color: 'success.main' }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 800,
                                color: 'success.main',
                                textTransform: 'uppercase',
                              }}
                            >
                              Strategy Insight
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'success.dark',
                              fontWeight: 600,
                              lineHeight: 1.6,
                            }}
                          >
                            {item.example}
                          </Typography>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Paper>
          </Box>
        ))}
      </Stack>

      {/* Value-Add Trust Pillars */}
      <Grid container spacing={3} sx={{ mt: 10 }}>
        {[
          {
            icon: <SecurityIcon />,
            title: 'Local Encryption',
            desc: "Your data stays in your browser's LocalStorage. No cloud, no tracking.",
          },
          {
            icon: <GrowthIcon />,
            title: 'Inflation-Aware',
            desc: 'All long-term projections factor in the eroding power of inflation.',
          },
          {
            icon: <TaxIcon />,
            title: 'Tax-Shield Logic',
            desc: 'Calculates net effective costs after government interest deductions.',
          },
        ].map((pillar, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Stack
              spacing={1.5}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              }}
            >
              <Box sx={{ color: 'primary.main' }}>{pillar.icon}</Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {pillar.title}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.5 }}
              >
                {pillar.desc}
              </Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FAQ;
