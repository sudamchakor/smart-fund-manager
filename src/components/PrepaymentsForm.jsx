import React from "react";
import styled from "styled-components";
import { Box, Typography, Grid } from "@mui/material";
import { useEmiContext } from "../context/EmiContext";
import { AmountInput, DatePickerInput } from "./common/CommonComponents";

const PrepaymentsHeader = styled(Box)`
  padding: 16px 0 16px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  margin-bottom: 16px;
`;

const PrepaymentsGrid = styled(Grid)`
  padding: 0 16px 16px 16px;
`;

const PrepaymentSection = ({
  title,
  amountValue,
  onAmountChange,
  dateLabel,
  dateValue,
  onDateChange,
  currency,
}) => (
  <Grid item xs={12} sm={3}>
    <Typography variant="subtitle2" gutterBottom>
      {title}
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
    </Box>
  </Grid>
);

const PrepaymentsForm = () => {
  const { prepayments, updatePrepayments, currency } = useEmiContext();

  const handleAmountChange = (type, event) => {
    let value = parseFloat(event.target.value);
    if (isNaN(value)) value = 0;
    updatePrepayments(type, "amount", value);
  };

  const handleDateChange = (type, newValue) => {
    updatePrepayments(
      type,
      type === "oneTime" ? "date" : "startDate",
      newValue,
    );
  };

  return (
    <>
      <PrepaymentsHeader>
        <Typography variant="h6">Partial Prepayments</Typography>
      </PrepaymentsHeader>

      <PrepaymentsGrid container spacing={2}>
        <PrepaymentSection
          title="Monthly Payment"
          amountValue={prepayments.monthly.amount}
          onAmountChange={(e) => handleAmountChange("monthly", e)}
          dateLabel="Starting from"
          dateValue={prepayments.monthly.startDate}
          onDateChange={(newValue) => handleDateChange("monthly", newValue)}
          currency={currency}
        />

        <PrepaymentSection
          title="Yearly Payment"
          amountValue={prepayments.yearly.amount}
          onAmountChange={(e) => handleAmountChange("yearly", e)}
          dateLabel="Starting from"
          dateValue={prepayments.yearly.startDate}
          onDateChange={(newValue) => handleDateChange("yearly", newValue)}
          currency={currency}
        />

        <PrepaymentSection
          title="Quarterly Payment"
          amountValue={prepayments.quarterly.amount}
          onAmountChange={(e) => handleAmountChange("quarterly", e)}
          dateLabel="Starting from"
          dateValue={prepayments.quarterly.startDate}
          onDateChange={(newValue) => handleDateChange("quarterly", newValue)}
          currency={currency}
        />

        <PrepaymentSection
          title="One-time Payment"
          amountValue={prepayments.oneTime.amount}
          onAmountChange={(e) => handleAmountChange("oneTime", e)}
          dateLabel="In the month of"
          dateValue={prepayments.oneTime.date}
          onDateChange={(newValue) => handleDateChange("oneTime", newValue)}
          currency={currency}
        />
      </PrepaymentsGrid>
    </>
  );
};

export default PrepaymentsForm;
