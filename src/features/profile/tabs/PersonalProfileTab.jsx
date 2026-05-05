import React, { useState } from 'react';
import {
  Grid,
  Box,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import {
  AttachMoney,
  MoneyOff,
  AccountBalanceWallet,
  Edit as EditIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  Person as PersonIcon, // New Icon Import
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

// Component Imports
import BasicInfoDisplay from '../components/BasicInfoDisplay';
import BasicInfoEdit from '../components/BasicInfoEdit';
import FinancialSettings from '../components/FinancialSettings';
import CashFlowDonutChart from '../components/CashFlowDonutChart';
import ProjectedCashFlowChart from '../components/ProjectedCashFlowChart';
import FinancialSection from '../components/FinancialSection';
import CorpusManager from '../../corpus/CorpusManager';
import FinancialModal from '../components/FinancialModal';
import ActionSpeedDial from '../../../components/common/ActionSpeedDial';

// Selector Imports
import {
  selectProfileExpenses,
  selectCurrentAge,
  selectRetirementAge,
  setCurrentAge,
  setRetirementAge,
  selectTotalMonthlyGoalContributions,
  selectIndividualGoalInvestmentContributions,
  selectGoals,
  selectPrioritizedGoalFunding,
  selectIncomes,
  selectGeneralInflationRate,
  selectCareerGrowthRate,
} from '../../../store/profileSlice';
import { selectCalculatedValues } from '../../emiCalculator/utils/emiCalculator';
import { investmentCategories } from '../../../utils/taxRules';

export default function PersonalProfileTab({ onEditGoal }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalAsset, setModalAsset] = useState(null);
  const [modalMode, setModalMode] = useState('add');

  // Data Selectors
  const expenses = useSelector(selectProfileExpenses) || [];
  const incomes = useSelector(selectIncomes) || [];
  const currentAge = useSelector(selectCurrentAge) || 30;
  const retirementAge = useSelector(selectRetirementAge) || 60;
  const careerGrowthRaw = useSelector(selectCareerGrowthRate);
  const careerGrowthRate =
    typeof careerGrowthRaw === 'object'
      ? careerGrowthRaw.value
      : careerGrowthRaw || 0;
  const careerGrowthType =
    typeof careerGrowthRaw === 'object' ? careerGrowthRaw.type : 'percentage';
  const generalInflationRate = useSelector(selectGeneralInflationRate) || 0.06;

  const { emi: monthlyEmi } = useSelector(selectCalculatedValues);
  const emiState = useSelector(
    (state) => state.emi || state.emiCalculator || {},
  );

  const totalMonthlyGoalContributions = useSelector(
    selectTotalMonthlyGoalContributions,
  );
  const individualGoalInvestments = useSelector(
    selectIndividualGoalInvestmentContributions,
  );
  const goalsWithFunding = useSelector(selectPrioritizedGoalFunding) || [];
  const goals = useSelector(selectGoals) || [];

  // Chart Data Calculation
  const needsValue = expenses
    .filter((e) => e.category === 'basic')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const wantsValue = expenses
    .filter((e) => e.category === 'discretionary')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const donutData = [
    { name: 'Needs', value: needsValue },
    { name: 'Wants', value: wantsValue },
    { name: 'Loan EMIs', value: monthlyEmi || 0 },
    { name: 'Future Wealth', value: totalMonthlyGoalContributions },
  ].filter((item) => item.value > 0);

  // Handlers
  const handleSaveBasicInfo = (newCurrentAge, newRetirementAge) => {
    dispatch(setCurrentAge(newCurrentAge));
    dispatch(setRetirementAge(newRetirementAge));
    setEditingBasicInfo(false);
  };

  const handleOpenFinancialModal = (type, assetData = null, mode = 'add') => {
    setModalType(type);
    setModalAsset(assetData);
    setModalMode(mode);
    setModalOpen(true);
    setSpeedDialOpen(false);
  };

  const handleCloseFinancialModal = () => {
    setModalOpen(false);
    setModalType('');
    setModalAsset(null);
    setModalMode('add');
  };

  const actions = [
    {
      icon: <AccountBalanceWallet />,
      name: 'Corpus',
      handler: () => handleOpenFinancialModal('corpus', null, 'add'),
      tooltipOpen: true,
    },
    {
      icon: <AttachMoney />,
      name: 'Income',
      handler: () => handleOpenFinancialModal('income', null, 'add'),
      tooltipOpen: true,
    },
    {
      icon: <MoneyOff />,
      name: 'Expense',
      handler: () => handleOpenFinancialModal('expense', null, 'add'),
      tooltipOpen: true,
    },
  ];

  return (
    <Box sx={{ pb: 10 }}>
      <Grid container spacing={3}>
        {/* ROW 1: CORE PROFILE & SETTINGS */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '520px',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: 1,
            }}
          >
            <CardHeader
              sx={{ py: 1.5, px: 2 }}
              title={
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Basic Information
                  </Typography>
                </Stack>
              }
              action={
                !editingBasicInfo && (
                  <IconButton
                    size="small"
                    onClick={() => setEditingBasicInfo(true)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )
              }
            />
            <Divider />
            <CardContent sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
              {editingBasicInfo ? (
                <BasicInfoEdit
                  currentAge={currentAge}
                  retirementAge={retirementAge}
                  onSave={handleSaveBasicInfo}
                  onCancel={() => setEditingBasicInfo(false)}
                />
              ) : (
                <BasicInfoDisplay
                  currentAge={currentAge}
                  retirementAge={retirementAge}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <FinancialSettings />
        </Grid>

        {/* SECTION HEADER: ASSETS & INCOME */}
        <Grid item xs={12}>
          <Divider>
            <Chip
              label="ASSETS & CASH FLOW"
              sx={{ fontWeight: 800, letterSpacing: 1 }}
            />
          </Divider>
        </Grid>

        <Grid item xs={12} md={6}>
          <CorpusManager onOpenModal={handleOpenFinancialModal} />
        </Grid>

        <Grid item xs={12} md={6}>
          <FinancialSection
            isIncome={true}
            onOpenModal={handleOpenFinancialModal}
          />
        </Grid>

        {/* SECTION HEADER: EXPENSES & ALLOCATION */}
        <Grid item xs={12} md={6}>
          <FinancialSection
            isIncome={false}
            onEditGoal={onEditGoal}
            goalsWithFunding={goalsWithFunding}
            onOpenModal={handleOpenFinancialModal}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1 }}>
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Monthly Cash Flow Breakdown
                </Typography>
              }
              avatar={<PieChartIcon sx={{ color: 'warning.main' }} />}
            />
            <Divider />
            <CardContent>
              <Box sx={{ width: '100%', height: 350 }}>
                <CashFlowDonutChart donutData={donutData} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* SECTION HEADER: PROJECTIONS */}
        <Grid item xs={12}>
          <Divider>
            <Chip
              label="FUTURE PROJECTIONS"
              sx={{ fontWeight: 800, letterSpacing: 1 }}
            />
          </Divider>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
            <CardHeader
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Projected Annual Income vs. Expenses
                </Typography>
              }
              avatar={<TimelineIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Box sx={{ width: '100%', height: 400 }}>
                <ProjectedCashFlowChart
                  currentAge={currentAge}
                  retirementAge={retirementAge}
                  careerGrowthRate={careerGrowthRate}
                  careerGrowthType={careerGrowthType}
                  monthlyEmi={monthlyEmi}
                  emiState={emiState}
                  individualGoalInvestments={individualGoalInvestments}
                  goals={goals}
                  expenses={expenses}
                  incomes={incomes}
                  inflationRate={generalInflationRate}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Button (Mobile) */}
      {isSmallScreen && (
        <ActionSpeedDial
          actions={actions}
          sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 9999 }}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          open={speedDialOpen}
        />
      )}

      <FinancialModal
        open={modalOpen}
        onClose={handleCloseFinancialModal}
        type={modalType}
        asset={modalAsset}
        mode={modalMode}
        investmentCategories={investmentCategories}
      />
    </Box>
  );
}
