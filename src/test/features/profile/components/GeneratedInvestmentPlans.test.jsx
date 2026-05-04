import React from "react";
import { render, screen } from "@testing-library/react";
import GeneratedInvestmentPlans from "../../../features/profile/components/GeneratedInvestmentPlans";

describe.skip("GeneratedInvestmentPlans Component", () => {
  const defaultProps = {
    generatedInvestmentPlans: [
      { id: 1, name: "Aggressive Equity Plan", fullSummary: "High risk, high reward.", isSafe: false },
      { id: 2, name: "Conservative Debt Plan", fullSummary: "Low risk, steady returns.", isSafe: true },
    ],
    totalInvestedAmount: 500000,
    totalEstimatedReturns: 250000,
    totalCurrentValue: 750000,
    totalTimePeriod: 15,
    overallROI: 12.5,
  };

  it("renders summary statistics correctly", () => {
    render(<GeneratedInvestmentPlans {...defaultProps} />);

    // Using regular expressions or exact matches for formatted currency
    expect(screen.getByText(/₹5,00,000/)).toBeInTheDocument();
    expect(screen.getByText(/₹2,50,000/)).toBeInTheDocument();
    expect(screen.getByText(/₹7,50,000/)).toBeInTheDocument();
    expect(screen.getByText(/15 years/)).toBeInTheDocument();
    expect(screen.getByText(/12.50%/)).toBeInTheDocument();
  });

  it("renders individual plan cards correctly", () => {
    render(<GeneratedInvestmentPlans {...defaultProps} />);

    expect(screen.getByText("Aggressive Equity Plan")).toBeInTheDocument();
    expect(screen.getByText("High risk, high reward.")).toBeInTheDocument();

    expect(screen.getByText("Conservative Debt Plan")).toBeInTheDocument();
    expect(screen.getByText("Low risk, steady returns.")).toBeInTheDocument();
  });

  it("displays '(Considered Safe)' badge only for safe plans", () => {
    render(<GeneratedInvestmentPlans {...defaultProps} />);

    const safeBadges = screen.getAllByText("(Considered Safe)");
    expect(safeBadges.length).toBe(1); // Only the second plan is safe
  });

  it("does not render the summary card if there are no plans", () => {
    render(<GeneratedInvestmentPlans {...defaultProps} generatedInvestmentPlans={[]} />);
    
    // The summary card title shouldn't exist
    expect(screen.queryByText("Summary")).not.toBeInTheDocument();
  });
});