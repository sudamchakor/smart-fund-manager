import React from 'react';
import { render, screen } from '@testing-library/react';
import StepUpSipCalculatorForm from '../../../../../src/features/investment/tabs/StepUpSipCalculatorForm';

describe('StepUpSipCalculatorForm', () => {
  it('renders without crashing', () => {
    render(<StepUpSipCalculatorForm />);
    expect(screen.getByText(/Step-Up SIP Calculator/i)).toBeInTheDocument();
  });
});