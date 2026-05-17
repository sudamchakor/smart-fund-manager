import { createTheme, alpha } from '@mui/material';
import { getMotionProfile } from './motionProfiles';

// --- 1. PRE-CONFIGURED GALLERY PRESETS ---
export const themePresets = {
  modern_solid: { name: 'Modern Solid', arch: 'material', style: 'flat' },
  premium_glass: { name: 'Premium Glass', arch: 'apple', style: 'glass' },
  enterprise_pro: {
    name: 'Enterprise Pro',
    arch: 'fluent',
    style: 'minimalist',
  },
  soft_3d: { name: 'Soft & Deep', arch: 'apple', style: 'neumorphic' },
};

// --- 2. EXPANDED COLOR PALETTE ---
export const themeColors = [
  {
    name: 'System',
    value: 'system',
    colors: ['#0061A4', '#D1E4FF', '#F8FAFF', '#001D35', '#535F70'],
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

// --- 3. THEME GENERATOR ---
export const getAppTheme = (themeMode, designSystem, visualStyle) => {
  const selectedTheme =
    themeColors.find((t) => t.value === themeMode) || themeColors[0];
  const [primary, secondary, background, textPrimary, textSecondary] =
    selectedTheme.colors;

  const isDarkMode =
    themeMode === 'dark' || themeMode === 'zinc' || themeMode === 'slate';
  const isGlass = visualStyle === 'glass';
  const isNeumorphic = visualStyle === 'neumorphic';
  const isMinimalist = visualStyle === 'minimalist';

  const motion = getMotionProfile(designSystem);
  const isMaterial = designSystem === 'material';

  const baseRadius =
    designSystem === 'apple'
      ? '14px'
      : designSystem === 'fluent'
        ? '0px'
        : '8px';
  const innerRadius =
    designSystem === 'apple'
      ? '8px'
      : designSystem === 'fluent'
        ? '0px'
        : '4px';

  return createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: { main: primary },
      secondary: { main: secondary },
      background: {
        default: isNeumorphic
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
    transitions: { easing: motion.easing, duration: motion.duration },
    shape: { borderRadius: 4 },
    typography: {
      fontFamily:
        designSystem === 'apple'
          ? "'-apple-system', 'SF Pro Text', sans-serif"
          : "'Inter', sans-serif",
    },

    components: {
      MuiButton: {
        defaultProps: {
          disableRipple: !isMaterial,
          disableElevation: !isMaterial,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: designSystem === 'apple' ? 500 : 400,
            borderRadius: innerRadius,
            transition: 'all 0.2s ease-in-out',
            ...(designSystem === 'apple' && {
              '&:active': { transform: 'scale(0.96)' },
            }),
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            ...(isGlass && { backgroundColor: 'transparent !important' }),
          },
        },
      },
      // 🟢 THE FIX: Explicitly target the Mobile Drawer from Header.jsx
      MuiDrawer: {
        styleOverrides: {
          paper: {
            ...(isGlass && {
              backgroundColor: isDarkMode
                ? 'rgba(18, 18, 18, 0.65) !important'
                : 'rgba(255, 255, 255, 0.45) !important',
              backdropFilter: 'blur(24px) saturate(200%) !important',
              WebkitBackdropFilter: 'blur(24px) saturate(200%) !important',
              backgroundImage: 'none !important',
              borderRight: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'} !important`,
            }),
            ...(isMinimalist && {
              borderRight: '1px solid #e0e0e0 !important',
              boxShadow: 'none !important',
            }),
          },
        },
      },
      // 🟢 THE FIX: Add hover & select styles to the Mobile Drawer Lists
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: innerRadius,
            margin: '2px 8px',
            padding: '8px 14px',
            transition: 'all 0.15s ease',
            ...(isGlass && {
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
                color: primary,
              },
              '&.Mui-selected': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(0, 0, 0, 0.08)',
                color: primary,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: isDarkMode
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.12)',
                },
              },
            }),
          },
        },
      },
      // Forces Icons inside the Mobile Drawer to change color when you select/hover them
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: 'inherit',
            transition: 'color 0.15s ease',
          },
        },
      },
      MuiMenu: {
        defaultProps: { PaperProps: { sx: { mt: '8px' } } },
        styleOverrides: {
          paper: {
            borderRadius: baseRadius + ' !important',
            ...(isGlass && {
              backgroundColor: isDarkMode
                ? 'rgba(18, 18, 18, 0.6) !important'
                : 'rgba(255, 255, 255, 0.4) !important',
              backdropFilter: 'blur(24px) saturate(200%) !important',
              WebkitBackdropFilter: 'blur(24px) saturate(200%) !important',
              backgroundImage: 'none !important',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'} !important`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12) !important',
            }),
            ...(isMinimalist && {
              boxShadow: 'none !important',
              border: '1px solid #e0e0e0 !important',
            }),
          },
          list: { padding: '8px !important' },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: baseRadius + ' !important',
            ...(isGlass && {
              backgroundColor: isDarkMode
                ? 'rgba(18, 18, 18, 0.6) !important'
                : 'rgba(255, 255, 255, 0.4) !important',
              backdropFilter: 'blur(24px) saturate(200%) !important',
              WebkitBackdropFilter: 'blur(24px) saturate(200%) !important',
              backgroundImage: 'none !important',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'} !important`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12) !important',
            }),
            ...(isMinimalist && {
              boxShadow: 'none !important',
              border: '1px solid #e0e0e0 !important',
            }),
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: baseRadius + ' !important',
            ...(isGlass && {
              backgroundColor: isDarkMode
                ? 'rgba(18, 18, 18, 0.6) !important'
                : 'rgba(255, 255, 255, 0.4) !important',
              backdropFilter: 'blur(24px) saturate(200%) !important',
              WebkitBackdropFilter: 'blur(24px) saturate(200%) !important',
              backgroundImage: 'none !important',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'} !important`,
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2) !important',
            }),
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: innerRadius,
            margin: '2px 4px',
            padding: '8px 14px',
            fontSize: '0.94rem',
            ...(isGlass && {
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
                color: primary,
              },
              '&.Mui-selected': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(0, 0, 0, 0.08)',
                color: primary,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: isDarkMode
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.12)',
                },
              },
            }),
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: innerRadius,
            ...(isGlass && {
              backgroundColor: isDarkMode
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(8px)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(0, 0, 0, 0.1)',
              },
            }),
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
            borderRadius: baseRadius,
            ...(isGlass && {
              '&.MuiCard-root, &.MuiTableContainer-root': {
                backgroundColor: isDarkMode
                  ? 'rgba(30, 30, 30, 0.5)'
                  : 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
              },
            }),
            ...(isNeumorphic && {
              boxShadow: isDarkMode
                ? '12px 12px 24px #0b0b0b, -12px -12px 24px #252525'
                : '10px 10px 20px #d1d5db, -10px -10px 20px #ffffff',
            }),
            ...(isMinimalist && {
              boxShadow: 'none',
              border: '1px solid #e0e0e0',
            }),
          },
        },
      },
    },
  });
};

