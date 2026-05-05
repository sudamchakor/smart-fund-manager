import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  DeleteOutline as DeleteIcon,
  ReceiptLong as ExpenseIcon,
} from '@mui/icons-material';
import SliderInput from '../../../../components/common/SliderInput';
import { labelStyle, getWellInputStyle } from '../../../../styles/formStyles';

export default function FixedLiabilities({
  expense,
  setExpense,
  expensesList,
  setExpensesList,
  handleAddExpense,
}) {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <ExpenseIcon sx={{ fontSize: '1.2rem', color: 'warning.main' }} />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'warning.main',
          }}
        >
          Operational Liabilities
        </Typography>
      </Stack>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.warning.main, 0.03),
          border: `1px dashed ${alpha(theme.palette.warning.main, 0.2)}`,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Liability Identifier</Typography>
            <TextField
              variant="standard"
              fullWidth
              size="small"
              value={expense.name}
              onChange={(e) => setExpense({ ...expense, name: e.target.value })}
              InputProps={{
                disableUnderline: true,
                sx: getWellInputStyle(theme, 'warning'),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SliderInput
              label="Amount"
              value={Number(expense.amount) || 0}
              onChange={(val) => setExpense({ ...expense, amount: val })}
              min={0}
              max={1000000}
              step={500}
              color="warning"
              showInput={true}
              isInline={false}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Classification</Typography>
            <FormControl variant="standard" fullWidth>
              <Select
                value={expense.category}
                onChange={(e) =>
                  setExpense({ ...expense, category: e.target.value })
                }
                disableUnderline
                sx={getWellInputStyle(theme, 'warning')}
              >
                <MenuItem value="basic" sx={{ fontWeight: 700 }}>
                  Mandatory Need
                </MenuItem>
                <MenuItem value="discretionary" sx={{ fontWeight: 700 }}>
                  Discretionary Want
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Frequency</Typography>
            <FormControl variant="standard" fullWidth>
              <Select
                value={expense.frequency}
                onChange={(e) =>
                  setExpense({ ...expense, frequency: e.target.value })
                }
                disableUnderline
                sx={getWellInputStyle(theme, 'warning')}
              >
                <MenuItem value="monthly" sx={{ fontWeight: 700 }}>
                  Monthly
                </MenuItem>
                <MenuItem value="quarterly" sx={{ fontWeight: 700 }}>
                  Quarterly
                </MenuItem>
                <MenuItem value="yearly" sx={{ fontWeight: 700 }}>
                  Yearly
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <SliderInput
              label="Start Year"
              value={expense.startYear}
              onChange={(val) => setExpense({ ...expense, startYear: val })}
              min={currentYear}
              max={currentYear + 50}
              step={1}
              color="warning"
              isInline={false}
              showInput={true}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SliderInput
              label="End Year"
              value={expense.endYear}
              onChange={(val) => setExpense({ ...expense, endYear: val })}
              min={expense.startYear}
              max={currentYear + 50}
              step={1}
              color="warning"
              isInline={false}
              showInput={true}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}
          >
            <Button
              variant="contained"
              color="warning"
              onClick={handleAddExpense}
              disabled={!expense.name || expense.amount === 0}
              sx={{ fontWeight: 800, px: 4 }}
            >
              Log Liability
            </Button>
          </Grid>
        </Grid>
      </Box>

      {expensesList.length > 0 && (
        <List
          dense
          sx={{
            mt: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
            maxHeight: 200,
            overflow: 'auto',
          }}
        >
          {expensesList.map((exp, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() =>
                    setExpensesList(expensesList.filter((_, i) => i !== index))
                  }
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 800 }}>{exp.name}</Typography>
                }
                secondary={`${exp.amount} (${exp.category})`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
