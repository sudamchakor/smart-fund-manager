import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BasicInfoEdit from '../../../../features/profile/components/BasicInfoEdit.jsx'; // Corrected path

// Mock SliderInput since it's an external custom component
jest.mock('../../../components/common/SliderInput.jsx', () => {
  return function MockSliderInput({ label, value, onChange }) {
    return (
      <div data-testid={`slider-${label}`}>
        <label>{label}</label>
        <span data-testid={`value-${label}`}>{value}</span>
        <button onClick={() => onChange(value + 1)}>Increment {label}</button>
      </div>
    );
  };
});

describe.skip('BasicInfoEdit Component', () => {
  const defaultProps = {
    currentAge: 30,
    retirementAge: 60,
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders with initial age values', () => {
    render(<BasicInfoEdit {...defaultProps} />);
    expect(screen.getByTestId('value-Current Age')).toHaveTextContent('30');
    expect(screen.getByTestId('value-Target Retirement Age')).toHaveTextContent(
      '60',
    );
    expect(screen.getByText('30 years')).toBeInTheDocument(); // Years to Retirement
  });

  it('calls onSave with updated values when Save is clicked', () => {
    render(<BasicInfoEdit {...defaultProps} />);

    // Increment current age by 1
    fireEvent.click(screen.getByText('Increment Current Age'));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(defaultProps.onSave).toHaveBeenCalledWith(31, 60);
  });

  it('shows an alert and blocks save if retirement age is less than or equal to current age', () => {
    render(
      <BasicInfoEdit {...defaultProps} currentAge={60} retirementAge={60} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(window.alert).toHaveBeenCalledWith(
      'Time travel not yet supported! Retirement age must be greater than current age.',
    );
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });
});
