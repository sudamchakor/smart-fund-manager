import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Divider,
  Button,
  Tooltip,
  useTheme,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReadOnlyItem from '../../../components/common/ReadOnlyItem';
import ExpenseOptimizerModal from './ExpenseOptimizerModal';
import ExpenseDetailsModal from '../../../components/common/ExpenseDetailsModal';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectIncomes,
  deleteIncome,
  selectTotalMonthlyIncome,
  selectProfileExpenses,
  deleteExpense,
  updateExpense,
  selectTotalMonthlyExpenses,
  selectTotalYearlyExpenses,
  selectTotalMonthlyGoalContributions,
  selectIndividualGoalInvestmentContributions,
  selectGoals,
  selectCurrentSurplus,
  selectAnnualGoalRunway,
  selectTotalOneTimeInvestments,
  deleteGoal,
  selectPrioritizedGoalFunding,
} from '../../../store/profileSlice';
import {
  resetHomeLoanForm,
  selectCurrency,
  selectIsLoanActive,
} from '../../../store/emiSlice';
import { selectTaxComparison } from '../../../store/taxSlice';
import { selectCalculatedValues } from '../../emiCalculator/utils/emiCalculator';
import { formatCurrency } from '../../../utils/formatting';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../../../components/common/SectionHeader';

