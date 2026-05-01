import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  Button,
  Divider,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  LinearProgress,
  Paper,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Ensure these paths match your actual project structure
import {
  selectTaxRegime,
  selectEmergencyFundTarget,
  selectRiskProfile,
  updateFinancialSettings,
} from "../../../store/profileSlice";

// --- Questionnaire Data ---
const questions = [
  {
    id: "q1",
    text: "In general, how would your best friend describe you as a risk taker?",
    options: [
      { value: 1, label: "A real gambler" },
      { value: 2, label: "Willing to take risks after research" },
      { value: 3, label: "Cautious" },
      { value: 4, label: "A real risk avoider" },
    ],
  },
  {
    id: "q2",
    text: "You are on a TV game show and can choose one of the following. Which would you take?",
    options: [
      { value: 1, label: "$1,000 in cash" },
      { value: 2, label: "50% chance at $5,000" },
      { value: 3, label: "25% chance at $10,000" },
      { value: 4, label: "5% chance at $100,000" },
    ],
  },
  {
    id: "q3",
    text: 'Three weeks before a "once-in-a-lifetime" vacation, you lose your job. You would:',
    options: [
      { value: 1, label: "Cancel the vacation" },
      { value: 2, label: "Take a modest vacation" },
      { value: 3, label: "Go as scheduled to prepare" },
      { value: 4, label: "Extend it (first-class)" },
    ],
  },
  {
    id: "q4",
    text: "If you unexpectedly received $20,000 to invest, what would you do?",
    options: [
      { value: 1, label: "Bank account / CD" },
      { value: 2, label: "Safe bonds / Mutual funds" },
      { value: 3, label: "Stocks / Stock mutual funds" },
    ],
  },
  {
    id: "q5",
    text: "How comfortable are you investing in stocks or stock mutual funds?",
    options: [
      { value: 1, label: "Not at all" },
      { value: 2, label: "Somewhat comfortable" },
      { value: 3, label: "Very comfortable" },
    ],
  },
];

const FinancialSettings = () => {
  const dispatch = useDispatch();

  // Selectors
  const currentTaxRegime = useSelector(selectTaxRegime);
  const currentEmergencyTarget = useSelector(selectEmergencyFundTarget);
  const currentRiskProfile = useSelector(selectRiskProfile);

  // Local State
  const [taxRegime, setTaxRegime] = useState(currentTaxRegime || "new");
  const [emergencyTarget, setEmergencyTarget] = useState(
    currentEmergencyTarget || 6,
  );
  const [riskAnswers, setRiskAnswers] = useState(
    currentRiskProfile || { q1: 3, q2: 3, q3: 3, q4: 2, q5: 2 },
  );

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(riskAnswers).length;
  const completionPercentage = (answeredCount / totalQuestions) * 100;

  useEffect(() => {
    setTaxRegime(currentTaxRegime || "new");
    setEmergencyTarget(currentEmergencyTarget || 6);
    if (currentRiskProfile) setRiskAnswers(currentRiskProfile);
  }, [currentTaxRegime, currentEmergencyTarget, currentRiskProfile]);

  const handleRiskChange = (questionId, value) => {
    if (value !== null) {
      setRiskAnswers((prev) => ({ ...prev, [questionId]: Number(value) }));
    }
  };

  const handleSave = () => {
    dispatch(
      updateFinancialSettings({
        taxRegime,
        emergencyFundTarget: emergencyTarget,
        riskProfile: riskAnswers,
      }),
    );
  };

  return (
    <Card
      sx={{
        height: "520px",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <CardHeader
        sx={{ py: 1.5, px: 2 }}
        title={
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1rem" }}>
            Financial Settings
          </Typography>
        }
      />
      <Divider />

      <CardContent sx={{ flexGrow: 1, overflowY: "auto", p: 0 }}>
        {/* Core Controls */}
        <Box sx={{ p: 3, bgcolor: "#f8faff" }}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <AccountBalanceIcon fontSize="inherit" /> TAX REGIME
              </Typography>
              <RadioGroup
                row
                value={taxRegime}
                onChange={(e) => setTaxRegime(e.target.value)}
              >
                <FormControlLabel
                  value="old"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Old
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="new"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      New
                    </Typography>
                  }
                />
              </RadioGroup>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <HealthAndSafetyIcon fontSize="inherit" /> EMERGENCY FUND
              </Typography>
              <Select
                fullWidth
                size="small"
                value={emergencyTarget}
                onChange={(e) => setEmergencyTarget(e.target.value)}
                sx={{ bgcolor: "white", borderRadius: 2 }}
              >
                <MenuItem value={3}>3 Months</MenuItem>
                <MenuItem value={6}>6 Months (Rec.)</MenuItem>
                <MenuItem value={12}>12 Months</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Progress Tracker */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AssignmentIcon fontSize="small" color="primary" /> Risk Profile
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "text.secondary" }}
            >
              {answeredCount}/{totalQuestions} Complete
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{ height: 6, borderRadius: 3, bgcolor: "#eee" }}
          />
        </Box>

        {/* Questionnaire */}
        <Box sx={{ p: 2 }}>
          {questions.map((q, idx) => (
            <Paper
              key={q.id}
              elevation={0}
              sx={{ p: 2, mb: 2, border: "1px solid #edf2f7", borderRadius: 2 }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  lineHeight: 1.4,
                  display: "flex",
                  gap: 1,
                }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: "primary.main", fontWeight: 900 }}
                >
                  {idx + 1}.
                </Typography>
                {q.text}
              </Typography>

              <ToggleButtonGroup
                value={riskAnswers[q.id]}
                exclusive
                onChange={(e, val) => handleRiskChange(q.id, val)}
                fullWidth
                size="small"
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1,
                  "& .MuiToggleButton-root": {
                    border: "1px solid #e2e8f0 !important",
                    borderRadius: "8px !important",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "white",
                      borderColor: "primary.main",
                      "&:hover": { bgcolor: "primary.dark" },
                    },
                  },
                }}
              >
                {q.options.map((opt) => (
                  <ToggleButton key={opt.value} value={opt.value}>
                    {opt.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Paper>
          ))}
        </Box>
      </CardContent>

      <Divider />
      <Box
        sx={{
          p: 2,
          bgcolor: "#fcfcfc",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          startIcon={<CheckCircleIcon />}
          onClick={handleSave}
          sx={{ borderRadius: 2, px: 4 }}
        >
          Apply Changes
        </Button>
      </Box>
    </Card>
  );
};

export default FinancialSettings;
