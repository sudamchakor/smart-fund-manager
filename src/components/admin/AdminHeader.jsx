import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';

const AdminHeader = ({ isAdmin, tabValue }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 900 }}>
        Admin Console
      </Typography>
      {isAdmin && tabValue === 0 && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/admin/articles/new"
          sx={{ px: 3 }}
        >
          Create Article
        </Button>
      )}
    </Box>
  );
};

export default AdminHeader;