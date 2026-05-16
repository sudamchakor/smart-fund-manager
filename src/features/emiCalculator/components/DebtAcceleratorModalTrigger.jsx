import React, { useState, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
  useMediaQuery,
  Box,
  Typography,
  alpha, // Import alpha here
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DebtAccelerator from '../../profile/components/DebtAccelerator';
import { useSelector } from 'react-redux';
import { selectCalculatedValues } from '../utils/emiCalculator';

const DebtAcceleratorModalTrigger = ({
  open,
  onClose,
  initialPrepaymentAmount = 10000,
  onApplyPrepayment,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [currentExtraPayment, setCurrentExtraPayment] = useState(initialPrepaymentAmount);

  const { principal, interestRate, tenure, loanAmount } = useSelector(selectCalculatedValues);

  const debtAcceleratorRef = useRef(null);

  const handleApply = () => {
    const valueToApply = debtAcceleratorRef.current?.getCurrentExtraPayment();
    if (onApplyPrepayment && valueToApply !== undefined) {
      onApplyPrepayment(valueToApply);
    }
    onClose();
  };

  return (
    <Box>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={onClose}
        aria-labelledby="debt-accelerator-dialog-title"
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.default,
            color: theme.palette.text.primary,
            borderRadius: fullScreen ? 0 : 3,
            boxShadow: fullScreen ? 'none' : `0 8px 24px ${alpha(theme.palette.common.black, 0.5)}`,
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, bgcolor: theme.palette.background.paper }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            Debt Accelerator Tool
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: theme.palette.background.default, p: fullScreen ? 1 : 3 }}>
          {loanAmount > 0 ? (
            <DebtAccelerator
              ref={debtAcceleratorRef}
              initialOutstandingPrincipal={principal}
              initialInterestRateAnnual={interestRate}
              initialRemainingTenureMonths={tenure}
              extraPayment={currentExtraPayment}
              setExtraPayment={setCurrentExtraPayment}
            />
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ p: 3 }}>
              Please enter your loan details in the main calculator to use the Debt Accelerator.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: theme.palette.background.paper, p: 2 }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
            Close
          </Button>
          <Button
            onClick={handleApply}
            color="primary"
            variant="contained"
            sx={{
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
              color: theme.palette.primary.contrastText,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Apply Prepayment Strategy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DebtAcceleratorModalTrigger;