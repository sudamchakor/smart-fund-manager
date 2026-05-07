import React from 'react';
import { render, screen } from '@testing-library/react';
import FixedLiabilities from '../../../../../features/profile/tabs/OnboardingSteps/FixedLiabilities.jsx'; // Corrected path

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) => {
    try {
      return selector({
        profile: {
          // Ensure these are arrays, even if empty
          expenses: [],
          expensesList: [],
        },
        emi: {
          currency: '₹',
        },
      });
    } catch (e) {
      return undefined;
    }
  }),
  useDispatch: () => jest.fn(),
}));

// Mock child components
jest.mock('../../../../../src/components/common/EditableIncomeExpenseItem.jsx', // Corrected path
  () =>
    ({ item }) => (
      <div data-testid={`editable-expense-item-${item ? item.id : 'new'}`}>
        {item ? item.name : 'New Expense'}
      </div>
    ),
  { virtual: true },
);

describe('FixedLiabilities', () => {
  it('renders without crashing', () => {
    const mockExpense = { name: '', amount: '', type: 'monthly', category: 'basic' };
    const mockSetExpense = jest.fn();
    render(
      <FixedLiabilities
        onNext={jest.fn()}
        onBack={jest.fn()}
        expense={mockExpense}
        setExpense={mockSetExpense}
        expensesList={[]} // Provide an empty array as a default
        setExpensesList={jest.fn()} // Provide a mock function
        // The component might expect a specific structure for its initial state, ensure mockExpense matches
      />
    );
    expect(
      screen.getByText(/Operational Liabilities/i), // Updated text matcher
    ).toBeInTheDocument();
    expect(screen.getByText(/New Expense/i)).toBeInTheDocument();
  });
});
