import { createTheme, alpha } from '@mui/material/styles';
import { getAppTheme, themePresets, themeColors } from '../../src/theme/ThemeConfig';

// Mock getMotionProfile as it's an external dependency
jest.mock('../../src/theme/motionProfiles', () => ({
  getMotionProfile: jest.fn(() => ({
    easing: { easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', sharp: 'cubic-bezier(0.4, 0, 0.6, 1)' },
    duration: { short: 200, standard: 300 },
  })),
}));

describe('ThemeConfig - getAppTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Palette Mode and Colors ---
  it('should return a dark theme when themeMode is "dark"', () => {
    const theme = getAppTheme('dark', 'material', 'flat');
    const selectedColors = themeColors.find(t => t.value === 'dark'); // Assuming 'dark' is a themeColor value
    const [primary, secondary, background, textPrimary, textSecondary] = selectedColors.colors;

    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.primary.main).toBe(primary);
    expect(theme.palette.background.default).toBe(background);
    expect(theme.palette.background.paper).toBe('#1C1B1F');
    expect(theme.palette.text.primary).toBe(textPrimary);
  });

  it('should return a light theme when themeMode is "dodgerblue" (default light)', () => {
    const theme = getAppTheme('dodgerblue', 'material', 'flat');
    const selectedColors = themeColors.find(t => t.value === 'dodgerblue');
    const [primary, secondary, background, textPrimary, textSecondary] = selectedColors.colors;

    expect(theme.palette.mode).toBe('light');
    expect(theme.palette.primary.main).toBe(primary);
    expect(theme.palette.background.default).toBe(background);
    expect(theme.palette.background.paper).toBe('#ffffff');
    expect(theme.palette.text.primary).toBe(textPrimary);
  });

  it('should return a light theme for an unknown themeMode, defaulting to first themeColor', () => {
    const theme = getAppTheme('unknown', 'material', 'flat');
    const defaultColors = themeColors[0].colors; // DodgerBlue
    const [primary, secondary, background, textPrimary, textSecondary] = defaultColors;

    expect(theme.palette.mode).toBe('light');
    expect(theme.palette.primary.main).toBe(primary);
    expect(theme.palette.background.default).toBe(background);
    expect(theme.palette.background.paper).toBe('#ffffff');
    expect(theme.palette.text.primary).toBe(textPrimary);
  });

  it('should handle "slate" themeMode for dark mode paper background', () => {
    const theme = getAppTheme('slate', 'material', 'flat');
    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.background.paper).toBe('#1E293B');
  });

  it('should handle "zinc" themeMode for dark mode paper background', () => {
    const theme = getAppTheme('zinc', 'material', 'flat');
    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.background.paper).toBe('#1C1B1F'); // Default dark paper
  });

  // --- Motion Profile Injection ---
  it('should inject motion profile easing and duration', () => {
    const theme = getAppTheme('light', 'material', 'flat');
    expect(theme.transitions.easing.easeInOut).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(theme.transitions.duration.standard).toBe(300);
  });

  // --- Shape (BorderRadius) ---
  it('should set borderRadius based on designSystem "apple"', () => {
    const theme = getAppTheme('light', 'apple', 'flat');
    expect(theme.shape.borderRadius).toBe(8);
  });

  it('should set borderRadius based on designSystem "fluent"', () => {
    const theme = getAppTheme('light', 'fluent', 'flat');
    expect(theme.shape.borderRadius).toBe(2);
  });

  it('should set borderRadius based on designSystem "material" (default)', () => {
    const theme = getAppTheme('light', 'material', 'flat');
    expect(theme.shape.borderRadius).toBe(4);
  });

  // --- Typography ---
  it('should set fontFamily based on designSystem "apple"', () => {
    const theme = getAppTheme('light', 'apple', 'flat');
    expect(theme.typography.fontFamily).toBe("'-apple-system', sans-serif");
  });

  it('should set fontFamily based on designSystem "material" (default)', () => {
    const theme = getAppTheme('light', 'material', 'flat');
    expect(theme.typography.fontFamily).toBe("'Inter', 'Roboto', sans-serif");
  });

  // --- MuiPaper Component Overrides (visualStyle) ---
  it('should apply "glass" visualStyle to MuiPaper', () => {
    const theme = getAppTheme('light', 'material', 'glass');
    const paperStyles = theme.components.MuiPaper.styleOverrides.root({ theme });
    expect(paperStyles.backgroundColor).toBe(alpha(theme.palette.background.paper, 0.7));
    expect(paperStyles.backdropFilter).toBe('blur(20px)');
    expect(paperStyles.border).toBe(`1px solid ${alpha(theme.palette.common.white, 0.1)}`);
  });

  it('should apply "neumorphic" visualStyle to MuiPaper (light mode)', () => {
    const theme = getAppTheme('light', 'material', 'neumorphic');
    const paperStyles = theme.components.MuiPaper.styleOverrides.root({ theme });
    expect(paperStyles.backgroundColor).toBe(theme.palette.background.default);
    expect(paperStyles.boxShadow).toBe("6px 6px 12px #d1d5db, -6px -6px 12px #ffffff");
  });

  it('should apply "neumorphic" visualStyle to MuiPaper (dark mode)', () => {
    const theme = getAppTheme('dark', 'material', 'neumorphic');
    const paperStyles = theme.components.MuiPaper.styleOverrides.root({ theme });
    expect(paperStyles.backgroundColor).toBe(theme.palette.background.default);
    expect(paperStyles.boxShadow).toBe("5px 5px 10px #0b0b0b, -5px -5px 10px #252525");
  });

  it('should apply "minimalist" visualStyle to MuiPaper', () => {
    const theme = getAppTheme('light', 'material', 'minimalist');
    const paperStyles = theme.components.MuiPaper.styleOverrides.root({ theme });
    expect(paperStyles.boxShadow).toBe('none');
    expect(paperStyles.border).toBe(`1px solid ${theme.palette.divider}`);
  });

  it('should apply "flat" visualStyle to MuiPaper (default)', () => {
    const theme = getAppTheme('light', 'material', 'flat');
    const paperStyles = theme.components.MuiPaper.styleOverrides.root({ theme });
    expect(paperStyles.boxShadow).toBe('0 2px 10px rgba(0,0,0,0.04)');
    expect(paperStyles.border).toBeUndefined(); // No custom border for flat
  });
});

