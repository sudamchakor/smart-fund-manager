import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Typography,
  Divider,
  Stack,
  InputAdornment,
  Box,
  Grid,
  IconButton,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AttachMoney as IncomeIcon,
  MoneyOff as ExpenseIcon,
  AccountBalanceWallet as AssetIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import IncomeExpenseForm from '../../../components/common/IncomeExpenseForm';
import {
  addIncome,
  addExpense,
  updateIncome,
  updateExpense,
} from '../../../store/profileSlice';
import {
  addAsset,
  updateAsset,
  addInvestmentType,
  selectInvestmentTypes,
} from '../../corpus/corpusSlice';
import {
  updateDeclaration,
  updateHouseProperty,
  updateMonthData,
} from '../../../store/taxSlice';

const CorpusForm = ({ onSave, onCancel, assetToEdit, mode }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const investmentTypes = useSelector(selectInvestmentTypes);
  const [newAsset, setNewAsset] = useState({
    label: '',
    value: '',
    expectedReturn: '',
    category: 'Equity',
  });
  const [newInvestmentType, setNewInvestmentType] = useState('');

  useEffect(() => {
    if (assetToEdit && mode === 'edit') {
      setNewAsset({ ...assetToEdit });
    }
  }, [assetToEdit, mode]);

  const handleAddInvestmentType = () => {
    if (newInvestmentType.trim() !== '') {
      dispatch(
        addInvestmentType({
          value: newInvestmentType,
          label: newInvestmentType,
        }),
      );
      setNewInvestmentType('');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
      }}
    >
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              label="Asset Name"
              placeholder="e.g., HDFC Top 100, ICICI Liquid Fund..."
              fullWidth
              variant="outlined"
              value={newAsset.label}
              onChange={(e) =>
                setNewAsset({ ...newAsset, label: e.target.value })
              }
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Category"
              value={newAsset.category}
              onChange={(e) =>
                setNewAsset({ ...newAsset, category: e.target.value })
              }
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {investmentTypes.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Expected Return"
              type="number"
              fullWidth
              value={newAsset.expectedReturn}
              onChange={(e) =>
                setNewAsset({ ...newAsset, expectedReturn: e.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: 'text.secondary' }}
                    >
                      %
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Current Value"
              type="number"
              fullWidth
              value={newAsset.value}
              onChange={(e) =>
                setNewAsset({ ...newAsset, value: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>
                      ₹
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Add New Investment Type"
              fullWidth
              value={newInvestmentType}
              onChange={(e) => setNewInvestmentType(e.target.value)}
            />
            <Button onClick={handleAddInvestmentType}>Add Type</Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mx: -4, mb: -3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            px: 4, // Re-applies the horizontal padding for the buttons
            py: 2.5,
            bgcolor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Button
            onClick={onCancel}
            variant="text"
            color="inherit"
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(newAsset)}
            variant="contained"
            elevation={0}
            sx={{
              px: 4,
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {mode === 'edit' ? 'Update Asset' : 'Add to Corpus'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default function FinancialModal({ open, onClose, type, asset, mode }) {
  const dispatch = useDispatch();
  const theme = useTheme();

  const config = {
    income: {
      title: 'Income',
      icon: <IncomeIcon />,
      color: theme.palette.success.main,
    },
    expense: {
      title: 'Expense',
      icon: <ExpenseIcon />,
      color: theme.palette.error.main,
    },
    corpus: {
      title: 'Investment Asset',
      icon: <AssetIcon />,
      color: theme.palette.primary.main,
    },
  };

  const active = config[type] || config.corpus;

  const handleFormSave = (formData) => {
    if (formData.isTaxDeductible && formData.taxCategory) {
      const annualAmount =
        formData.frequency === 'monthly'
          ? formData.amount * 12
          : formData.frequency === 'quarterly'
            ? formData.amount * 4
            : formData.amount;

      switch (formData.taxCategory) {
        case 'hra':
          dispatch(
            updateDeclaration({
              section: 'exemptions',
              field: 'hra',
              value: { produced: annualAmount },
            }),
          );
          break;
        case '80c':
          dispatch(
            updateDeclaration({
              section: 'sec80C',
              field: 'standard80C',
              value: annualAmount,
            }),
          );
          break;
        case '80d':
          dispatch(
            updateDeclaration({
              section: 'deductions',
              field: 'sec80D',
              value: { produced: annualAmount },
            }),
          );
          break;
        case '24b':
          dispatch(updateHouseProperty({ interest: annualAmount }));
          break;
        default:
          break;
      }
    }

    if (type === 'expense' && formData.name.toLowerCase().includes('rent')) {
      const monthlyAmount =
        formData.frequency === 'monthly'
          ? formData.amount
          : formData.frequency === 'quarterly'
            ? formData.amount / 3
            : formData.amount / 12;
      dispatch(
        updateMonthData({
          index: 0,
          field: 'rent',
          value: monthlyAmount,
          populateRemaining: true,
        }),
      );
    }

    if (mode === 'edit') {
      const payload = { ...formData, id: asset.id };
      if (type === 'income') dispatch(updateIncome(payload));
      else if (type === 'expense') dispatch(updateExpense(payload));
      else if (type === 'corpus') dispatch(updateAsset(payload));
    } else {
      if (type === 'income') dispatch(addIncome(formData));
      else if (type === 'expense') dispatch(addExpense(formData));
      else if (type === 'corpus') {
        dispatch(addAsset(formData));
      }
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' },
      }}
    >
      <DialogTitle sx={{ px: 4, py: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                bgcolor: alpha(active.color, 0.15),
                color: active.color,
                p: 1.2,
                borderRadius: 2.5,
                display: 'flex',
              }}
            >
              {active.icon}
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 900, lineHeight: 1.2, color: 'text.primary' }}
              >
                {mode === 'edit'
                  ? `Edit ${active.title}`
                  : `Add ${active.title}`}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 600 }}
              >
                Manage your financial details
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ bgcolor: alpha(theme.palette.background.default, 0.8) }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 4, py: 4 }}>
        {type === 'corpus' ? (
          <CorpusForm
            onSave={handleFormSave}
            onCancel={onClose}
            assetToEdit={asset}
            mode={mode}
          />
        ) : (
          <IncomeExpenseForm
            initialData={mode === 'edit' ? asset : null}
            isExpense={type === 'expense'}
            onSave={handleFormSave}
            onCancel={onClose}
            submitLabel={mode === 'edit' ? 'Apply Changes' : 'Add Entry'}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
