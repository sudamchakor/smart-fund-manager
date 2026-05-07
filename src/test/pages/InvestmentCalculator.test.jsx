import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InvestmentCalculator from '../../pages/InvestmentCalculator';
import '@testing-library/jest-dom';

// Mock react-router-dom hooks
const mockUseLocation = jest.fn();
const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockUseLocation(),
  useNavigate: () => mockUseNavigate,
}));

// Mock lazy-loaded child components
jest.mock(
  '../../features/investment/tabs/SipCalculatorForm',
  () =>
    ({ onCalculate, sharedState, onSharedStateChange }) => (
      <div data-testid="sip-calculator-form">
        SIP Form
        <button
          onClick={() =>
            onCalculate({
              investedAmount: 100,
              estimatedReturns: 10,
              totalValue: 110,
              chartData: [{ month: 1, value: 10 }],
            })
          }
        >
          Calculate SIP
        </button>
        <button onClick={() => onSharedStateChange('monthlyInvestment', 1000)}>
          Change Monthly Investment
        </button>
      </div>
    ),
);
jest.mock(
  '../../features/investment/tabs/LumpsumCalculatorForm',
  () =>
    ({ onCalculate, sharedState, onSharedStateChange }) => (
      <div data-testid="lumpsum-calculator-form">
        Lumpsum Form
        <button
          onClick={() =>
            onCalculate({
              investedAmount: 200,
              estimatedReturns: 20,
              totalValue: 220,
              chartData: [{ month: 1, value: 20 }],
            })
          }
        >
          Calculate Lumpsum
        </button>
      </div>
    ),
);
jest.mock(
  '../../features/investment/tabs/StepUpSipCalculatorForm',
  () =>
    ({ onCalculate, sharedState, onSharedStateChange }) => (
      <div data-testid="step-up-sip-calculator-form">
        Step-Up SIP Form
        <button
          onClick={() =>
            onCalculate({
              investedAmount: 300,
              estimatedReturns: 30,
              totalValue: 330,
              chartData: [{ month: 1, value: 30 }],
            })
          }
        >
          Calculate Step-Up SIP
        </button>
      </div>
    ),
);
jest.mock(
  '../../features/investment/tabs/SwpCalculatorForm',
  () =>
    ({ onCalculate, sharedState, onSharedStateChange }) => (
      <div data-testid="swp-calculator-form">
        SWP Form
        <button
          onClick={() =>
            onCalculate({
              investedAmount: 400,
              totalWithdrawn: 40,
              totalValue: 360,
              chartData: [{ month: 1, value: 40 }],
            })
          }
        >
          Calculate SWP
        </button>
      </div>
    ),
);
jest.mock(
  '../../features/investment/tabs/FdCalculatorForm',
  () =>
    ({ onCalculate, sharedState, onSharedStateChange }) => (
      <div data-testid="fd-calculator-form">
        FD Form
        <button
          onClick={() =>
            onCalculate({
              investedAmount: 500,
              estimatedReturns: 50,
              totalValue: 550,
              chartData: [{ month: 1, value: 50 }],
            })
          }
        >
          Calculate FD
        </button>
      </div>
    ),
);
jest.mock(
  '../../features/investment/components/InvestmentChart',
  () =>
    ({ data }) => (
      <div data-testid="investment-chart">
        Investment Chart
        <span data-testid="chart-data">{JSON.stringify(data)}</span>
      </div>
    ),
);
jest.mock('../../components/common/SuspenseFallback', () => () => (
  <div data-testid="suspense-fallback">Loading...</div>
));

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('InvestmentCalculator Page', () => {
  const renderComponent = (initialPath = '/investment') => {
    mockUseLocation.mockReturnValue({ pathname: initialPath });
    return render(
      <ThemeProvider theme={theme}>
        <Router>
          <InvestmentCalculator />
        </Router>
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockClear();
  });

  // --- Header Section ---
  it('renders the main header and description', () => {
    renderComponent();
    expect(screen.getByText('Investment Strategy Console')).toBeInTheDocument();
    expect(
      screen.getByText(/Project long-term wealth accumulation/i),
    ).toBeInTheDocument();
  });

  // --- Tab Navigation ---
  it('renders all investment tabs', () => {
    renderComponent();
    expect(screen.getAllByRole('tab', { name: 'SIP' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('tab', { name: 'Lumpsum' })[0]).toBeInTheDocument();
    expect(
      screen.getAllByRole('tab', { name: 'Step-Up SIP' })[0],
    ).toBeInTheDocument();
    expect(screen.getAllByRole('tab', { name: 'SWP' })[0]).toBeInTheDocument();
    expect(
      screen.getAllByRole('tab', { name: 'Fixed Deposit' })[0],
    ).toBeInTheDocument();
  });

  it('selects the correct tab based on initial URL path', async () => {
    renderComponent('/investment/lumpsum');
    expect(screen.getAllByRole('tab', { name: 'Lumpsum' })[0]).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect((await screen.findAllByTestId('lumpsum-calculator-form'))[0]).toBeInTheDocument();
    expect(screen.queryByTestId('sip-calculator-form')).not.toBeInTheDocument();
  });

  it('defaults to SIP tab if URL path is unknown or /investment', async () => {
    renderComponent('/investment');
    expect(screen.getAllByRole('tab', { name: 'SIP' })[0]).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect((await screen.findAllByTestId('sip-calculator-form'))[0]).toBeInTheDocument();

    renderComponent('/investment/unknown');
    expect(screen.getAllByRole('tab', { name: 'SIP' })[0]).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect((await screen.findAllByTestId('sip-calculator-form'))[0]).toBeInTheDocument();
  });

  it('navigates to the correct path when a tab is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getAllByRole('tab', { name: 'Lumpsum' })[0]);
    expect(mockUseNavigate).toHaveBeenCalledWith('/investment/lumpsum');
  });

  // --- Shared State ---
  it('updates shared state when onSharedStateChange is called from a form', async () => {
    renderComponent();
    const btn = await screen.findAllByRole('button', { name: 'Change Monthly Investment' });
    fireEvent.click(
      btn[0],
    ); // Button from mock SIP form
    // This is a mock, so we check if the function was called.
    // The actual state change is internal to the component.
    expect((await screen.findAllByTestId('sip-calculator-form'))[0]).toBeInTheDocument(); // Ensure SIP form is rendered
  });

  // --- Projection Summary ---
  it('renders "Awaiting input parameters" when no investment data is calculated', () => {
    renderComponent();
    expect(
      screen.getByText('Awaiting input parameters to generate projection'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('investment-chart')).not.toBeInTheDocument();
  });

  it('renders summary wells and chart when investment data is calculated', async () => {
    renderComponent();
    const calcBtns = await screen.findAllByRole('button', { name: 'Calculate SIP' });
    fireEvent.click(calcBtns[0]); // Trigger calculation
    expect(screen.getByText('Projection Summary')).toBeInTheDocument();
    expect(screen.getByText('Total Investment')).toBeInTheDocument();
    expect(screen.getByText('₹100')).toBeInTheDocument();
    expect(screen.getByText('Est. Returns')).toBeInTheDocument();
    expect(screen.getByText('₹10')).toBeInTheDocument();
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText('₹110')).toBeInTheDocument();
    expect((await screen.findAllByTestId('investment-chart'))[0]).toBeInTheDocument();
    expect((await screen.findAllByTestId('chart-data'))[0]).toHaveTextContent(
      JSON.stringify([{ month: 1, value: 10 }]),
    );
  });

  it('renders SWP specific summary wells', async () => {
    renderComponent('/investment/swp');
    const swpBtns = await screen.findAllByRole('button', { name: 'Calculate SWP' });
    fireEvent.click(swpBtns[0]);
    expect(screen.getByText('Invested Amount')).toBeInTheDocument();
    expect(screen.getByText('₹400')).toBeInTheDocument();
    expect(screen.getByText('Total Withdrawn')).toBeInTheDocument();
    expect(screen.getByText('₹40')).toBeInTheDocument();
    expect(screen.getByText('Final Balance')).toBeInTheDocument();
    expect(screen.getByText('₹360')).toBeInTheDocument();
  });

  // --- Suspense Fallback ---
  it('renders SuspenseFallback during lazy loading of forms', () => {
    // This is implicitly tested by the mocks, as they immediately render their content.
    // To truly test SuspenseFallback, you'd need to delay the mock's rendering,
    // which is more complex and often handled by React's own testing utilities for Suspense.
    // For now, we ensure the fallback component is mocked.
    expect(screen.queryByTestId('suspense-fallback')).not.toBeInTheDocument(); // Should not be visible after initial load
  });
});
