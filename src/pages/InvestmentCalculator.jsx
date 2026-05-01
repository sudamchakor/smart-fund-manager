import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Stack,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  ShowChart as ShowChartIcon,
  Savings as SavingsIcon,
  AccountBalance as AccountBalanceIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

// Import the individual components
import SipCalculatorForm from "../features/investment/tabs/SipCalculatorForm";
import LumpsumCalculatorForm from "../features/investment/tabs/LumpsumCalculatorForm";
import StepUpSipCalculatorForm from "../features/investment/tabs/StepUpSipCalculatorForm";
import SwpCalculatorForm from "../features/investment/tabs/SwpCalculatorForm";
import FdCalculatorForm from "../features/investment/tabs/FdCalculatorForm";
import InvestmentChart from "../features/investment/components/InvestmentChart";

const TAB_ROUTES = [
  "/investment",
  "/investment/lumpsum",
  "/investment/step-up-sip",
  "/investment/swp",
  "/investment/fd",
];

export default function InvestmentCalculator() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const currentTabIndex = TAB_ROUTES.indexOf(location.pathname);
  const [tabIndex, setTabIndex] = useState(
    currentTabIndex !== -1 ? currentTabIndex : 0,
  );

  useEffect(() => {
    const idx = TAB_ROUTES.indexOf(location.pathname);
    if (idx !== -1 && idx !== tabIndex) {
      setTabIndex(idx);
    }
  }, [location.pathname, tabIndex]);

  const [sharedState, setSharedState] = useState({
    monthlyInvestment: 5000,
    totalInvestment: 100000,
    expectedReturnRate: 12,
    timePeriod: 10,
    stepUpPercentage: 10,
    withdrawalPerMonth: 10000,
    principalAmount: 100000,
    interestRate: 7,
    compoundingFrequency: "annually",
  });

  const handleSharedStateChange = (field, value) => {
    setSharedState((prev) => ({ ...prev, [field]: value }));
  };

  const [investmentData, setInvestmentData] = useState({
    investedAmount: 0,
    estimatedReturns: 0,
    totalValue: 0,
    totalWithdrawn: 0,
    chartData: [],
  });

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    navigate(TAB_ROUTES[newValue]);
  };

  // Helper for rendering high-density data wells
  const SummaryWell = ({ label, value, colorToken }) => (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(colorToken, 0.05),
        border: `1px solid ${alpha(colorToken, 0.1)}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 800,
          textTransform: "uppercase",
          color: "text.secondary",
          letterSpacing: 0.5,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 900,
          color: colorToken,
          letterSpacing: -0.5,
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        width: "100%",
        p: { xs: 2, md: 4 },
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1200 }}>
        {/* Technical Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
            }}
          >
            <AnalyticsIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: "text.primary",
                letterSpacing: -0.5,
              }}
            >
              Investment Strategy Console
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "text.secondary" }}
            >
              Project long-term wealth accumulation across various asset classes
              and contribution methods.
            </Typography>
          </Box>
        </Stack>

        {/* Main Application Container */}
        <Box
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.1),
            bgcolor: theme.palette.background.paper,
            boxShadow: `0 4px 24px ${alpha(theme.palette.common.black || "#000", 0.02)}`,
            overflow: "hidden", // Keeps the tabs flush with the container corners
          }}
        >
          {/* Navigation Tabs */}
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 56,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "text.secondary",
                  minHeight: 56,
                },
                "& .Mui-selected": {
                  color: "primary.main",
                  fontWeight: 900,
                },
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                },
              }}
            >
              <Tab icon={<TrendingUpIcon />} label="SIP" iconPosition="start" />
              <Tab
                icon={<AccountBalanceWalletIcon />}
                label="Lumpsum"
                iconPosition="start"
              />
              <Tab
                icon={<ShowChartIcon />}
                label="Step-Up SIP"
                iconPosition="start"
              />
              <Tab icon={<SavingsIcon />} label="SWP" iconPosition="start" />
              <Tab
                icon={<AccountBalanceIcon />}
                label="Fixed Deposit"
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={4}>
              {/* Left Column: Input Forms */}
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    pr: { md: 4 },
                    borderRight: {
                      md: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    },
                    height: "100%",
                  }}
                >
                  {tabIndex === 0 && (
                    <SipCalculatorForm
                      onCalculate={setInvestmentData}
                      sharedState={sharedState}
                      onSharedStateChange={handleSharedStateChange}
                    />
                  )}
                  {tabIndex === 1 && (
                    <LumpsumCalculatorForm
                      onCalculate={setInvestmentData}
                      sharedState={sharedState}
                      onSharedStateChange={handleSharedStateChange}
                    />
                  )}
                  {tabIndex === 2 && (
                    <StepUpSipCalculatorForm
                      onCalculate={setInvestmentData}
                      sharedState={sharedState}
                      onSharedStateChange={handleSharedStateChange}
                    />
                  )}
                  {tabIndex === 3 && (
                    <SwpCalculatorForm
                      onCalculate={setInvestmentData}
                      sharedState={sharedState}
                      onSharedStateChange={handleSharedStateChange}
                    />
                  )}
                  {tabIndex === 4 && (
                    <FdCalculatorForm
                      onCalculate={setInvestmentData}
                      sharedState={sharedState}
                      onSharedStateChange={handleSharedStateChange}
                    />
                  )}
                </Box>
              </Grid>

              {/* Right Column: Output Summary & Chart */}
              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      textTransform: "uppercase",
                      color: "text.secondary",
                      letterSpacing: 1,
                      mb: 3,
                    }}
                  >
                    Projection Summary
                  </Typography>

                  {investmentData.totalValue > 0 ||
                  tabIndex === 2 ||
                  tabIndex === 3 ||
                  tabIndex === 4 ? (
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Data Wells */}
                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={4}>
                          <SummaryWell
                            label={
                              tabIndex === 3
                                ? "Invested Amount"
                                : "Total Investment"
                            }
                            value={`₹${investmentData.investedAmount.toLocaleString("en-IN")}`}
                            colorToken={theme.palette.text.primary}
                          />
                        </Grid>

                        {tabIndex === 3 ? (
                          <Grid item xs={12} sm={4}>
                            <SummaryWell
                              label="Total Withdrawn"
                              value={`₹${investmentData.totalWithdrawn ? investmentData.totalWithdrawn.toLocaleString("en-IN") : 0}`}
                              colorToken={theme.palette.warning.main}
                            />
                          </Grid>
                        ) : (
                          <Grid item xs={12} sm={4}>
                            <SummaryWell
                              label="Est. Returns"
                              value={`₹${investmentData.estimatedReturns.toLocaleString("en-IN")}`}
                              colorToken={theme.palette.success.main}
                            />
                          </Grid>
                        )}

                        <Grid item xs={12} sm={4}>
                          <SummaryWell
                            label={
                              tabIndex === 3 ? "Final Balance" : "Total Value"
                            }
                            value={`₹${investmentData.totalValue.toLocaleString("en-IN")}`}
                            colorToken={theme.palette.primary.main}
                          />
                        </Grid>
                      </Grid>

                      {/* Chart Area */}
                      <Box sx={{ flexGrow: 1, minHeight: 350 }}>
                        <InvestmentChart data={investmentData.chartData} />
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      /* Uninitialized Terminal State */
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 300,
                        borderRadius: 3,
                        border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "text.disabled",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Awaiting input parameters to generate projection
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
