import React from 'react';
import { Box, Button, Stack, CircularProgress } from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ArticleEditorActions = ({
  id,
  isSubmitting,
  handlePublish,
  clearForm,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
      <Button color="error" startIcon={<DeleteSweepIcon />} onClick={clearForm}>
        Clear
      </Button>

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" color="inherit" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<SaveIcon />}
          disabled={isSubmitting}
          onClick={() => handlePublish(null, 'draft')}
        >
          Save Draft
        </Button>
        <Button
          variant="contained"
          startIcon={
            isSubmitting ? <CircularProgress size={20} /> : <CloudUploadIcon />
          }
          disabled={isSubmitting}
          onClick={(e) => handlePublish(e, 'published')}
          sx={{ px: 4 }}
        >
          {id ? 'Update' : 'Publish'}
        </Button>
      </Stack>
    </Box>
  );
};

export default ArticleEditorActions;
