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
  Paper,
  Stack,
  Box,
  Chip,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

const getCategoryColor = (category) => {
  switch (category) {
    case 'basic':
      return 'info';
    case 'discretionary':
      return 'warning';
    case 'loan':
      return 'error';
    case 'goal':
      return 'success';
    case 'goal-one-time':
      return 'primary';
    case 'investment':
      return 'secondary';
    default:
      return 'default';
  }
};

export default function CommonDetailsModal({
  open,
  onClose,
  title,
  items,
  currency,
  formatCurrency,
}) {
  const theme = useTheme();

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
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
        sx: {
          borderRadius: 3,
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '400px', overflowY: 'auto' }}>
        <List sx={{ p: 0 }}>
          {items.length > 0 ? (
            items.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 1 }}> {/* Reduced margin-bottom */}
                <Paper
                  elevation={1}
                  sx={{
                    width: '100%',
                    p: 1.5, // Reduced padding
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
                        variant="subtitle2" // Reduced variant from subtitle1
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
                            sx={{ height: 18, fontSize: '0.7rem' }} // Reduced height and font size
                          />
                        )}
                        {item.isFunded && (
                          <Chip
                            label="Funded"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.7rem', fontWeight: 'bold' }} // Reduced height and font size
                          />
                        )}
                      </Stack>
                    </Box>
                    <Typography 
                      variant="subtitle1" // Reduced variant from h6
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
              <Typography variant="body2" color="text.secondary">No items to display.</Typography>
            </ListItem>
          )}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1.5, justifyContent: 'space-between' }}>
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
