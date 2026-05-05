import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  WarningAmber as WarningIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          py: 8,
        }}
      >
        <Box
          sx={{
            width: '100%',
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha(theme.palette.error.main, 0.2),
            bgcolor: theme.palette.background.paper,
            boxShadow: `0 12px 40px ${alpha(theme.palette.common.black || '#000', 0.05)}`,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background error tint */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              bgcolor: 'error.main',
            }}
          />

          <Stack spacing={3} alignItems="center">
            {/* Error Icon Well */}
            <Box
              sx={{
                display: 'flex',
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: 'error.main',
                mb: 1,
              }}
            >
              <WarningIcon sx={{ fontSize: 64 }} />
            </Box>

            {/* Typography Section */}
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: 'error.main',
                  letterSpacing: -2,
                  lineHeight: 1,
                }}
              >
                404
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'text.primary',
                  letterSpacing: 2,
                  mt: 1,
                }}
              >
                System Routing Error
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.divider, 0.05),
                border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  lineHeight: 1.6,
                }}
              >
                The requested module or routing path could not be located in the
                current system registry. It may have been relocated,
                decommissioned, or the endpoint is temporarily unavailable.
              </Typography>
            </Box>

            {/* Action Button */}
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/')}
              disableElevation
              sx={{
                mt: 2,
                fontWeight: 800,
                textTransform: 'none',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Return to Command Center
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
