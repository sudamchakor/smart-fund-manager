import React, { useState } from "react";
import { Paper } from "@mui/material";
import ReadOnlyItem from "./ReadOnlyItem"; // Ensure this is the correct ReadOnlyItem
import FinancialModal from "../../features/profile/components/FinancialModal"; // Import FinancialModal

export const EditableIncomeExpenseItem = ({
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
  isGoal = false, // Add isGoal prop
  isReadOnly = false, // Add isReadOnly prop
  onEditGoal, // Add onEditGoal prop
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updatedData) => {
    if (onUpdate) {
      onUpdate(updatedData);
    }
    setIsEditing(false); // Close the modal after saving
  };

  const handleCloseModal = () => {
    setIsEditing(false); // Close the modal without saving
  };

  const formatCurrency = (val) =>
    `${currency}${Number(val).toLocaleString("en-IN")}`;

  const expenseRatio = totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0;
  const getExpenseColor = () => {
    if (expenseRatio > 40) return "error.main";
    if (expenseRatio > 30) return "warning.main";
    return "success.main";
  };

  // Determine the type for FinancialModal based on props
  const modalType = isIncome ? "income" : isExpense ? "expense" : ""; // Should only be income or expense here

  return (
    <>
      <ReadOnlyItem
        item={item}
        currency={currency}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onConfirmDelete={onDelete}
        deletionImpactMessage={`This will permanently remove the ${isExpense ? "expense" : "income"} from your cash flow calculations.`}
        isExpense={isExpense}
        isIncome={isIncome}
        isBudgetExceeded={isBudgetExceeded}
        budgetWarning={budgetWarning}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        isEditing={isEditing} // Pass isEditing state
        setIsEditing={setIsEditing} // Pass setIsEditing to ReadOnlyItem
        isGoal={isGoal} // Pass isGoal to ReadOnlyItem
        isReadOnly={isReadOnly} // Pass isReadOnly to ReadOnlyItem
        onEditGoal={onEditGoal} // Pass onEditGoal to ReadOnlyItem
        expenseRatio={expenseRatio}
        getExpenseColor={getExpenseColor}
        formatCurrency={formatCurrency}
        key={item.id}
      />

      {/* FinancialModal for editing */}
      <FinancialModal
        open={isEditing}
        onClose={handleCloseModal}
        type={modalType}
        asset={item} // Pass the item to be edited
        mode="edit" // Set mode to "edit"
        onSave={handleSave} // Pass the save handler
      />
    </>
  );
};

export default EditableIncomeExpenseItem;