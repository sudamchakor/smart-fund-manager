import React from 'react';
import { render, screen } from '@testing-library/react';
import FinancialSettings from '../../../features/profile/components/FinancialSettings';

describe.skip('FinancialSettings', () => {
  it('renders without crashing', () => {
    render(<FinancialSettings />);
    expect(screen.getByText(/Financial Settings/i)).toBeInTheDocument(); // Placeholder
  });
});