import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Divider,
  Fade, // Import Fade component
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getAuthentication } from '../../firebaseConfig';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });
  const navigate = useNavigate();

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // FIX: Call getAuthentication() to get the auth instance
      await signInWithEmailAndPassword(getAuthentication(), email, password);
      setSnackbar({
        open: true,
        message: 'Login successful!',
        severity: 'success',
      });
      navigate('/admin/articles');
    } catch (error) {
      console.error('Email/Password login error:', error.message);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerInstance, providerName) => {
    setLoading(true);
    try {
      // FIX: Call getAuthentication() to get the auth instance
      await signInWithPopup(getAuthentication(), providerInstance);
      setSnackbar({
        open: true,
        message: `${providerName} login successful!`,
        severity: 'success',
      });
      navigate('/admin/articles');
    } catch (error) {
      console.error(`${providerName} login error:`, error.message);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    handleSocialLogin(provider, 'Google');
  };

  const handleGithubLogin = () => {
    const provider = new GithubAuthProvider();
    handleSocialLogin(provider, 'GitHub');
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      {/* Fade in the login form */}
      <Fade in={true} timeout={1000}>
        <Paper
          elevation={6} // Increased elevation for more prominence
          sx={{
            p: 4,
            borderRadius: 3, // More rounded corners
            backgroundColor: 'background.paper', // Ensure it uses theme background
            boxShadow: 6, // Stronger shadow
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            sx={{ color: 'primary.main', fontWeight: 'bold' }} // Use primary color and bold
          >
            Admin Login
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary" // Use secondary text color
            sx={{ mb: 3 }}
          >
            Sign in to manage articles.
          </Typography>
          {/* Email/Password Login Form */}
          <form onSubmit={handleEmailPasswordLogin}>
            <Stack spacing={3}>
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                startIcon={
                  loading && <CircularProgress size={20} color="inherit" />
                }
                sx={{ py: 1.5 }} // Add some vertical padding to the button
              >
                {loading ? 'Logging In...' : 'Login with Email'}
              </Button>
            </Stack>
          </form>
          <Divider sx={{ my: 3, borderColor: 'divider' }}>OR</Divider>{' '}
          {/* Use theme divider color */}
          {/* Social Login Buttons */}
          <Stack spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleGoogleLogin}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <img
                    src="https://img.icons8.com/color/16/000000/google-logo.png"
                    alt="Google"
                    style={{ marginRight: 8 }} // Add some spacing
                  />
                )
              }
              sx={{ py: 1.5 }}
            >
              Login with Google
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleGithubLogin}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <img
                    src="https://img.icons8.com/ios-glyphs/16/000000/github.png"
                    alt="GitHub"
                    style={{ marginRight: 8 }} // Add some spacing
                  />
                )
              }
              sx={{ py: 1.5 }}
            >
              Login with GitHub
            </Button>
          </Stack>
        </Paper>
      </Fade>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginPage;