describe('ThemeConfig - themePresets', () => {
  it('should export themePresets object', () => {
    expect(themePresets).toBeDefined();
    expect(Object.keys(themePresets).length).toBeGreaterThan(0);
  });

  it('each preset should have expected properties', () => {
    for (const key in themePresets) {
      const preset = themePresets[key];
      expect(preset).toHaveProperty('name');
      expect(typeof preset.name).toBe('string');
      expect(preset).toHaveProperty('arch');
      expect(typeof preset.arch).toBe('string');
      expect(preset).toHaveProperty('style');
      expect(typeof preset.style).toBe('string');
      expect(preset).toHaveProperty('desc');
      expect(typeof preset.desc).toBe('string');
      expect(preset).toHaveProperty('previewColor');
      expect(typeof preset.previewColor).toBe('string');
    }
  });
});

describe('ThemeConfig - themeColors', () => {
  it('should export themeColors array', () => {
    expect(themeColors).toBeDefined();
    expect(Array.isArray(themeColors)).toBe(true);
    expect(themeColors.length).toBeGreaterThan(0);
  });

  it('each color entry should have expected properties', () => {
    themeColors.forEach(colorEntry => {
      expect(colorEntry).toHaveProperty('name');
      expect(typeof colorEntry.name).toBe('string');
      expect(colorEntry).toHaveProperty('value');
      expect(typeof colorEntry.value).toBe('string');
      expect(colorEntry).toHaveProperty('colors');
      expect(Array.isArray(colorEntry.colors)).toBe(true);
      expect(colorEntry.colors.length).toBe(5); // Primary, Secondary, Background, TextPrimary, TextSecondary
      expect(colorEntry.colors.every(c => typeof c === 'string')).toBe(true);
    });
  });
});