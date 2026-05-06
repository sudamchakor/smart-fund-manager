import React from 'react';
import { render, screen } from '@testing-library/react';
import GoalFormHeader from '../../../../features/profile/components/GoalFormHeader.jsx'; // Corrected path

describe.skip('GoalFormHeader', () => {
  it('renders without crashing', () => {
    render(<GoalFormHeader isEditMode={false} />);
    expect(screen.getByText(/Add New Goal/i)).toBeInTheDocument();
  });

  it('renders "Edit Goal" when in edit mode', () => {
    render(<GoalFormHeader isEditMode={true} />);
    expect(screen.getByText(/Edit Goal/i)).toBeInTheDocument();
  });
});
