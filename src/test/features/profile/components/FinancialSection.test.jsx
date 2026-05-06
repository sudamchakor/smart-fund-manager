import React from 'react';
import { render, screen } from '@testing-library/react';
import FinancialSection from '../../../../features/profile/components/FinancialSection.jsx'; // Corrected path

describe.skip('FinancialSection', () => {
  it('renders without crashing', () => {
    render(<FinancialSection />);
    expect(screen.getByText(/Financial Section/i)).toBeInTheDocument(); // Placeholder
  });
});
