import React from 'react';
import { render, screen } from '@testing-library/react';
import IncomeStreams from '../../../../../features/profile/tabs/OnboardingSteps/IncomeStreams.jsx'; // Corrected path

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) => {
    try {
      return selector({
        profile: {
          incomes: [], // Ensure this is an array
          incomesList: [],
          expenses: [],
          goals: [],
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
jest.mock(
  '../../../../../src/components/common/EditableIncomeExpenseItem.jsx', // Corrected path
  () =>
    ({ item }) => (
      <div data-testid={`editable-income-item-${item ? item.id : 'new'}`}>
        {item ? item.name : 'New Income'}
      </div>
    ),
  { virtual: true },
);

describe('IncomeStreams', () => {
  it('renders without crashing', () => {
    const mockIncome = { name: '', amount: '', type: 'monthly' };
    const mockSetIncome = jest.fn();
    render(
      <IncomeStreams
        onNext={() => {}}
        onBack={() => {}}
        income={mockIncome}
        setIncome={mockSetIncome}
        incomesList={[]} // Pass an empty array to prevent TypeError
      />
    );
    expect(
      screen.getByText(/What are your income streams?/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/New Income/i)).toBeInTheDocument();
  });
});
