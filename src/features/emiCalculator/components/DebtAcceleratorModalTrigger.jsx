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
  alpha,
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
  // Makes modal full screen on small devices (md breakpoint and below)
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  // We'll manage the extraPayment state here, which controls the slider in DebtAccelerator
  const [currentExtraPayment, setCurrentExtraPayment] = useState(
    initialPrepaymentAmount,
  );

  // Access loan details from Redux, as DebtAccelerator also uses them
  const { principal, interestRate, tenure, loanAmount } = useSelector(
    selectCalculatedValues,
  );

  // Ref to access methods exposed by DebtAccelerator (e.g., getCurrentExtraPayment)
  const debtAcceleratorRef = useRef(null);

  const handleApply = () => {
    const valueToApply = debtAcceleratorRef.current?.getCurrentExtraPayment();
    if (onApplyPrepayment && valueToApply !== undefined) {
      onApplyPrepayment(valueToApply);
    }
    onClose(); // Close the modal after applying
  };

  return (
    <Dialog
      fullScreen={fullScreen} // Full screen on mobile
      open={open}
      onClose={onClose}
      aria-labelledby="debt-accelerator-dialog-title"
      maxWidth="md" // Max width for desktop
      fullWidth // Takes full width up to maxWidth
      PaperProps={{
        sx: {
          // Glassmorphism effect
          bgcolor: alpha(theme.palette.background.paper, 0.8), // Translucent background
          backdropFilter: 'blur(10px)', // Apply blur for glass effect
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.2), // Subtle border
          color: theme.palette.text.primary,
          borderRadius: fullScreen ? 0 : 3, // No border radius for full screen on mobile
          boxShadow: fullScreen
            ? 'none'
            : `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`, // Softer shadow
          display: 'flex',
          flexDirection: 'column',
          maxHeight: fullScreen ? '100%' : '90vh', // Limit height on desktop
        },
      }}
    >
      <DialogTitle
        id="debt-accelerator-dialog-title"
        sx={{
          m: 0,
          p: { xs: 2, md: 3 }, // Responsive padding for title
          bgcolor: alpha(theme.palette.background.paper, 0.8), // Translucent background
          flexShrink: 0, // Prevent title from shrinking
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1), // Subtle bottom border
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            fontSize: { xs: '1.1rem', md: '1.25rem' }, // Fluid typography
          }}
        >
          Debt Accelerator Tool
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: { xs: 8, md: 16 }, // Responsive positioning
            top: { xs: 8, md: 16 }, // Responsive positioning
            color: (theme) => theme.palette.grey[500],
            // Ensure touch target size (MUI IconButton usually handles this)
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers // Adds a border and makes content scrollable
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.7), // Slightly more translucent for content
          p: { xs: 2, md: 3 }, // Responsive padding for content
          flex: '1 1 auto', // Allows content to grow and shrink, pushing actions to bottom
          overflowY: 'auto', // Enables vertical scrolling for content
          // Ensure minHeight for touch targets within content if custom elements are used
          borderTop: 'none', // Remove default divider border as we have custom ones
          borderBottom: 'none', // Remove default divider border
        }}
      >
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
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ p: { xs: 2, md: 3 } }}
          >
            Please enter your loan details in the main calculator to use the
            Debt Accelerator.
          </Typography>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.8), // Translucent background
          p: { xs: 2, md: 3 }, // Responsive padding for actions
          flexShrink: 0, // Prevent actions from shrinking
          justifyContent: { xs: 'space-between', md: 'flex-end' }, // Adjust button alignment on mobile
          borderTop: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1), // Subtle top border
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          sx={{ fontWeight: 600, textTransform: 'none' }}
        >
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
            minWidth: { xs: 'auto', md: 120 }, // Ensure touch target size, but allow shrinking on mobile
            px: { xs: 2, md: 3 }, // Responsive padding
            py: { xs: 1, md: 1.2 }, // Responsive padding
          }}
        >
          Apply Prepayment Strategy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DebtAcceleratorModalTrigger;
