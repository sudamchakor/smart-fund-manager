import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
  alpha,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { getWellInputStyle } from '../../styles/formStyles';

const SalaryTable = ({
  viewMode,
  onViewModeChange,
  calculatedSalary,
  earningsFixed,
  deductionsFixed,
  otherFields,
  dynamicRows,
  renderRow,
  openAddModal,
  onAnnualChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const renderAnnualRow = (
    label,
    field,
    isCalculated = false,
    tooltipText = null,
  ) => {
    const annualValue = calculatedSalary.months.reduce(
      (acc, month) => acc + (parseFloat(month[field]) || 0),
      0,
    );

    return (
      <TableRow key={field}>
        <TableCell
          component="th"
          scope="row"
          sx={{
            fontWeight: isCalculated ? 900 : 700,
            color: isCalculated ? 'primary.main' : 'text.primary',
            textTransform: isCalculated ? 'uppercase' : 'none',
            fontSize: '0.75rem',
          }}
        >
          {label}
        </TableCell>
        <TableCell align="right">
          <TextField
            variant="standard"
            size="small"
            value={isCalculated ? Math.round(annualValue) : annualValue}
            onChange={(e) => onAnnualChange(field, e.target.value)}
            disabled={isCalculated}
            InputProps={{
              disableUnderline: true,
              sx: { ...getWellInputStyle(theme), width: '100%' },
            }}
          />
        </TableCell>
      </TableRow>
    );
  };

  if (isMobile) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'text.secondary',
            letterSpacing: 1,
            mb: 1.5,
          }}
        >
          Salary Components
        </Typography>
        <Grid container spacing={2}>
          {earningsFixed.map((item) => (
            <Grid item xs={12} sm={6} key={item.field}>
              <Card>
                <CardContent>
                  <Typography variant="caption">{item.label}</Typography>
                  <TextField
                    variant="standard"
                    size="small"
                    value={calculatedSalary.months[0][item.field]}
                    onChange={(e) =>
                      onAnnualChange(item.field, e.target.value * 12)
                    }
                    InputProps={{
                      disableUnderline: true,
                      sx: { ...getWellInputStyle(theme), width: '100%' },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1.5 }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'text.secondary',
            letterSpacing: 1,
          }}
        >
          Monthly Salary Parameters
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={onViewModeChange}
          size="small"
          aria-label="View mode"
        >
          <ToggleButton value="monthly" aria-label="Detailed Monthly">
            Detailed Monthly
          </ToggleButton>
          <ToggleButton value="annual" aria-label="Annual Summary">
            Annual Summary
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: theme.palette.background.paper,
          boxShadow: `0 4px 24px ${alpha(
            theme.palette.common.black || '#000',
            0.02,
          )}`,
          overflow: 'hidden',
        }}
      >
        <Collapse in={viewMode === 'monthly'} timeout="auto" unmountOnExit>
          <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                      backdropFilter: 'blur(10px)',
                      zIndex: 2,
                      minWidth: 100,
                      maxWidth: 120,
                      borderRight: `1px solid ${alpha(
                        theme.palette.divider,
                        0.2,
                      )}`,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.2,
                      )}`,
                    }}
                  ></TableCell>
                  {calculatedSalary.months.map((m) => (
                    <TableCell
                      key={m.month}
                      align="center"
                      sx={{
                        minWidth: 60,
                        py: 1,
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        borderRight: `1px solid ${alpha(
                          theme.palette.divider,
                          0.1,
                        )}`,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.divider,
                          0.2,
                        )}`,
                      }}
                    >
                      {m.month}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      width: 40,
                      minWidth: 40,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.2,
                      )}`,
                    }}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {earningsFixed.map((item) =>
                  renderRow(
                    item.label,
                    item.field,
                    false,
                    false,
                    null,
                    null,
                    item.tooltip,
                  ),
                )}
                {dynamicRows.income.map((item) =>
                  renderRow(
                    item.label,
                    item.id,
                    false,
                    true,
                    'income',
                    item.id,
                  ),
                )}
                <TableRow>
                  <TableCell
                    colSpan={14}
                    sx={{
                      p: 1,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1,
                      )}`,
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => openAddModal('income')}
                      sx={{ fontWeight: 700, color: 'text.secondary' }}
                    >
                      Inject Income Row
                    </Button>
                  </TableCell>
                </TableRow>
                {renderRow(
                  'Gross Total',
                  'total',
                  true,
                  false,
                  null,
                  null,
                  'Total Monthly Gross Earnings',
                )}

                {deductionsFixed.map((item) =>
                  renderRow(
                    item.label,
                    item.field,
                    item.calculated,
                    false,
                    null,
                    null,
                    item.tooltip,
                  ),
                )}
                {dynamicRows.deduction.map((item) =>
                  renderRow(
                    item.label,
                    item.id,
                    false,
                    true,
                    'deduction',
                    item.id,
                  ),
                )}
                <TableRow>
                  <TableCell
                    colSpan={14}
                    sx={{
                      p: 1,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1,
                      )}`,
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => openAddModal('deduction')}
                      sx={{ fontWeight: 700, color: 'text.secondary' }}
                    >
                      Inject Deduction Row
                    </Button>
                  </TableCell>
                </TableRow>
                {renderRow(
                  'Tot Deduct',
                  'totDed',
                  true,
                  false,
                  null,
                  null,
                  'Total Monthly Deductions',
                )}
                {renderRow(
                  'Net Pay',
                  'net',
                  true,
                  false,
                  null,
                  null,
                  'Net Monthly Salary',
                )}
                {otherFields.map((item) =>
                  renderRow(
                    item.label,
                    item.field,
                    false,
                    false,
                    null,
                    null,
                    item.tooltip,
                  ),
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>

        <Collapse in={viewMode === 'annual'} timeout="auto" unmountOnExit>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Component</TableCell>
                  <TableCell align="right">Total Annual</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {earningsFixed.map((item) =>
                  renderAnnualRow(item.label, item.field, false, item.tooltip),
                )}
                {dynamicRows.income.map((item) =>
                  renderAnnualRow(item.label, item.id, false),
                )}
                {renderAnnualRow(
                  'Gross Total',
                  'total',
                  true,
                  'Total Monthly Gross Earnings',
                )}
                {deductionsFixed.map((item) =>
                  renderAnnualRow(
                    item.label,
                    item.field,
                    item.calculated,
                    item.tooltip,
                  ),
                )}
                {dynamicRows.deduction.map((item) =>
                  renderAnnualRow(item.label, item.id, false),
                )}
                {renderAnnualRow(
                  'Tot Deduct',
                  'totDed',
                  true,
                  'Total Monthly Deductions',
                )}
                {renderAnnualRow('Net Pay', 'net', true, 'Net Monthly Salary')}
                {otherFields.map((item) =>
                  renderAnnualRow(item.label, item.field, false, item.tooltip),
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </Box>
    </Box>
  );
};

export default SalaryTable;
