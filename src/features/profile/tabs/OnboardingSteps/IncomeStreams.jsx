import React from "react";
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
} from "@mui/material";
import {
  DeleteOutline as DeleteIcon,
  AccountBalanceWallet as IncomeIcon,
} from "@mui/icons-material";
import SliderInput from "../../../../components/common/SliderInput";
import { labelStyle, getWellInputStyle } from "../../../../styles/formStyles";

export default function IncomeStreams({
  income,
  setIncome,
  incomesList,
  setIncomesList,
  handleAddIncome,
}) {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <IncomeIcon sx={{ fontSize: "1.2rem", color: "success.main" }} />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            textTransform: "uppercase",
            color: "success.main",
          }}
        >
          Primary Capital Inflows
        </Typography>
      </Stack>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.success.main, 0.03),
          border: `1px dashed ${alpha(theme.palette.success.main, 0.2)}`,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Source Designation</Typography>
            <TextField
              variant="standard"
              fullWidth
              size="small"
              value={income.name}
              onChange={(e) => setIncome({ ...income, name: e.target.value })}
              InputProps={{
                disableUnderline: true,
                sx: getWellInputStyle(theme, "success"),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SliderInput
              label="Amount"
              value={Number(income.amount) || 0}
              onChange={(val) => setIncome({ ...income, amount: val })}
              min={0}
              max={10000000}
              step={1000}
              color="success"
              showInput={true}
              isInline={false}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={labelStyle}>Frequency</Typography>
            <FormControl variant="standard" fullWidth>
              <Select
                value={income.frequency}
                onChange={(e) =>
                  setIncome({ ...income, frequency: e.target.value })
                }
                disableUnderline
                sx={getWellInputStyle(theme, "success")}
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
          <Grid item xs={12} sm={4}>
            <SliderInput
              label="Start Year"
              value={income.startYear}
              onChange={(val) => setIncome({ ...income, startYear: val })}
              min={currentYear}
              max={currentYear + 50}
              step={1}
              color="success"
              isInline={false}
              showInput={true}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SliderInput
              label="End Year"
              value={income.endYear}
              onChange={(val) => setIncome({ ...income, endYear: val })}
              min={income.startYear}
              max={currentYear + 50}
              step={1}
              color="success"
              isInline={false}
              showInput={true}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={handleAddIncome}
              disabled={!income.name || income.amount === 0}
              sx={{ fontWeight: 800, px: 4 }}
            >
              Inject Capital Stream
            </Button>
          </Grid>
        </Grid>
      </Box>

      {incomesList.length > 0 && (
        <List
          dense
          sx={{
            mt: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          {incomesList.map((inc, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() =>
                    setIncomesList(incomesList.filter((_, i) => i !== index))
                  }
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 800 }}>{inc.name}</Typography>
                }
                secondary={`${inc.amount} (${inc.frequency})`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
