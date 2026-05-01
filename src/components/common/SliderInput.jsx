import React, { useState, useEffect } from "react";
import {
  Box,
  Slider,
  TextField,
  Typography,
  Tooltip,
  useTheme,
  alpha,
  Stack,
} from "@mui/material";
import {
  InfoOutlined as InfoIcon,
  WarningAmber as WarningIcon,
} from "@mui/icons-material";

export const SliderInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  marks = false,
  warningThreshold = null,
  warningText = "",
  tooltipText = "",
  showInput = true,
  color = "primary",
  isInline = true,
  warning = false,
}) => {
  const theme = useTheme();
  const [internalValue, setInternalValue] = useState(Number(value) || 0);

  useEffect(() => {
    setInternalValue(Number(value) || 0);
  }, [value]);

  const numValue = Number(value) || 0;
  const isWarning =
    (warningThreshold !== null && numValue > warningThreshold) || warning;

  // Dynamically map the color token to ensure the Data Well and Slider match
  const activeColorToken = isWarning ? "error" : color;

  const handleInputChange = (e) => {
    const val = e.target.value;
    let sanitizedVal = val.replace(/^0+(?=\d)/, "");
    let newVal = sanitizedVal === "" ? "" : Number(sanitizedVal);

    if (newVal !== "" && newVal > max) {
      newVal = max;
    }
    setInternalValue(newVal);
    onChange(newVal);
  };

  const handleSliderChange = (e, newValue) => {
    setInternalValue(newValue);
  };

  const handleSliderChangeCommitted = (e, newValue) => {
    onChange(newValue);
  };

  // --- Reusable Component Blocks ---

  const renderLabelComponent = () => (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{ flexShrink: 0 }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 800,
          textTransform: "uppercase",
          color: "text.secondary",
          letterSpacing: 0.5,
          whiteSpace: "normal",
        }}
      >
        {label}
      </Typography>
      {tooltipText && (
        <Tooltip title={tooltipText} arrow placement="top">
          <InfoIcon
            sx={{
              fontSize: "1rem",
              color: isWarning ? "error.main" : "text.disabled",
              cursor: "help",
            }}
          />
        </Tooltip>
      )}
    </Stack>
  );

  const renderSliderComponent = () => (
    <Slider
      value={internalValue}
      onChange={handleSliderChange}
      onChangeCommitted={handleSliderChangeCommitted}
      min={min}
      max={max}
      step={step}
      marks={marks}
      color={activeColorToken}
      sx={{
        flexGrow: 1,
        py: 1,
        "& .MuiSlider-thumb": { width: 14, height: 14 },
        "& .MuiSlider-track": { height: 4 },
        "& .MuiSlider-rail": { height: 4, opacity: 0.2 },
      }}
    />
  );

  const renderInputComponent = () =>
    showInput && (
      <TextField
        variant="standard"
        type="number"
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (["e", "E", "+", "-"].includes(e.key)) {
            e.preventDefault();
          }
        }}
        size="small"
        InputProps={{
          disableUnderline: true,
          inputProps: {
            min,
            max,
            step,
          },
          sx: {
            fontWeight: 900,
            fontSize: "0.95rem",
            bgcolor: alpha(theme.palette[activeColorToken].main, 0.05),
            color: `${activeColorToken}.main`,
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            border: `1px solid ${alpha(theme.palette[activeColorToken].main, 0.1)}`,
            textAlign: "right",
            minWidth: 100,
            "& input": { textAlign: "right", p: 0 },
            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
              { display: "none" },
            MozAppearance: "textfield",
          },
        }}
      />
    );

  const renderWarningComponent = () =>
    isWarning &&
    warningText && (
      <Box
        sx={{
          mt: 1.5,
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.error.main, 0.05),
          border: `1px dashed ${alpha(theme.palette.error.main, 0.3)}`,
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          ...(isInline && {
            position: "absolute",
            width: "calc(100% - 32px)",
            left: 16,
            top: "100%",
            zIndex: 1,
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black || "#000", 0.05)}`,
          }),
        }}
      >
        <WarningIcon
          sx={{ color: "error.main", fontSize: "1.2rem", mt: 0.2 }}
        />
        <Typography
          variant="caption"
          sx={{ color: "error.dark", fontWeight: 700, lineHeight: 1.5 }}
        >
          {warningText}
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ width: "100%", px: 2, position: "relative" }}>
      {isInline ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 1, sm: 2 },
            width: "100%",
          }}
        >
          {renderLabelComponent()}
          {renderSliderComponent()}
          {renderInputComponent()}
        </Box>
      ) : (
        <>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-end"
            sx={{ mb: 0.5 }}
          >
            {renderLabelComponent()}
            {renderInputComponent()}
          </Stack>
          {renderSliderComponent()}
        </>
      )}
      {renderWarningComponent()}
    </Box>
  );
};

export default SliderInput;
