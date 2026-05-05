import React from 'react';
import { render, screen } from '@testing-library/react';
import IncomeStreams from '../../../../features/profile/tabs/OnboardingSteps/IncomeStreams';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) =>
    selector({
      profile: {
        incomes: [],
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
      <div data-testid={`editable-income-item-${item ? item.id : 'new'}`}>
        {item ? item.name : 'New Income'}
      </div>
    ),
  { virtual: true },
);

describe.skip('IncomeStreams', () => {
  it('renders without crashing', () => {
    render(<IncomeStreams onNext={() => {}} onBack={() => {}} />);
    expect(
      screen.getByText(/What are your income streams?/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/New Income/i)).toBeInTheDocument();
  });
});
