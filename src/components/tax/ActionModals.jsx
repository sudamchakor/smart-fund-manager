import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import { labelStyle, getWellInputStyle } from '../../styles/formStyles';

export const DynamicRowModal = ({
  open,
  onClose,
  onSave,
  mode,
  label,
  onLabelChange,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: `0 24px 64px ${alpha(theme.palette.common.black || '#000', 0.2)}`,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>
        {mode === 'add' ? 'Inject Data Row' : 'Modify Data Row'}
      </DialogTitle>
      <DialogContent>
        <Typography sx={labelStyle}>Row Identifier</Typography>
        <TextField
          autoFocus
          variant="standard"
          fullWidth
          value={label}
          onChange={onLabelChange}
          InputProps={{
            disableUnderline: true,
            sx: {
              ...getWellInputStyle(theme),
              textAlign: 'left',
              '& input': { textAlign: 'left' },
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          sx={{ fontWeight: 700, color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          sx={{ fontWeight: 800 }}
        >
          Apply Change
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const SettingsModal = ({
  open,
  onClose,
  settings,
  age,
  onAgeChange,
  onSettingChange,
  earningsFixed,
  dynamicRows,
  calculatedSalary,
  onInclusionChange,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: (theme) =>
            `0 24px 64px ${alpha(theme.palette.common.black || '#000', 0.2)}`,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 900 }}>System Configuration</DialogTitle>
      <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.1) }} />
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Assessee Age</Typography>
            <TextField
              variant="standard"
              value={age}
              onChange={onAgeChange}
              fullWidth
              InputProps={{
                disableUnderline: true,
                sx: getWellInputStyle(theme),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Metro City Residence?</Typography>
            <FormControl fullWidth variant="standard">
              <Select
                value={settings.isMetro}
                name="isMetro"
                onChange={(e) => onSettingChange('isMetro', e.target.value)}
                disableUnderline
                sx={getWellInputStyle(theme)}
              >
                <MenuItem value="Yes" sx={{ fontWeight: 700 }}>
                  Yes
                </MenuItem>
                <MenuItem value="No" sx={{ fontWeight: 700 }}>
                  No
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Employee PF Base (%)</Typography>
            <TextField
              variant="standard"
              value={settings.pfPercent}
              onChange={(e) => onSettingChange('pfPercent', e.target.value)}
              fullWidth
              InputProps={{
                disableUnderline: true,
                sx: getWellInputStyle(theme),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography sx={labelStyle}>Voluntary PF Boost (%)</Typography>
            <TextField
              variant="standard"
              value={settings.vpfPercent}
              onChange={(e) => onSettingChange('vpfPercent', e.target.value)}
              fullWidth
              InputProps={{
                disableUnderline: true,
                sx: getWellInputStyle(theme),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="subtitle2"
              sx={{
                mt: 3,
                mb: 1.5,
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'primary.main',
                letterSpacing: 0.5,
              }}
            >
              PF Inclusion Logic Engine
            </Typography>
            <Box
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                overflow: 'hidden',
              }}
            >
              <Table size="small">
                <TableBody>
                  {earningsFixed.map((item) => (
                    <TableRow
                      key={item.includeField}
                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: 'text.secondary',
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.1,
                          )}`,
                        }}
                      >
                        {item.label}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.1,
                          )}`,
                        }}
                      >
                        <Select
                          variant="standard"
                          name={item.includeField}
                          value={
                            calculatedSalary.months[0][item.includeField] || 'N'
                          }
                          onChange={(e) =>
                            onInclusionChange(item.includeField, e.target.value)
                          }
                          disableUnderline
                          sx={{
                            ...getWellInputStyle(theme),
                            py: 0,
                            px: 1,
                            '& .MuiSelect-select': { pr: 3 },
                          }}
                        >
                          <MenuItem value="Y" sx={{ fontWeight: 700 }}>
                            Included
                          </MenuItem>
                          <MenuItem value="N" sx={{ fontWeight: 700 }}>
                            Excluded
                          </MenuItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {dynamicRows.income.map((item) => {
                    const fieldName = `includePf${
                      item.id.charAt(0).toUpperCase() + item.id.slice(1)
                    }`;
                    return (
                      <TableRow
                        key={fieldName}
                        sx={{ '&:last-child td': { borderBottom: 0 } }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color: 'text.secondary',
                            borderBottom: `1px solid ${alpha(
                              theme.palette.divider,
                              0.1,
                            )}`,
                          }}
                        >
                          {item.label}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: `1px solid ${alpha(
                              theme.palette.divider,
                              0.1,
                            )}`,
                          }}
                        >
                          <Select
                            variant="standard"
                            name={fieldName}
                            value={calculatedSalary.months[0][fieldName] || 'N'}
                            onChange={(e) =>
                              onInclusionChange(fieldName, e.target.value)
                            }
                            disableUnderline
                            sx={{
                              ...getWellInputStyle(theme),
                              py: 0,
                              px: 1,
                              '& .MuiSelect-select': { pr: 3 },
                            }}
                          >
                            <MenuItem value="Y" sx={{ fontWeight: 700 }}>
                              Included
                            </MenuItem>
                            <MenuItem value="N" sx={{ fontWeight: 700 }}>
                              Excluded
                            </MenuItem>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{ fontWeight: 800, px: 4 }}
        >
          Apply Config
        </Button>
      </DialogActions>
    </Dialog>
  );
};
