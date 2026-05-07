import React from 'react';
import { render, screen } from '@testing-library/react';
import PageHeader from '../../../components/common/PageHeader';

describe('PageHeader Component', () => {
  test('renders the title correctly', () => {
    render(<PageHeader title="Dashboard Title" />);
    
    const titleElement = screen.getByText('Dashboard Title');
    expect(titleElement).toBeInTheDocument();
    // Typography component="h5" outputs an actual <h5> tag
    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Dashboard Title');
  });

  test('renders the subtitle when provided', () => {
    render(<PageHeader title="Dashboard" subtitle="Overview of your metrics" />);
    
    expect(screen.getByText('Overview of your metrics')).toBeInTheDocument();
  });

  test('does not render the subtitle when not provided', () => {
    render(<PageHeader title="Dashboard" />);
    
    // Using a query for a non-existent element (should return null)
    expect(screen.queryByText('Overview of your metrics')).not.toBeInTheDocument();
  });

  test('renders the icon when provided with the correct test ID', () => {
    // Create a simple mock icon component
    const MockIcon = (props) => <svg {...props}>Mock Icon</svg>;
    render(<PageHeader title="Dashboard" icon={MockIcon} />);
    
    expect(screen.getByTestId('page-header-icon')).toBeInTheDocument();
  });

  test('renders the action element when provided', () => {
    const mockAction = <button>Settings</button>;
    render(<PageHeader title="Dashboard" action={mockAction} />);
    
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });
});