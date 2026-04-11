import React from "react";
import {
  Typography,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "./FAQ.scss";

const FAQ = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom className="faq-title">
        Frequently Asked Questions
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>What calculators are available on this platform?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            We offer multiple financial calculators to help you plan your finances:
            <ul>
              <li>
                <strong>Home Loan EMI Calculator:</strong> Calculate your monthly EMI, total interest, and view detailed payment schedules for home loans. Includes prepayment options and additional expense tracking.
              </li>
              <li>
                <strong>Credit Card EMI Calculator:</strong> Understand the EMI for credit card purchases and calculate total interest payable.
              </li>
              <li>
                <strong>Personal Loan & BNPL Calculator:</strong> Calculate EMI for personal loans and Buy Now Pay Later products with flexible interest rates and tenures.
              </li>
              <li>
                <strong>Investment Calculators:</strong> Includes SIP (Systematic Investment Plan), Lumpsum Investment, Step-Up SIP, and SWP (Systematic Withdrawal Plan) calculators to help you plan your investments.
              </li>
            </ul>
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>How is the EMI calculated?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            EMI (Equated Monthly Installment) is calculated using the standard
            formula:
            <br />
            <code>E = P x r x (1 + r)^n / ((1 + r)^n - 1)</code>
            <br />
            Where:
            <ul>
              <li>
                <strong>E</strong> is EMI
              </li>
              <li>
                <strong>P</strong> is Principal Loan Amount
              </li>
              <li>
                <strong>r</strong> is rate of interest calculated on monthly
                basis (i.e., r = Rate of Annual interest/12/100)
              </li>
              <li>
                <strong>n</strong> is loan term / tenure / duration in number of
                months
              </li>
            </ul>
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            What are prepayments and how do they affect my loan?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Prepayments are extra payments made towards your loan principal over
            and above your regular EMI. By making prepayments, you reduce your
            outstanding principal faster, which in turn reduces the total
            interest you pay over the life of the loan. This can significantly
            shorten your loan tenure.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>What is Loan Margin or Down Payment?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            The margin or down payment is the portion of the property's purchase
            price that you pay out of pocket, rather than financing through the
            loan. Typically, banks finance up to 80-90% of the property value,
            and the rest is paid as a down payment.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Does Home Loan Interest Rate vary?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Yes, home loan interest rates can be fixed or floating. Floating
            interest rates change over time based on the lender's benchmark
            rate, whereas fixed rates remain constant for a specified period or
            the entire loan duration.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>What are property taxes and home insurance?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Property taxes are levied by your local government on your property.
            Home insurance protects your home against damages and is often
            required by lenders. Both can be substantial ongoing costs that
            should be factored into your budget.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Can I change my EMI amount later?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Generally, your regular EMI is fixed at the start of the loan.
            However, some banks offer step-up or step-down EMI options. Also, if
            the interest rate on a floating rate loan changes, you can request
            to alter your EMI or adjust the tenure.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>What is a Credit Card EMI?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            A Credit Card EMI allows you to convert your credit card purchase into fixed monthly installments. Instead of paying the entire bill at once, you can pay it in smaller, equal monthly payments with a specific interest rate. This is useful for large purchases and helps manage cash flow better.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>How is Credit Card EMI different from Personal Loan EMI?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            <ul>
              <li><strong>Interest Rate:</strong> Personal Loans typically have lower interest rates compared to Credit Card EMIs.</li>
              <li><strong>Loan Amount:</strong> Personal Loans usually offer higher loan amounts compared to Credit Card EMIs.</li>
              <li><strong>Processing:</strong> Credit Card EMI is processed instantly on your credit card, while Personal Loans require application and approval.</li>
              <li><strong>Repayment:</strong> Both follow the same EMI calculation, but Personal Loans offer more flexible repayment terms.</li>
            </ul>
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>What is BNPL (Buy Now Pay Later)?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Buy Now Pay Later (BNPL) is a payment option that allows you to purchase products and pay for them later, usually in installments. It's similar to a Personal Loan but is offered for specific purchases from retailers or online platforms. BNPL options often come with zero or low interest rates if paid within the agreed tenure.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>What are Investment Calculators and why are they important?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Investment Calculators help you plan and visualize your financial investments:
            <ul>
              <li><strong>SIP (Systematic Investment Plan):</strong> Invest a fixed amount regularly and see how your wealth grows over time with compound returns.</li>
              <li><strong>Lumpsum Calculator:</strong> Invest a one-time amount and calculate the future value based on expected returns.</li>
              <li><strong>Step-Up SIP:</strong> Start with a small investment and increase it over time, perfect for growing investments with salary increments.</li>
              <li><strong>SWP (Systematic Withdrawal Plan):</strong> Withdraw a fixed amount regularly from your investments for a steady income stream.</li>
            </ul>
            These calculators help you understand the power of compound interest and plan your long-term financial goals.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default FAQ;
