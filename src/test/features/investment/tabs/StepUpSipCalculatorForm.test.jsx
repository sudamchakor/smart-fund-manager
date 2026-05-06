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

const mockStore = configureStore([]);
const theme = createTheme(); // Define theme

describe('StepUpSipCalculatorForm', () => {
  const defaultSharedState = {
    emi: { currency: '₹' },
    profile: { expectedReturnRate: 0.12, stepUpPercentage: 0.05 },
    // sharedState is now part of the Redux state for this component
    // This is the structure the component expects if it were to use useSelector for sharedState
    // However, the component is designed to receive sharedState as a prop.
    // We'll keep this mock for other selectors if they exist, but pass sharedState as a prop.
    initialMonthlyInvestment: 5000,
    stepUpPercentage: 0.10,
    expectedReturnRate: 0.12,
    timePeriod: 10,
    },
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
