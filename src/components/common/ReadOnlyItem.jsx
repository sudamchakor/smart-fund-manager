import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function ReadOnlyItem({
  item,
  subItems,
  currency,
  isExpense,
  isIncome,
  isGoal,
  isReadOnly = false,
  onDelete,
  onEdit,
  onEditGoal,
  formatCurrency,
  totalIncome,
  expenseRatio,
  expenseColor,
  onConfirmDelete,
  deletionImpactMessage,
  onClick,
  taxRate,
}) {
  const theme = useTheme();
  const [showSubItems, setShowSubItems] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Dynamically resolve the indicator color based on the item's type
  const resolveItemColor = () => {
    if (isIncome) return theme.palette.success.main;
    if (isGoal) return theme.palette.primary.main;
    if (isExpense) {
      return expenseColor || theme.palette.error.main;
    }
    return alpha(theme.palette.divider, 0.2);
  };
  const itemColor = resolveItemColor();

  const handleDeleteClick = () => {
    if (onConfirmDelete) {
      setConfirmOpen(true);
    } else if (onDelete) {
      onDelete(item.id);
    }
  };

  const handleConfirmClose = (confirmed) => {
    setConfirmOpen(false);
    if (confirmed && onConfirmDelete) {
      onConfirmDelete();
    }
  };

  // Stable Event Handlers to prevent inline function recreation
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(item.id);
  };

  const handleEditGoalClick = (e) => {
    e.stopPropagation();
    onEditGoal(item.id);
  };

  const handleDeleteActionClick = (e) => {
    e.stopPropagation();
    handleDeleteClick();
  };

  const handleToggleSubItems = (e) => {
    e.stopPropagation();
    setShowSubItems(!showSubItems);
  };

  const taxSaved =
    isExpense && item.isTaxDeductible && taxRate ? item.amount * taxRate : 0;
  const netCost = isExpense && taxSaved > 0 ? item.amount - taxSaved : null;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        borderLeft: `4px solid ${itemColor}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black || '#000', 0.08)}`,
          bgcolor: alpha(theme.palette.action.hover, 0.04),
        },
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
            }}
          >
            {item.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatCurrency(item.amount, currency)} / {item.frequency}
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {isExpense && totalIncome > 0 && (
            <Chip
              label={`${((item.amount / totalIncome) * 100).toFixed(1)}%`}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.divider, 0.1),
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          )}
          {!isGoal && onEdit && !isReadOnly && (
            <IconButton
              size="small"
              onClick={handleEditClick}
              sx={{
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {isGoal && onEditGoal && (
            <IconButton
              size="small"
              onClick={handleEditGoalClick}
              sx={{
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {((onDelete && !isReadOnly) || onConfirmDelete) && (
            <IconButton
              size="small"
              onClick={handleDeleteActionClick}
              sx={{
                color: 'error.main',
                bgcolor: alpha(theme.palette.error.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
          {subItems && subItems.length > 0 && (
            <IconButton
              size="small"
              onClick={handleToggleSubItems}
              sx={{
                color: 'text.secondary',
                bgcolor: alpha(theme.palette.divider, 0.05),
                '&:hover': { bgcolor: alpha(theme.palette.divider, 0.1) },
              }}
            >
              {showSubItems ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </Stack>
      </Stack>

      {netCost !== null && (
        <Tooltip
          title={`Original: ${formatCurrency(
            item.amount,
            currency,
          )}, Tax Saved: ${formatCurrency(taxSaved, currency)}`}
          arrow
        >
          <Chip
            label={`Net Cost: ${formatCurrency(netCost, currency)}`}
            size="small"
            color="success"
            variant="outlined"
            sx={{ mt: 1, fontWeight: 600 }}
          />
        </Tooltip>
      )}

      {showSubItems && subItems && subItems.length > 0 && (
        <Box
          sx={{
            mt: 1.5,
            pl: 2,
            borderLeft: '2px solid',
            borderColor: alpha(theme.palette.divider, 0.1),
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {subItems.map((sub, index) => (
            <ReadOnlyItem
              key={sub.id || index}
              item={sub}
              currency={currency}
              isExpense={true}
              isReadOnly={true}
              formatCurrency={formatCurrency}
              totalIncome={totalIncome}
            />
          ))}
        </Box>
      )}

      {/* Conditionally render to prevent DOM pollution */}
      {confirmOpen && (
        <Dialog
          open={confirmOpen}
          onClose={() => handleConfirmClose(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: `0 24px 64px ${alpha(theme.palette.common.black || '#000', 0.2)}`,
            },
          }}
        >
          <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 900 }}>
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              id="alert-dialog-description"
              sx={{ fontWeight: 600, color: 'text.secondary' }}
            >
              {deletionImpactMessage ||
                'Are you sure you want to delete this item?'}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => handleConfirmClose(false)}
              sx={{ fontWeight: 700, color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleConfirmClose(true)}
              autoFocus
              variant="contained"
              color="error"
              sx={{ fontWeight: 800, px: 3, borderRadius: 2 }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
