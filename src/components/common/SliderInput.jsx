import React, { useState, useEffect } from "react";
import {
  Box,
  Slider,
  TextField,
  Typography,
  Tooltip,
  Paper,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

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
}) => {
  // Internal state for the slider's value during drag or text input
  const [internalValue, setInternalValue] = useState(Number(value) || 0);

  // Synchronize internal state with external value prop
  // This ensures that if the parent component updates the 'value' prop,
  // our internal state also reflects that change.
  useEffect(() => {
    setInternalValue(Number(value) || 0);
  }, [value]);

  const numValue = Number(value) || 0; // Use the external value for warning calculation
  const isWarning = warningThreshold !== null && numValue > warningThreshold;
  const sliderColor = isWarning ? "error" : color;

  const handleInputChange = (e) => {
    const val = e.target.value;
    let sanitizedVal = val.replace(/^0+(?=\d)/, "");
    let newVal = sanitizedVal === "" ? "" : Number(sanitizedVal);

    if (newVal !== "" && newVal > max) {
      newVal = max;
    }
    // Update internal state immediately for TextField visual feedback
    setInternalValue(newVal);
    // Also call external onChange immediately for TextField changes
    onChange(newVal);
  };

  const handleSliderChange = (e, newValue) => {
    // Update internal state immediately during slider drag for smooth visual feedback
    setInternalValue(newValue);
  };

  const handleSliderChangeCommitted = (e, newValue) => {
    // Only call external onChange when slider drag is committed
    // This prevents frequent re-renders of the parent during drag
    onChange(newValue);
  };

  // --- Reusable Components for Conditional Rendering ---

  const labelComponent = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexShrink: 0, // Prevent label from shrinking
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, whiteSpace: { xs: 'normal', sm: 'nowrap' } }} // Allow wrapping on xs
      >
        {label}
      </Typography>
      {tooltipText && (
        <Tooltip title={tooltipText}>
          <InfoIcon
            fontSize="small"
            sx={{
              color: isWarning ? "error.main" : "info.main",
              cursor: "help",
              opacity: 0.7,
            }}
          />
        </Tooltip>
      )}
    </Box>
  );

  const sliderComponent = (
    <Slider
      value={internalValue}
      onChange={handleSliderChange}
      onChangeCommitted={handleSliderChangeCommitted}
      min={min}
      max={max}
      step={step}
      marks={marks}
      valueLabelDisplay="auto"
      color={sliderColor}
      sx={{
        flexGrow: isInline ? 1 : undefined, // Only grow when inline
        "& .MuiSlider-track": {
          backgroundColor: isWarning ? "error.main" : undefined,
        },
        "& .MuiSlider-thumb": {
          backgroundColor: isWarning ? "error.main" : undefined,
        },
      }}
    />
  );

  const inputComponent = showInput && (
    <TextField
      type="number"
      value={internalValue}
      onChange={handleInputChange}
      onKeyDown={(e) => {
        if (["e", "E", "+", "-"].includes(e.key)) {
          e.preventDefault();
        }
      }}
      size="small"
      inputProps={{
        min,
        max,
        step,
        style: {
          MozAppearance: "textfield",
          textAlign: "right",
        },
      }}
      sx={{
        minWidth: 100,
        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
          {
            display: "none",
          },
      }}
      error={isWarning}
    />
  );

  const warningComponent = isWarning && warningText && (
    <Paper
      sx={{
        mt: 1.5,
        p: 1.5,
        backgroundColor: "#ffebee",
        borderLeft: "4px solid #f44336",
        borderRadius: 1,
        ...(isInline && {
          position: "absolute",
          width: "calc(100% - 32px)",
          left: 16,
          top: "100%",
          zIndex: 1,
        }),
      }}
    >
      <Typography variant="body2" sx={{ color: "#c62828" }}>
        {warningText}
      </Typography>
    </Paper>
  );

  return (
    <Box
      sx={{
        width: "100%",
        paddingX: 2,
        position: "relative", // Needed for absolute positioning of warning
        ...(isInline
          ? {
              display: "flex",
              flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on xs, row on sm and up
              alignItems: { xs: 'flex-start', sm: 'center' }, // Align items for stacked layout
              gap: { xs: 1, sm: 2 }, // Adjust gap for stacked layout
            }
          : {
              display: "block",
            }),
      }}
    >
      {isInline ? (
        // Inline layout: Label, Slider, Input
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
            {labelComponent}
            {inputComponent && (
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>{inputComponent}</Box> // Show input next to label on xs, hide on sm+
            )}
          </Box>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
            {sliderComponent}
            {inputComponent && (
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{inputComponent}</Box> // Show input next to slider on sm+, hide on xs
            )}
          </Box>
        </>
      ) : (
        // Block layout: Label & Input (flex row), then Slider below
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            {labelComponent}
            {inputComponent && (
              <Box sx={{ marginLeft: "auto" }}>{inputComponent}</Box>
            )}
          </Box>
          {sliderComponent}
        </>
      )}
      {warningComponent}
    </Box>
  );
};

export default SliderInput;
