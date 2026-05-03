import React from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Stack,
  useTheme,
} from "@mui/material";
import { Speed as SpeedIcon } from "@mui/icons-material";
import SliderInput from "../../../../components/common/SliderInput";
import { labelStyle, getWellInputStyle } from "../../../../styles/formStyles";

export default function SystemParameters({ basicInfo, setBasicInfoState }) {
  const theme = useTheme();
  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <SpeedIcon sx={{ fontSize: "1.2rem", color: "primary.main" }} />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          System & Demographics
        </Typography>
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography sx={labelStyle}>User Identity</Typography>
          <TextField
            variant="standard"
            fullWidth
            size="small"
            value={basicInfo.name}
            onChange={(e) =>
              setBasicInfoState({ ...basicInfo, name: e.target.value })
            }
            InputProps={{
              disableUnderline: true,
              sx: getWellInputStyle(theme),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography sx={labelStyle}>Professional Sector</Typography>
          <TextField
            variant="standard"
            fullWidth
            size="small"
            value={basicInfo.occupation}
            onChange={(e) =>
              setBasicInfoState({
                ...basicInfo,
                occupation: e.target.value,
              })
            }
            InputProps={{
              disableUnderline: true,
              sx: getWellInputStyle(theme),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <SliderInput
            label="Current Age"
            value={basicInfo.age}
            onChange={(val) => setBasicInfoState({ ...basicInfo, age: val })}
            min={18}
            max={100}
            step={1}
            isInline={false}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SliderInput
            label="Retirement Target"
            value={basicInfo.retirementAge}
            onChange={(val) =>
              setBasicInfoState({ ...basicInfo, retirementAge: val })
            }
            min={basicInfo.age}
            max={100}
            step={1}
            color="warning"
            isInline={false}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <SliderInput
            label="Career Growth (p.a)"
            value={(basicInfo.careerGrowthRate * 100).toFixed(1)}
            onChange={(val) =>
              setBasicInfoState({
                ...basicInfo,
                careerGrowthRate: val / 100,
              })
            }
            min={0}
            max={20}
            step={0.1}
            color="success"
            isInline={false}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SliderInput
            label="General Inflation"
            value={(basicInfo.generalInflationRate * 100).toFixed(1)}
            onChange={(val) =>
              setBasicInfoState({
                ...basicInfo,
                generalInflationRate: val / 100,
              })
            }
            min={0}
            max={20}
            step={0.1}
            color="error"
            isInline={false}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography sx={labelStyle}>Calculated Risk Tolerance</Typography>
          <FormControl variant="standard" fullWidth>
            <Select
              value={basicInfo.riskTolerance}
              onChange={(e) =>
                setBasicInfoState({
                  ...basicInfo,
                  riskTolerance: e.target.value,
                })
              }
              disableUnderline
              sx={getWellInputStyle(theme)}
            >
              <MenuItem value="low" sx={{ fontWeight: 700 }}>
                Conservative (Capital Preservation)
              </MenuItem>
              <MenuItem value="medium" sx={{ fontWeight: 700 }}>
                Moderate (Balanced Growth)
              </MenuItem>
              <MenuItem value="high" sx={{ fontWeight: 700 }}>
                Aggressive (Maximum Yield)
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}
