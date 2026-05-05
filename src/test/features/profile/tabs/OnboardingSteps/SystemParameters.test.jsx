import React from 'react';
import { render, screen } from '@testing-library/react';
import SystemParameters from '../../../../features/profile/tabs/OnboardingSteps/SystemParameters';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) =>
    selector({
      profile: {
        name: '',
        occupation: '',
        riskTolerance: 'medium',
        currentAge: 30,
        retirementAge: 60,
        careerGrowthRate: { type: 'percentage', value: 0.05 },
        generalInflationRate: 0.06,
        educationInflationRate: 0.08,
      },
    }),
  ),
  useDispatch: () => jest.fn(),
}));

// Mock child components
jest.mock(
  '../../../../../src/components/common/SliderInput',
  () => (props) => (
    <div data-testid={`slider-${props.label}`}>{props.label}</div>
  ),
  { virtual: true },
);

describe.skip('SystemParameters', () => {
  it('renders without crashing', () => {
    render(<SystemParameters onNext={() => {}} />);
    expect(
      screen.getByText(/Let's set up some basic system parameters/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('slider-Current Age')).toBeInTheDocument();
    expect(screen.getByTestId('slider-Retirement Age')).toBeInTheDocument();
    expect(screen.getByTestId('slider-Career Growth Rate')).toBeInTheDocument();
    expect(
      screen.getByTestId('slider-General Inflation Rate'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('slider-Education Inflation Rate'),
    ).toBeInTheDocument();
  });
});
