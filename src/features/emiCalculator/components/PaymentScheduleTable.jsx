import React, { useState, useMemo } from 'react';
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
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCalculatedValues } from '../utils/emiCalculator';
import { selectCurrency } from '../../../store/emiSlice';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

// Formatting helper
const formatVal = (val, curr) =>
  `${curr} ${Math.round(val).toLocaleString('en-IN')}`;

const Row = ({ yearData, currency }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const cellStyle = {
    py: 1,
    px: 1.5,
    fontSize: '0.85rem',
    borderColor: alpha(theme.palette.divider, 0.1),
  };

  return (
    <React.Fragment>
      <TableRow
        sx={{
          bgcolor: open ? alpha(theme.palette.primary.main, 0.05) : 'inherit',
          '&:nth-of-type(odd)': {
            bgcolor: open
              ? alpha(theme.palette.primary.main, 0.08)
              : alpha(theme.palette.primary.main, 0.02),
          },
          transition: 'background-color 0.2s',
        }}
      >
        <TableCell sx={{ ...cellStyle, fontWeight: 800 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="small"
              onClick={() => setOpen(!open)}
              sx={{ mr: 1, color: theme.palette.primary.main }}
            >
              {open ? (
                <RemoveCircleOutlineIcon fontSize="small" />
              ) : (
                <AddCircleOutlineIcon fontSize="small" />
              )}
            </IconButton>
            {yearData.year}
          </Box>
        </TableCell>
        <TableCell align="right" sx={{ ...cellStyle, fontWeight: 600 }}>
          {formatVal(yearData.totalPrincipal, currency)}
        </TableCell>
        <TableCell align="right" sx={{ ...cellStyle, fontWeight: 600 }}>
          {formatVal(yearData.totalInterest, currency)}
        </TableCell>
        <TableCell align="right" sx={{ ...cellStyle, fontWeight: 600 }}>
          {formatVal(yearData.totalPrepayment, currency)}
        </TableCell>
        <TableCell
          align="right"
          sx={{ ...cellStyle, fontWeight: 800, color: 'primary.main' }}
        >
          {formatVal(
            yearData.totalPrincipal +
              yearData.totalInterest +
              yearData.totalPrepayment,
            currency,
          )}
        </TableCell>
        <TableCell align="right" sx={{ ...cellStyle, fontWeight: 600 }}>
          {formatVal(yearData.yearEndBalance, currency)}
        </TableCell>
        <TableCell align="right" sx={{ ...cellStyle, fontWeight: 800 }}>
          {yearData.paidPercent}%
        </TableCell>
      </TableRow>

      {/* Monthly Breakdown (Sub-rows) */}
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ bgcolor: alpha(theme.palette.grey[500], 0.03), p: 1 }}>
              <Table size="small">
                <TableBody>
                  {yearData.months.map((monthRow) => (
                    <TableRow
                      key={monthRow.date}
                      sx={{ '&:hover': { bgcolor: 'white' } }}
                    >
                      <TableCell
                        sx={{
                          ...cellStyle,
                          width: '15%',
                          border: 0,
                          pl: 6,
                          color: 'text.secondary',
                        }}
                      >
                        {monthRow.date.split(' ')[0]}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ ...cellStyle, width: '14%', border: 0 }}
                      >
                        {formatVal(monthRow.principal, currency)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ ...cellStyle, width: '14%', border: 0 }}
                      >
                        {formatVal(monthRow.interest, currency)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ ...cellStyle, width: '14%', border: 0 }}
                      >
                        {formatVal(monthRow.prepayment, currency)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ ...cellStyle, width: '15%', border: 0 }}
                      >
                        {formatVal(monthRow.totalPayment, currency)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ ...cellStyle, width: '14%', border: 0 }}
                      >
                        {formatVal(monthRow.balance, currency)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ ...cellStyle, width: '14%', border: 0 }}
                      >
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
  const theme = useTheme();
  const calculatedValues = useSelector(selectCalculatedValues);
  const currency = useSelector(selectCurrency);
  const schedule = calculatedValues.schedule || [];

  const groupedSchedule = useMemo(() => {
    const years = {};
    schedule.forEach((row) => {
      const year = row.date.split(' ')[1];
      if (!years[year]) {
        years[year] = {
          year,
          totalPrincipal: 0,
          totalInterest: 0,
          totalPrepayment: 0,
          yearEndBalance: 0,
          months: [],
        };
      }
      years[year].totalPrincipal += row.principal;
      years[year].totalInterest += row.interest;
      years[year].totalPrepayment += row.prepayment;
      years[year].yearEndBalance = row.balance;
      years[year].paidPercent = row.paidPercent;
      years[year].months.push(row);
    });
    return Object.values(years);
  }, [schedule]);

  const headerStyle = (bgColor) => ({
    bgcolor: bgColor,
    color: 'white',
    fontWeight: 800,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    py: 1.5,
    border: 0,
  });

  if (!schedule.length) {
    return (
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'auto',
      }}
    >
      <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={headerStyle(theme.palette.grey[800])}>
              Year
            </TableCell>
            <TableCell
              align="right"
              sx={headerStyle(theme.palette.success.main)}
            >
              Principal
            </TableCell>
            <TableCell align="right" sx={headerStyle(theme.palette.error.main)}>
              Interest
            </TableCell>
            <TableCell
              align="right"
              sx={headerStyle(theme.palette.warning.main)}
            >
              Prepayment
            </TableCell>
            <TableCell
              align="right"
              sx={headerStyle(theme.palette.primary.main)}
            >
              Total Payment
            </TableCell>
            <TableCell align="right" sx={headerStyle(theme.palette.grey[700])}>
              Balance
            </TableCell>
            <TableCell align="right" sx={headerStyle(theme.palette.grey[800])}>
              Paid %
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groupedSchedule.map((yearData) => (
            <Row key={yearData.year} yearData={yearData} currency={currency} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PaymentScheduleTable;
