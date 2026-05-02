import React from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  Container,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Payments as PaymentsIcon,
  PieChart as PieChartIcon,
  TableChart as TableIcon,
  BarChart as BarIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectCalculatedValues } from "../features/emiCalculator/utils/emiCalculator";

import HomeLoanForm from "../features/emiCalculator/components/HomeLoanForm";
import PrepaymentsForm from "../features/emiCalculator/components/PrepaymentsForm";
import PaymentScheduleTable from "../features/emiCalculator/components/PaymentScheduleTable";
import TotalMonthlyPayment from "../features/emiCalculator/components/TotalMonthlyPayment";
import PieChartComponent from "../components/charts/PieChartComponent";
import BarChartComponent from "../components/charts/BarChartComponent";

const SectionHeader = ({ icon, title, color }) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
    <Box
      sx={{
        display: "flex",
        p: 0.8,
        borderRadius: 1.5,
        bgcolor: alpha(color, 0.1),
        color: color,
      }}
    >
      {React.cloneElement(icon, { fontSize: "small" })}
    </Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
      {title}
    </Typography>
  </Stack>
);

const StyledPaper = ({ children, sx = {} }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.1),
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.02)}`,
        bgcolor: theme.palette.background.paper,
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
};

const Calculator = () => {
  const theme = useTheme();
  const calculatedValues = useSelector(selectCalculatedValues);
  const schedule = calculatedValues.schedule || [];
  const startMonthYear = schedule.length > 0 ? schedule[0].date : "";
  const endMonthYear =
    schedule.length > 0 ? schedule[schedule.length - 1].date : "";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${theme.palette.background.default} 100%)`,
        pt: 3,
        pb: 10,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
            Home Loan{" "}
            <Box component="span" sx={{ color: theme.palette.primary.main }}>
              EMI Calculator
            </Box>
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <StyledPaper>
              <HomeLoanForm />
            </StyledPaper>
          </Grid>

          <Grid item xs={12}>
            <StyledPaper>
              <SectionHeader
                title="Prepayment Plan"
                icon={<PaymentsIcon />}
                color={theme.palette.success.main}
              />
              <PrepaymentsForm />
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={7} lg={8}>
            <StyledPaper sx={{ height: "100%" }}>
              <SectionHeader
                title="Payment Breakdown"
                icon={<PieChartIcon />}
                color={theme.palette.info.main}
              />
              <Box sx={{ height: 350 }}>
                <PieChartComponent />
              </Box>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={5} lg={4}>
            <StyledPaper sx={{ padding: 0, height: "100%" }}>
              <SectionHeader
                title="Monthly Commitment"
                icon={<TableIcon />}
                color={theme.palette.secondary.main}
              />
              <TotalMonthlyPayment />
            </StyledPaper>
          </Grid>

          <Grid item xs={12}>
            <StyledPaper>
              <SectionHeader
                title="Loan Progression"
                icon={<BarIcon />}
                color={theme.palette.warning.main}
              />
              <Box sx={{ height: 400 }}>
                <BarChartComponent />
              </Box>
            </StyledPaper>
          </Grid>

          <Grid item xs={12}>
            <StyledPaper sx={{ p: 0, overflow: "hidden" }}>
              <Box sx={{ p: 2.5, pb: 0 }}>
                <SectionHeader
                  title={`Amortization Schedule (${startMonthYear} - ${endMonthYear})`}
                  icon={<TableIcon />}
                  color={theme.palette.grey[700]}
                />
              </Box>
              <PaymentScheduleTable />
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Calculator;
