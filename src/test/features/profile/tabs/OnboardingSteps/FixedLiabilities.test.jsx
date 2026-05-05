import React from 'react';
import { render, screen } from '@testing-library/react';
import FixedLiabilities from '../../../../features/profile/tabs/OnboardingSteps/FixedLiabilities';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) =>
    selector({
      profile: {
        expenses: [],
      },
      emi: {
        currency: '₹',
      },
    }),
  ),
  useDispatch: () => jest.fn(),
}));

// Mock child components
jest.mock(
  '../../../../../src/components/common/EditableIncomeExpenseItem',
  () =>
    ({ item }) => (
      <div data-testid={`editable-expense-item-${item ? item.id : 'new'}`}>
        {item ? item.name : 'New Expense'}
      </div>
    ),
  { virtual: true },
);

describe.skip('FixedLiabilities', () => {
  it('renders without crashing', () => {
    render(<FixedLiabilities onNext={() => {}} onBack={() => {}} />);
    expect(
      screen.getByText(/What are your fixed liabilities and expenses?/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/New Expense/i)).toBeInTheDocument();
  });
});
