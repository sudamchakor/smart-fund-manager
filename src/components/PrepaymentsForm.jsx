import React from "react";
import styled from "styled-components";
import { Box, Typography, Grid, Paper, CircularProgress } from "@mui/material";
import { useEmiContext } from "../context/EmiContext";
import { AmountInput, DatePickerInput } from "./common/CommonComponents";
// import { useDispatch } from "react-redux"; // Remove useDispatch
// import { updatePrepayments as reduxUpdatePrepayments } from "../store/emiSlice"; // Remove reduxUpdatePrepayments

const StyledPaper = styled(Paper)`
  padding: 24px;
  margin-bottom: 24px;
  position: relative;
`;

const PrepaymentsHeader = styled(Box)`
  margin-bottom: 24px;
`;

const PrepaymentsGrid = styled(Grid)`
  position: relative;
`;

const LoadingOverlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.85);
  z-index: 10;
  border-radius: 4px;
`;

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 100%;

  @media (max-width: 600px) {
    min-width: 100%;
  }
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
  <Grid item xs={12} sm={6} md={3}>
    <InputContainer>
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ fontWeight: 600, color: "text.primary" }}
      >
        {title}
      </Typography>
      <AmountInput
        label="Amount"
        value={amountValue}
        onChange={onAmountChange}
        currency={currency}
        aria-label={`${title} amount`}
      />
      <DatePickerInput
        label={dateLabel}
        value={dateValue}
        onChange={onDateChange}
      />
    </InputContainer>
  </Grid>
);

const PrepaymentsForm = () => {
  const { prepayments, currency, updatePrepayments } = useEmiContext(); // Removed isCalculating
  // const dispatch = useDispatch(); // Remove useDispatch

  const handleAmountChange = (type, event) => {
    let value = parseFloat(event.target.value);
    if (isNaN(value)) value = 0;
    updatePrepayments(type, "amount", value); // Use context's updatePrepayments
  };

  const handleDateChange = (type, newValue) => {
    updatePrepayments(
      type,
      type === "oneTime" ? "date" : "startDate",
      newValue,
    ); // Use context's updatePrepayments
  };

  return (
    <>
      <PrepaymentsHeader>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          Partial Prepayments
        </Typography>
      </PrepaymentsHeader>

      <PrepaymentsGrid
        container
        spacing={2}
        role="region"
        aria-label="Prepayments section"
      >
        {/* Removed conditional rendering based on isCalculating */}
        {/* {isCalculating && (
          <LoadingOverlay>
            <CircularProgress size={40} aria-label="Loading prepayments" />
          </LoadingOverlay>
        )} */}
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
