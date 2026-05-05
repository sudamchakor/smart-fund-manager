import React, { useMemo, useCallback } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff'; // Keep this icon
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReadOnlyItem from '../../../components/common/ReadOnlyItem';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectIncomes,
  deleteIncome,
  selectTotalMonthlyIncome,
  selectProfileExpenses,
  deleteExpense,
  selectTotalMonthlyExpenses,
  selectTotalMonthlyGoalContributions,
  selectIndividualGoalInvestmentContributions,
  selectGoals,
  selectCurrentSurplus,
  deleteGoal,
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

  const incomes = useSelector(selectIncomes) || [];
  const totalIncome = useSelector(selectTotalMonthlyIncome);
  const expenses = useSelector(selectProfileExpenses) || [];
  const totalProfileExpenses = useSelector(selectTotalMonthlyExpenses);
  const totalMonthlyGoalContributions = useSelector(
    selectTotalMonthlyGoalContributions,
  );
  const individualGoalInvestments = useSelector(
    selectIndividualGoalInvestmentContributions,
  );
  const goals = useSelector(selectGoals) || [];
  const investableSurplus = useSelector(selectCurrentSurplus);
  const { emi: monthlyEmi } = useSelector(selectCalculatedValues);
  const isLoanActive = useSelector(selectIsLoanActive);
  const taxComparison = useSelector(selectTaxComparison);

  const totalAmount = isIncome
    ? totalIncome
    : totalProfileExpenses +
      (isLoanActive ? monthlyEmi || 0 : 0) +
      totalMonthlyGoalContributions;
  const isBudgetExceeded = !isIncome && investableSurplus < 0;

  // Grouping logic to pass investments into the subItems prop
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
      let monthly = inv.amount || 0;
      if (inv.frequency === 'yearly') monthly /= 12;
      else if (inv.frequency === 'quarterly') monthly /= 3;

      acc[inv.goalId].amount += monthly;
      acc[inv.goalId].investments.push(inv);
      return acc;
    }, {});
  }, [individualGoalInvestments, goals]);

  // Helper function to determine expense item color for text
  const getExpenseItemColor = useCallback(
    (category) => {
      if (category === 'basic') return theme.palette.info.main;
      if (category === 'discretionary') return theme.palette.warning.main;
      return theme.palette.primary.main; // Default if no category match
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

  return (
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
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onOpenModal(isIncome ? 'income' : 'expense')}
          sx={{ borderRadius: 1.5, mt: 0.5 }}
        >
          Add
        </Button>
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
                  subItems={goal.investments} // investments passed to subItems
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
                  isReadOnly={false} // Ensure edit button is visible
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

        <Box
          sx={{
            p: 2,
            background: (theme) =>
              `linear-gradient(135deg, ${
                isBudgetExceeded
                  ? theme.palette.error.main
                  : theme.palette.primary.main
              } 0%, ${
                isBudgetExceeded
                  ? theme.palette.error.dark
                  : theme.palette.primary.dark
              } 100%)`,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {isIncome ? 'Total Income' : 'Total Expenses'}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {formatCurrency(totalAmount)}
            </Typography>
            {isBudgetExceeded && (
              <Tooltip title="Spending exceeds income">
                <InfoIcon fontSize="small" sx={{ color: 'white' }} />
              </Tooltip>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
