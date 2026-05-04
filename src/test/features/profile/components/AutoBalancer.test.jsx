import React from 'react';
import { render, screen } from '@testing-library/react';
import AutoBalancer from '../../../../features/profile/components/AutoBalancer';

describe('AutoBalancer', () => {
  it('renders without crashing', () => {
    render(<AutoBalancer />);
    expect(screen.getByText(/Auto Balancer/i)).toBeInTheDocument(); // Placeholder
  });
});