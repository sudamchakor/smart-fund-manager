import React, { useState } from "react";
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
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const PaymentSchedule = () => {
  const { calculatedValues, currency } = useEmiContext();
  const schedule = calculatedValues.schedule;
  const [open, setOpen] = useState(false);

  return (
    <TableContainer component={Paper} sx={{ border: "1px solid #e0e0e0" }}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
              >
                {open ? <RemoveIcon /> : <AddIcon />}
              </IconButton>
              Month
            </TableCell>
            <TableCell align="right">Principal</TableCell>
            <TableCell align="right">Interest</TableCell>
            <TableCell align="right">Prepayment</TableCell>
            <TableCell align="right">Total Payment</TableCell>
            <TableCell align="right">Balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ margin: 1 }}>
                  <Table size="small" aria-label="purchases">
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
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PaymentSchedule;