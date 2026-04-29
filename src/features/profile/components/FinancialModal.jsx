import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import { useDispatch } from "react-redux";
import IncomeExpenseForm from "../../../components/common/IncomeExpenseForm";
import { addIncome, addExpense, updateIncome, updateExpense } from "../../../store/profileSlice"; // Import updateIncome, updateExpense
import { addAsset, updateAsset } from "../../corpus/corpusSlice";

const CorpusForm = ({ onSave, onCancel, assetToEdit, mode }) => {
  const [newAsset, setNewAsset] = useState({
    label: "",
    value: "",
    expectedReturn: "",
    category: "Equity",
  });

  useEffect(() => {
    if (assetToEdit && mode === "edit") {
      setNewAsset({
        id: assetToEdit.id,
        label: assetToEdit.label,
        value: assetToEdit.value,
        expectedReturn: assetToEdit.expectedReturn,
        category: assetToEdit.category,
      });
    } else {
      setNewAsset({
        label: "",
        value: "",
        expectedReturn: "",
        category: "Equity",
      });
    }
  }, [assetToEdit, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAsset({ ...newAsset, [name]: value });
  };

  const handleSave = () => {
    if (newAsset.label && newAsset.value && newAsset.expectedReturn) {
      onSave(newAsset);
    }
  };

  return (
    <>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="label"
          label="Asset Name"
          type="text"
          fullWidth
          variant="outlined"
          value={newAsset.label}
          onChange={handleInputChange}
        />
        <TextField
          margin="dense"
          name="value"
          label="Current Amount"
          type="number"
          fullWidth
          variant="outlined"
          value={newAsset.value}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <Typography>₹</Typography>,
          }}
        />
        <TextField
          margin="dense"
          name="expectedReturn"
          label="Expected Return"
          type="number"
          fullWidth
          variant="outlined"
          value={newAsset.expectedReturn}
          onChange={handleInputChange}
          InputProps={{
            endAdornment: <Typography>%</Typography>,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {mode === "edit" ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </>
  );
};

export default function FinancialModal({ open, onClose, type, asset, mode }) {
  const dispatch = useDispatch();

  const getTitle = () => {
    switch (type) {
      case "income":
        return mode === "edit" ? "Edit Income" : "Add New Income";
      case "expense":
        return mode === "edit" ? "Edit Expense" : "Add New Expense";
      case "corpus":
        return mode === "edit" ? "Edit Asset" : "Add New Asset";
      default:
        return "";
    }
  };

  const handleFormSave = (formData) => {
    if (mode === "edit") {
      if (type === "income") {
        dispatch(updateIncome({ ...formData, id: asset.id }));
      } else if (type === "expense") {
        dispatch(updateExpense({ ...formData, id: asset.id }));
      } else if (type === "corpus") {
        dispatch(updateAsset({ ...formData, id: asset.id }));
      }
    } else {
      // Add operation
      if (type === "income") {
        dispatch(addIncome(formData));
      } else if (type === "expense") {
        dispatch(addExpense(formData));
      } else if (type === "corpus") {
        const payload = { ...formData, id: Date.now() }; // id will be generated in prepare for addAsset
        dispatch(
          addAsset(
            payload.label,
            payload.value,
            payload.expectedReturn,
            payload.category,
          ),
        );
      }
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <Divider sx={{ mb: 2 }} />
      {type === "corpus" ? (
        <CorpusForm onSave={handleFormSave} onCancel={onClose} assetToEdit={asset} mode={mode} />
      ) : (
        <DialogContent>
          <IncomeExpenseForm
            initialData={mode === "edit" ? asset : null} // Pass initialData for editing
            isExpense={type === "expense"}
            onSave={handleFormSave}
            onCancel={onClose}
            submitLabel={mode === "edit" ? "Update" : "Add"}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}