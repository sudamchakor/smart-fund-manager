import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Stack,
  alpha,
  useTheme,
  Alert,
  Tabs,
  Tab,
  Divider,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Print as PrintIcon,
  LightbulbOutlined as LightbulbIcon,
} from '@mui/icons-material';
import { generateTaxReportPDF } from '../../utils/taxReportGenerator';
import { useSelector } from 'react-redux';
import { selectCurrency } from '../../store/emiSlice';
import DetailRow from '../common/DetailRow';

const TaxSummary = ({
  taxComparison,
  declarations,
  onQuickFill,
  breakEven,
  calculatedSalary,
  hraBreakdown,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currency = useSelector(selectCurrency) || '₹';
  const [activeTab, setActiveTab] = useState('old');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleExport = () => {
    generateTaxReportPDF(taxComparison, breakEven, calculatedSalary);
  };

  const renderRegimeView = (regime, type) => (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.divider, 0.03),
        border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
      }}
    >
      <Stack spacing={1}>
        <DetailRow
          label="Gross Income"
          value={`${currency} ${Math.round(regime.grossIncome).toLocaleString('en-IN')}`}
        />
        <DetailRow
          label="Deductions"
          value={`- ${currency} ${Math.round(regime.deductions).toLocaleString('en-IN')}`}
        />
        <Divider />
        <DetailRow
          label="Taxable Income"
          value={`${currency} ${Math.round(regime.taxableIncome).toLocaleString('en-IN')}`}
        />
        <Stack direction="row" justifyContent="space-between">
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            Tax Liability
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 900,
              color:
                taxComparison.optimal === type ? 'success.main' : 'error.main',
            }}
          >
            {currency} {Math.round(regime.tax).toLocaleString('en-IN')}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 4,
        position: isMobile ? 'static' : 'sticky',
        top: 24,
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        boxShadow: `0 12px 40px ${alpha(
          theme.palette.common.black || '#000',
          0.05,
        )}`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 800,
          textTransform: 'uppercase',
          color: 'text.disabled',
          letterSpacing: 1.5,
          display: 'block',
          mb: 2,
        }}
      >
        System Output
      </Typography>

      {hraBreakdown.eligibleHra > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Rent expense detected. Potential HRA deduction of {currency}
          {hraBreakdown.eligibleHra.toLocaleString('en-IN')} calculated.
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'uppercase',
          }}
        >
          Recommended Regime
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            color: 'primary.main',
            letterSpacing: -1,
            lineHeight: 1.2,
            mt: 0.5,
          }}
        >
          {taxComparison.optimal}
        </Typography>
      </Box>

      <Box
        sx={{
          mb: 4,
          p: 2,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <SuccessIcon sx={{ color: 'success.main' }} />
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: 'success.dark',
              textTransform: 'uppercase',
            }}
          >
            Maximum Efficiency
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: 'text.primary' }}
          >
            Saves{' '}
            <strong style={{ whiteSpace: 'nowrap' }}>
              {currency}{' '}
              {Math.round(taxComparison.savings).toLocaleString('en-IN')}
            </strong>{' '}
            in liabilities.
          </Typography>
        </Box>
      </Box>

      {breakEven.investmentNeeded > 0 && (
        <Alert
          icon={<LightbulbIcon fontSize="inherit" />}
          severity="info"
          sx={{ mb: 4, borderRadius: 2 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
            Tax Optimizer
          </Typography>
          <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
            You could save an additional{' '}
            <strong style={{ whiteSpace: 'nowrap' }}>
              {currency} {breakEven.potentialSavings.toLocaleString('en-IN')}
            </strong>{' '}
            in the Old Regime if you invest{' '}
            <strong style={{ whiteSpace: 'nowrap' }}>
              {currency} {breakEven.investmentNeeded.toLocaleString('en-IN')}
            </strong>{' '}
            more in Section {breakEven.section}.
          </Typography>
          <Button
            size="small"
            variant="contained"
            onClick={() =>
              onQuickFill(breakEven.section, breakEven.investmentNeeded)
            }
          >
            Quick-Fill
          </Button>
        </Alert>
      )}

      <Box sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Old Regime" value="old" />
          <Tab label="New Regime" value="new" />
        </Tabs>
      </Box>

      {activeTab === 'old' &&
        renderRegimeView(taxComparison.oldRegime, 'Old Regime')}
      {activeTab === 'new' &&
        renderRegimeView(taxComparison.newRegime, 'New Regime')}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        startIcon={<PrintIcon />}
        onClick={handleExport}
        sx={{
          mt: 4,
          py: 1.5,
          fontWeight: 800,
          borderRadius: 2,
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      >
        Export Report
      </Button>
    </Box>
  );
};

export default TaxSummary;
