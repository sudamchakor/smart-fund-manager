import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Fade,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';

// Firebase Imports
import { getDataBase } from '../../firebaseConfig';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import SuspenseFallback from '../../components/common/SuspenseFallback';

// New Components
import ProfileDetailsForm from '../../components/admin/ProfileDetailsForm';
import PasswordUpdateModal from '../../components/admin/PasswordUpdateModal';
import DeleteOptionsModal from '../../components/admin/DeleteOptionsModal';
import ReauthenticateModal from '../../components/admin/ReauthenticateModal';

const AdminProfile = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const hasPassword = user?.providerData.some(
    (provider) => provider.providerId === 'password',
  );

  // --- States ---
  const [profileData, setProfileData] = useState({ displayName: '', bio: '' });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Modal States
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reauthenticateOpen, setReauthenticateOpen] = useState(false);

  // Password & Deletion Logic States
  const [deletionType, setDeletionType] = useState('profile'); // 'profile' or 'full'
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState('');

  // --- Effects ---
  useEffect(() => {
    if (!authLoading && !user) navigate('/admin/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setLoadingProfile(true);
        const userId = user.uid || user.id;
        const docSnap = await getDoc(
          doc(getDataBase(), 'authorProfiles', userId),
        );
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          setProfileData({ displayName: user.displayName || '', bio: '' });
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    if (!authLoading && user) fetchProfile();
  }, [user, authLoading]);

  // --- Handlers ---
  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile(user, { displayName: profileData.displayName });
      await setDoc(
        doc(getDataBase(), 'authorProfiles', user.uid),
        profileData,
        {
          merge: true,
        },
      );
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      });
    } catch (e) {
      setSnackbar({ open: true, message: e.message, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordChangeError('');
    if (hasPassword && !currentPassword)
      return setPasswordChangeError('Current password required.');
    if (newPassword.length < 6)
      return setPasswordChangeError('Password too short.');
    if (newPassword !== confirmNewPassword)
      return setPasswordChangeError('Passwords do not match.');

    setPasswordChangeLoading(true);
    try {
      if (hasPassword) {
        const cred = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, cred);
      }
      await updatePassword(user, newPassword);
      setSnackbar({
        open: true,
        message: 'Security updated!',
        severity: 'success',
      });
      setPasswordModalOpen(false);
      resetPasswordFields();
    } catch (e) {
      setPasswordChangeError(e.message);
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const resetPasswordFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordChangeError('');
  };

  const handleExecuteDeletion = async () => {
    setIsSubmitting(true);
    try {
      const userId = user.uid || user.id;

      // 1. Always delete the Firestore profile data
      await deleteDoc(doc(getDataBase(), 'authorProfiles', userId));

      // 2. If 'full' deletion is selected, delete the Auth account
      if (deletionType === 'full') {
        await deleteUser(user);
        logout();
      } else {
        // Just profile deleted
        setProfileData({ displayName: user.displayName || '', bio: '' });
        setSnackbar({
          open: true,
          message: 'Public profile deleted. Account remains active.',
          severity: 'info',
        });
        setDeleteModalOpen(false);
      }
    } catch (e) {
      if (e.code === 'getAuthentication/requires-recent-login') {
        setDeleteModalOpen(false);
        setReauthenticateOpen(true);
      } else {
        setSnackbar({ open: true, message: e.message, severity: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReauthenticate = async () => {
    try {
      const cred = EmailAuthProvider.credential(user.email, reauthPassword);
      await reauthenticateWithCredential(user, cred);
      setReauthenticateOpen(false);
      setDeleteModalOpen(true); // Re-open delete modal to finish action
    } catch (e) {
      setReauthError('Invalid password. Please try again.');
    }
  };

  if (authLoading || loadingProfile)
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );

  return (
    <Fade in={!loadingProfile} timeout={800}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <PageHeader
          title="My Author Profile"
          subtitle="Manage your identity and security."
          icon={PersonIcon}
        />

        <Paper
          elevation={3}
          sx={{ p: { xs: 3, md: 5 }, mt: 3, borderRadius: 3 }}
        >
          <ProfileDetailsForm
            profileData={profileData}
            setProfileData={setProfileData}
            handleSaveProfile={handleSaveProfile}
            isSubmitting={isSubmitting}
            setPasswordModalOpen={setPasswordModalOpen}
            setDeleteModalOpen={setDeleteModalOpen}
            hasPassword={hasPassword}
            userEmail={user.email}
          />
        </Paper>

        <DeleteOptionsModal
          deleteModalOpen={deleteModalOpen}
          setDeleteModalOpen={setDeleteModalOpen}
          deletionType={deletionType}
          setDeletionType={setDeletionType}
          handleExecuteDeletion={handleExecuteDeletion}
          isSubmitting={isSubmitting}
        />

        <PasswordUpdateModal
          passwordModalOpen={passwordModalOpen}
          setPasswordModalOpen={setPasswordModalOpen}
          hasPassword={hasPassword}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmNewPassword={confirmNewPassword}
          setConfirmNewPassword={setConfirmNewPassword}
          handlePasswordSubmit={handlePasswordSubmit}
          passwordChangeLoading={passwordChangeLoading}
          passwordChangeError={passwordChangeError}
        />

        <ReauthenticateModal
          reauthenticateOpen={reauthenticateOpen}
          setReauthenticateOpen={setReauthenticateOpen}
          reauthPassword={reauthPassword}
          setReauthPassword={setReauthPassword}
          handleReauthenticate={handleReauthenticate}
          reauthError={reauthError}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Fade>
  );
};

export default AdminProfile;
