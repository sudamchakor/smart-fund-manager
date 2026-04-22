import React from "react";
import { Box, Paper, Typography, Tooltip, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";

export default function BasicInfoDisplay({
  currentAge,
  retirementAge,
  onEdit,
}) {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Basic Info</Typography>
        <IconButton size="small" onClick={onEdit} color="primary">
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Changed flexDirection to be responsive */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // Stack vertically on xs, row on sm and up
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Current Age
            <Tooltip title="Your current age for retirement planning calculations">
              <InfoIcon fontSize="small" sx={{ opacity: 0.6 }} />
            </Tooltip>
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: "#e3f2fd", borderRadius: 1 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              {currentAge} years
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Target Retirement Age
            <Tooltip title="Standard in India is 60. You can adjust based on your personal circumstances.">
              <InfoIcon fontSize="small" sx={{ opacity: 0.6 }} />
            </Tooltip>
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: "#f3e5f5", borderRadius: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#7b1fa2" }}>
              {retirementAge} years
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Years to Retirement
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: "#e8f5e9", borderRadius: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32" }}>
              {retirementAge - currentAge} years
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Paper>
  );
}
