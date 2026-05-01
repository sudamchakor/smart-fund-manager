import {
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Paper,
  Tooltip,  
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // Import ExpandMoreIcon
import React, { useState } from "react";
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
    isGoal = false, // Add isGoal prop
    onEditGoal, // Add onEditGoal prop
    onClick,
  } = props;
  const handleEditClick = (event) => {
    event.stopPropagation();
    if (!isReadOnly && setIsEditing) { // Ensure setIsEditing is provided
      setIsEditing(true); // Trigger the parent's modal
    } else if (isGoal && onEditGoal) { // Handle read-only goal items
      onEditGoal(item); // Pass the full item for goal editing
    }
  };
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    setOpenConfirmDelete(true);
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDelete(false);
  };

  const handleConfirmDelete = () => {
    if (onConfirmDelete) onConfirmDelete(item.id);
    else if (onDelete) onDelete(item.id);
    handleCloseConfirmDelete();
  };

  const renderItemContent = () => (
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
            {/* Show edit button if not read-only, OR if it's a read-only goal item with an edit handler */}
            {(!isReadOnly || (isGoal && onEditGoal)) && (
              <IconButton
                size="small"
                onClick={handleEditClick}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {/* Only show delete button if not read-only */}
            {(!isReadOnly && (onConfirmDelete || onDelete)) && (
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
  );

  const itemPaperProps = {
    sx: {
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
    },
    onClick: onClick,
  };

  return (
    <>
      {isGoal ? (
        <Accordion defaultExpanded={false} sx={{ mb: 1.5, borderRadius: 1.5, '&.Mui-expanded': { margin: '8px 0' } }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-${item.id}-content`}
            id={`panel-${item.id}-header`}
            sx={{
              p: 0, // Remove default padding to use Paper's padding
              '& .MuiAccordionSummary-content': { margin: 0 }, // Remove content margin
            }}
          >
            <Paper {...itemPaperProps} sx={{ ...itemPaperProps.sx, mb: 0, width: '100%' }}>
              {renderItemContent()}
            </Paper>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 2, px: 2, borderTop: '1px solid #e0e0e0', backgroundColor: 'background.paper' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Target Amount: {formatCurrency(item.targetAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Target Year: {item.targetYear}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {item.status}
            </Typography>
            {item.inflationAdjustedTarget && (
              <Typography variant="body2" color="text.secondary">
                Inflation-Adjusted Target: {formatCurrency(item.inflationAdjustedTarget)}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ) : (
        <Paper {...itemPaperProps}>
          {renderItemContent()}
        </Paper>
      )}

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

export default ReadOnlyItem;