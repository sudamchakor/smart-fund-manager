import React from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Stack,
  Avatar,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import { useSelector } from "react-redux";
import {
  selectName,
  selectOccupation,
  selectRiskTolerance,
  selectCareerGrowthRate,
  selectGeneralInflationRate,
} from "../../../store/profileSlice";

const RetirementTimeline = ({ currentAge, retirementAge }) => {
  const careerStartAge = 25;
  const totalCareerSpan = retirementAge - careerStartAge;
  const yearsCompleted = currentAge - careerStartAge;
  const progress =
    totalCareerSpan > 0 ? (yearsCompleted / totalCareerSpan) * 100 : 0;

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Current Age: <strong>{currentAge}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Retirement: <strong>{retirementAge}</strong>
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 10, borderRadius: 5 }}
      />
    </Box>
  );
};

export default function BasicInfoDisplay({ currentAge, retirementAge }) {
  const name = useSelector(selectName);
  const occupation = useSelector(selectOccupation);
  const riskTolerance = useSelector(selectRiskTolerance) || "low";
  const careerGrowthRate = useSelector(selectCareerGrowthRate) || 0;
  const generalInflationRate = useSelector(selectGeneralInflationRate) || 0;

  // Completion Math
  const completion = Math.min(
    Math.round((currentAge / retirementAge) * 100),
    100,
  );

  return (
    <Stack
      spacing={0}
      sx={{
        height: "100%",
        py: 0.5,
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      {/* 1. Profile Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 46,
            height: 46,
            fontSize: "1.1rem",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Avatar>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, lineHeight: 1.2, color: "#1a1a1a" }}
          >
            {name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {occupation}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 2,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1.5 }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 1 }}
          >
            RETIREMENT JOURNEY
          </Typography>
          <Chip
            label={`${completion}% Complete`}
            size="small"
            color="primary"
            sx={{ fontWeight: 700, fontSize: "0.65rem", height: 20 }}
          />
        </Stack>

        <RetirementTimeline
          currentAge={currentAge}
          retirementAge={retirementAge}
        />

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: "primary.main",
              letterSpacing: -1.5,
              lineHeight: 1,
            }}
          >
            {retirementAge - currentAge} Years
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              mt: 0.5,
              display: "block",
            }}
          >
            Until Retirement Goal
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2, borderStyle: "dashed", opacity: 0.5 }} />

      {/* 3. Metrics Row - Modern Left-Border Accent Tiles */}
      <Grid container spacing={1.5}>
        {[
          {
            label: "Risk",
            val: riskTolerance,
            icon: <ShieldIcon sx={{ fontSize: 16 }} />,
            col: riskTolerance.toLowerCase() === "low" ? "#2e7d32" : "#ed6c02",
          },
          {
            label: "Growth",
            val: `${(careerGrowthRate * 100).toFixed(1)}%`,
            icon: <TrendingUpIcon sx={{ fontSize: 16 }} />,
            col: "#0288d1",
          },
          {
            label: "Inflation",
            val: `${(generalInflationRate * 100).toFixed(1)}%`,
            icon: <GraphicEqIcon sx={{ fontSize: 16 }} />,
            col: "#7b1fa2",
          },
        ].map((item, index) => (
          <Grid item xs={4} key={index}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "white",
                border: "1px solid",
                borderColor: "grey.200",
                borderLeft: `4px solid ${item.col}`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                textAlign: "left",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ mb: 0.5, color: item.col }}
              >
                {item.icon}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    color: "text.secondary",
                  }}
                >
                  {item.label.toUpperCase()}
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: "#333",
                  textTransform: "capitalize",
                }}
              >
                {item.val}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
