import { alpha } from '@mui/material';

export const labelStyle = {
  fontWeight: 800,
  textTransform: 'uppercase',
  fontSize: '0.65rem',
  color: 'text.secondary',
  letterSpacing: 0.5,
  display: 'block',
  mb: 0.5,
};

export const getWellInputStyle = (theme, colorToken = 'primary') => ({
  fontWeight: 800,
  fontSize: '0.9rem',
  bgcolor: alpha(theme.palette[colorToken].main, 0.05),
  color: `${colorToken}.main`,
  px: 1.5,
  py: 0.5,
  borderRadius: 1,
  border: `1px solid ${alpha(theme.palette[colorToken].main, 0.1)}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    bgcolor: alpha(theme.palette[colorToken].main, 0.08),
  },
});
