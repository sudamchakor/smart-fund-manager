import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Grid,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { formatCurrency } from '../../../utils/formatting';
import { useSelector } from 'react-redux';
import { selectCurrency } from '../../../store/emiSlice';
import { selectExpectedReturnRate } from '../../../store/profileSlice';

const BridgeGapModal = ({ open, onClose, goal }) => {
  const currency = useSelector(selectCurrency);
  const expectedReturnRate = useSelector(selectExpectedReturnRate);

  if (!goal) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon color="warning" />
        Goal Shortfall Analysis
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          {goal.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Based on your current wealth trajectory and goal prioritization, this
          goal is currently <strong>{goal.status}</strong>.
        </Typography>

        <Box
          sx={{ my: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Inflation-Adjusted Target
              </Typography>
              <Typography variant="subtitle1">
                {formatCurrency(goal.inflationAdjustedTarget, currency)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Current Funded Amount
              </Typography>
              <Typography variant="subtitle1" color="success.main">
                {formatCurrency(goal.fundedAmount, currency)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Projected Shortfall
              </Typography>
              <Typography variant="h6" color="error.main">
                {formatCurrency(goal.shortfall, currency)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Action Plan to Bridge the Gap:
        </Typography>
        <Typography variant="body1">
          To reach this goal by {goal.targetYear}, you need to increase your
          monthly investments by:
        </Typography>
        <Typography
          variant="h4"
          color="primary.main"
          sx={{ my: 2, textAlign: 'center', fontWeight: 'bold' }}
        >
          {formatCurrency(goal.requiredSip, currency)} / month
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="center"
        >
          *Assumes an expected return rate of {expectedReturnRate * 100}% per
          annum.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Understood
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BridgeGapModal;
