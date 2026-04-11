import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Typography, Paper, Box, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Select, MenuItem, FormControl, InputLabel,
  Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import DataCard from '../components/common/DataCard';
import ExemptionRow from '../components/common/ExemptionRow';
import {
  updateMonthData,
  populateRowFromFirstMonth,
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
import '../assets/styles.css';

const TaxDashboard = () => {
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);

  // Dynamic Row Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [modalType, setModalType] = useState('income'); // 'income' or 'deduction'
  const [modalRowId, setModalRowId] = useState('');
  const [modalLabel, setModalLabel] = useState('');

  // Settings Modal State
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Hover state for input cells to show the populate button
  const [hoveredCell, setHoveredCell] = useState(null);

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

  if (!mounted) return null;

  const handleMonthChange = (index, field, value) => {
    dispatch(updateMonthData({ index, field, value, populateRemaining: false }));
  };

  const handlePopulateRowFromCurrent = (index, field) => {
    dispatch(updateMonthData({ index, field, value: calculatedSalary.months[index][field], populateRemaining: true }));
  };

  const handleSettingChange = (field, value) => {
    dispatch(updateSettings({ [field]: value }));
  };

  const handleDeclarationChange = (section, field, subfield, value) => {
    if (subfield) {
       dispatch(updateDeclaration({ section, field, value: { [subfield]: value } }));
    } else {
       dispatch(updateDeclaration({ section, field, value }));
    }
  };

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
          dispatch(editDynamicRow({ type: modalType, id: modalRowId, label: modalLabel }));
      }
      setModalOpen(false);
  };

  const renderCell = (month, index, field, isCalculated = false) => {
    const isHovered = hoveredCell === `${index}-${field}`;
    
    if (isCalculated) {
      return (
        <TableCell key={field} sx={{ p: 0.5, borderRight: '1px solid #e0e0e0' }}>
          <TextField 
            variant="outlined" 
            size="small" 
            value={Math.round(month[field] || 0)} 
            disabled 
            sx={{ width: '100%', minWidth: 60, '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#000', backgroundColor: '#f5f5f5', padding: '6px' } }}
          />
        </TableCell>
      );
    }

    return (
      <TableCell 
        key={field} 
        onMouseEnter={() => setHoveredCell(`${index}-${field}`)}
        onMouseLeave={() => setHoveredCell(null)}
        sx={{ position: 'relative', p: 0.5, borderRight: '1px solid #e0e0e0' }}
      >
        <TextField 
          variant="outlined" 
          size="small" 
          value={month[field] || (month[field] === 0 ? '0' : '')} 
          onChange={(e) => handleMonthChange(index, field, e.target.value)}
          sx={{ width: '100%', minWidth: 60, '& .MuiInputBase-input': { padding: '6px' } }}
        />
        {isHovered && index < 11 && (
          <Tooltip title={`Populate remaining months with this value`}>
             <IconButton 
               size="small" 
               onClick={() => handlePopulateRowFromCurrent(index, field)} 
               sx={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'background.paper', boxShadow: 1, padding: '2px' }}
             >
               <ArrowRightAltIcon fontSize="small" color="primary" />
             </IconButton>
          </Tooltip>
        )}
      </TableCell>
    );
  };

  const earningsFixed = [
    { label: 'Basic', field: 'basic', includeField: 'includePfBasic', tooltip: 'Basic Salary Component - Fully taxable, forms base for PF and HRA calculation.' },
    { label: 'DA', field: 'da', includeField: 'includePfDa', tooltip: 'Dearness Allowance - Fully taxable, added to Basic for PF/HRA if it forms part of retirement benefits.' },
    { label: 'Convey', field: 'convey', includeField: 'includePfConvey', tooltip: 'Conveyance Allowance - Exemption up to ₹1,600/month removed for non-handicapped since standard deduction was introduced.' },
    { label: 'HRA', field: 'hra', includeField: 'includePfHra', tooltip: 'House Rent Allowance - Partially exempt u/s 10(13A) if rent is paid. Depends on Metro/Non-Metro and Basic Salary.' },
    { label: 'Ch. Educ', field: 'chEduc', includeField: 'includePfChEduc', tooltip: 'Children Education Allowance - Exempt up to ₹100 per month per child (max 2 children).' },
    { label: 'Medical', field: 'medical', includeField: 'includePfMedical', tooltip: 'Medical Allowance - Fully taxable. (Standard deduction replaced earlier ₹15,000 medical reimbursement).' },
    { label: 'LTA', field: 'lta', includeField: 'includePfLta', tooltip: 'Leave Travel Allowance - Exemption available for 2 journeys in a block of 4 years subject to actual travel bills.' },
    { label: 'Uniform All.', field: 'uniformAll', includeField: 'includePfUniformAll', tooltip: 'Uniform Allowance - Exempt to the extent of actual expenditure incurred for employment.' },
    { label: 'Car allow', field: 'carAllow', includeField: 'includePfCarAllow', tooltip: 'Car Allowance - Taxable, unless specified otherwise under perquisite rules.' },
  ];

  const deductionsFixed = [
    { label: 'Prof tax', field: 'profTax', tooltip: 'Professional Tax - Deductible from gross salary u/s 16(iii) up to ₹2,500 per year.' },
    { label: 'PF', field: 'pf', calculated: true, tooltip: 'Provident Fund (Employee Contribution) - Eligible for deduction under Section 80C.' },
    { label: 'VPF', field: 'vpf', calculated: true, tooltip: 'Voluntary Provident Fund - Additional contribution, also eligible for 80C.' },
    { label: 'IT', field: 'it', tooltip: 'Income Tax Deducted (TDS) - Tax deducted at source by employer.' },
    { label: 'Rent', field: 'rent', tooltip: 'Rent Paid - Used to calculate HRA Exemption. Must exceed 10% of Basic Salary to get any exemption.' },
    { label: 'Life Insur.', field: 'lifeInsur', tooltip: 'Life Insurance Premium - Deducted directly by employer, eligible for 80C.' },
  ];

  const otherFields = [
    { label: 'Loan/Wdwl', field: 'loanWdwl', tooltip: 'Loan or Withdrawal - Deductions for company loans.' },
    { label: 'OB', field: 'ob', tooltip: 'Opening Balance' },
    { label: 'Int', field: 'int', tooltip: 'Interest' },
    { label: 'CB', field: 'cb', tooltip: 'Closing Balance' },
  ];

  const renderRow = (label, field, isCalculated = false, isDynamic = false, dynamicType = null, id = null, tooltipText = null) => (
    <TableRow key={field} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th" scope="row" sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1, minWidth: 100, maxWidth: 120, p: 0.5, borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <Tooltip title={tooltipText || label} placement="right">
               <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isCalculated ? 'bold' : 'normal', cursor: 'pointer' }}>
                 {label}
               </Typography>
            </Tooltip>
            {isDynamic && (
               <Box>
                 <IconButton size="small" onClick={() => openEditModal(dynamicType, id, label)} sx={{ p: 0 }}><EditIcon fontSize="inherit" /></IconButton>
                 <IconButton size="small" onClick={() => dispatch(deleteDynamicRow({ type: dynamicType, id }))} sx={{ p: 0 }}><DeleteIcon fontSize="inherit" color="error" /></IconButton>
               </Box>
            )}
        </Box>
      </TableCell>
      {calculatedSalary.months.map((month, index) => renderCell(month, index, field, isCalculated))}
    </TableRow>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }} className="dashboard-container">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
         <Typography variant="h4" fontWeight="bold" color="primary">
            Indian Tax Comparison (FY 2025-26)
         </Typography>
         <Tooltip title="Configure Settings & PF Inclusions">
             <IconButton color="primary" onClick={() => setSettingsModalOpen(true)} size="large">
                <SettingsIcon fontSize="large" />
             </IconButton>
         </Tooltip>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={12}>
          <DataCard title="Monthly Salary Data">
            <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto', border: '1px solid #e0e0e0' }}>
              <Table size="small" aria-label="salary table" sx={{ minWidth: 1000 }}>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ position: 'sticky', left: 0, bgcolor: '#f5f5f5', zIndex: 2, minWidth: 100, maxWidth: 120, borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}></TableCell>
                    {calculatedSalary.months.map((m) => (
                      <TableCell key={m.month} align="center" sx={{ minWidth: 60, p: 0.5, fontWeight: 'bold', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
                        {m.month}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {earningsFixed.map(item => renderRow(item.label, item.field, false, false, null, null, item.tooltip))}
                  {dynamicRows.income.map(item => renderRow(item.label, item.id, false, true, 'income', item.id, `Dynamic Income Component: ${item.label} - Fully taxable unless exemption specified.`))}
                  <TableRow>
                    <TableCell colSpan={13} sx={{ p: 0.5 }}>
                       <Button size="small" startIcon={<AddIcon />} onClick={() => openAddModal('income')}>Add Income Row</Button>
                    </TableCell>
                  </TableRow>
                  {renderRow('Total', 'total', true, false, null, null, 'Total Monthly Gross Earnings')}

                  {deductionsFixed.map(item => renderRow(item.label, item.field, item.calculated, false, null, null, item.tooltip))}
                  {dynamicRows.deduction.map(item => renderRow(item.label, item.id, false, true, 'deduction', item.id, `Dynamic Deduction Component: ${item.label}`))}
                   <TableRow>
                    <TableCell colSpan={13} sx={{ p: 0.5 }}>
                       <Button size="small" startIcon={<AddIcon />} onClick={() => openAddModal('deduction')}>Add Deduction Row</Button>
                    </TableCell>
                  </TableRow>
                  {renderRow('Tot Ded', 'totDed', true, false, null, null, 'Total Monthly Deductions')}

                  {renderRow('Net', 'net', true, false, null, null, 'Net Monthly Salary (Total Earnings - Total Deductions)')}

                  {otherFields.map(item => renderRow(item.label, item.field, false, false, null, null, item.tooltip))}
                </TableBody>
              </Table>
            </TableContainer>
          </DataCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <DataCard title="A. Exemptions under Section 10 & 17">
              <ExemptionRow label="HRA Exemption (sec 10 (13A))" 
                  produced={
                    <TextField size="small" sx={{ width: 100 }} value={declarations.exemptions.hra.produced} onChange={(e) => handleDeclarationChange('exemptions', 'hra', 'produced', e.target.value)} />
                  } 
                  limited={declarations.exemptions.hra.limited} 
              />
              <ExemptionRow label="Transport Exemption (sec 10(14))" 
                  produced={
                    <TextField size="small" sx={{ width: 100 }} value={declarations.exemptions.transport.produced} onChange={(e) => handleDeclarationChange('exemptions', 'transport', 'produced', e.target.value)} />
                  } 
                  limited={declarations.exemptions.transport.limited} 
              />
              <ExemptionRow label="Gratuity / Other (sec 10(10))" 
                  produced={
                    <TextField size="small" sx={{ width: 100 }} value={declarations.exemptions.gratuity.produced} onChange={(e) => handleDeclarationChange('exemptions', 'gratuity', 'produced', e.target.value)} />
                  } 
                  limited={declarations.exemptions.gratuity.limited} 
              />
              <ExemptionRow label="Children's Ed. Allowance (sec 10(14))" 
                  produced={
                    <TextField size="small" sx={{ width: 100 }} value={declarations.exemptions.childrenEduc.produced} onChange={(e) => handleDeclarationChange('exemptions', 'childrenEduc', 'produced', e.target.value)} />
                  } 
                  limited={declarations.exemptions.childrenEduc.limited} 
              />
              <ExemptionRow label="LTA Exemption (sec 10(5))" 
                  produced={
                    <TextField size="small" sx={{ width: 100 }} value={declarations.exemptions.lta.produced} onChange={(e) => handleDeclarationChange('exemptions', 'lta', 'produced', e.target.value)} />
                  } 
                  limited={declarations.exemptions.lta.limited} 
              />
              <ExemptionRow label="Uniform Expenses (sec 10(14))" 
                  produced={
                    <TextField size="small" sx={{ width: 100 }} value={declarations.exemptions.uniform.produced} onChange={(e) => handleDeclarationChange('exemptions', 'uniform', 'produced', e.target.value)} />
                  } 
                  limited={declarations.exemptions.uniform.limited} 
              />
               <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total Exempted Allowances</Typography>
                  <TextField size="small" sx={{ width: 150, '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#000', backgroundColor: '#f5f5f5' } }} value={Math.round(declarations.exemptions.totalLimited)} disabled />
              </Box>
          </DataCard>

           <DataCard title="B. Other Income & Bonus">
             <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Annual/Performance Bonus" value={declarations.otherIncome.bonus} onChange={(e) => handleDeclarationChange('otherIncome', 'bonus', null, e.target.value)} fullWidth size="small" margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Savings Bank & Bank Deposit Interest" value={declarations.otherIncome.savingsInt} onChange={(e) => handleDeclarationChange('otherIncome', 'savingsInt', null, e.target.value)} fullWidth size="small" margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Dividends (Indian Companies/MFs)" value={declarations.otherIncome.dividends} onChange={(e) => handleDeclarationChange('otherIncome', 'dividends', null, e.target.value)} fullWidth size="small" margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Capital Gains" value={declarations.otherIncome.capitalGains} onChange={(e) => handleDeclarationChange('otherIncome', 'capitalGains', null, e.target.value)} fullWidth size="small" margin="normal" />
                </Grid>
                 <Grid item xs={12} sm={6}>
                  <TextField label="Virtual Digital Assets (Crypto) - 30%" value={declarations.otherIncome.crypto} onChange={(e) => handleDeclarationChange('otherIncome', 'crypto', null, e.target.value)} fullWidth size="small" margin="normal" />
                </Grid>
             </Grid>
          </DataCard>

          <DataCard title="C. Deductions (Chapter VI-A)">
              <ExemptionRow label="80D - Health Insurance" 
                  produced={<TextField size="small" sx={{ width: 100 }} value={declarations.deductions.sec80D.produced} onChange={(e) => handleDeclarationChange('deductions', 'sec80D', 'produced', e.target.value)} />} 
                  limited={declarations.deductions.sec80D.limited} 
              />
              <ExemptionRow label="80DD/DDB - Medical (Handicapped/Specified)" 
                  produced={<TextField size="small" sx={{ width: 100 }} value={declarations.deductions.sec80DD_DDB.produced} onChange={(e) => handleDeclarationChange('deductions', 'sec80DD_DDB', 'produced', e.target.value)} />} 
                  limited={declarations.deductions.sec80DD_DDB.limited} 
              />
              <ExemptionRow label="80E/EEB - Education/EV Loan Interest" 
                  produced={<TextField size="small" sx={{ width: 100 }} value={declarations.deductions.sec80E_EEB.produced} onChange={(e) => handleDeclarationChange('deductions', 'sec80E_EEB', 'produced', e.target.value)} />} 
                  limited={declarations.deductions.sec80E_EEB.limited} 
              />
              <ExemptionRow label="80G - Donations to Charities" 
                  produced={<TextField size="small" sx={{ width: 100 }} value={declarations.deductions.sec80G.produced} onChange={(e) => handleDeclarationChange('deductions', 'sec80G', 'produced', e.target.value)} />} 
                  limited={declarations.deductions.sec80G.limited} 
              />
               <ExemptionRow label="80GG - Rent Deduction (if no HRA)" 
                  produced={<TextField size="small" sx={{ width: 100 }} value={declarations.deductions.sec80GG.produced} onChange={(e) => handleDeclarationChange('deductions', 'sec80GG', 'produced', e.target.value)} />} 
                  limited={declarations.deductions.sec80GG.limited} 
              />
              <ExemptionRow label="80TTA/U - Bank Interest / Disability" 
                  produced={<TextField size="small" sx={{ width: 100 }} value={declarations.deductions.sec80TTA_U.produced} onChange={(e) => handleDeclarationChange('deductions', 'sec80TTA_U', 'produced', e.target.value)} />} 
                  limited={declarations.deductions.sec80TTA_U.limited} 
              />
              <ExemptionRow label="Sec 24(b) - Home Loan Interest" 
                  produced={<TextField size="small" sx={{ width: 100 }} value={houseProperty.interest} onChange={(e) => dispatch(updateHouseProperty({interest: e.target.value}))} />} 
                  limited={Math.min(parseFloat(houseProperty.interest) || 0, 200000)} 
              />
          </DataCard>
          
           <DataCard title="D. Section 80C (Investments)">
             <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="NPS: Employee (80CCD(1))" value={declarations.sec80C.npsEmployee} onChange={(e) => handleDeclarationChange('sec80C', 'npsEmployee', null, e.target.value)} fullWidth size="small" margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="NPS: Employer (80CCD(2))" value={declarations.sec80C.npsEmployer} onChange={(e) => handleDeclarationChange('sec80C', 'npsEmployer', null, e.target.value)} fullWidth size="small" margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Standard 80C (PPF, NSC, ELSS, etc.)" value={declarations.sec80C.standard80C} onChange={(e) => handleDeclarationChange('sec80C', 'standard80C', null, e.target.value)} fullWidth size="small" margin="normal" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Superannuation" value={declarations.sec80C.superannuation} onChange={(e) => handleDeclarationChange('sec80C', 'superannuation', null, e.target.value)} fullWidth size="small" margin="normal" />
                </Grid>
             </Grid>
             <Box sx={{ mt: 3 }}>
                <ExemptionRow label="Total 80C (Including PF, VPF, Life Insur)" 
                  produced={<Typography>₹{Math.round(declarations.sec80C.totalProduced)}</Typography>} 
                  limited={declarations.sec80C.limited} 
                />
             </Box>
          </DataCard>
        </Grid>

        <Grid item xs={12} md={4} className="verdict-column">
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="secondary.main">
              Tax Verdict
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" color="text.secondary">Optimal Regime:</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
                {taxComparison.optimal}
              </Typography>
            </Box>

            <Box sx={{ mt: 2, mb: 4, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
              <Typography variant="body1" color="success.contrastText">
                You save <strong>₹{Math.round(taxComparison.savings).toLocaleString()}</strong> by choosing this regime.
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" fontWeight="bold">Tax Breakdown</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body1">Old Regime Taxable:</Typography>
                <Typography variant="body1" fontWeight="bold">₹{Math.round(taxComparison.oldRegime.taxableIncome).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body1">Old Regime Tax:</Typography>
                <Typography variant="body1" fontWeight="bold">₹{Math.round(taxComparison.oldRegime.tax).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid #ccc' }}>
                <Typography variant="body1">New Regime Taxable:</Typography>
                <Typography variant="body1" fontWeight="bold">₹{Math.round(taxComparison.newRegime.taxableIncome).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body1">New Regime Tax:</Typography>
                <Typography variant="body1" fontWeight="bold">₹{Math.round(taxComparison.newRegime.tax).toLocaleString()}</Typography>
              </Box>
            </Box>

            <Button variant="contained" color="primary" fullWidth sx={{ mt: 4 }} className="print-btn" onClick={() => window.print()}>
              Print Report
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Dynamic Row Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>{modalMode === 'add' ? 'Add Row' : 'Edit Row'}</DialogTitle>
        <DialogContent>
           <TextField
             autoFocus
             margin="dense"
             label="Label Name"
             fullWidth
             variant="outlined"
             value={modalLabel}
             onChange={(e) => setModalLabel(e.target.value)}
           />
        </DialogContent>
        <DialogActions>
           <Button onClick={() => setModalOpen(false)}>Cancel</Button>
           <Button onClick={handleModalSave} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tax Settings</DialogTitle>
        <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField label="Age" value={age} onChange={(e) => dispatch(updateAge(e.target.value))} fullWidth size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Metro City?</InputLabel>
                  <Select variant="outlined" value={settings.isMetro} label="Metro City?" onChange={(e) => handleSettingChange('isMetro', e.target.value)}>
                    <MenuItem value="Yes">Yes</MenuItem><MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Employee PF %" value={settings.pfPercent} onChange={(e) => handleSettingChange('pfPercent', e.target.value)} fullWidth size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Voluntary PF %" value={settings.vpfPercent} onChange={(e) => handleSettingChange('vpfPercent', e.target.value)} fullWidth size="small" />
              </Grid>
               
               <Grid item xs={12}>
                 <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>PF Inclusion Rules (Apply to all months)</Typography>
                 <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                       <TableBody>
                         {earningsFixed.map(item => (
                             <TableRow key={item.includeField}>
                                <TableCell>{item.label}</TableCell>
                                <TableCell align="right">
                                   <Select
                                      variant="outlined"
                                      value={calculatedSalary.months[0][item.includeField] || 'N'}
                                      onChange={(e) => dispatch(updateMonthData({ index: 0, field: item.includeField, value: e.target.value, populateRemaining: true }))}
                                      size="small"
                                      sx={{ width: 80, height: 30 }}
                                    >
                                      <MenuItem value="Y">Yes</MenuItem>
                                      <MenuItem value="N">No</MenuItem>
                                    </Select>
                                </TableCell>
                             </TableRow>
                         ))}
                         {dynamicRows.income.map(item => {
                            const fieldName = `includePf${item.id.charAt(0).toUpperCase() + item.id.slice(1)}`;
                            return (
                               <TableRow key={fieldName}>
                                <TableCell>{item.label}</TableCell>
                                <TableCell align="right">
                                   <Select
                                      variant="outlined"
                                      value={calculatedSalary.months[0][fieldName] || 'N'}
                                      onChange={(e) => dispatch(updateMonthData({ index: 0, field: fieldName, value: e.target.value, populateRemaining: true }))}
                                      size="small"
                                      sx={{ width: 80, height: 30 }}
                                    >
                                      <MenuItem value="Y">Yes</MenuItem>
                                      <MenuItem value="N">No</MenuItem>
                                    </Select>
                                </TableCell>
                             </TableRow>
                            )
                         })}
                       </TableBody>
                    </Table>
                 </TableContainer>
               </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
           <Button onClick={() => setSettingsModalOpen(false)} variant="contained" color="primary">Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaxDashboard;
