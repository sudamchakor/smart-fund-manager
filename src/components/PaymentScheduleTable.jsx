import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
} from "@mui/material";
import { useEmiContext } from "../context/EmiContext";
import { useTheme } from "@mui/material/styles";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

// Define a common style for cell borders for better readability and maintenance.
// Reduced padding to decrease row height.
const cellBorderStyle = {
  border: "1px solid rgba(224, 224, 224, 1)",
  padding: "6px 8px", 
};

const Row = ({ yearData, currency }) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      {/* Main row for the year */}
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell component="th" scope="row" sx={{ ...cellBorderStyle, width: "15%", p: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pl: 1 }}>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
              sx={{ mr: 1, padding: '2px' }}
            >
              {open ? <RemoveCircleOutlineIcon fontSize="small" /> : <AddCircleOutlineIcon fontSize="small" />}
            </IconButton>
            {yearData.year}
          </Box>
        </TableCell>
        <TableCell align="right" sx={{ ...cellBorderStyle, width: "14%" }}>
          {currency}
          {yearData.totalPrincipal}
        </TableCell>
        <TableCell align="right" sx={{ ...cellBorderStyle, width: "14%" }}>
          {currency}
          {yearData.totalInterest}
        </TableCell>
        <TableCell align="right" sx={{ ...cellBorderStyle, width: "14%" }}>
          {currency}
          {yearData.totalPrepayment}
        </TableCell>
        <TableCell align="right" sx={{ ...cellBorderStyle, width: "15%" }}>
          {currency}
          {yearData.totalPrincipal +
            yearData.totalInterest +
            yearData.totalPrepayment}
        </TableCell>
        <TableCell align="right" sx={{ ...cellBorderStyle, width: "14%" }}>
          {currency}
          {yearData.yearEndBalance}
        </TableCell>
        <TableCell align="right" sx={{ ...cellBorderStyle, width: "14%" }}>
          {yearData.paidPercent}%
        </TableCell>
      </TableRow>
      {/* Collapsible row for the months */}
      <TableRow>
        <TableCell style={{ padding: 0, border: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 0 }}>
              <Table size="small" aria-label="purchases" sx={{ tableLayout: "fixed", width: "100%" }}>
                <TableBody>
                  {yearData.months.map((monthRow) => (
                    <TableRow key={monthRow.date}>
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{ ...cellBorderStyle, width: "15%", pl: 5 }}
                      >
                        {monthRow.date.split(" ")[0]}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellBorderStyle, width: "14%" }}>
                        {currency}
                        {monthRow.principal}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellBorderStyle, width: "14%" }}>
                        {currency}
                        {monthRow.interest}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellBorderStyle, width: "14%" }}>
                        {currency}
                        {monthRow.prepayment}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellBorderStyle, width: "15%" }}>
                        {currency}
                        {monthRow.totalPayment}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellBorderStyle, width: "14%" }}>
                        {currency}
                        {monthRow.balance}
                      </TableCell>
                      <TableCell align="right" sx={{ ...cellBorderStyle, width: "14%" }}>
                        {monthRow.paidPercent}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const PaymentScheduleTable = () => {
  const { calculatedValues, currency } = useEmiContext();
  const schedule = calculatedValues.schedule;
  const theme = useTheme();

  const groupedSchedule = useMemo(() => {
    const years = {};
    schedule.forEach((row) => {
      const year = row.date.split(" ")[1];
      if (!years[year]) {
        years[year] = {
          year: year,
          totalPrincipal: 0,
          totalInterest: 0,
          totalPrepayment: 0,
          yearEndBalance: 0,
          months: [],
        };
      }
      years[year].totalPrincipal += Math.round(row.principal);
      years[year].totalInterest += Math.round(row.interest);
      years[year].totalPrepayment += Math.round(row.prepayment);
      years[year].yearEndBalance = Math.round(row.balance);
      years[year].paidPercent = Math.round(row.paidPercent);
      years[year].months.push(row);
    });
    return Object.values(years);
  }, [schedule]);

  // Using a different, unified background color for the header for a cleaner look
  const headerCellStyle = {
    color: theme.palette.text.primary,
    fontWeight: "bold",
    ...cellBorderStyle,
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" sx={{ minWidth: 650, tableLayout: "fixed" }} aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...headerCellStyle, width: "15%", backgroundColor: theme.palette.grey[200] }}>Year</TableCell>
            <TableCell align="right" sx={{ ...headerCellStyle, width: "14%", backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
              Principal
            </TableCell>
            <TableCell align="right" sx={{ ...headerCellStyle, width: "14%", backgroundColor: theme.palette.secondary.main, color: theme.palette.secondary.contrastText }}>
              Interest
            </TableCell>
            <TableCell align="right" sx={{ ...headerCellStyle, width: "14%", backgroundColor: theme.palette.success.main, color: theme.palette.success.contrastText }}>
              Prepayment
            </TableCell>
            <TableCell align="right" sx={{ ...headerCellStyle, width: "15%", backgroundColor: theme.palette.info.main, color: theme.palette.info.contrastText }}>
              Total Payment
            </TableCell>
            <TableCell align="right" sx={{ ...headerCellStyle, width: "14%", backgroundColor: theme.palette.warning.main, color: theme.palette.warning.contrastText }}>
              Balance
            </TableCell>
            <TableCell align="right" sx={{ ...headerCellStyle, width: "14%", backgroundColor: theme.palette.grey[200] }}>Loan Paid To Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groupedSchedule.map((yearData) => (
            <Row
              key={yearData.year}
              yearData={yearData}
              currency={currency}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PaymentScheduleTable;
