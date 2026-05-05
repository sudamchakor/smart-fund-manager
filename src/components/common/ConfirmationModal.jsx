import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Slide,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, md: 2 },
          boxShadow: theme.shadows[10],
          border: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DialogTitle id="confirmation-dialog-title" sx={{ pb: 1 }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <DialogContentText id="confirmation-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            minWidth: 100,
            borderColor: theme.palette.grey[400],
            '&:hover': {
              borderColor: theme.palette.grey[600],
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          autoFocus
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            minWidth: 100,
            boxShadow: theme.shadows[3],
            '&:hover': {
              boxShadow: theme.shadows[6],
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
