import React from 'react';
import {
  Grid,
  Stack,
  TextField,
  Typography,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import DataCard from '../common/DataCard';
import ExemptionRow from '../common/ExemptionRow';
import { getWellInputStyle } from '../../styles/formStyles';

const Declarations = ({
  declarations,
  houseProperty,
  handleDeclarationChange,
  updateHouseProperty,
}) => {
  const theme = useTheme();

  const createTextField = (
    section,
    field,
    subfield,
    currentValue,
    limit,
    label, // Add label prop here
  ) => {
    // Ensure limit is a positive number for error checking
    const isError = limit > 0 && parseFloat(currentValue) > limit;
    const helperText = isError
      ? `Max limit is ₹${limit.toLocaleString('en-IN')}`
      : '';

    return (
      <TextField
        label={label} // Pass label to TextField
        variant="standard"
        size="small"
        value={currentValue === null || currentValue === undefined ? '' : currentValue} // Handle null/undefined values
        onChange={(e) =>
          handleDeclarationChange(section, field, subfield, e.target.value)
        }
        error={isError}
        helperText={helperText}
        InputProps={{
          disableUnderline: true,
          sx: {
            ...getWellInputStyle(theme),
            ...(isError && {
              borderColor: theme.palette.error.main,
              '&:hover': {
                borderColor: theme.palette.error.dark,
              },
            }),
          },
        }}
        sx={{
          '& .MuiFormHelperText-root': {
            fontSize: '0.6rem',
            color: 'error.main',
            position: 'absolute',
            bottom: -18,
            right: 0,
            textAlign: 'right',
          },
        }}
      />
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <DataCard title="A. Sec 10 & 17 Exemptions">
          <Stack spacing={1.5}>
            <ExemptionRow
              label="Standard Deduction"
              produced={
                <Typography
                  sx={{ ...getWellInputStyle(theme), textAlign: 'right' }}
                >
                  ₹75,000
                </Typography>
              }
              limited={75000}
              tooltip="Standard deduction of ₹75,000 for salaried individuals under the new regime."
            />
            <ExemptionRow
              label="HRA Exemption"
              produced={createTextField(
                'exemptions',
                'hra',
                'produced',
                declarations.exemptions.hra.produced,
                null, // No limit for HRA here, limit is calculated elsewhere
                'HRA Exemption' // Add label
              )}
              limited={declarations.exemptions.hra.limited}
              tooltip="Exemption for House Rent Allowance."
            />
            <ExemptionRow
              label="Transport Exemption"
              produced={createTextField(
                'exemptions',
                'transport',
                'produced',
                declarations.exemptions.transport.produced,
                38400,
                'Transport Exemption' // Add label
              )}
              limited={declarations.exemptions.transport.limited}
              tooltip="Exemption for transport allowance, capped at ₹3,200 per month."
            />
            <ExemptionRow
              label="Gratuity / Other"
              produced={createTextField(
                'exemptions',
                'gratuity',
                'produced',
                declarations.exemptions.gratuity.produced,
                null, // No limit
                'Gratuity / Other' // Add label
              )}
              limited={declarations.exemptions.gratuity.limited}
              tooltip="Exemption for gratuity and other allowances."
            />
            <ExemptionRow
              label="Children's Ed. Allowance"
              produced={createTextField(
                'exemptions',
                'childrenEduc',
                'produced',
                declarations.exemptions.childrenEduc.produced,
                2400,
                "Children's Ed. Allowance" // Add label
              )}
              limited={declarations.exemptions.childrenEduc.limited}
              tooltip="Exemption for children's education allowance, capped at ₹100 per month per child for up to 2 children."
            />
            <ExemptionRow
              label="LTA Exemption"
              produced={createTextField(
                'exemptions',
                'lta',
                'produced',
                declarations.exemptions.lta.produced,
                null, // No limit
                'LTA Exemption' // Add label
              )}
              limited={declarations.exemptions.lta.limited}
              tooltip="Exemption for Leave Travel Allowance."
            />
            <ExemptionRow
              label="Uniform Expenses"
              produced={createTextField(
                'exemptions',
                'uniform',
                'produced',
                declarations.exemptions.uniform.produced,
                null, // No limit
                'Uniform Expenses' // Add label
              )}
              limited={declarations.exemptions.uniform.limited}
              tooltip="Exemption for expenses incurred on a uniform for official duties."
            />
          </Stack>
        </DataCard>

        <DataCard title="B. Other Income">
          <Stack spacing={2}>
            {createTextField(
              'otherIncome',
              'bonus',
              null,
              declarations.otherIncome.bonus,
              null, // No limit
              'Bonus' // Add label
            )}
            {createTextField(
              'otherIncome',
              'savingsInt',
              null,
              declarations.otherIncome.savingsInt,
              null, // No limit
              'Savings Interest' // Add label
            )}
            {createTextField(
              'otherIncome',
              'dividends',
              null,
              declarations.otherIncome.dividends,
              null, // No limit
              'Dividends' // Add label
            )}
            {createTextField(
              'otherIncome',
              'capitalGains',
              null,
              declarations.otherIncome.capitalGains,
              null, // No limit
              'Capital Gains' // Add label
            )}
            {createTextField(
              'otherIncome',
              'crypto',
              null,
              declarations.otherIncome.crypto,
              null, // No limit
              'Crypto' // Add label
            )}
          </Stack>
        </DataCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DataCard title="C. Chapter VI-A Deductions">
          <Stack spacing={1.5}>
            <ExemptionRow
              label="80D - Health Insurance"
              produced={createTextField(
                'deductions',
                'sec80D',
                'produced',
                declarations.deductions.sec80D.produced,
                100000,
                '80D - Health Insurance' // Add label
              )}
              limited={declarations.deductions.sec80D.limited}
              tooltip="Deduction for Health Insurance premiums for self, spouse, and parents."
            />
            <ExemptionRow
              label="80DD/DDB - Medical"
              produced={createTextField(
                'deductions',
                'sec80DD_DDB',
                'produced',
                declarations.deductions.sec80DD_DDB.produced,
                125000,
                '80DD/DDB - Medical' // Add label
              )}
              limited={declarations.deductions.sec80DD_DDB.limited}
              tooltip="Deduction for medical treatment of a dependent with a disability."
            />
            <ExemptionRow
              label="80E/EEB - Loan Interest"
              produced={createTextField(
                'deductions',
                'sec80E_EEB',
                'produced',
                declarations.deductions.sec80E_EEB.produced,
                null, // No limit
                '80E/EEB - Loan Interest' // Add label
              )}
              limited={declarations.deductions.sec80E_EEB.limited}
              tooltip="Deduction for interest on an education loan."
            />
            <ExemptionRow
              label="80G - Charity Donations"
              produced={createTextField(
                'deductions',
                'sec80G',
                'produced',
                declarations.deductions.sec80G.produced,
                null, // No limit
                '80G - Charity Donations' // Add label
              )}
              limited={declarations.deductions.sec80G.limited}
              tooltip="Deduction for donations to certain funds and charitable institutions."
            />
            <ExemptionRow
              label="80GG - Rent (No HRA)"
              produced={createTextField(
                'deductions',
                'sec80GG',
                'produced',
                declarations.deductions.sec80GG.produced,
                60000,
                '80GG - Rent (No HRA)' // Add label
              )}
              limited={declarations.deductions.sec80GG.limited}
              tooltip="Deduction for rent paid when HRA is not received, capped at ₹5,000 per month."
            />
            <ExemptionRow
              label="80TTA/U - Bank Interest"
              produced={createTextField(
                'deductions',
                'sec80TTA_U',
                'produced',
                declarations.deductions.sec80TTA_U.produced,
                50000,
                '80TTA/U - Bank Interest' // Add label
              )}
              limited={declarations.deductions.sec80TTA_U.limited}
              tooltip="Deduction on interest income from savings accounts, capped at ₹10,000 for individuals and ₹50,000 for senior citizens."
            />
            <ExemptionRow
              label="Sec 24(b) - Home Loan"
              produced={createTextField(
                'houseProperty',
                'interest',
                null,
                houseProperty.interest,
                200000,
                'Sec 24(b) - Home Loan' // Add label
              )}
              limited={Math.min(
                parseFloat(houseProperty.interest) || 0,
                200000,
              )}
              tooltip="Interest on Home Loan (Self-occupied) capped at ₹2 Lakhs."
            />
          </Stack>
        </DataCard>

        <DataCard title="D. Sec 80C Investments">
          <Stack spacing={2}>
            {createTextField(
              'sec80C',
              'npsEmployee',
              null,
              declarations.sec80C.npsEmployee,
              null, // No limit
              'NPS Employee' // Add label
            )}
            {createTextField(
              'sec80C',
              'npsEmployer',
              null,
              declarations.sec80C.npsEmployer,
              null, // No limit
              'NPS Employer' // Add label
            )}
            {createTextField(
              'sec80C',
              'standard80C',
              null,
              declarations.sec80C.standard80C,
              150000,
              'Standard 80C' // Add label
            )}
            {createTextField(
              'sec80C',
              'superannuation',
              null,
              declarations.sec80C.superannuation,
              null, // No limit
              'Superannuation' // Add label
            )}
            <Divider
              sx={{
                my: 1,
                borderColor: alpha(theme.palette.divider, 0.1),
              }}
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                }}
              >
                Total 80C Claimed
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 900, color: 'text.primary' }}
              >
                ₹{' '}
                {Math.round(declarations.sec80C.limited).toLocaleString(
                  'en-IN',
                )}
              </Typography>
            </Stack>
          </Stack>
        </DataCard>
      </Grid>
    </Grid>
  );
};

export default Declarations;
