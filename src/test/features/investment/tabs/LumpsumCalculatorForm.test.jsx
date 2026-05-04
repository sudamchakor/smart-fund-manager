import React from 'react';
import { render, screen } from '@testing-library/react';
import LumpsumCalculatorForm from '../../../../../src/features/investment/tabs/LumpsumCalculatorForm';

describe('LumpsumCalculatorForm', () => {
  it('renders without crashing', () => {
    render(<LumpsumCalculatorForm />);
    expect(screen.getByText(/Lumpsum Calculator/i)).toBeInTheDocument();
  });
});