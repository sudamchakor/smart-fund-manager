import React from 'react';
import { render, screen } from '@testing-library/react';
import SystemParameters from '../../../../../features/profile/tabs/OnboardingSteps/SystemParameters.jsx'; // Corrected path

// Mock Redux hooks - kept for completeness, though SystemParameters primarily uses props for its data
jest.mock('react-redux', () => ({ // Ensure useSelector provides all necessary initial state properties
  useSelector: jest.fn((selector) =>
    selector({
      profile: {
        basicInfo: {
          name: '',
          occupation: '',
        },
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
jest.mock('../../../../../src/components/common/SliderInput.jsx',
  () => (props) => (
    <div data-testid={`slider-${props.label}`}>{props.label}</div>
  ),
  { virtual: true },
);


describe('SystemParameters', () => {
  it('renders without crashing', () => {
    // Ensure all props expected by the component are provided with default values
    const mockBasicInfo = {
      name: '',
      occupation: '',
      // Ensure these fields, used by SliderInput, are present and have default values
      currentAge: 30,
      retirementAge: 60,
      careerGrowthRate: 0.05,
      educationInflationRate: 0.08,
      generalInflationRate: 0.06, // Default value for slider
      riskTolerance: 'medium', // Default value for select
    };
    const mockSetBasicInfoState = jest.fn();
    render(
      <SystemParameters onNext={() => {}} basicInfo={mockBasicInfo} setBasicInfoState={mockSetBasicInfoState} />
    );
    expect(
      screen.getByText(/System & Demographics/i), // Corrected text matcher
    ).toBeInTheDocument();
    expect(screen.getByTestId('slider-Current Age')).toBeInTheDocument();
    expect(screen.getByTestId('slider-Retirement Target')).toBeInTheDocument(); // Updated
    expect(screen.getByTestId('slider-Career Growth (p.a)')).toBeInTheDocument(); // Updated
    expect(screen.getByTestId('slider-General Inflation')).toBeInTheDocument(); // Updated
    // Removed expectation for 'slider-Education Inflation Rate' as it doesn't exist in the component
  });
});
