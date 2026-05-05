import React from 'react';
import {
  Box,
  Typography,
  Container,
  useTheme,
  alpha,
  Stack,
  Divider,
  Link,
} from '@mui/material';
import { Gavel as GavelIcon } from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import { getSectionHeaderStyle, bodyStyle } from '../styles/legalStyles';

const TermsOfService = () => {
  const theme = useTheme();
  const sectionHeaderStyle = getSectionHeaderStyle(theme);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          bgcolor: theme.palette.background.paper,
          boxShadow: `0 4px 24px ${alpha(theme.palette.common.black || '#000', 0.02)}`,
        }}
      >
        <PageHeader
          title="Terms of Service"
          subtitle="Operational guidelines and legal agreements for system usage."
          icon={GavelIcon}
        />

        <Typography variant="h2" sx={sectionHeaderStyle}>
          1. System Introduction
        </Typography>
        <Typography sx={bodyStyle}>
          Welcome to <strong>SmartFund Manager</strong>. These Terms of Service
          ("Terms") govern your use of our system, calculation engines, and
          related services. By accessing or using our platform, you agree to be
          bound by these Terms. If you do not agree with any part of these
          Terms, you must immediately terminate your use of our services.
        </Typography>

        <Typography variant="h2" sx={sectionHeaderStyle}>
          2. Permitted System Usage
        </Typography>
        <Typography sx={bodyStyle}>
          SmartFund Manager provides precision algorithms and data projection
          tools for calculating Equated Monthly Installments (EMIs), investment
          growth, and loan amortization. This service is intended strictly for
          informational and simulation purposes and{' '}
          <strong>does not constitute certified financial advice</strong>. You
          are solely responsible for verifying the accuracy of any calculations
          before executing real-world financial decisions.
        </Typography>
        <Typography sx={bodyStyle}>
          You agree not to use the platform for any unlawful purpose or in any
          way that could harm, disable, overburden, or impair the system
          infrastructure.
        </Typography>

        <Typography variant="h2" sx={sectionHeaderStyle}>
          3. Mathematical Accuracy & Liability
        </Typography>
        <Typography sx={bodyStyle}>
          While our calculation engines are designed to provide accurate and
          up-to-date mathematical projections, we do not warrant the absolute
          completeness, reliability, or real-world execution of any information
          generated through our service. We are not liable for any
          discrepancies, omissions, or for any financial losses incurred based
          on the outputs provided.
        </Typography>

        <Typography variant="h2" sx={sectionHeaderStyle}>
          4. Intellectual Property
        </Typography>
        <Typography sx={bodyStyle}>
          All algorithms, codebase, UI/UX designs, trademarks, and logos
          deployed on the SmartFund Manager platform are the exclusive property
          of SmartFund Manager or its licensors and are protected by
          intellectual property laws. You may not reverse-engineer, reproduce,
          distribute, or create derivative works from any system component
          without our express written permission.
        </Typography>

        <Typography variant="h2" sx={sectionHeaderStyle}>
          5. Limitation of Liability
        </Typography>
        <Typography sx={bodyStyle}>
          To the fullest extent permitted by applicable law, SmartFund Manager
          shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or any loss of profits or
          revenues, whether incurred directly or indirectly, or any loss of
          data, use, goodwill, or other intangible losses, resulting from (a)
          your access to or use of or inability to access or use the service;
          (b) any conduct or content of any third party on the service; (c) any
          content obtained from the service; and (d) unauthorized access, use or
          alteration of your local data transmissions.
        </Typography>

        <Typography variant="h2" sx={sectionHeaderStyle}>
          6. Protocol Revisions
        </Typography>
        <Typography sx={bodyStyle}>
          We reserve the right to modify or replace these Terms at any time
          without prior warning. If a revision alters core operational
          mechanics, we will provide at least 30 days' notice prior to any new
          terms taking effect. What constitutes a material operational change
          will be determined at our sole discretion.
        </Typography>

        <Typography variant="h2" sx={sectionHeaderStyle}>
          7. Governing Law
        </Typography>
        <Typography sx={bodyStyle}>
          These Terms shall be governed and construed in accordance with
          standard international data processing and digital service laws,
          without regard to conflict of law provisions.
        </Typography>

        <Divider
          sx={{ my: 4, borderColor: alpha(theme.palette.divider, 0.1) }}
        />

        <Typography
          variant="h2"
          sx={{ ...sectionHeaderStyle, borderBottom: 'none', mt: 0 }}
        >
          8. Contact & Support
        </Typography>
        <Typography sx={bodyStyle}>
          If you require clarification on any of the terms outlined above,
          please escalate your query to the support team:
        </Typography>
        <Typography
          sx={{ ...bodyStyle, fontWeight: 700, color: 'text.primary' }}
        >
          <Link
            href="mailto:support@smartfundmanager.com"
            sx={{ color: 'primary.main', textDecoration: 'none' }}
          >
            support@smartfundmanager.com
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default TermsOfService;
