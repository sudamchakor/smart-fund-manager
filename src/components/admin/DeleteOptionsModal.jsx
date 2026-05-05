import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Typography,
  Box,
} from '@mui/material';

const DeleteOptionsModal = ({
  deleteModalOpen,
  setDeleteModalOpen,
  deletionType,
  setDeletionType,
  handleExecuteDeletion,
  isSubmitting,
}) => {
  return (
    <Dialog
      open={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
        Delete Account Data
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>
          Select the scope of data you wish to remove. This action is permanent.
        </DialogContentText>

        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={deletionType}
            onChange={(e) => setDeletionType(e.target.value)}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 1,
                mb: 2,
                borderColor:
                  deletionType === 'profile' ? 'primary.main' : 'divider',
              }}
            >
              <FormControlLabel
                value="profile"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle2">Just Profile</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Removes bio and display name. You can still log in.
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: 1,
                borderColor: deletionType === 'full' ? 'error.main' : 'divider',
              }}
            >
              <FormControlLabel
                value="full"
                control={<Radio color="error" />}
                label={
                  <Box>
                    <Typography variant="subtitle2" color="error">
                      Complete Data
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Wipes everything and deletes your login account forever.
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={() => setDeleteModalOpen(false)} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleExecuteDeletion}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Confirm Deletion'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteOptionsModal;
