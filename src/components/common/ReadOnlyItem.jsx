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
  Grid,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useState } from "react";
import FinancialModal from "../../features/profile/components/FinancialModal"; // Import FinancialModal

const ReadOnlyItem = (props) => {
  const {
    item,
    currency,
    onUpdate,
    onDelete,
    onConfirmDelete,
    deletionImpactMessage,
    isExpense = false,
    isIncome = false,
    isBudgetExceeded = false,
    budgetWarning = "",
    totalIncome = 0,
    isEditing,
    setIsEditing,
    expenseRatio,
    getExpenseColor,
    formatCurrency,
    isReadOnly = false,
    onClick,
  } = props;

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for FinancialModal

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    setOpenConfirmDelete(true);
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    if (!isReadOnly) {
      setIsModalOpen(true); // Open the FinancialModal
    }
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDelete(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (onConfirmDelete) onConfirmDelete(item.id);
    else if (onDelete) onDelete(item.id);
    handleCloseConfirmDelete();
  };

  // Determine the type for FinancialModal based on props
  const modalType = isIncome ? "income" : isExpense ? "expense" : "corpus";

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
            cursor: onClick ? "pointer" : "default",
          },
        }}
        onClick={onClick}
      >
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: { xs: 0.5, sm: 1 },
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {item.name}
                  <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}> :</Box>
                </Typography>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        isExpense && getExpenseColor
                          ? getExpenseColor()
                          : "success.main",
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(item.amount)}
                  </Typography>
                  {(isExpense || isIncome) && item.frequency && (
                    <Typography variant="body2" color="textSecondary">
                      / {item.frequency}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexShrink: 0 }}>
                {!isReadOnly && (
                  <IconButton
                    size="small"
                    onClick={handleEditClick}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {(onConfirmDelete || onDelete) && (
                  <IconButton
                    size="small"
                    onClick={handleDeleteClick}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
                mt: 1,
              }}
            >
              {isExpense && totalIncome > 0 && (
                <Typography variant="caption" color="textSecondary">
                  ({expenseRatio ? expenseRatio.toFixed(1) : 0}% of income)
                </Typography>
              )}
              {isExpense && item.category && (
                <Chip
                  label={
                    item.category === "basic" ? "Basic" : "Discretionary"
                  }
                  size="small"
                  variant="outlined"
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

      {/* FinancialModal for editing */}
      <FinancialModal
        open={isModalOpen}
        onClose={handleCloseModal}
        type={modalType}
        asset={item} // Pass the item to be edited
        mode="edit" // Set mode to "edit"
      />
    </>
  );
};

export default ReadOnlyItem;