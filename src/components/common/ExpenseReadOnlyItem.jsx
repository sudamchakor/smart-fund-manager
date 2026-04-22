import {
  Box,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Grid, // Import Grid
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useState } from "react";

const ExpenseReadOnlyItem = (props) => {
  const {
    item,
    currency,
    onUpdate, // Not used in read-only, but kept for consistency if it becomes editable
    onDelete, // This will now trigger the confirmation dialog
    onConfirmDelete, // New prop: function to call when deletion is confirmed
    deletionImpactMessage, // New prop: message to show in deletion confirmation
    isExpense = false,
    isIncome = false,
    isBudgetExceeded = false,
    budgetWarning = "",
    totalIncome = 0,
    isEditing, // Not used in read-only
    setIsEditing, // Not used in read-only
    expenseRatio,
    getExpenseColor,
    formatCurrency,
    isReadOnly = false,
    onClick, // New prop: function to call when the item itself is clicked
  } = props;

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  const handleDeleteClick = (event) => {
    event.stopPropagation(); // Prevent onClick of the Paper from firing
    setOpenConfirmDelete(true);
  };

  const handleEditClick = (event) => {
    event.stopPropagation(); // Prevent onClick of the Paper from firing
    if (!isReadOnly && setIsEditing) {
      setIsEditing(true);
    }
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDelete(false);
  };

  const handleConfirmDelete = () => {
    if (onConfirmDelete)
      onConfirmDelete(item.id); // Call the provided confirmation handler
    else if (onDelete) onDelete(item.id); // Fallback to standard onDelete prop
    handleCloseConfirmDelete();
  };

  return (
    <>
      <Paper
        sx={{
          p: 2,
          mb: 1.5,
          border: isBudgetExceeded ? "2px solid #f44336" : "1px solid #e0e0e0",
          backgroundColor: isBudgetExceeded ? "#ffebee" : "background.paper",
          borderRadius: 1.5,
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            cursor: onClick ? "pointer" : "default", // Show pointer if clickable
          },
        }}
        onClick={onClick} // Attach onClick handler to the Paper component
      >
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12}> {/* Changed to xs={12} for full width */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 0.5,
                flexWrap: "wrap",
              }} // Allow chips to wrap
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%", // Ensure this div takes full width of its parent
                }}
              >
                <div>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {item.name}
                  </Typography>
                </div>
                <div>
                  {!isReadOnly && (
                    <IconButton
                      size="small"
                      onClick={handleEditClick} // Use new handler
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  {(onConfirmDelete || onDelete) && (
                    <IconButton
                      size="small"
                      onClick={handleDeleteClick} // Use new handler
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </div>
              </div>
              {isExpense && totalIncome > 0 && (
                <Typography variant="caption" color="textSecondary">
                  {expenseRatio ? expenseRatio.toFixed(1) : 0}% of income
                </Typography>
              )}
              {isExpense && item.category && (
                <Chip
                  label={item.category === "basic" ? "Basic" : "Discretionary"}
                  size="small"
                  variant="outlined"
                />
              )}
              {(isExpense || isIncome) && item.frequency && (
                <Chip
                  label={
                    item.frequency.charAt(0).toUpperCase() +
                    item.frequency.slice(1)
                  }
                  size="small"
                  variant="filled"
                  color="info"
                />
              )}

              {isBudgetExceeded && (
                <Tooltip title={budgetWarning}>
                  <WarningIcon
                    fontSize="small"
                    sx={{ color: "error.main", cursor: "help" }}
                  />
                </Tooltip>
              )}
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: isExpense ? getExpenseColor() : "success.main",
                fontWeight: 600,
              }}
            >
              {formatCurrency(item.amount)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={openConfirmDelete}
        onClose={handleCloseConfirmDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete "{item.name}"?
            <br />
            <br />
            <strong>Impact of deletion:</strong>
            <br />
            {deletionImpactMessage || "This item will be permanently removed."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} autoFocus color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExpenseReadOnlyItem;
