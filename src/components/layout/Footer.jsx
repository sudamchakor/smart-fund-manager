import React from "react";
import {
  Box,
  Typography,
  Link,
  Stack,
  Container,
  useTheme,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        // --- STICKY LOGIC ---
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar, // Ensures it stays above page content
        // --------------------

        // Glassmorphism effect
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(8px)",
        borderTop: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.1),
        textAlign: "center",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 4 }}
          justifyContent="center"
          alignItems="center"
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            © {new Date().getFullYear()}{" "}
            <Link
              color="primary"
              onClick={() => navigate("/")}
              sx={{ fontWeight: 700, textDecoration: "none", cursor: "pointer" }}
            >
              SmartFund Manager
            </Link>
          </Typography>

          <Stack direction="row" spacing={3}>
            <Link
              onClick={() => navigate("/privacy-policy")}
              underline="none"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "0.75rem",
                cursor: "pointer",
                "&:hover": { color: "primary.main" },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              onClick={() => navigate("/terms-of-service")}
              underline="none"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "0.75rem",
                cursor: "pointer",
                "&:hover": { color: "primary.main" },
              }}
            >
              Terms of Service
            </Link>
            <Link
              onClick={() => navigate("/contact-us")}
              underline="none"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "0.75rem",
                cursor: "pointer",
                "&:hover": { color: "primary.main" },
              }}
            >
              Contact Us
            </Link>
          </Stack>

          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              fontWeight: 600,
              display: { xs: "none", md: "block" },
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              pl: 4,
            }}
          >
            Built for precision. Managed with intelligence.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
