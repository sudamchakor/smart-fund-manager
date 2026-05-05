import React from 'react';
import { render, screen } from '@testing-library/react';
import HomeLoanForm from '../../../../../src/features/emiCalculator/components/HomeLoanForm';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) =>
    selector({
      emiCalculator: {
        loanAmount: 100000,
        interestRate: 10,
        loanTenure: 120,
      },
      emi: {
        currency: '₹',
      },
    }),
  ),
  useDispatch: () => jest.fn(),
}));

// Mock SliderInput
jest.mock('../../../../../src/components/common/SliderInput', () => (props) => (
  <div data-testid={`slider-${props.label}`}>{props.label}</div>
));

describe('HomeLoanForm', () => {
  it('renders without crashing', () => {
    render(<HomeLoanForm />);
    expect(screen.getByText(/Loan Amount/i)).toBeInTheDocument();
    expect(screen.getByText(/Interest Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Loan Tenure/i)).toBeInTheDocument();
  });
});
