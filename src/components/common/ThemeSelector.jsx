import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import { themeColors } from '../../theme/ThemeConfig'; // IMPORT FROM CONFIG

const ThemeSelector = ({ selectedTheme, onThemeChange, disabled }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      {themeColors.map((themeOption) => (
        <Grid item xs={12} sm={6} md={2.4} key={themeOption.value}>
          <Card
            variant="outlined"
            sx={{
              borderColor:
                selectedTheme === themeOption.value
                  ? 'primary.main'
                  : alpha(theme.palette.divider, 0.2),
              borderWidth: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              boxShadow:
                selectedTheme === themeOption.value
                  ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                  : 0,
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <CardActionArea
              onClick={() => onThemeChange(themeOption.value)}
              disabled={disabled}
            >
              <Stack direction="row" sx={{ height: { xs: 30, sm: 40 } }}>
                {themeOption.colors.map((color, index) => (
                  <Box
                    key={index}
                    data-testid="color-box"
                    sx={{
                      height: '100%',
                      width: `${100 / themeOption.colors.length}%`,
                      backgroundColor: color,
                    }}
                  />
                ))}
              </Stack>
              <Typography
                variant="caption"
                align="center"
                display="block"
                sx={{
                  py: 0.5,
                  fontWeight: selectedTheme === themeOption.value ? 700 : 500,
                  textTransform: 'capitalize',
                }}
              >
                {themeOption.name}
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ThemeSelector;