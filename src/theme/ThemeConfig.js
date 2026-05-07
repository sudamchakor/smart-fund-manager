import { createTheme, alpha } from '@mui/material';
import { getMotionProfile } from './motionProfiles';

// --- PRE-CONFIGURED GALLERY PRESETS ---
export const themePresets = {
  modern_solid: {
    name: 'Modern Solid',
    arch: 'material',
    style: 'flat',
    desc: 'Clean and dependable.',
    previewColor: '#0061A4',
  },
  premium_glass: {
    name: 'Premium Glass',
    arch: 'apple',
    style: 'glass',
    desc: 'Frosted transparency.',
    previewColor: '#000000',
  },
  enterprise_pro: {
    name: 'Enterprise Pro',
    arch: 'fluent',
    style: 'minimalist',
    desc: 'Sharp data focus.',
    previewColor: '#0078D4',
  },
  soft_3d: {
    name: 'Soft & Deep',
    arch: 'apple',
    style: 'neumorphic',
    desc: 'Tactile 3D shadows.',
    previewColor: '#C5A059',
  },
};

// --- EXPANDED COLOR PALETTE (10 Professional Themes) ---
export const themeColors = [
  {
    name: 'System',
    value: 'system',
    colors: ['#0061A4', '#D1E4FF', '#F8FAFF', '#001D35', '#535F70'], // fallback values
  },
  {
    name: 'DodgerBlue',
    value: 'dodgerblue',
    colors: ['#0061A4', '#D1E4FF', '#F8FAFF', '#001D35', '#535F70'],
  },
  {
    name: 'Emerald',
    value: 'green',
    colors: ['#006D3A', '#D3E8D3', '#F1F8F1', '#00210E', '#748C7D'],
  },
  {
    name: 'Rose',
    value: 'rose',
    colors: ['#9C4275', '#FFD8EB', '#FFF8F9', '#201A1D', '#81737A'],
  },
  {
    name: 'Amber',
    value: 'amber',
    colors: ['#7A5900', '#FFDF9E', '#FFF8F1', '#261900', '#4D4639'],
  },
  {
    name: 'Indigo',
    value: 'indigo',
    colors: ['#4355B9', '#DEE0FF', '#FEFBFF', '#001158', '#5B5D72'],
  },
  {
    name: 'Teal',
    value: 'teal',
    colors: ['#006A6A', '#B2F0F0', '#F4FBFB', '#002020', '#4A6363'],
  },
  {
    name: 'Violet',
    value: 'violet',
    colors: ['#6750A4', '#EADDFF', '#FFFBFE', '#21005D', '#49454F'],
  },
];

export const getAppTheme = (resolvedThemeMode, designSystem, visualStyle) => {
  let isDarkMode = false;
  let colorName = resolvedThemeMode;

  // Determine mode and color palette name from the resolved theme mode.
  if (resolvedThemeMode === 'dark') {
    isDarkMode = true;
    colorName = 'dodgerblue'; // Use default color palette for system dark mode
  } else if (resolvedThemeMode === 'light') {
    isDarkMode = false;
    colorName = 'dodgerblue'; // Use default color palette for system light mode
  }
  // If a specific color theme (e.g., 'green') is passed, isDarkMode will be false.
  // This is a pre-existing limitation: selecting a color theme forces light mode.

  const selectedTheme =
    themeColors.find((t) => t.value === colorName) ||
    themeColors.find((t) => t.value === 'dodgerblue');

  const [primary, secondary, background, textPrimary, textSecondary] =
    selectedTheme.colors;

  const motion = getMotionProfile(designSystem);

  // Define palette options, with specific overrides for dark mode.
  const themeOptions = {
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: { main: primary },
      secondary: { main: secondary },
      background: {
        default: isDarkMode ? '#121212' : background,
        paper: isDarkMode ? '#1E1E1E' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#FFFFFF' : textPrimary,
        secondary: isDarkMode ? '#B0B0B0' : textSecondary,
      },
    },
    transitions: {
      easing: motion.easing,
      duration: motion.duration,
    },
    shape: {
      borderRadius:
        designSystem === 'apple' ? 8 : designSystem === 'fluent' ? 2 : 4,
    },
    typography: {
      fontFamily:
        designSystem === 'apple'
          ? "'-apple-system', sans-serif"
          : "'Inter', 'Roboto', sans-serif",
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            transition: theme.transitions.create(['all'], {
              duration: theme.transitions.duration.standard,
              easing: theme.transitions.easing.easeInOut,
            }),
            borderRadius: theme.shape.borderRadius,
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            ...(visualStyle === 'glass' && {
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            }),
            ...(visualStyle === 'neumorphic' && {
              backgroundColor: isDarkMode ? '#1e1e1e' : '#f3f4f6',
              boxShadow: isDarkMode
                ? '5px 5px 10px #0b0b0b, -5px -5px 10px #252525'
                : '6px 6px 12px #d1d5db, -6px -6px 12px #ffffff',
            }),
            ...(visualStyle === 'minimalist' && {
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
            }),
          }),
        },
      },
    },
  };

  // Apply special background for neumorphic style, overriding the default.
  if (visualStyle === 'neumorphic') {
    themeOptions.palette.background.default = isDarkMode
      ? '#1e1e1e'
      : '#f3f4f6';
  }

  return createTheme(themeOptions);
};