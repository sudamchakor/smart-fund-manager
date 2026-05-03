import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  CircularProgress, // Keep CircularProgress for authLoading
  Snackbar,
  Alert,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';

// Firebase Imports
import { db } from '../../firebaseConfig';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword, // Import updatePassword
} from 'firebase/auth'; // Import Firebase Auth functions
import SuspenseFallback from '../../components/common/SuspenseFallback'; // Import SuspenseFallback

const AdminProfile = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(true); // Reintroduced loadingProfile state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [reauthenticateOpen, setReauthenticateOpen] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch author profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          setLoadingProfile(true); // Set loading to true before fetching
          const profileRef = doc(db, 'authorProfiles', user.uid);
          const docSnap = await getDoc(profileRef);

          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          } else {
            // Initialize with Firebase Auth user data if no profile exists
            setProfileData({
              displayName: user.displayName || '',
              bio: '',
            });
          }
        } catch (error) {
          console.error('Error fetching author profile:', error);
          setSnackbar({
            open: true,
            message: 'Error loading profile.',
            severity: 'error',
          });
        } finally {
          setLoadingProfile(false); // Set loading to false after fetching
        }
      }
    };

    if (!authLoading && user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profileData.displayName,
        // photoURL is removed as per request
      });

      // Update Firestore author profile
      const profileRef = doc(db, 'authorProfiles', user.uid);
      await setDoc(profileRef, profileData, { merge: true });

      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setSnackbar({
        open: true,
        message: `Error saving profile: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    setPasswordChangeLoading(true);
    setPasswordChangeError('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordChangeError('All password fields are required.');
      setPasswordChangeLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('New password and confirm password do not match.');
      setPasswordChangeLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordChangeError(
        'New password must be at least 6 characters long.',
      );
      setPasswordChangeLoading(false);
      return;
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setSnackbar({
        open: true,
        message: 'Password updated successfully!',
        severity: 'success',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      let errorMessage = 'Failed to change password.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect current password.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage =
          'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log in again to update your password.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      setPasswordChangeError(errorMessage);
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handleDeleteProfileClick = () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmDeleteOpen(false);
    if (!user) return;

    try {
      // Attempt to delete user account
      await deleteUser(user);

      // If successful, delete Firestore profile and log out
      const profileRef = doc(db, 'authorProfiles', user.uid);
      await deleteDoc(profileRef);

      setSnackbar({
        open: true,
        message: 'Profile and account deleted successfully!',
        severity: 'success',
      });
      logout(); // This will also navigate to '/'
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        setReauthenticateOpen(true); // Prompt for re-authentication
      } else {
        setSnackbar({
          open: true,
          message: `Error deleting account: ${error.message}`,
          severity: 'error',
        });
      }
    }
  };

  const handleReauthenticate = async () => {
    setReauthError('');
    if (!user || !user.email || !reauthPassword) {
      setReauthError('Email and password are required.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        reauthPassword,
      );
      await reauthenticateWithCredential(user, credential);
      setReauthenticateOpen(false);
      setReauthPassword('');
      // After re-authentication, retry deletion
      handleConfirmDelete();
    } catch (error) {
      console.error('Re-authentication error:', error);
      setReauthError(`Re-authentication failed: ${error.message}`);
    }
  };

  if (authLoading) { // Still wait for auth to load
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  if (loadingProfile) { // Show SuspenseFallback while profile data is loading
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <SuspenseFallback message="" />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader
        title="My Author Profile"
        subtitle="Manage your public author information and account settings."
        icon={PersonIcon}
      />

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Profile Details
        </Typography>
        <Stack spacing={3} sx={{ mb: 4 }}>
          <TextField
            label="Display Name"
            name="displayName"
            variant="outlined"
            fullWidth
            value={profileData.displayName}
            onChange={handleChange}
            helperText="This name will appear on your articles."
          />
          <TextField
            label="Bio"
            name="bio"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={profileData.bio}
            onChange={handleChange}
            helperText="Tell readers a bit about yourself."
          />
          {/* Profile Picture URL field removed */}
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveProfile}
            disabled={isSubmitting}
            startIcon={
              isSubmitting && <CircularProgress size={20} color="inherit" />
            }
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </Stack>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Use your email ({user.email}) as your username for normal login.
        </Typography>
        <Stack spacing={3} sx={{ mb: 4 }}>
          <TextField
            label="Current Password"
            type="password"
            variant="outlined"
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            variant="outlined"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Minimum 6 characters."
          />
          <TextField
            label="Confirm New Password"
            type="password"
            variant="outlined"
            fullWidth
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            error={!!passwordChangeError}
            helperText={passwordChangeError}
          />
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            color="secondary"
            onClick={handleChangePassword}
            disabled={passwordChangeLoading}
            startIcon={
              passwordChangeLoading && (
                <CircularProgress size={20} color="inherit" />
              )
            }
          >
            {passwordChangeLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </Stack>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" color="error" gutterBottom>
          Danger Zone
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Permanently delete your author profile and account. This action cannot
          be undone.
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteProfileClick}
          disabled={isSubmitting}
        >
          Delete My Account
        </Button>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Confirm Account Deletion'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you absolutely sure you want to delete your account? All your
            profile data will be removed, and you will no longer be able to log
            in. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Re-authentication Dialog */}
      <Dialog
        open={reauthenticateOpen}
        onClose={() => setReauthenticateOpen(false)}
        aria-labelledby="reauth-dialog-title"
      >
        <DialogTitle id="reauth-dialog-title">
          {'Re-authenticate to Delete Account'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            For security reasons, you must re-authenticate to delete your
            account. Please enter your password. (Note: If you signed in with
            Google/GitHub, you might need to set a password for your account in
            Firebase Auth settings first, or re-authenticate via that provider
            if Firebase supports it directly for re-auth.)
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            value={reauthPassword}
            onChange={(e) => setReauthPassword(e.target.value)}
            error={!!reauthError}
            helperText={reauthError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReauthenticateOpen(false)}>Cancel</Button>
          <Button onClick={handleReauthenticate} color="primary">
            Re-authenticate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProfile;
