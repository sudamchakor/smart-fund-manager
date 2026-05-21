import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Box,
  Chip,
  useTheme,
} from '@mui/material';
import { getModalStyle, getDialogTitleStyle, getDialogContentStyle, getDialogActionsStyle } from '../../theme/modalStyles';

export default function ExpenseDetailsModal({ open, onClose, title, items, currency, formatCurrency }) {
  const theme = useTheme();

  const getCategoryColor = (category) => {
    switch (category) {
      case 'basic': return 'info';
      case 'discretionary': return 'warning';
      case 'loan': return 'error';
      case 'goal': return 'success';
      case 'goal-one-time': return 'primary';
      case 'investment': return 'secondary';
      default: return 'default';
    }
  };

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      // Exclude funded items from the total sum
      if (item.isFunded) return sum;
      return sum + (item.amount || 0);
    }, 0);
  }, [items]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: getModalStyle(theme),
      }}
    >
      <DialogTitle sx={getDialogTitleStyle()}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={getDialogContentStyle()}>
        <List sx={{ p: 0 }}>
          {items.length > 0 ? (
            items.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                <Paper
                  elevation={1}
                  sx={{
                    width: '100%',
                    p: 1.5,
                    borderRadius: 2,
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    opacity: item.isFunded ? 0.7 : 1,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 700,
                        }}
                      >
                        {item.name} {item.year && `(${item.year})`}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        {item.category && (
                          <Chip
                            label={item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                            size="small"
                            color={getCategoryColor(item.category)}
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        )}
                        {item.isFunded && (
                          <Chip
                            label="Funded"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 'bold' }}
                          />
                        )}
                      </Stack>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 800, 
                        color: item.isFunded ? theme.palette.text.disabled : theme.palette.text.primary,
                      }}
                    >
                      {formatCurrency(item.amount)}
                    </Typography>
                  </Stack>
                </Paper>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No items to display." />
            </ListItem>
          )}
        </List>
      </DialogContent>
      <DialogActions sx={getDialogActionsStyle()}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Total: {formatCurrency(totalAmount)}
        </Typography>
        <Button onClick={onClose} sx={{ fontWeight: 600, color: 'text.secondary' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
