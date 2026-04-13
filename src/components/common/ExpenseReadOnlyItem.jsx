import {
  Box,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";

const expenseReadOnlyItem = (props) => {
  const {
    item,
    currency,
    onUpdate,
    onDelete,
    isExpense = false,
    isIncome = false,
    isBudgetExceeded = false,
    budgetWarning = "",
    totalIncome = 0,
    totalExpenses = 0,
    isEditing,
    setIsEditing,
    expenseRatio,
    getExpenseColor,
    formatCurrency,
    isReadOnly = false,
  } = props;
  return (
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
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {item.name}
            </Typography>
            {isExpense && totalIncome > 0 && (
              <Typography variant="caption" color="textSecondary">
                {expenseRatio.toFixed(1)}% of income
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
        </Box>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          {!isReadOnly && (
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => onDelete(item.id)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default expenseReadOnlyItem;
