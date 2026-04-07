import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
} from "@mui/material";

const themes = [
  { name: "Light", value: "light", color: "#2a9d8f" },
  { name: "Dark", value: "dark", color: "#264653" },
  { name: "Blue", value: "blue", color: "#0077b6" },
  { name: "Green", value: "green", color: "#40916c" },
  { name: "Yellow", value: "yellow", color: "#fb8500" },
];

const ThemeSelector = ({ selectedTheme, onThemeChange, disabled }) => {
  return (
    <Grid container spacing={2}>
      {themes.map((theme) => (
        <Grid item xs={2.4} key={theme.value}>
          <Card
            variant="outlined"
            sx={{
              borderColor:
                selectedTheme === theme.value
                  ? "primary.main"
                  : "transparent",
              borderWidth: 2,
            }}
          >
            <CardActionArea
              onClick={() => onThemeChange(theme.value)}
              disabled={disabled}
            >
              <Box
                sx={{
                  height: 60,
                  backgroundColor: theme.color,
                }}
              />
              <Typography variant="caption" align="center" display="block" p={1}>
                {theme.name}
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ThemeSelector;