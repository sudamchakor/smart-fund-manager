import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Divider,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Assignment as DetailsIcon,
  TrendingUp as IncrementIcon,
  ReceiptLong as ExpenseIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateLoanDetails,
  updateExpenses,
  changeLoanUnit,
  changeExpenseUnit,
  selectLoanDetails,
  selectExpenses,
  selectCurrency,
} from '../../../store/emiSlice';
import { selectCalculatedValues } from '../utils/emiCalculator';
import {
  AmountInput,
  AmountWithUnitInput,
  DatePickerInput,
} from '../../../components/common/CommonComponents';
import {
  convertAmount,
  convertTenure,
  convertYearlyPaymentIncrease,
} from '../utils/emiCalculator';
import SectionHeader from '../../../components/common/SectionHeader';

const HomeLoanForm = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const loanDetails = useSelector(selectLoanDetails);
  const expenses = useSelector(selectExpenses);
  const calculatedValues = useSelector(selectCalculatedValues);
  const currency = useSelector(selectCurrency);

  const handleUnitChange = (unitField, amountField, event) => {
    const newUnit = event.target.value;
    const oldUnit = loanDetails[unitField];
    const currentAmount = loanDetails[amountField];
    let convertedAmount;

    if (unitField === 'tenureUnit') {
      convertedAmount = convertTenure(currentAmount, oldUnit, newUnit);
    } else if (unitField === 'yearlyPaymentIncreaseUnit') {
      convertedAmount = convertYearlyPaymentIncrease(
        currentAmount,
        oldUnit,
        newUnit,
        calculatedValues.emi,
      );
    } else {
      let baseValue = loanDetails.homeValue;
      if (unitField === 'feesUnit') baseValue = calculatedValues.loanAmount;
      convertedAmount = convertAmount(
        currentAmount,
        oldUnit,
        newUnit,
        baseValue,
      );
    }
    dispatch(
      changeLoanUnit({ unitField, amountField, newUnit, convertedAmount }),
    );
  };

  const handleChange = (field, event) => {
    let value = parseFloat(event.target.value);
    if (isNaN(value)) value = 0;
    dispatch(updateLoanDetails({ key: field, value }));
  };

  const handleExpenseUnitChange = (unitField, amountField, event) => {
    const newUnit = event.target.value;
    const oldUnit = expenses[unitField];
    const currentAmount = expenses[amountField];
    const baseValue = loanDetails.homeValue;
    const convertedAmount = convertAmount(
      currentAmount,
      oldUnit,
      newUnit,
      baseValue,
    );
    dispatch(
      changeExpenseUnit({ unitField, amountField, newUnit, convertedAmount }),
    );
  };

  const handleExpenseChange = (field, event) => {
    let value = parseFloat(event.target.value);
    if (isNaN(value)) value = 0;
    dispatch(updateExpenses({ key: field, value }));
  };

  return (
    <Box>
      {/* SECTION 1: CORE LOAN DETAILS */}
      <SectionHeader
        title="Home Loan Details"
        icon={<DetailsIcon />}
        color={theme.palette.primary.main}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AmountInput
            label="Home Value (HV)"
            value={loanDetails.homeValue}
            onChange={(e) => handleChange('homeValue', e)}
            currency={currency}
            placeholder="Enter home value"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AmountWithUnitInput
            label="Margin / Down Payment"
            value={loanDetails.marginAmount}
            onAmountChange={(e) => handleChange('marginAmount', e)}
            unitValue={loanDetails.marginUnit}
            onUnitChange={(e) =>
              handleUnitChange('marginUnit', 'marginAmount', e)
            }
            unitOptions={[
              { value: 'Rs', label: currency },
              { value: '%', label: '%' },
            ]}
          />
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'block',
              fontWeight: 500,
              color: 'text.secondary',
            }}
          >
            Total: {currency}{' '}
            {(calculatedValues?.marginInRs ?? 0).toLocaleString('en-IN')}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AmountInput
            label="Loan Insurance (LI)"
            value={loanDetails.loanInsurance}
            onChange={(e) => handleChange('loanInsurance', e)}
            currency={currency}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AmountInput
            label="Loan Amount"
            value={(calculatedValues?.loanAmount ?? 0).toFixed(2)}
            disabled={true}
            currency={currency}
            sx={{
              bgcolor: alpha(theme.palette.action.disabledBackground, 0.05),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AmountInput
            label="Interest Rate"
            value={loanDetails.interestRate}
            onChange={(e) => handleChange('interestRate', e)}
            currency="%"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AmountWithUnitInput
            label="Loan Tenure"
            value={loanDetails.loanTenure}
            onAmountChange={(e) => handleChange('loanTenure', e)}
            unitValue={loanDetails.tenureUnit}
            onUnitChange={(e) =>
              handleUnitChange('tenureUnit', 'loanTenure', e)
            }
            unitOptions={[
              { value: 'years', label: 'Y' },
              { value: 'months', label: 'M' },
            ]}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AmountWithUnitInput
            label="Loan Fees & Charges"
            value={loanDetails.loanFees}
            onAmountChange={(e) => handleChange('loanFees', e)}
            unitValue={loanDetails.feesUnit}
            onUnitChange={(e) => handleUnitChange('feesUnit', 'loanFees', e)}
            unitOptions={[
              { value: 'Rs', label: currency },
              { value: '%', label: '%' },
            ]}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <DatePickerInput
            label="Start Month & Year"
            value={loanDetails.startDate}
            onChange={(newValue) =>
              dispatch(updateLoanDetails({ key: 'startDate', value: newValue }))
            }
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

      {/* SECTION 2: YEARLY INCREMENT */}
      <SectionHeader
        title="Yearly Payment Increment"
        icon={<IncrementIcon />}
        color={theme.palette.success.main}
      />
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Plan a voluntary yearly increase to pay off the principal faster. This
          significantly reduces your long-term interest burden.
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AmountWithUnitInput
              label="Yearly Payment Increase"
              value={loanDetails.yearlyPaymentIncreaseAmount}
              onAmountChange={(e) =>
                handleChange('yearlyPaymentIncreaseAmount', e)
              }
              unitValue={loanDetails.yearlyPaymentIncreaseUnit}
              onUnitChange={(e) =>
                handleUnitChange(
                  'yearlyPaymentIncreaseUnit',
                  'yearlyPaymentIncreaseAmount',
                  e,
                )
              }
              unitOptions={[
                { value: 'Rs', label: currency },
                { value: '%', label: '%' },
              ]}
            />
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                display: 'block',
                fontWeight: 500,
                color: 'text.secondary',
              }}
            >
              Value: {currency}{' '}
              {(calculatedValues?.yearlyIncreaseAmountRs ?? 0).toLocaleString(
                'en-IN',
              )}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

      {/* SECTION 3: HOMEOWNER EXPENSES */}
      <SectionHeader
        title="Homeowner Expenses"
        icon={<ExpenseIcon />}
        color={theme.palette.warning.main}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AmountWithUnitInput
            label="One-time Expenses"
            value={expenses.oneTimeExpenses}
            onAmountChange={(e) => handleExpenseChange('oneTimeExpenses', e)}
            unitValue={expenses.oneTimeUnit}
            onUnitChange={(e) =>
              handleExpenseUnitChange('oneTimeUnit', 'oneTimeExpenses', e)
            }
            unitOptions={[
              { value: 'Rs', label: currency },
              { value: '%', label: '%' },
            ]}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AmountWithUnitInput
            label="Property Taxes / year"
            value={expenses.propertyTaxes}
            onAmountChange={(e) => handleExpenseChange('propertyTaxes', e)}
            unitValue={expenses.taxesUnit}
            onUnitChange={(e) =>
              handleExpenseUnitChange('taxesUnit', 'propertyTaxes', e)
            }
            unitOptions={[
              { value: 'Rs', label: currency },
              { value: '%', label: '%' },
            ]}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AmountWithUnitInput
            label="Home Insurance / year"
            value={expenses.homeInsurance}
            onAmountChange={(e) => handleExpenseChange('homeInsurance', e)}
            unitValue={expenses.homeInsUnit}
            onUnitChange={(e) =>
              handleExpenseUnitChange('homeInsUnit', 'homeInsurance', e)
            }
            unitOptions={[
              { value: 'Rs', label: currency },
              { value: '%', label: '%' },
            ]}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AmountInput
            label="Maintenance / month"
            value={expenses.maintenance}
            onChange={(e) => handleExpenseChange('maintenance', e)}
            currency={currency}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomeLoanForm;
