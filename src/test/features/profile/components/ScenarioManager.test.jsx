import React from 'react';
import { render, screen } from '@testing-library/react';
import ScenarioManager from '../../../features/profile/components/ScenarioManager';

describe.skip('ScenarioManager', () => {
  it('renders without crashing', () => {
    render(<ScenarioManager />);
    expect(screen.getByText(/Scenario Manager/i)).toBeInTheDocument(); // Placeholder
  });
});