// --- 4. ANIMATION CONFIGURATIONS ---
export const textVariant = (delay) => ({
  hidden: { y: -50, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', duration: 1.25, delay: delay },
  },
});
export const fadeIn = (direction, type, delay, duration) => ({
  hidden: {
    x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
    y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: type,
      delay: delay,
      duration: duration,
      ease: 'easeOut',
    },
  },
});
export const zoomIn = (delay, duration) => ({
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'tween',
      delay: delay,
      duration: duration,
      ease: 'easeOut',
    },
  },
});
export const slideIn = (direction, type, delay, duration) => ({
  hidden: {
    x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
    y: direction === 'up' ? '100%' : direction === 'down' ? '-100%' : 0,
  },
  show: {
    x: 0,
    y: 0,
    transition: {
      type: type,
      delay: delay,
      duration: duration,
      ease: 'easeOut',
    },
  },
});
export const staggerContainer = (staggerChildren, delayChildren) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerChildren,
      delayChildren: delayChildren || 0,
    },
  },
});
export const textVariant2 = () => ({
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween',
      ease: 'easeIn',
      staggerChildren: 0.02,
      delayChildren: 0.02,
    },
  },
});
export const footerVariants = () => ({
  hidden: {
    opacity: 0,
    y: 50,
    transition: { type: 'spring', stiffness: 300, damping: 140 },
  },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, delay: 0.5, duration: 1.2 },
  },
});
