import React from 'react';
import { Box, Typography, Button, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { ReportProblemOutlined as ReportProblemOutlinedIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showClearDataModal: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo: errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleOpenClearDataModal = () => {
    this.setState({ showClearDataModal: true });
  };

  handleCloseClearDataModal = () => {
    this.setState({ showClearDataModal: false });
  };

  handleClearData = () => {
    localStorage.clear();
    sessionStorage.clear();
    this.setState({ showClearDataModal: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <ReportProblemOutlinedIcon
              color="error"
              sx={{ fontSize: 60, mb: 2 }}
            />
            <Typography variant="h5" component="h1" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We're sorry, but an unexpected error occurred. Please try reloading the page or clearing your data if the issue persists.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={this.handleOpenClearDataModal}
              >
                Clear Data
              </Button>
            </Box>
          </Paper>

          <Dialog
            open={this.state.showClearDataModal}
            onClose={this.handleCloseClearDataModal}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Clear Application Data?"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                This will clear all your saved data and settings in this application. Are you sure you want to proceed?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleCloseClearDataModal}>Cancel</Button>
              <Button onClick={this.handleClearData} color="error" autoFocus>
                Clear Data & Reload
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
