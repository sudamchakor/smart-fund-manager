import { alpha } from '@mui/material';

export const getSectionHeaderStyle = (theme) => ({
  fontWeight: 800,
  textTransform: 'uppercase',
  color: 'primary.main',
  letterSpacing: 1,
  fontSize: '0.85rem',
  mt: 5,
  mb: 2,
  borderBottom: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
  pb: 1,
});

export const subHeaderStyle = {
  fontWeight: 800,
  color: 'text.primary',
  mt: 3,
  mb: 1,
  fontSize: '1rem',
};

export const bodyStyle = {
  color: 'text.secondary',
  lineHeight: 1.7,
  mb: 2,
  fontSize: '0.9rem',
  fontWeight: 500,
};

export const listStyle = {
  color: 'text.secondary',
  fontSize: '0.9rem',
  lineHeight: 1.7,
  paddingLeft: '1.5rem',
  marginBottom: '1.5rem',
  '& li': {
    marginBottom: '0.5rem',
  },
  '& strong': {
    color: 'text.primary',
    fontWeight: 700,
  },
};
