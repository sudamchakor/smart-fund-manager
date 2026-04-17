import React, { useState, useEffect } from "react";
import { Grid, Card, CardActionArea, CardContent, Typography, Box, Container, Grow } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CalculateIcon from "@mui/icons-material/Calculate";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptIcon from "@mui/icons-material/Receipt";
import OnboardingModal from "./OnboardingModal";

const features = [
  { title: "User Profile", description: "Manage your incomes, expenses, and financial goals.", icon: <AccountCircleIcon color="secondary" sx={{ fontSize: 56 }} />, path: "/profile" },
  { title: "EMI Calculator", description: "Calculate your monthly EMI and view amortization schedule.", icon: <CalculateIcon color="primary" sx={{ fontSize: 56 }} />, path: "/calculator" },
  { title: "Credit Card EMI", description: "Plan your credit card dues and EMI conversions.", icon: <CreditCardIcon color="success" sx={{ fontSize: 56 }} />, path: "/credit-card-emi" },
  { title: "Investment Calculator", description: "Calculate SIP, Lumpsum returns and wealth accumulation.", icon: <TrendingUpIcon color="info" sx={{ fontSize: 56 }} />, path: "/investment/sip" },
  { title: "Personal Loan", description: "Estimate personal loan EMIs and interest payouts.", icon: <AccountBalanceIcon color="warning" sx={{ fontSize: 56 }} />, path: "/personal-loan" },
  { title: "Tax Calculator", description: "Calculate your income tax under new/old regimes.", icon: <ReceiptIcon color="error" sx={{ fontSize: 56 }} />, path: "/tax-calculator" },
];

export default function Home() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem("hasOnboarded");
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    localStorage.setItem("hasOnboarded", "true");
    setShowOnboarding(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, textAlign: "center", mb: 5 }}>
        Welcome to the Financial Planner
      </Typography>
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Grow in={true} timeout={(index + 1) * 300}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 2, transition: "transform 0.2s ease-in-out", "&:hover": { boxShadow: 6, transform: "translateY(-5px)", "& .MuiSvgIcon-root": { transform: "scale(1.2)" } } }}>
                <CardActionArea onClick={() => navigate(feature.path)} sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2, "& .MuiSvgIcon-root": { transition: "transform 0.3s ease-in-out" } }}>{feature.icon}</Box>
                  <CardContent sx={{ textAlign: "center", p: 0 }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>
      <OnboardingModal open={showOnboarding} onClose={handleCloseOnboarding} />
    </Container>
  );
}