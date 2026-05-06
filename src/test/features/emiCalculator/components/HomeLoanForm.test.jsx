import React from 'react';
import { render, screen } from '@testing-library/react';
import HomeLoanForm from '../../../../../src/features/emiCalculator/components/HomeLoanForm';
import { Provider } from 'react-redux'; // Import Provider

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

const mockReduxState = {
  emiCalculator: {
    loanAmount: 100000,
    interestRate: 10,
    loanTenure: 120,
    loanDetails: {
      homeValue: 5000000, // Example value
      marginAmount: 1000000,
      marginUnit: 'Rs',
      loanInsurance: 0,
      loanFees: 0,
    },
  },
  emi: {
    currency: '₹',
  },
};

beforeEach(() => {
  require('react-redux').useSelector.mockImplementation((selector) =>
    selector(mockReduxState)
  );
});

// Mock SliderInput
jest.mock('../../../../../src/components/common/SliderInput', () => ({ label, ...rest }) => (
  <div data-testid={`mock-slider-input-${label.replace(/\s/g, '-')}`}>{label}</div>
)); // Updated mock to match common pattern

describe('HomeLoanForm', () => {
  it('renders without crashing', async () => { // Marked as async for potential async operations
    // Wrap HomeLoanForm with Provider and a minimal store if needed, or directly mock useSelector
    render(<Provider store={{}}><HomeLoanForm /></Provider>); // Render the component wrapped in Provider
    expect(screen.getByText(/Home Value/i)).toBeInTheDocument(); // Check for a specific label from loanDetails
    expect(screen.getByText(/Interest Rate/i)).toBeInTheDocument(); // Assuming this is rendered
    expect(screen.getByText(/Loan Tenure/i)).toBeInTheDocument(); // Assuming this is rendered
  });
});
