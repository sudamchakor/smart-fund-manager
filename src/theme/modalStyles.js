import { alpha } from '@mui/material/styles';

export const getModalStyle = (theme) => ({
  borderRadius: 3,
  backgroundImage: 'none',
  boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.15)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
});

export const getDialogTitleStyle = () => ({
  pb: 1,
  fontWeight: 800,
});

export const getDialogContentStyle = () => ({
  p: 2,
  '&.MuiDialogContent-root': {
    overflowY: 'auto',
    maxHeight: '60vh',
  },
});

export const getDialogActionsStyle = () => ({
  p: 2,
  pt: 1.5,
  justifyContent: 'space-between',
});