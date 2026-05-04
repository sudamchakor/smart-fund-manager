import React from 'react';
import { render, screen } from '@testing-library/react';
import FdCalculatorForm from '../../../../../src/features/investment/tabs/FdCalculatorForm';

describe('FdCalculatorForm', () => {
  it('renders without crashing', () => {
    render(<FdCalculatorForm />);
    expect(screen.getByText(/FD Calculator/i)).toBeInTheDocument();
  });
});