import React from 'react';
import { render, screen } from '@testing-library/react';
import FinancialModal from '../../../../features/profile/components/FinancialModal.jsx'; // Corrected path

describe.skip('FinancialModal', () => {
  it('renders without crashing', () => {
    render(<FinancialModal open={true} onClose={() => {}} />);
    expect(screen.getByText(/Financial Details/i)).toBeInTheDocument(); // Placeholder
  });
});
