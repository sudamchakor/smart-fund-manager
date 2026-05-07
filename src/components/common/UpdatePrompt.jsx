import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';

const UpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    const onSWUpdated = (event) => {
      const registration = event.detail;
      setWaitingWorker(registration.waiting);
      setShowPrompt(true);
    };

    window.addEventListener('swUpdated', onSWUpdated);

    return () => {
      window.removeEventListener('swUpdated', onSWUpdated);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowPrompt(false);
    window.location.reload();
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowPrompt(false);
  };

  return (
    <Snackbar
      open={showPrompt}
      autoHideDuration={60000} // Give users plenty of time to see it
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity="info"
        variant="filled"
        sx={{ width: '100%', alignItems: 'center' }}
        action={
          <Button color="inherit" size="small" onClick={handleUpdate} sx={{ fontWeight: 'bold' }}>
            UPDATE NOW
          </Button>
        }
      >
        A new version of the app is available!
      </Alert>
    </Snackbar>
  );
};

export default UpdatePrompt;