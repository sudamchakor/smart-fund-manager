import React from 'react';
import { Box, Typography, Grid, Stack, useTheme, alpha } from '@mui/material';
import {
  EventRepeat as RepeatIcon,
  CalendarMonth as MonthlyIcon,
  EventAvailable as OneTimeIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  updatePrepayments,
  selectPrepayments,
  selectCurrency,
} from '../../../store/emiSlice';
import {
  AmountInput,
  DatePickerInput,
} from '../../../components/common/CommonComponents';
import SectionHeader from '../../../components/common/SectionHeader';

const PrepaymentSection = ({
  title,
  icon,
  iconColor,
  amountValue,
  onAmountChange,
  dateLabel,
  dateValue,
  onDateChange,
  currency,
}) => (
  <Grid item xs={12} sm={6} md={3}>
    <Box sx={{ height: '100%' }}>
      <SectionHeader title={title} icon={icon} color={iconColor} />
      <Stack spacing={2}>
        <AmountInput
          label="Amount"
          value={amountValue}
          onChange={onAmountChange}
          currency={currency}
        />
        <DatePickerInput
          label={dateLabel}
          value={dateValue}
          onChange={onDateChange}
        />
      </Stack>
    </Box>
  </Grid>
);

const PrepaymentsForm = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const prepayments = useSelector(selectPrepayments);
  const currency = useSelector(selectCurrency);

  const handleAmountChange = (type, event) => {
    let value = parseFloat(event.target.value);
    if (isNaN(value)) value = 0;
    dispatch(updatePrepayments({ type, key: 'amount', value }));
  };

  const handleDateChange = (type, newValue) => {
    dispatch(
      updatePrepayments({
        type,
        key: type === 'oneTime' ? 'date' : 'startDate',
        value: newValue,
      }),
    );
  };

  return (
    <Box>
      <Grid container spacing={4}>
        <PrepaymentSection
          title="Monthly"
          icon={<MonthlyIcon />}
          iconColor={theme.palette.primary.main}
          amountValue={prepayments.monthly.amount}
          onAmountChange={(e) => handleAmountChange('monthly', e)}
          dateLabel="Starting from"
          dateValue={prepayments.monthly.startDate}
          onDateChange={(newValue) => handleDateChange('monthly', newValue)}
          currency={currency}
        />

        <PrepaymentSection
          title="Yearly"
          icon={<RepeatIcon />}
          iconColor={theme.palette.success.main}
          amountValue={prepayments.yearly.amount}
          onAmountChange={(e) => handleAmountChange('yearly', e)}
          dateLabel="Starting from"
          dateValue={prepayments.yearly.startDate}
          onDateChange={(newValue) => handleDateChange('yearly', newValue)}
          currency={currency}
        />

        <PrepaymentSection
          title="Quarterly"
          icon={<RepeatIcon />}
          iconColor={theme.palette.info.main}
          amountValue={prepayments.quarterly.amount}
          onAmountChange={(e) => handleAmountChange('quarterly', e)}
          dateLabel="Starting from"
          dateValue={prepayments.quarterly.startDate}
          onDateChange={(newValue) => handleDateChange('quarterly', newValue)}
          currency={currency}
        />

        <PrepaymentSection
          title="One-time"
          icon={<OneTimeIcon />}
          iconColor={theme.palette.warning.main}
          amountValue={prepayments.oneTime.amount}
          onAmountChange={(e) => handleAmountChange('oneTime', e)}
          dateLabel="Payment month"
          dateValue={prepayments.oneTime.date}
          onDateChange={(newValue) => handleDateChange('oneTime', newValue)}
          currency={currency}
        />
      </Grid>

      {/* Strategy Hint */}
      <Box
        sx={{
          mt: 4,
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.success.main, 0.04),
          border: `1px dashed ${alpha(theme.palette.success.main, 0.2)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'success.dark', fontWeight: 600, display: 'block' }}
        >
          💡 Strategy Tip: Even small regular prepayments significantly reduce
          your total interest and loan tenure.
        </Typography>
      </Box>
    </Box>
  );
};

export default PrepaymentsForm;
