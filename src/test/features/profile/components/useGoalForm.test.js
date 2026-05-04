import { renderHook, act } from '@testing-library/react-hooks';
import { useDispatch, useSelector } from 'react-redux';
import useGoalForm from '../../../features/profile/components/useGoalForm';
import { addGoal, updateGoal } from '../../../store/profileSlice';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../../store/profileSlice', () => ({
  addGoal: jest.fn(),
  updateGoal: jest.fn(),
  selectGoals: jest.fn(() => []),
  selectCurrentAge: jest.fn(() => 30),
}));

describe.skip('useGoalForm', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockImplementation(selector => selector({
      profile: {
        goals: [],
        currentAge: 30,
      },
      emi: {
        currency: '₹',
      }
    }));
    jest.clearAllMocks();
  });

  it('initializes with default goal state for new goal', () => {
    const { result } = renderHook(() => useGoalForm());

    expect(result.current.goal).toEqual({
      name: '',
      targetAmount: '',
      targetYear: '',
      category: '',
      priority: '',
      investmentPlans: [],
    });
    expect(result.current.isEditMode).toBe(false);
  });

  it('initializes with existing goal state for edit mode', () => {
    const existingGoal = {
      id: '1',
      name: 'Test Goal',
      targetAmount: 100000,
      targetYear: 2030,
      category: 'education',
      priority: 'high',
      investmentPlans: [{ type: 'sip', monthlyContribution: 5000 }],
    };
    useSelector.mockImplementation(selector => selector({
      profile: {
        goals: [existingGoal],
        currentAge: 30,
      },
      emi: {
        currency: '₹',
      }
    }));

    const { result } = renderHook(() => useGoalForm(existingGoal.id));

    expect(result.current.goal).toEqual(existingGoal);
    expect(result.current.isEditMode).toBe(true);
  });

  it('handles input changes correctly', () => {
    const { result } = renderHook(() => useGoalForm());

    act(() => {
      result.current.handleChange({ target: { name: 'name', value: 'New Goal' } });
    });
    expect(result.current.goal.name).toBe('New Goal');

    act(() => {
      result.current.handleChange({ target: { name: 'targetAmount', value: '50000' } });
    });
    expect(result.current.goal.targetAmount).toBe(50000);
  });

  it('adds an investment plan', () => {
    const { result } = renderHook(() => useGoalForm());

    act(() => {
      result.current.addInvestmentPlan();
    });
    expect(result.current.goal.investmentPlans).toHaveLength(1);
    expect(result.current.goal.investmentPlans[0]).toEqual({ type: 'sip', monthlyContribution: 0, expectedReturnRate: 0, timeHorizon: 0 });
  });

  it('removes an investment plan', () => {
    const { result } = renderHook(() => useGoalForm());

    act(() => {
      result.current.addInvestmentPlan();
      result.current.removeInvestmentPlan(0);
    });
    expect(result.current.goal.investmentPlans).toHaveLength(0);
  });

  it('handles investment plan changes', () => {
    const { result } = renderHook(() => useGoalForm());

    act(() => {
      result.current.addInvestmentPlan();
      result.current.handleInvestmentPlanChange(0, { target: { name: 'monthlyContribution', value: '1000' } });
    });
    expect(result.current.goal.investmentPlans[0].monthlyContribution).toBe(1000);
  });

  it('dispatches addGoal for new goal submission', () => {
    const { result } = renderHook(() => useGoalForm());

    act(() => {
      result.current.handleChange({ target: { name: 'name', value: 'New Goal' } });
      result.current.handleChange({ target: { name: 'targetAmount', value: '100000' } });
      result.current.handleChange({ target: { name: 'targetYear', value: '2030' } });
      result.current.handleChange({ target: { name: 'category', value: 'other' } });
      result.current.handleChange({ target: { name: 'priority', value: 'medium' } });
      result.current.handleSubmit({ preventDefault: jest.fn() });
    });

    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // Thunk action
  });

  it('dispatches updateGoal for existing goal submission', () => {
    const existingGoal = {
      id: '1',
      name: 'Test Goal',
      targetAmount: 100000,
      targetYear: 2030,
      category: 'education',
      priority: 'high',
      investmentPlans: [],
    };
    useSelector.mockImplementation(selector => selector({
      profile: {
        goals: [existingGoal],
        currentAge: 30,
      },
      emi: {
        currency: '₹',
      }
    }));

    const { result } = renderHook(() => useGoalForm(existingGoal.id));

    act(() => {
      result.current.handleChange({ target: { name: 'name', value: 'Updated Goal' } });
      result.current.handleSubmit({ preventDefault: jest.fn() });
    });

    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function)); // Thunk action
  });

  it('sets errors for invalid submission', () => {
    const { result } = renderHook(() => useGoalForm());

    act(() => {
      result.current.handleSubmit({ preventDefault: jest.fn() });
    });

    expect(result.current.errors.name).toBe('Goal Name is required');
    expect(result.current.errors.targetAmount).toBe('Target Amount is required');
  });
});