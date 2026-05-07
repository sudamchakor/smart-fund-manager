import React from 'react';
import { render, screen } from '@testing-library/react';
import StepUpSipCalculatorForm from '../../../../../src/features/investment/tabs/StepUpSipCalculatorForm';
import configureStore from 'redux-mock-store';
import { useSelector } from 'react-redux'; // Import useSelector
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

const theme = createTheme(); // Define theme

describe('StepUpSipCalculatorForm', () => {
  const defaultSharedState = {
    initialMonthlyInvestment: 5000,
    stepUpPercentage: 10,
    expectedReturnRate: 12,
    timePeriod: 10,
  };

  beforeEach(() => {
    // Mock useSelector for any other Redux state slices the component might use
    useSelector.mockImplementation((selector) => selector({
      emi: { currency: '₹' },
      profile: { expectedReturnRate: 0.12, stepUpPercentage: 0.05 },
    }));
  });

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={theme}>
        <StepUpSipCalculatorForm
          sharedState={defaultSharedState} // Pass sharedState as a prop
          onSharedStateChange={jest.fn()}
        />
      </ThemeProvider>
    );
    expect(screen.getByText(/Step-Up SIP Calculator/i)).toBeInTheDocument();
  });
});
