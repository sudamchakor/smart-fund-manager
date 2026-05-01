import React from "react";
import { Box, Typography, useTheme, alpha, Stack } from "@mui/material";

const DataCard = ({ title, icon, colorToken, children, sx = {} }) => {
  const theme = useTheme();

  // Default to primary color if no specific token is passed
  const activeColor = colorToken || theme.palette.primary.main;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.1),
        bgcolor: theme.palette.background.paper,
        boxShadow: `0 4px 24px ${alpha(theme.palette.common.black || "#000", 0.02)}`,
        mb: 3,
        display: "flex",
        flexDirection: "column",
        ...sx, // Allow passing custom styles from parent
      }}
    >
      {title && (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ mb: 2.5 }}
        >
          {/* Render the tinted icon well if an icon is provided */}
          {icon && (
            <Box
              sx={{
                display: "flex",
                p: 1,
                borderRadius: 2,
                bgcolor: alpha(activeColor, 0.1),
                color: activeColor,
              }}
            >
              {icon}
            </Box>
          )}

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
        </Stack>
      )}

      {/* Content Area */}
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  );
};

export default DataCard;
