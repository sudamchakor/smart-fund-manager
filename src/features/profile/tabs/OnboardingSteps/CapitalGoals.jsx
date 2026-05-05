import React from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  DeleteOutline as DeleteIcon,
  FlagCircle as GoalIcon,
} from '@mui/icons-material';
import GoalForm from '../../components/GoalForm';

export default function CapitalGoals({
  goalsList,
  setGoalsList,
  showCustomGoalForm,
  setShowCustomGoalForm,
  customGoalData,
  setCustomGoalData,
  applyRetirementGoal,
  applyEducationGoal,
  applyEmergencyFundGoal,
  handleAddCustomGoal,
}) {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <GoalIcon sx={{ fontSize: '1.2rem', color: 'info.main' }} />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'info.main',
          }}
        >
          Future Capital Goals
        </Typography>
      </Stack>

      {showCustomGoalForm ? (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <GoalForm
            goal={customGoalData}
            currentYear={currentYear}
            onSave={setCustomGoalData}
          />
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}
            sx={{ mt: 3 }}
          >
            <Button
              onClick={() => setShowCustomGoalForm(false)}
              sx={{ fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => handleAddCustomGoal(customGoalData)}
              disabled={!customGoalData.name || !customGoalData.targetAmount}
              sx={{ fontWeight: 800 }}
            >
              Compile Goal
            </Button>
          </Stack>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {/* Styled Goal Tiles */}
          <Grid item xs={12} sm={3}>
            <Box
              onClick={applyRetirementGoal}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: 'pointer',
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Typography variant="h5" sx={{ mb: 1 }}>
                🎯
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, display: 'block' }}
              >
                Retirement
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box
              onClick={applyEducationGoal}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: 'pointer',
                textAlign: 'center',
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                },
              }}
            >
              <Typography variant="h5" sx={{ mb: 1 }}>
                🎓
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, display: 'block' }}
              >
                Education
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box
              onClick={applyEmergencyFundGoal}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: 'pointer',
                textAlign: 'center',
                bgcolor: alpha(theme.palette.error.main, 0.05),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <Typography variant="h5" sx={{ mb: 1 }}>
                🛟
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, display: 'block' }}
              >
                Safety Net
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box
              onClick={() => setShowCustomGoalForm(true)}
              sx={{
                p: 2,
                height: '100%',
                borderRadius: 2,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                border: `1px dashed ${alpha(
                  theme.palette.secondary.main,
                  0.4,
                )}`,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.15),
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 900,
                  color: 'secondary.main',
                  textTransform: 'uppercase',
                }}
              >
                + Custom
              </Typography>
            </Box>
          </Grid>
        </Grid>
      )}

      {goalsList.length > 0 && (
        <List
          dense
          sx={{
            mt: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
            maxHeight: 200,
            overflow: 'auto',
          }}
        >
          {goalsList.map((goal, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() =>
                    setGoalsList(goalsList.filter((_, i) => i !== index))
                  }
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 800 }}>{goal.name}</Typography>
                }
                secondary={`Target Corpus: ₹${goal.targetAmount.toLocaleString(
                  'en-IN',
                )}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
