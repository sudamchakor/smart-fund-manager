import React from 'react';
import { render, screen } from '@testing-library/react';
import BridgeGapModal from '../../../features/profile/components/BridgeGapModal';

describe.skip('BridgeGapModal', () => {
  it('renders without crashing', () => {
    render(<BridgeGapModal open={true} onClose={() => {}} />);
    expect(screen.getByText(/Bridge the Gap/i)).toBeInTheDocument(); // Placeholder
  });
});