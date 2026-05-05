import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Grid,
  Link,
  useTheme,
  alpha,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  SupportAgent as SupportIcon,
  Send as SendIcon,
  EmailOutlined as EmailIcon,
  LocationOnOutlined as LocationIcon,
  PhoneOutlined as PhoneIcon,
  AccessTimeOutlined as TimeIcon,
} from '@mui/icons-material';

const ContactUs = () => {
  const theme = useTheme();

  // Form State Management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  // Mailto Execution Logic
  const handleTransmit = () => {
    const targetEmail = 'chakorsudam@gmail.com';

    // Fallback subject if the user leaves it blank
    const emailSubject = encodeURIComponent(
      formData.subject || 'SmartFund Manager System Inquiry',
    );

    // Constructing the email body with the user's provided details
    const emailBody = encodeURIComponent(
      `Assessee Name: ${formData.name}\n` +
        `Return Email: ${formData.email}\n\n` +
        `Transmission Payload:\n${formData.message}`,
    );

    // Triggers the default mail client (Outlook, Mail app, Gmail web handler, etc.)
    window.location.href = `mailto:${targetEmail}?subject=${emailSubject}&body=${emailBody}`;
  };

  // Shared Styles for Command Center Aesthetic
  const labelStyle = {
    fontWeight: 800,
    textTransform: 'uppercase',
    fontSize: '0.65rem',
    color: 'text.secondary',
    letterSpacing: 1,
    mb: 0.5,
    display: 'block',
  };

  const wellInputStyle = {
    fontWeight: 600,
    fontSize: '0.9rem',
    bgcolor: alpha(theme.palette.primary.main, 0.03),
    color: 'text.primary',
    px: 1.5,
    py: 1,
    borderRadius: 2,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      bgcolor: alpha(theme.palette.primary.main, 0.06),
    },
    '&.Mui-focused': {
      bgcolor: alpha(theme.palette.primary.main, 0.08),
      borderColor: alpha(theme.palette.primary.main, 0.3),
    },
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Technical Header */}
      <Box sx={{ mb: 6, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1.5,
            mb: 2,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
          }}
        >
          <SupportIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: 'text.primary',
            letterSpacing: -0.5,
            mb: 1,
          }}
        >
          Support Channels
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, color: 'text.secondary', lineHeight: 1.6 }}
        >
          Establish a direct connection with the SmartFund Manager engineering
          and support teams. Transmit your query below or utilize the provided
          communication vectors.
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {/* Left Column: Transmission Form */}
        <Grid item xs={12} md={7}>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.1),
              bgcolor: theme.palette.background.paper,
              boxShadow: `0 4px 24px ${alpha(theme.palette.common.black || '#000', 0.02)}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'primary.main',
                letterSpacing: 0.5,
                mb: 3,
              }}
            >
              Initialize Transmission
            </Typography>

            <Stack spacing={3}>
              <Box>
                <Typography sx={labelStyle}>Assessee Name *</Typography>
                <TextField
                  fullWidth
                  variant="standard"
                  required
                  value={formData.name}
                  onChange={handleChange('name')}
                  InputProps={{ disableUnderline: true, sx: wellInputStyle }}
                />
              </Box>

              <Box>
                <Typography sx={labelStyle}>Return Email Address *</Typography>
                <TextField
                  fullWidth
                  variant="standard"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange('email')}
                  InputProps={{ disableUnderline: true, sx: wellInputStyle }}
                />
              </Box>

              <Box>
                <Typography sx={labelStyle}>
                  Query Classification / Subject
                </Typography>
                <TextField
                  fullWidth
                  variant="standard"
                  value={formData.subject}
                  onChange={handleChange('subject')}
                  InputProps={{ disableUnderline: true, sx: wellInputStyle }}
                />
              </Box>

              <Box>
                <Typography sx={labelStyle}>Transmission Payload *</Typography>
                <TextField
                  fullWidth
                  variant="standard"
                  multiline
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange('message')}
                  InputProps={{ disableUnderline: true, sx: wellInputStyle }}
                />
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<SendIcon />}
                onClick={handleTransmit}
                disabled={
                  !formData.name || !formData.email || !formData.message
                }
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontWeight: 800,
                  borderRadius: 2,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                Execute Transmission
              </Button>
            </Stack>
          </Box>
        </Grid>

        {/* Right Column: Contact Vectors */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              height: '100%',
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'text.secondary',
                letterSpacing: 0.5,
                mb: 3,
              }}
            >
              System Directory
            </Typography>

            <List sx={{ p: 0 }}>
              <ListItem disableGutters sx={{ alignItems: 'flex-start', mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                  <LocationIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={labelStyle}>
                      Primary Node Address
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}
                    >
                      123 Logic Street, Sector 4<br />
                      Finance City, FC 12345
                    </Typography>
                  }
                />
              </ListItem>

              <Divider
                sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.1) }}
              />

              <ListItem disableGutters sx={{ alignItems: 'flex-start', mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                  <PhoneIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={labelStyle}>Voice Protocol</Typography>
                  }
                  secondary={
                    <Link
                      href="tel:+1234567890"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        textDecoration: 'none',
                        '&:hover': { color: 'primary.main' },
                        mt: 0.5,
                        display: 'inline-block',
                      }}
                    >
                      (123) 456-7890
                    </Link>
                  }
                />
              </ListItem>

              <Divider
                sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.1) }}
              />

              <ListItem disableGutters sx={{ alignItems: 'flex-start', mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                  <EmailIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={labelStyle}>Direct Routing</Typography>
                  }
                  secondary={
                    <Link
                      href="mailto:chakorsudam@gmail.com"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        textDecoration: 'none',
                        '&:hover': { color: 'primary.main' },
                        mt: 0.5,
                        display: 'inline-block',
                      }}
                    >
                      chakorsudam@gmail.com
                    </Link>
                  }
                />
              </ListItem>

              <Divider
                sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.1) }}
              />

              <ListItem disableGutters sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                  <TimeIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={labelStyle}>Operational Uptime</Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}
                    >
                      Monday - Friday
                      <br />
                      0900 HRS - 1700 HRS (Local)
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactUs;
