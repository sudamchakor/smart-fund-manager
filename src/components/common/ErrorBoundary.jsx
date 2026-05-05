import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ReportProblemOutlined as ReportProblemOutlinedIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
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
              We're sorry, but an unexpected error occurred.
            </Typography>
            {this.state.error && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'error.light',
                  color: 'error.contrastText',
                  borderRadius: 1,
                  textAlign: 'left',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  wordBreak: 'break-word',
                }}
              >
                <Typography variant="subtitle2">Error Details:</Typography>
                <Typography variant="caption" component="pre">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReload}
              sx={{ mt: 3 }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
