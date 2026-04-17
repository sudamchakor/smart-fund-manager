import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

// 1. Mock the Pages and Components
// We mock these so we are only testing App.jsx's routing and layout, not the children's logic.
jest.mock("./components/layout/Header", () => () => <div data-testid="mock-header">Header</div>);
jest.mock("./pages/Home", () => () => <div data-testid="mock-home">Home</div>);
jest.mock("./pages/Calculator", () => () => <div data-testid="mock-calculator">Calculator</div>);
jest.mock("./pages/UserProfile", () => () => <div data-testid="mock-user-profile">UserProfile</div>);
jest.mock("./pages/CreditCardEmiCalculator", () => () => <div data-testid="mock-cc-emi">CreditCardEmiCalculator</div>);
jest.mock("./pages/InvestmentCalculator", () => () => <div data-testid="mock-investment">InvestmentCalculator</div>);
jest.mock("./pages/PersonalLoanCalculator", () => () => <div data-testid="mock-personal-loan">PersonalLoanCalculator</div>);
jest.mock("./pages/FAQ", () => () => <div data-testid="mock-faq">FAQ</div>);
jest.mock("./pages/TaxCalculator", () => () => <div data-testid="mock-tax-calculator">TaxCalculator</div>);

// 2. Mock Providers and Store
// This prevents real persistence and Redux configurations from failing in the test environment.
jest.mock("./store", () => ({
  __esModule: true,
  default: {
    getState: () => ({
      emi: { themeMode: "dodgerblue", currency: "₹" },
      profile: {}
    }),
    subscribe: jest.fn(() => jest.fn()),
    dispatch: jest.fn(),
  },
  persistor: {}
}));

jest.mock("redux-persist/integration/react", () => ({
  PersistGate: ({ children }) => <>{children}</>,
}));

jest.mock("react-helmet-async", () => ({
  HelmetProvider: ({ children }) => <>{children}</>,
}));

jest.mock("./context/EmiContext", () => ({
  EmiProvider: ({ children }) => <>{children}</>,
}));

describe("App Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Header and Home page on the default route ("/")', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-home")).toBeInTheDocument();
    // FAQ should not be visible on the default route
    expect(screen.queryByTestId("mock-faq")).not.toBeInTheDocument();
  });

  it('renders the Calculator page on the "/calculator" route', () => {
    render(
      <MemoryRouter initialEntries={["/calculator"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("mock-calculator")).toBeInTheDocument();
  });

  it('renders the FAQ page on the "/faq" route', () => {
    render(
      <MemoryRouter initialEntries={["/faq"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("mock-faq")).toBeInTheDocument();
  });

  it('renders the unified Investment page on the "/investment/sip" route', () => {
    render(
      <MemoryRouter initialEntries={["/investment/sip"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId("mock-investment")).toBeInTheDocument();
  });

  describe("ErrorBoundary functionality", () => {
    it("catches component errors and displays the fallback UI", () => {
      // Suppress React's intentional error logging during this specific test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      
      const FAQMock = require("./pages/FAQ");
      FAQMock.mockImplementationOnce(() => {
        throw new Error("Intentional Test Error");
      });

      render(
        <MemoryRouter initialEntries={["/faq"]}>
          <App />
        </MemoryRouter>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText(/Intentional Test Error/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Reload Page/i })).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});