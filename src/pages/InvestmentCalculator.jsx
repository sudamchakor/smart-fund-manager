import React, { useState, useEffect } from "react";
import { Grid, Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import SavingsIcon from "@mui/icons-material/Savings";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"; // Import for FD icon
import { useLocation, useNavigate } from "react-router-dom";

// Import the individual components
import SipCalculatorForm from "../components/calculators/investment/SipCalculatorForm";
import LumpsumCalculatorForm from "../components/calculators/investment/LumpsumCalculatorForm";
import StepUpSipCalculatorForm from "../components/calculators/investment/StepUpSipCalculatorForm";
import SwpCalculatorForm from "../components/calculators/investment/SwpCalculatorForm";
import FdCalculatorForm from "../components/calculators/investment/FdCalculatorForm"; // Import for FD Calculator
import InvestmentChart from "../components/calculators/investment/InvestmentChart";

const TAB_ROUTES = [
  "/investment",
  "/investment/lumpsum",
  "/investment/step-up-sip",
  "/investment/swp",
  "/investment/fd",
];

const InvestmentCalculator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on current URL
  const currentTabIndex = TAB_ROUTES.indexOf(location.pathname);
  const [tabIndex, setTabIndex] = useState(
    currentTabIndex !== -1 ? currentTabIndex : 0,
  );

  // Sync tab with URL
  useEffect(() => {
    const idx = TAB_ROUTES.indexOf(location.pathname);
    if (idx !== -1 && idx !== tabIndex) {
      setTabIndex(idx);
    }
  }, [location.pathname, tabIndex]);

  // Shared Form State across tabs
  const [sharedState, setSharedState] = useState({
    monthlyInvestment: 5000,
    totalInvestment: 100000,
    expectedReturnRate: 12,
    timePeriod: 10,
    stepUpPercentage: 10,
    withdrawalPerMonth: 10000,
    principalAmount: 100000, // New state for FD principal
    interestRate: 7, // New state for FD interest rate
    compoundingFrequency: "annually", // New state for FD compounding frequency
  });

  const handleSharedStateChange = (field, value) => {
    setSharedState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // State to hold calculated values to pass to the chart
  const [investmentData, setInvestmentData] = useState({
    investedAmount: 0,
    estimatedReturns: 0,
    totalValue: 0,
    totalWithdrawn: 0, // specific to SWP
    chartData: [],
  });

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    navigate(TAB_ROUTES[newValue]);
    console.log("sudam", newValue, TAB_ROUTES);
    // We intentionally DO NOT reset the data or shared state here
    // so that the other forms can use the derived amounts.
  };

  return (
    <Box className="calculator-container" sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Investment Calculators
      </Typography>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="investment calculators tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
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
          <Tab icon={<AccountBalanceIcon />} label="FD" iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  pr: { md: 2 },
                  borderRight: { md: "1px solid #eee" },
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
                {tabIndex === 4 && ( // New condition for FD Calculator
                  <FdCalculatorForm
                    onCalculate={setInvestmentData}
                    sharedState={sharedState}
                    onSharedStateChange={handleSharedStateChange}
                  />
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  pl: { md: 2 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Investment Summary
                </Typography>

                {investmentData.totalValue > 0 ||
                tabIndex === 3 ||
                tabIndex === 4 ? ( // Added tabIndex 4 for FD
                  <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                      <Grid item xs={12} sm={4}>
                        <Box textAlign="center">
                          <Typography variant="body2" color="textSecondary">
                            {tabIndex === 3
                              ? "Total Investment"
                              : "Total Investment"}
                          </Typography>
                          <Typography variant="h6">
                            ₹
                            {investmentData.investedAmount.toLocaleString(
                              "en-IN",
                            )}
                          </Typography>
                        </Box>
                      </Grid>

                      {tabIndex === 3 ? (
                        <Grid item xs={12} sm={4}>
                          <Box textAlign="center">
                            <Typography variant="body2" color="textSecondary">
                              Total Withdrawn
                            </Typography>
                            <Typography variant="h6" color="warning.main">
                              ₹
                              {investmentData.totalWithdrawn
                                ? investmentData.totalWithdrawn.toLocaleString(
                                    "en-IN",
                                  )
                                : 0}
                            </Typography>
                          </Box>
                        </Grid>
                      ) : (
                        <Grid item xs={12} sm={4}>
                          <Box textAlign="center">
                            <Typography variant="body2" color="textSecondary">
                              Est. Returns
                            </Typography>
                            <Typography variant="h6" color="success.main">
                              ₹
                              {investmentData.estimatedReturns.toLocaleString(
                                "en-IN",
                              )}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      <Grid item xs={12} sm={4}>
                        <Box textAlign="center">
                          <Typography variant="body2" color="textSecondary">
                            {tabIndex === 3 ? "Final Balance" : "Total Value"}
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            ₹{investmentData.totalValue.toLocaleString("en-IN")}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ height: 350 }}>
                      <InvestmentChart data={investmentData.chartData} />
                    </Box>
                  </Box>
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    minHeight="300px"
                  >
                    <Typography variant="body1" color="textSecondary">
                      Enter values to see the investment projection
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default InvestmentCalculator;
