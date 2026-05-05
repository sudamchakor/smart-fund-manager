import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const ProfileDetailsForm = ({
  profileData,
  setProfileData,
  handleSaveProfile,
  isSubmitting,
  setPasswordModalOpen,
  setDeleteModalOpen,
  hasPassword,
  userEmail,
}) => {
  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        color="primary.main"
        fontWeight="600"
      >
        Profile Details
      </Typography>

      <Stack spacing={3} sx={{ mb: 4 }}>
        <TextField
          label="Email Address"
          fullWidth
          value={userEmail || ''}
          disabled
          variant="filled"
        />
        <TextField
          label="Display Name"
          fullWidth
          value={profileData.displayName}
          onChange={(e) =>
            setProfileData({ ...profileData, displayName: e.target.value })
          }
        />
        <TextField
          label="Bio"
          fullWidth
          multiline
          rows={3}
          value={profileData.bio}
          onChange={(e) =>
            setProfileData({ ...profileData, bio: e.target.value })
          }
        />
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="outlined"
          startIcon={<LockIcon />}
          onClick={() => setPasswordModalOpen(true)}
        >
          {hasPassword ? 'Change Password' : 'Set Password'}
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveProfile}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Save Profile'}
        </Button>
      </Stack>

      <Divider sx={{ my: 5 }} />

      <Typography variant="h6" color="error.main" gutterBottom fontWeight="600">
        Account Privacy
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage what happens to your data when you no longer want to use this
        profile.
      </Typography>
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteForeverIcon />}
        onClick={() => setDeleteModalOpen(true)}
      >
        Delete Options
      </Button>
    </Box>
  );
};

export default ProfileDetailsForm;
