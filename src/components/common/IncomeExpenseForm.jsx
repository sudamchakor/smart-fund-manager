import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Collapse,
  Typography,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import SliderInput from './SliderInput';
import {
  incomeTypes,
  expenseCategories,
  taxExpenseCategories,
} from '../../utils/taxRules';
import { labelStyle, getWellInputStyle } from '../../styles/formStyles';

const currentYear = new Date().getFullYear();

export default function IncomeExpenseForm({
  initialData,
  isExpense = false,
  onSave,
  onCancel,
  submitLabel = 'Save',
}) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    startYear: currentYear,
    endYear: currentYear + 10,
    category: 'basic',
    incomeType: 'Salary',
    isTaxDeductible: false,
    taxCategory: '',
    ...initialData,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...initialData,
    }));
  }, [initialData]);

  const [startYearOpen, setStartYearOpen] = useState(false);
  const [endYearOpen, setEndYearOpen] = useState(false);

  const handleSubmit = () => {
    if (formData.name && formData.amount > 0) {
      let finalAmount = Number(formData.amount);
      if (!isExpense && formData.incomeType === 'Rental Income') {
        finalAmount *= 0.7; // Apply 30% standard deduction
      }
      onSave({ ...formData, amount: finalAmount });
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
      <Grid container spacing={2}>
        {!isExpense && (
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle} id="income-type-label">
              Income Type
            </Typography>
            <FormControl variant="standard" size="small" fullWidth>
              <Select
                labelId="income-type-label"
                value={formData.incomeType || 'Salary'}
                onChange={(e) =>
                  setFormData({ ...formData, incomeType: e.target.value })
                }
                disableUnderline
                sx={getWellInputStyle(theme)}
              >
                {incomeTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12} sm={isExpense ? 12 : 6}>
          <Typography sx={labelStyle} id="source-label">
            {isExpense ? 'Expense Name' : 'Source'}
          </Typography>
          <TextField
            aria-labelledby="source-label"
            variant="standard"
            fullWidth
            size="small"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            InputProps={{
              disableUnderline: true,
              sx: getWellInputStyle(theme),
            }}
          />
        </Grid>

        {isExpense ? (
          <Grid item xs={12}>
            <SliderInput
              label="Amount"
              value={Number(formData.amount) || 0}
              onChange={(val) => setFormData({ ...formData, amount: val })}
              min={0}
              max={Math.max(1000000, Number(formData.amount) * 2 || 1000000)}
              step={500}
              showInput={true}
            />
          </Grid>
        ) : (
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle} id="frequency-label">
              Frequency
            </Typography>
            <FormControl variant="standard" size="small" fullWidth>
              <Select
                labelId="frequency-label"
                value={formData.frequency || 'monthly'}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
                disableUnderline
                sx={getWellInputStyle(theme)}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {isExpense ? (
          <>
            <Grid item xs={12} sm={6}>
              <Typography sx={labelStyle} id="category-label">
                Category
              </Typography>
              <FormControl variant="standard" size="small" fullWidth>
                <Select
                  labelId="category-label"
                  value={formData.category || 'basic'}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  disableUnderline
                  sx={getWellInputStyle(theme)}
                >
                  {expenseCategories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={labelStyle} id="expense-frequency-label">
                Frequency
              </Typography>
              <FormControl variant="standard" size="small" fullWidth>
                <Select
                  labelId="expense-frequency-label"
                  value={formData.frequency || 'monthly'}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  disableUnderline
                  sx={getWellInputStyle(theme)}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isTaxDeductible}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isTaxDeductible: e.target.checked,
                      })
                    }
                  />
                }
                label="Is this tax-deductible?"
              />
            </Grid>
            <Grid item xs={12}>
              <Collapse in={formData.isTaxDeductible}>
                <Typography sx={labelStyle} id="exemption-category-label">
                  Exemption Category
                </Typography>
                <FormControl variant="standard" fullWidth size="small">
                  <Select
                    labelId="exemption-category-label"
                    value={formData.taxCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, taxCategory: e.target.value })
                    }
                    disableUnderline
                    sx={getWellInputStyle(theme)}
                  >
                    {taxExpenseCategories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Collapse>
            </Grid>
          </>
        ) : (
          <Grid item xs={12} sm={12}>
            <SliderInput
              label="Amount"
              value={Number(formData.amount) || 0}
              onChange={(val) => setFormData({ ...formData, amount: val })}
              min={0}
              max={Math.max(10000000, Number(formData.amount) * 2 || 10000000)}
              step={1000}
              showInput={true}
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <Typography sx={labelStyle} id="start-year-label">
            Start Year
          </Typography>
          <DatePicker
            label="Start Year"
            views={['year', 'month']}
            openTo="month"
            open={startYearOpen}
            onOpen={() => setStartYearOpen(true)}
            onClose={() => setStartYearOpen(false)}
            value={dayjs(`${Number(formData.startYear) || currentYear}-01-01`)}
            onChange={(newValue) =>
              setFormData({
                ...formData,
                startYear: newValue ? newValue.year() : currentYear,
              })
            }
            slotProps={{
              textField: {
                variant: 'standard',
                size: 'small',
                fullWidth: true,
                onClick: () => setStartYearOpen(true),
                'aria-labelledby': 'start-year-label',
                InputProps: {
                  disableUnderline: true,
                  sx: getWellInputStyle(theme),
                },
              },
            }}
            minDate={dayjs(`${currentYear - 50}-01-01`)}
            maxDate={dayjs(`${currentYear + 50}-12-31`)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography sx={labelStyle} id="end-year-label">
            End Year
          </Typography>
          <DatePicker
            label="End Year"
            views={['year', 'month']}
            openTo="month"
            open={endYearOpen}
            onOpen={() => setEndYearOpen(true)}
            onClose={() => setEndYearOpen(false)}
            value={dayjs(
              `${Number(formData.endYear) || currentYear + 10}-01-01`,
            )}
            onChange={(newValue) =>
              setFormData({
                ...formData,
                endYear: newValue ? newValue.year() : currentYear + 10,
              })
            }
            slotProps={{
              textField: {
                variant: 'standard',
                size: 'small',
                fullWidth: true,
                onClick: () => setEndYearOpen(true),
                'aria-labelledby': 'end-year-label',
                InputProps: {
                  disableUnderline: true,
                  sx: getWellInputStyle(theme),
                },
              },
            }}
            minDate={dayjs(
              `${Number(formData.startYear) || currentYear}-01-01`,
            )}
            maxDate={dayjs(`${currentYear + 50}-12-31`)}
          />
        </Grid>
      </Grid>
      <DialogActions>
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        <Button variant="contained" onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Box>
  );
}
