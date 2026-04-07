import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useEmiContext } from "../context/EmiContext";
import { useTheme } from "@mui/material/styles";

const PaymentScheduleTable = () => {
  const { calculatedValues, currency } = useEmiContext();
  const schedule = calculatedValues.schedule;
  const theme = useTheme();

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
          <TableRow>
            <TableCell sx={{ color: theme.palette.primary.contrastText }}>Month</TableCell>
            <TableCell sx={{ color: theme.palette.primary.contrastText }} align="right">Principal</TableCell>
            <TableCell sx={{ color: theme.palette.primary.contrastText }} align="right">Interest</TableCell>
            <TableCell sx={{ color: theme.palette.primary.contrastText }} align="right">Prepayment</TableCell>
            <TableCell sx={{ color: theme.palette.primary.contrastText }} align="right">Total Payment</TableCell>
            <TableCell sx={{ color: theme.palette.primary.contrastText }} align="right">Balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedule.map((row) => (
            <TableRow
              key={row.date}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.date}
              </TableCell>
              <TableCell align="right">
                {currency}
                {row.principal.toFixed(2)}
              </TableCell>
              <TableCell align="right">
                {currency}
                {row.interest.toFixed(2)}
              </TableCell>
              <TableCell align="right">
                {currency}
                {row.prepayment.toFixed(2)}
              </TableCell>
              <TableCell align="right">
                {currency}
                {row.totalPayment.toFixed(2)}
              </TableCell>
              <TableCell align="right">
                {currency}
                {row.balance.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PaymentScheduleTable;