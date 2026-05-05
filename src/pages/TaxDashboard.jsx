import React, { useEffect, useState, useMemo, Suspense, lazy } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Typography,
  Box,
  Button,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  IconButton,
  Grid,
  Skeleton,
  useTheme,
  alpha,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowRightAlt as ArrowRightAltIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  SettingsOutlined as SettingsIcon,
  AccountBalance as TaxIcon,
  DoubleArrow as DoubleArrowIcon,
  DeleteSweep as DeleteSweepIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import SuspenseFallback from '../components/common/SuspenseFallback';
import {
  updateMonthData,
  updateSettings,
  updateDeclaration,
  addDynamicRow,
  editDynamicRow,
  deleteDynamicRow,
  updateHouseProperty,
  updateAge,
  selectSettings,
  selectCalculatedDeclarations,
  selectDynamicRows,
  selectHouseProperty,
  selectAge,
  selectCalculatedSalary,
  selectTaxComparison,
} from '../store/taxSlice';
import { selectIncomes, selectProfileExpenses } from '../store/profileSlice';
import { calculateTax } from '../utils/taxEngine';
import PageHeader from '../components/common/PageHeader';

const SalaryTable = lazy(() => import('../components/tax/SalaryTable'));
const TaxSummary = lazy(() => import('../components/tax/TaxSummary'));
const Declarations = lazy(() => import('../components/tax/Declarations'));
const TaxBreakdownChart = lazy(
  () => import('../components/tax/TaxBreakdownChart'),
);
const DynamicRowModal = lazy(() =>
  import('../components/tax/ActionModals').then((module) => ({
    default: module.DynamicRowModal,
  })),
);
const SettingsModal = lazy(() =>
  import('../components/tax/ActionModals').then((module) => ({
    default: module.SettingsModal,
  })),
);

const TaxDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mounted, setMounted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // View Mode
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'annual'

  // Modal and Hover States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [modalType, setModalType] = useState('income');
  const [modalRowId, setModalRowId] = useState('');
  const [modalLabel, setModalLabel] = useState('');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Autofill from Profile
  const incomes = useSelector(selectIncomes);
  const expenses = useSelector(selectProfileExpenses);

  // Redux Action Handlers
  const handleMonthChange = (index, field, value) => {
    setIsUpdating(true);
    dispatch(
      updateMonthData({ index, field, value, populateRemaining: false }),
    );
    setTimeout(() => setIsUpdating(false), 300);
  };

  const handleAnnualChange = (field, annualValue) => {
    setIsUpdating(true);
    const monthlyValue =
      annualValue && parseFloat(annualValue) > 0
        ? parseFloat(annualValue) / 12
        : '';
    for (let i = 0; i < 12; i++) {
      dispatch(
        updateMonthData({
          index: i,
          field,
          value: monthlyValue,
          populateRemaining: false,
        }),
      );
    }
    setTimeout(() => setIsUpdating(false), 300);
  };

  const handlePopulateRowFromCurrent = (index, field) => {
    setIsUpdating(true);
    dispatch(
      updateMonthData({
        index,
        field,
        value: calculatedSalary.months[index][field],
        populateRemaining: true,
      }),
    );
    setTimeout(() => setIsUpdating(false), 300);
  };

  const handleSettingChange = (field, value) => {
    setIsUpdating(true);
    dispatch(updateSettings({ [field]: value }));
    setTimeout(() => setIsUpdating(false), 300);
  };

  const handleDeclarationChange = (section, field, subfield, value) => {
    setIsUpdating(true);
    if (subfield) {
      dispatch(
        updateDeclaration({ section, field, value: { [subfield]: value } }),
      );
    } else {
      dispatch(updateDeclaration({ section, field, value }));
    }
    setTimeout(() => setIsUpdating(false), 300);
  };

  const handleQuickFill = (section, amount) => {
    if (section === '80C') {
      const currentStandard80C =
        parseFloat(declarations.sec80C.standard80C) || 0;
      handleDeclarationChange(
        'sec80C',
        'standard80C',
        null,
        currentStandard80C + amount,
      );
    } else if (section === '80D') {
      const current80D =
        parseFloat(declarations.deductions.sec80D.produced) || 0;
      handleDeclarationChange(
        'deductions',
        'sec80D',
        'produced',
        current80D + amount,
      );
    }
  };

  useEffect(() => {
    // Autofill salary from profile
    const salary = incomes.find((i) => i.name === 'Salary');
    if (salary) {
      handleAnnualChange('basic', salary.amount * 12);
    }

    // Autofill rent from profile
    const rent = expenses.find((e) => e.name === 'Rent');
    if (rent) {
      handleAnnualChange('rent', rent.amount * 12);
    }
  }, [incomes, expenses]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const settings = useSelector(selectSettings);
  const declarations = useSelector(selectCalculatedDeclarations);
  const dynamicRows = useSelector(selectDynamicRows);
  const houseProperty = useSelector(selectHouseProperty);
  const age = useSelector(selectAge);
  const calculatedSalary = useSelector(selectCalculatedSalary);
  const taxComparison = useSelector(selectTaxComparison);

  const breakEven = useMemo(() => {
    if (taxComparison.optimal !== 'New Regime') {
      return { investmentNeeded: 0, potentialSavings: 0, section: null };
    }

    const taxDiff = taxComparison.oldRegime.tax - taxComparison.newRegime.tax;
    if (taxDiff <= 0) {
      return { investmentNeeded: 0, potentialSavings: 0, section: null };
    }

    const income = { salary: calculatedSalary.annual.totalIncome };
    const meta = { age: age, profTax: calculatedSalary.annual.profTax };

    // Check 80C first
    const current80C = declarations.sec80C.totalProduced;
    const remaining80C = 150000 - current80C;

    if (remaining80C > 0) {
      for (let i = 500; i <= remaining80C; i += 500) {
        const tempDeclarations = JSON.parse(JSON.stringify(declarations));
        tempDeclarations.sec80C.standard80C =
          (parseFloat(tempDeclarations.sec80C.standard80C) || 0) + i;

        const newTax = calculateTax(
          income,
          tempDeclarations,
          houseProperty,
          meta,
        );
        if (newTax.oldRegime.tax < newTax.newRegime.tax) {
          const newSavings = newTax.newRegime.tax - newTax.oldRegime.tax;
          return {
            investmentNeeded: i,
            potentialSavings: newSavings,
            section: '80C',
          };
        }
      }
    }

    // If 80C is exhausted or not enough, check 80D
    const current80D = declarations.deductions.sec80D.produced;
    const limit80D = age >= 60 ? 50000 : 25000; // Simplified limit
    const remaining80D = limit80D - current80D;

    if (remaining80D > 0) {
      for (let i = 500; i <= remaining80D; i += 500) {
        const tempDeclarations = JSON.parse(JSON.stringify(declarations));
        tempDeclarations.deductions.sec80D.produced =
          (parseFloat(tempDeclarations.deductions.sec80D.produced) || 0) + i;

        const newTax = calculateTax(
          income,
          tempDeclarations,
          houseProperty,
          meta,
        );

        if (newTax.oldRegime.tax < newTax.newRegime.tax) {
          const newSavings = newTax.newRegime.tax - newTax.oldRegime.tax;
          return {
            investmentNeeded: i,
            potentialSavings: newSavings,
            section: '80D',
          };
        }
      }
    }

    return { investmentNeeded: 0, potentialSavings: 0, section: null };
  }, [taxComparison, declarations, calculatedSalary, houseProperty, age]);

  const hraBreakdown = useMemo(() => {
    const annualRent = calculatedSalary.annual.rentPaid;
    const annualBasic = calculatedSalary.annual.basic;
    const annualHraReceived = calculatedSalary.annual.hraReceived;
    const isMetro = settings.isMetro === 'Yes';

    const rentMinus10PercentBasic = Math.max(0, annualRent - 0.1 * annualBasic);
    const fiftyPercentBasic = 0.5 * annualBasic;
    const fortyPercentBasic = 0.4 * annualBasic;

    const eligibleHra = Math.min(
      annualHraReceived,
      isMetro ? fiftyPercentBasic : fortyPercentBasic,
      rentMinus10PercentBasic,
    );

    return {
      eligibleHra,
    };
  }, [calculatedSalary, settings]);

  if (!mounted) return null;

  // Modal Handlers
  const openAddModal = (type) => {
    setModalType(type);
    setModalMode('add');
    setModalLabel('');
    setModalOpen(true);
  };

  const openEditModal = (type, id, currentLabel) => {
    setModalType(type);
    setModalMode('edit');
    setModalRowId(id);
    setModalLabel(currentLabel);
    setModalOpen(true);
  };

  const handleModalSave = () => {
    if (modalLabel.trim() === '') return;
    if (modalMode === 'add') {
      dispatch(addDynamicRow({ type: modalType, label: modalLabel }));
    } else {
      dispatch(
        editDynamicRow({ type: modalType, id: modalRowId, label: modalLabel }),
      );
    }
    setModalOpen(false);
  };

  // Quick Action Handlers
  const handleClearRow = (field) => {
    setIsUpdating(true);
    for (let i = 0; i < 12; i++) {
      dispatch(
        updateMonthData({
          index: i,
          field,
          value: '',
          populateRemaining: false,
        }),
      );
    }
    setTimeout(() => setIsUpdating(false), 300);
  };

  const handleApplyAprilToAll = (field) => {
    const aprilValue = calculatedSalary.months[0][field] || '';
    if (aprilValue) {
      setIsUpdating(true);
      for (let i = 1; i < 12; i++) {
        dispatch(
          updateMonthData({
            index: i,
            field,
            value: aprilValue,
            populateRemaining: false,
          }),
        );
      }
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  // Shared Styles
  const labelStyle = {
    fontWeight: 800,
    textTransform: 'uppercase',
    fontSize: '0.65rem',
    color: 'text.disabled',
    letterSpacing: 1,
    mb: 0.5,
  };

  const wellInputStyle = {
    fontWeight: 800,
    fontSize: '0.85rem',
    bgcolor: alpha(theme.palette.primary.main, 0.04),
    color: 'primary.main',
    px: 1,
    py: 0.5,
    borderRadius: 1,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    textAlign: 'right',
    '& input': { textAlign: 'right', p: 0 },
    transition: 'all 0.2s',
    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
    '&.Mui-disabled': {
      bgcolor: alpha(theme.palette.text.disabled, 0.05),
      color: 'text.secondary',
      borderColor: 'transparent',
    },
  };

  // Renderers
  const renderCell = (month, index, field, isCalculated = false) => {
    const isHovered = hoveredCell === `${index}-${field}`;

    return (
      <TableCell
        key={field}
        onMouseEnter={() =>
          !isCalculated && setHoveredCell(`${index}-${field}`)
        }
        onMouseLeave={() => !isCalculated && setHoveredCell(null)}
        sx={{
          position: 'relative',
          p: 0.5,
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <TextField
          variant="standard"
          size="small"
          value={
            isCalculated
              ? Math.round(month[field] || 0)
              : month[field] || (month[field] === 0 ? '0' : '')
          }
          onChange={(e) =>
            !isCalculated && handleMonthChange(index, field, e.target.value)
          }
          disabled={isCalculated}
          InputProps={{
            disableUnderline: true,
            sx: { ...wellInputStyle, minWidth: 60, width: '100%' },
          }}
        />
        {isHovered && index < 11 && !isCalculated && (
          <Tooltip
            title={
              index === 0
                ? `Apply April's value to all months`
                : `Populate remaining months`
            }
            placement="top"
            arrow
          >
            <IconButton
              size="small"
              onClick={() =>
                index === 0
                  ? handleApplyAprilToAll(field)
                  : handlePopulateRowFromCurrent(index, field)
              }
              sx={{
                position: 'absolute',
                right: -8,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                bgcolor: theme.palette.background.paper,
                boxShadow: `0 2px 8px ${alpha(
                  theme.palette.common.black || '#000',
                  0.2,
                )}`,
                padding: '2px',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            >
              {index === 0 ? (
                <DoubleArrowIcon fontSize="small" color="inherit" />
              ) : (
                <ArrowRightAltIcon fontSize="small" color="inherit" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    );
  };

  const earningsFixed = [
    {
      label: 'Basic',
      field: 'basic',
      includeField: 'includePfBasic',
      tooltip:
        'Basic Salary Component - Fully taxable, forms base for PF and HRA calculation.',
    },
    {
      label: 'DA',
      field: 'da',
      includeField: 'includePfDa',
      tooltip:
        'Dearness Allowance - Fully taxable, added to Basic for PF/HRA if it forms part of retirement benefits.',
    },
    {
      label: 'Convey',
      field: 'convey',
      includeField: 'includePfConvey',
      tooltip: 'Conveyance Allowance',
    },
    {
      label: 'HRA',
      field: 'hra',
      includeField: 'includePfHra',
      tooltip: 'House Rent Allowance - Partially exempt u/s 10(13A)',
    },
    {
      label: 'Ch. Educ',
      field: 'chEduc',
      includeField: 'includePfChEduc',
      tooltip:
        'Children Education Allowance - Exempt up to ₹100 per month per child',
    },
    {
      label: 'Medical',
      field: 'medical',
      includeField: 'includePfMedical',
      tooltip: 'Medical Allowance - Fully taxable.',
    },
    {
      label: 'LTA',
      field: 'lta',
      includeField: 'includePfLta',
      tooltip: 'Leave Travel Allowance',
    },
    {
      label: 'Uniform All.',
      field: 'uniformAll',
      includeField: 'includePfUniformAll',
      tooltip: 'Uniform Allowance',
    },
    {
      label: 'Car allow',
      field: 'carAllow',
      includeField: 'includePfCarAllow',
      tooltip: 'Car Allowance',
    },
  ];

  const deductionsFixed = [
    {
      label: 'Prof tax',
      field: 'profTax',
      tooltip: 'Professional Tax - Deductible from gross salary u/s 16(iii)',
    },
    {
      label: 'PF',
      field: 'pf',
      calculated: true,
      tooltip: 'Provident Fund (Employee Contribution)',
    },
    {
      label: 'VPF',
      field: 'vpf',
      calculated: true,
      tooltip: 'Voluntary Provident Fund',
    },
    { label: 'IT', field: 'it', tooltip: 'Income Tax Deducted (TDS)' },
    {
      label: 'Rent',
      field: 'rent',
      tooltip: 'Rent Paid - Used to calculate HRA Exemption.',
    },
    {
      label: 'Life Insur.',
      field: 'lifeInsur',
      tooltip: 'Life Insurance Premium',
    },
  ];

  const otherFields = [
    { label: 'Loan/Wdwl', field: 'loanWdwl', tooltip: 'Loan or Withdrawal' },
    { label: 'OB', field: 'ob', tooltip: 'Opening Balance' },
    { label: 'Int', field: 'int', tooltip: 'Interest' },
    { label: 'CB', field: 'cb', tooltip: 'Closing Balance' },
  ];

  const renderRow = (
    label,
    field,
    isCalculated = false,
    isDynamic = false,
    dynamicType = null,
    id = null,
    tooltipText = null,
  ) => (
    <TableRow
      key={field}
      onMouseEnter={() => !isCalculated && setHoveredRow(field)}
      onMouseLeave={() => setHoveredRow(null)}
      sx={{ '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.04) } }}
    >
      <TableCell
        component="th"
        scope="row"
        sx={{
          position: 'sticky',
          left: 0,
          zIndex: 1,
          minWidth: 100,
          maxWidth: 120,
          p: 1,
          bgcolor: theme.palette.background.paper,
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Tooltip title={tooltipText || label} placement="right" arrow>
            <Typography
              variant="caption"
              sx={{
                fontWeight: isCalculated ? 900 : 700,
                color: isCalculated ? 'primary.main' : 'text.primary',
                textTransform: isCalculated ? 'uppercase' : 'none',
              }}
            >
              {label}
            </Typography>
          </Tooltip>
          {isDynamic && (
            <Box>
              <IconButton
                size="small"
                onClick={() => openEditModal(dynamicType, id, label)}
                sx={{ p: 0.2 }}
              >
                <EditIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() =>
                  dispatch(deleteDynamicRow({ type: dynamicType, id }))
                }
                sx={{ p: 0.2 }}
              >
                <DeleteIcon sx={{ fontSize: '1rem', color: 'error.main' }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </TableCell>
      {calculatedSalary.months.map((month, index) =>
        renderCell(month, index, field, isCalculated),
      )}
      <TableCell
        sx={{
          p: 0.5,
          width: 40,
          minWidth: 40,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {hoveredRow === field && !isCalculated && (
          <Tooltip title="Clear all months" placement="left" arrow>
            <IconButton
              size="small"
              onClick={() => handleClearRow(field)}
              sx={{ p: 0.2 }}
            >
              <DeleteSweepIcon
                sx={{ fontSize: '1.2rem', color: 'text.secondary' }}
              />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={{ flexGrow: 1, position: 'relative' }}>
      {isUpdating && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.background.default, 0.5),
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            borderRadius: 3,
          }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ borderRadius: 3, opacity: 0.2 }}
          />
        </Box>
      )}

      <PageHeader
        title="Indian Tax Engine (FY 2025-26)"
        subtitle="Compute comparative tax liabilities across legislative regimes."
        icon={TaxIcon}
        action={
          <Tooltip title="System Configuration & Rules" arrow>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsModalOpen(true)}
              sx={{
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
              }}
            >
              Config
            </Button>
          </Tooltip>
        }
      />

      <Suspense fallback={<SuspenseFallback />}>
        <Grid container spacing={4}>
          {/* Left Column: Heavy Data Entry */}
          <Grid item xs={12} md={8}>
            <SalaryTable
              viewMode={viewMode}
              onViewModeChange={(e, newMode) => newMode && setViewMode(newMode)}
              calculatedSalary={calculatedSalary}
              earningsFixed={earningsFixed}
              deductionsFixed={deductionsFixed}
              otherFields={otherFields}
              dynamicRows={dynamicRows}
              renderRow={renderRow}
              openAddModal={openAddModal}
              onAnnualChange={handleAnnualChange}
              wellInputStyle={wellInputStyle}
            />
            <Declarations
              declarations={declarations}
              houseProperty={houseProperty}
              handleDeclarationChange={handleDeclarationChange}
              updateHouseProperty={(value) =>
                dispatch(updateHouseProperty(value))
              }
              wellInputStyle={wellInputStyle}
              labelStyle={labelStyle}
            />
          </Grid>

          {/* Right Column: Tax Verdict Terminal */}
          <Grid item xs={12} md={4} sx={isMobile ? {} : {}}>
            <TaxSummary
              taxComparison={taxComparison}
              declarations={declarations}
              onQuickFill={handleQuickFill}
              breakEven={breakEven}
              calculatedSalary={calculatedSalary}
              hraBreakdown={hraBreakdown}
            />
            <Button
              variant="outlined"
              startIcon={<AnalyticsIcon />}
              onClick={() => setAnalyticsModalOpen(true)}
              fullWidth
              sx={{ mt: 2 }}
            >
              View Analytics
            </Button>
          </Grid>
        </Grid>
      </Suspense>

      {/* Modals */}
      {modalOpen && (
        <Suspense fallback={<div />}>
          <DynamicRowModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleModalSave}
            mode={modalMode}
            label={modalLabel}
            onLabelChange={(e) => setModalLabel(e.target.value)}
            wellInputStyle={wellInputStyle}
            labelStyle={labelStyle}
          />
        </Suspense>
      )}
      {settingsModalOpen && (
        <Suspense fallback={<div />}>
          <SettingsModal
            open={settingsModalOpen}
            onClose={() => setSettingsModalOpen(false)}
            settings={settings}
            age={age}
            onAgeChange={(e) => dispatch(updateAge(e.target.value))}
            onSettingChange={handleSettingChange}
            earningsFixed={earningsFixed}
            dynamicRows={dynamicRows}
            calculatedSalary={calculatedSalary}
            onInclusionChange={(field, value) =>
              dispatch(
                updateMonthData({
                  index: 0,
                  field,
                  value,
                  populateRemaining: true,
                }),
              )
            }
            wellInputStyle={wellInputStyle}
            labelStyle={labelStyle}
          />
        </Suspense>
      )}
      <Dialog
        open={analyticsModalOpen}
        onClose={() => setAnalyticsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tax Analytics</DialogTitle>
        <DialogContent>
          <Suspense fallback={<SuspenseFallback />}>
            <TaxBreakdownChart
              taxComparison={taxComparison}
              calculatedSalary={calculatedSalary}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TaxDashboard;