export default function FinancialSection({
  isIncome,
  onEditGoal,
  onOpenModal,
}) {
  const dispatch = useDispatch();
  const currency = useSelector(selectCurrency);
  const navigate = useNavigate();
  const theme = useTheme();
  const [isOptimizerOpen, setOptimizerOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsModalData, setDetailsModalData] = useState({ title: '', items: [] });

  const incomes = useSelector(selectIncomes) || [];
  const totalIncome = useSelector(selectTotalMonthlyIncome);
  const expenses = useSelector(selectProfileExpenses) || [];
  const totalProfileExpenses = useSelector(selectTotalMonthlyExpenses);
  const totalYearlyExpenses = useSelector(selectTotalYearlyExpenses);
  const totalMonthlyGoalContributions = useSelector(
    selectTotalMonthlyGoalContributions,
  );
  const individualGoalInvestments = useSelector(
    selectIndividualGoalInvestmentContributions,
  );
  const goals = useSelector(selectGoals) || [];
  const investableSurplus = useSelector(selectCurrentSurplus);
  const annualGoalRunway = useSelector(selectAnnualGoalRunway);
  const totalOneTimeInvestments = useSelector(selectTotalOneTimeInvestments);
  const { emi: monthlyEmi } = useSelector(selectCalculatedValues);
  const isLoanActive = useSelector(selectIsLoanActive);
  const taxComparison = useSelector(selectTaxComparison);
  const prioritizedGoals = useSelector(selectPrioritizedGoalFunding);

  const totalAmount = isIncome
    ? totalIncome
    : totalProfileExpenses +
      (isLoanActive ? monthlyEmi || 0 : 0) +
      totalMonthlyGoalContributions;

  const flexibleExpenses = useMemo(
    () =>
      expenses.filter(
        (exp) =>
          exp.category === 'basic' || exp.category === 'discretionary',
      ),
    [expenses],
  );

  const handleApplyExpenses = (updatedExpenses) => {
    updatedExpenses.forEach((expense) => {
      dispatch(updateExpense(expense));
    });
  };

  const groupedGoals = useMemo(() => {
    return individualGoalInvestments.reduce((acc, inv) => {
      if (!acc[inv.goalId]) {
        const goal = goals.find((g) => g.id === inv.goalId);
        acc[inv.goalId] = {
          id: inv.goalId,
          name: goal?.name || 'Goal',
          amount: 0,
          frequency: 'monthly',
          investments: [],
        };
      }
      // Exclude funded investments from the total amount
      if (!inv.isFunded) {
        let monthly = inv.amount || 0;
        if (inv.frequency === 'yearly') monthly /= 12;
        else if (inv.frequency === 'quarterly') monthly /= 3;
        acc[inv.goalId].amount += monthly;
      }
      acc[inv.goalId].investments.push(inv);
      return acc;
    }, {});
  }, [individualGoalInvestments, goals]);

  const getExpenseItemColor = useCallback(
    (category) => {
      if (category === 'basic') return theme.palette.info.main;
      if (category === 'discretionary') return theme.palette.warning.main;
      return theme.palette.primary.main;
    },
    [theme.palette],
  );

  const taxRate = useMemo(() => {
    if (!taxComparison) return 0;
    const taxableIncome =
      taxComparison.optimal === 'Old Regime'
        ? taxComparison.oldRegime.taxableIncome
        : taxComparison.newRegime.taxableIncome;

    if (taxableIncome > 1000000) return 0.3;
    if (taxableIncome > 500000) return 0.2;
    if (taxableIncome > 250000) return 0.05;
    return 0;
  }, [taxComparison]);

  const handleOpenDetailsModal = (title, items) => {
    setDetailsModalData({ title, items });
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setDetailsModalData({ title: '', items: [] });
  };

  const monthlyExpensesList = useMemo(() => {
    const list = [...expenses];
    if (isLoanActive && monthlyEmi > 0) {
      list.push({
        id: 'home-loan-emi',
        name: 'Home Loan EMI',
        amount: monthlyEmi,
        frequency: 'monthly',
        category: 'loan',
      });
    }
    Object.values(groupedGoals).forEach(goal => {
      const correspondingPrioritizedGoal = prioritizedGoals.find(pg => pg.id === goal.id);
      if (correspondingPrioritizedGoal && correspondingPrioritizedGoal.status !== 'Fully Funded') {
        list.push({
          id: goal.id,
          name: `${goal.name} (Goal Contribution)`,
          amount: goal.amount,
          frequency: 'monthly',
          category: 'goal',
        });
      }
    });
    return list;
  }, [expenses, isLoanActive, monthlyEmi, groupedGoals, prioritizedGoals]);

  const oneTimeInvestmentsList = useMemo(() => {
    return individualGoalInvestments.filter(inv => inv.frequency === 'one-time').map(inv => {
      const goal = goals.find(g => g.id === inv.goalId);
      return {
        id: inv.id,
        name: `${goal?.name || 'Goal'} (One-Time Investment)`,
        amount: inv.amount,
        frequency: 'one-time',
        category: 'goal-one-time',
        year: inv.year,
        isFunded: inv.isFunded,
      };
    });
  }, [individualGoalInvestments, goals]);


  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            pt: 2.5,
            px: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <SectionHeader
            title={isIncome ? 'Income Details' : 'Expense Details'}
            icon={isIncome ? <AttachMoneyIcon /> : <MoneyOffIcon />}
            color={
              isIncome ? theme.palette.success.main : theme.palette.error.main
            }
          />
          <Stack direction="row" spacing={1}>
            {!isIncome && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AutoAwesomeIcon />}
                onClick={() => setOptimizerOpen(true)}
                sx={{ borderRadius: 1.5, mt: 0.5 }}
              >
                Optimize
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => onOpenModal(isIncome ? 'income' : 'expense')}
              sx={{ borderRadius: 1.5, mt: 0.5 }}
            >
              Add
            </Button>
          </Stack>
        </Box>
        <Divider sx={{ mt: -1 }} />

        <CardContent
          sx={{
            flexGrow: 1,
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            '&:last-child': { pb: 0 },
          }}
        >
          <Box
            sx={{
              p: 2,
              flexGrow: 1,
              overflowY: 'auto',
              maxHeight: '340px',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#ccc',
                borderRadius: '10px',
              },
            }}
          >
            {isIncome ? (
              incomes.length === 0 ? (
                <Box
                  sx={{
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.6,
                    textAlign: 'center',
                  }}
                >
                  <SavingsOutlinedIcon
                    sx={{ fontSize: 64, mb: 2, color: 'text.secondary' }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: 'text.secondary' }}
                  >
                    No income streams added.
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Add your salary, rental income, or other inflows.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {incomes.map((item) => (
                    <ReadOnlyItem
                      key={item.id}
                      item={item}
                      currency={currency}
                      isIncome={true}
                      isReadOnly={false}
                      onDelete={(id) => dispatch(deleteIncome(id))}
                      onEdit={(itemId) =>
                        onOpenModal(
                          'income',
                          incomes.find((inc) => inc.id === itemId),
                          'edit',
                        )
                      }
                      formatCurrency={formatCurrency}
                      totalIncome={totalIncome}
                    />
                  ))}
                </Stack>
              )
            ) : Object.keys(groupedGoals).length === 0 &&
              expenses.length === 0 &&
              !(isLoanActive && monthlyEmi > 0) ? (
              <Box
                sx={{
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                  textAlign: 'center',
                }}
                >
                <ReceiptLongOutlinedIcon
                  sx={{ fontSize: 64, mb: 2, color: 'text.secondary' }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: 'text.secondary' }}
                >
                  No expenses recorded.
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Add your monthly liabilities and basic needs.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {isLoanActive && monthlyEmi > 0 && (
                  <ReadOnlyItem
                    item={{
                      id: 'home-loan-emi',
                      name: 'Home Loan EMI',
                      amount: monthlyEmi,
                      frequency: 'monthly'
                    }}
                    currency={currency}
                    isExpense={true}
                    totalIncome={totalIncome}
                    expenseRatio={(monthlyEmi / totalIncome) * 100}
                    formatCurrency={formatCurrency}
                    onConfirmDelete={() => dispatch(resetHomeLoanForm())}
                    isReadOnly={false}
                    onEdit={() => navigate('/calculator')}
                    deletionImpactMessage="This will permanently clear your EMI calculator data, including your full loan schedule, property details, and prepayments. This action cannot be undone."
                  />
                )}
                {Object.values(groupedGoals).map((goal) => (
                  <ReadOnlyItem
                    key={goal.id}
                    item={goal}
                    subItems={goal.investments}
                    currency={currency}
                    isExpense={true}
                    totalIncome={totalIncome}
                    expenseRatio={(goal.amount / totalIncome) * 100}
                    formatCurrency={formatCurrency}
                    isGoal={true}
                    isReadOnly={false}
                    onEditGoal={() => onEditGoal(goal.id)}
                    onConfirmDelete={() => dispatch(deleteGoal(goal.id))}
                    deletionImpactMessage={`This will permanently delete the goal "${goal.name}" and all its associated investment strategies.`}
                  />
                ))}
                {expenses.map((item) => (
                  <ReadOnlyItem
                    key={item.id}
                    item={item}
                    currency={currency}
                    isExpense={true}
                    isReadOnly={false}
                    onDelete={(id) => dispatch(deleteExpense(id))}
                    onEdit={(itemId) =>
                      onOpenModal(
                        'expense',
                        expenses.find((exp) => exp.id === itemId),
                        'edit',
                      )
                    }
                    formatCurrency={formatCurrency}
                    totalIncome={totalIncome}
                    expenseColor={getExpenseItemColor(item.category)}
                    taxRate={taxRate}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {isIncome ? (
            <Box
              sx={{
                p: 2,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 'auto',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Total Monthly Income
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {formatCurrency(totalAmount)}
              </Typography>
            </Box>
          ) : (
            <Grid container sx={{ mt: 'auto', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    height: '100%',
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                    color: 'white',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                      Total Monthly Expenses
                    </Typography>
                    <Tooltip title="View monthly expense details">
                      <InfoIcon
                        fontSize="small"
                        sx={{ cursor: 'pointer', opacity: 0.8 }}
                        onClick={() => handleOpenDetailsModal('Monthly Expense Details', monthlyExpensesList)}
                      />
                    </Tooltip>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {formatCurrency(totalAmount)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    height: '100%',
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                    Total Yearly Expenses
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {formatCurrency(totalYearlyExpenses)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    height: '100%',
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                      Total One-Time Expenses
                    </Typography>
                    <Tooltip title="View one-time expense details">
                      <InfoIcon
                        fontSize="small"
                        sx={{ cursor: 'pointer', opacity: 0.8 }}
                        onClick={() => handleOpenDetailsModal('One-Time Expense Details', oneTimeInvestmentsList)}
                      />
                    </Tooltip>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {formatCurrency(totalOneTimeInvestments)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
      <ExpenseOptimizerModal
        open={isOptimizerOpen}
        onClose={() => setOptimizerOpen(false)}
        currentIncome={totalIncome}
        flexibleExpenses={flexibleExpenses}
        currency={currency}
        onApply={handleApplyExpenses}
      />
      <ExpenseDetailsModal
        open={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        title={detailsModalData.title}
        items={detailsModalData.items}
        currency={currency}
        formatCurrency={formatCurrency}
      />
    </>
  );
}