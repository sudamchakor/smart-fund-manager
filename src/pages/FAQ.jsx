import React, { useState } from "react";
import {
  Typography,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Box,
  useTheme,
  alpha,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpIcon,
  Functions as MathIcon,
} from "@mui/icons-material";

// Structured FAQ Data for clean rendering
const faqData = [
  {
    category: "System Overview",
    items: [
      {
        q: "What calculators are available on this platform?",
        a: "We offer multiple precision engines to help you plan your finances:\n\n• Home Loan EMI: Calculate your monthly EMI, total interest, and view detailed payment schedules. Includes prepayment and tracking.\n• Credit Card EMI: Understand the exact cost of credit card conversions.\n• Personal Loan & BNPL: Flexible tenure calculations for unsecured debt.\n• Investment Projections: SIP, Lumpsum, Step-Up SIP, and SWP calculators for long-term wealth planning.",
      },
    ],
  },
  {
    category: "Loan Mechanics",
    items: [
      {
        q: "How is the EMI calculated?",
        a: "EMI (Equated Monthly Installment) is calculated using the standard amortization formula. Where E is EMI, P is Principal, r is the monthly interest rate, and n is the tenure in months.",
        formula: "E = P × r × (1 + r)^n / ((1 + r)^n - 1)",
      },
      {
        q: "What is Loan Margin or Down Payment?",
        a: "The margin or down payment is the portion of the asset's purchase price that you pay out of pocket. Lenders typically finance up to 80-90% of the value; the remainder is your required margin.",
      },
      {
        q: "Does Home Loan Interest Rate vary?",
        a: "Yes. Floating interest rates change over time based on the lender's benchmark (like the repo rate), whereas fixed rates remain locked for a specified period or the entire tenure.",
      },
      {
        q: "What are prepayments and how do they affect my loan?",
        a: "Prepayments are surplus payments made directly towards your principal balance. Because interest is calculated on the outstanding principal, prepayments drastically reduce the total interest paid and accelerate your debt-free timeline.",
      },
      {
        q: "Can I change my EMI amount later?",
        a: "Regular EMIs are fixed at origination. However, lenders offer 'Step-Up' or 'Step-Down' options. If a floating rate changes, you usually have the choice to alter the EMI amount or adjust the remaining tenure.",
      },
      {
        q: "How is Credit Card EMI different from Personal Loan EMI?",
        a: "• Interest Rate: Personal Loans typically offer lower rates.\n• Processing: Credit Card EMI is instant against your existing limit; Personal Loans require approval.\n• Repayment: The mathematical calculation is identical, but Personal Loans offer wider tenure flexibility.",
      },
      {
        q: "What is BNPL (Buy Now Pay Later)?",
        a: "BNPL is a micro-financing option for specific retail purchases. It often features zero or promotional low-interest rates if paid strictly within the short agreed tenure.",
      },
    ],
  },
  {
    category: "Investment Engines",
    items: [
      {
        q: "What are Investment Calculators and why are they important?",
        a: "They simulate the mathematical power of compound interest:\n\n• SIP: Regular, fixed contributions over time.\n• Lumpsum: Future value of a single, upfront capital deployment.\n• Step-Up SIP: Automatically increasing contributions to match career/salary growth.\n• SWP: Safe withdrawal mechanics for passive income during retirement.",
      },
    ],
  },
];

const FAQ = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Technical Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.1),
            color: "info.main",
          }}
        >
          <HelpIcon fontSize="medium" />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 900, color: "text.primary", letterSpacing: -0.5 }}
          >
            Knowledge Base
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.secondary" }}
          >
            Operational guidelines and financial calculation methodologies.
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={4}>
        {faqData.map((section, sectionIndex) => (
          <Box key={sectionIndex}>
            {/* Category Header */}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                textTransform: "uppercase",
                color: "text.disabled",
                letterSpacing: 1,
                mb: 1,
                display: "block",
                pl: 1,
              }}
            >
              {section.category}
            </Typography>

            {/* Category Accordions */}
            <Box
              sx={{
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: theme.palette.background.paper,
                boxShadow: `0 4px 24px ${alpha(theme.palette.common.black || "#000", 0.02)}`,
              }}
            >
              {section.items.map((item, itemIndex) => {
                const panelId = `panel-${sectionIndex}-${itemIndex}`;
                const isExpanded = expanded === panelId;

                return (
                  <Accordion
                    key={itemIndex}
                    expanded={isExpanded}
                    onChange={handleChange(panelId)}
                    disableGutters
                    elevation={0}
                    square
                    sx={{
                      bgcolor: "transparent",
                      borderBottom:
                        itemIndex !== section.items.length - 1
                          ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
                          : "none",
                      "&:before": { display: "none" }, // Removes default MUI top border
                      transition: "background-color 0.2s ease",
                      ...(isExpanded && {
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      }),
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon
                          sx={{
                            color: isExpanded
                              ? "primary.main"
                              : "text.secondary",
                          }}
                        />
                      }
                      sx={{
                        px: 2.5,
                        py: 0.5,
                        "& .MuiAccordionSummary-content": { my: 1.5 },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: isExpanded ? 800 : 700,
                          color: isExpanded ? "primary.main" : "text.primary",
                          transition: "color 0.2s",
                        }}
                      >
                        {item.q}
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          lineHeight: 1.6,
                          fontWeight: 500,
                          whiteSpace: "pre-wrap", // Allows \n to render as line breaks
                        }}
                      >
                        {item.a}
                      </Typography>

                      {/* Optional Terminal-style Formula Block */}
                      {item.formula && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(
                              theme.palette.common.black || "#000",
                              0.04,
                            ),
                            border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <MathIcon
                            sx={{ color: "text.disabled", fontSize: "1rem" }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              color: "text.primary",
                            }}
                          >
                            {item.formula}
                          </Typography>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          </Box>
        ))}
      </Stack>
    </Container>
  );
};

export default FAQ;
