import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
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
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings'; // New Icon Import

import {
  selectTaxRegime,
  selectEmergencyFundTarget,
  selectRiskProfile,
  updateFinancialSettings,
} from '../../../store/profileSlice';
import SectionHeader from '../../../components/common/SectionHeader';

// --- Questionnaire Data ---
const questions = [
  {
    id: 'q1',
    text: 'In general, how would your best friend describe you as a risk taker?',
    options: [
      { value: 1, label: 'A real gambler' },
      { value: 2, label: 'Researcher' },
      { value: 3, label: 'Cautious' },
      { value: 4, label: 'Avoider' },
    ],
  },
  {
    id: 'q2',
    text: 'You are on a TV game show. Which would you take?',
    options: [
      { value: 1, label: '$1,000 Cash' },
      { value: 2, label: '50% @ $5k' },
      { value: 3, label: '25% @ $10k' },
      { value: 4, label: '5% @ $100k' },
    ],
  },
  {
    id: 'q3',
    text: 'You lose your job 3 weeks before a vacation. You would:',
    options: [
      { value: 1, label: 'Cancel it' },
      { value: 2, label: 'Modest Trip' },
      { value: 3, label: 'Go as planned' },
      { value: 4, label: 'Extend it' },
    ],
  },
  {
    id: 'q4',
    text: 'You unexpectedly received $20,000 to invest:',
    options: [
      { value: 1, label: 'Bank/CD' },
      { value: 2, label: 'Bonds/MFs' },
      { value: 3, label: 'Stocks/Equity' },
    ],
  },
  {
    id: 'q5',
    text: 'How comfortable are you investing in stocks?',
    options: [
      { value: 1, label: 'Not at all' },
      { value: 2, label: 'Somewhat' },
      { value: 3, label: 'Very' },
    ],
  },
];

const FinancialSettings = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const currentTaxRegime = useSelector(selectTaxRegime);
  const currentEmergencyTarget = useSelector(selectEmergencyFundTarget);
  const currentRiskProfile = useSelector(selectRiskProfile);

  const [taxRegime, setTaxRegime] = useState(currentTaxRegime || 'new');
  const [emergencyTarget, setEmergencyTarget] = useState(
    currentEmergencyTarget || 6,
  );
  const [riskAnswers, setRiskAnswers] = useState(
    currentRiskProfile || { q1: 3, q2: 3, q3: 3, q4: 2, q5: 2 },
  );

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(riskAnswers).length;
  const completionPercentage = (answeredCount / totalQuestions) * 100;

  // Simple Risk Logic for UX feedback
  const calculatedRisk = useMemo(() => {
    const sum = Object.values(riskAnswers).reduce((a, b) => a + b, 0);
    if (sum <= 8) return { label: 'Aggressive', color: 'error' };
    if (sum <= 12) return { label: 'Moderate', color: 'warning' };
    return { label: 'Conservative', color: 'success' };
  }, [riskAnswers]);

  useEffect(() => {
    setTaxRegime(currentTaxRegime || 'new');
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
        height: '520px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <Box
        sx={{
          pt: 2.5,
          px: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          bgcolor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        <SectionHeader title="Financial Settings" icon={<SettingsIcon />} />
        <Button
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ borderRadius: 1.5, textTransform: 'none', px: 2, mt: 0.5 }}
        >
          Save
        </Button>
      </Box>
      <Divider sx={{ mt: -1 }} />

      <CardContent
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 0,
          bgcolor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        {/* 1. Core Controls */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 0.5,
                }}
              >
                <AccountBalanceIcon sx={{ fontSize: 14 }} /> TAX REGIME
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
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      Old
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="new"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
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
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 1,
                }}
              >
                <HealthAndSafetyIcon sx={{ fontSize: 14 }} /> EMERGENCY FUND
              </Typography>
              <Select
                fullWidth
                size="small"
                value={emergencyTarget}
                onChange={(e) => setEmergencyTarget(e.target.value)}
                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
              >
                <MenuItem value={3} sx={{ fontSize: '0.75rem' }}>
                  3 Months
                </MenuItem>
                <MenuItem value={6} sx={{ fontSize: '0.75rem' }}>
                  6 Months (Rec.)
                </MenuItem>
                <MenuItem value={12} sx={{ fontSize: '0.75rem' }}>
                  12 Months
                </MenuItem>
              </Select>
            </Grid>
          </Grid>
        </Box>

        {/* 2. Risk Header with Result */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'primary.main',
              }}
            >
              <AssignmentIcon sx={{ fontSize: 16 }} /> RISK PROFILE
            </Typography>
            <Chip
              label={calculatedRisk.label}
              color={calculatedRisk.color}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
            />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{ height: 4, borderRadius: 2, bgcolor: '#eee' }}
          />
        </Box>

        {/* 3. Questionnaire Grid */}
        <Box sx={{ p: 1.5 }}>
          {questions.map((q, idx) => (
            <Paper
              key={q.id}
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1.5,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: 'text.primary',
                  display: 'block',
                  lineHeight: 1.3,
                }}
              >
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ color: 'primary.main', fontWeight: 900, mr: 1 }}
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
                  display: 'grid',
                  gridTemplateColumns:
                    q.options.length > 3 ? '1fr 1fr' : '1fr 1fr 1fr',
                  gap: 0.5,
                  '& .MuiToggleButton-root': {
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)} !important`,
                    borderRadius: '16px !important',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    color: 'text.secondary',
                    py: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
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
    </Card>
  );
};

export default FinancialSettings;
