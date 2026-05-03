import { createTheme, alpha } from '@mui/material';

// --- 1. MOTION PROFILES ---
export const motionProfiles = {
  material: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: { short: 200, standard: 300 },
  },
  apple: {
    easing: {
      easeInOut: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      sharp: 'cubic-bezier(0.33, 1, 0.68, 1)',
    },
    duration: { short: 300, standard: 500 },
  },
  fluent: {
    easing: {
      easeInOut: 'cubic-bezier(0.55, 0, 0.1, 1)',
      sharp: 'cubic-bezier(0, 0, 0, 1)',
    },
    duration: { short: 150, standard: 250 },
  },
};

export const getMotionProfile = (system) =>
  motionProfiles[system] || motionProfiles.material;

// --- 2. THEME CONFIGURATIONS ---
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

export const themeColors = [
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

// --- 3. THEME GENERATOR ---
export const getAppTheme = (themeMode, designSystem, visualStyle) => {
  const selectedTheme =
    themeColors.find((t) => t.value === themeMode) || themeColors[0];
  const [primary, secondary, background, textPrimary, textSecondary] =
    selectedTheme.colors;

  const isDarkMode =
    themeMode === 'dark' || themeMode === 'zinc' || themeMode === 'slate';
  const motion = getMotionProfile(designSystem);
  const isMaterial = designSystem === 'material';

  return createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: { main: primary },
      secondary: { main: secondary },
      background: {
        default:
          visualStyle === 'neumorphic'
            ? isDarkMode
              ? '#1e1e1e'
              : '#f3f4f6'
            : background,
        paper: isDarkMode
          ? themeMode === 'slate'
            ? '#1E293B'
            : '#1C1B1F'
          : '#ffffff',
      },
      text: { primary: textPrimary, secondary: textSecondary },
    },
    transitions: {
      easing: motion.easing,
      duration: motion.duration,
    },
    shape: {
      borderRadius:
        designSystem === 'apple' ? 12 : designSystem === 'fluent' ? 0 : 4,
    },
    typography: {
      fontFamily:
        designSystem === 'apple'
          ? "'-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', sans-serif"
          : designSystem === 'fluent'
            ? "'Segoe UI', 'Segoe UI Web', sans-serif"
            : "'Inter', 'Roboto', sans-serif",
    },
    components: {
      // FORCE RIPPLE DISABLE
      MuiButtonBase: {
        defaultProps: {
          disableRipple: !isMaterial,
          disableTouchRipple: !isMaterial,
          focusRipple: isMaterial,
        },
      },
      MuiButton: {
        defaultProps: {
          disableRipple: !isMaterial,
          disableElevation: designSystem !== 'material',
        },
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'none',
            fontWeight: designSystem === 'apple' ? 500 : 400,
            transition: theme.transitions.create(['all'], {
              duration: theme.transitions.duration.short,
            }),

            // Eliminate any "ghost" ripples from CSS
            '& .MuiTouchRipple-root': {
              display: isMaterial ? 'block' : 'none !important',
            },

            // APPLE ARCHITECTURE: Press and Scale
            ...(designSystem === 'apple' && {
              '&:active': {
                transform: 'scale(0.96)',
                opacity: 0.8,
              },
            }),

            // FLUENT ARCHITECTURE: Boxy and High Contrast
            ...(designSystem === 'fluent' && {
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
              },
              '&:active': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            }),

            // NEUMORPHIC STYLE: Surface interactions
            ...(visualStyle === 'neumorphic' && {
              boxShadow: isDarkMode
                ? '4px 4px 8px #0b0b0b, -4px -4px 8px #252525'
                : '5px 5px 10px #d1d5db, -5px -5px 10px #ffffff',
              '&:hover': {
                boxShadow: isDarkMode
                  ? '2px 2px 4px #0b0b0b, -2px -2px 4px #252525'
                  : '2px 2px 5px #d1d5db, -2px -2px 5px #ffffff',
              },
              '&:active': {
                boxShadow: isDarkMode
                  ? 'inset 3px 3px 6px #0b0b0b, inset -3px -3px 6px #252525'
                  : 'inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff',
                transform: 'translateY(1px)',
              },
            }),

            // GLASS STYLE: Lighting and Blur shifts
            ...(visualStyle === 'glass' && {
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.15),
                backdropFilter: 'blur(30px)',
              },
            }),
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            transition: theme.transitions.create(['all'], {
              duration: theme.transitions.duration.standard,
              easing: theme.transitions.easing.easeInOut,
            }),
            borderRadius: theme.shape.borderRadius,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',

            ...(visualStyle === 'glass' && {
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            }),
            ...(visualStyle === 'neumorphic' && {
              backgroundColor: theme.palette.background.default,
              boxShadow: isDarkMode
                ? '12px 12px 24px #0b0b0b, -12px -12px 24px #252525'
                : '10px 10px 20px #d1d5db, -10px -10px 20px #ffffff',
            }),
            ...(visualStyle === 'minimalist' && {
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
            }),
          }),
        },
      },
    },
  });
};
