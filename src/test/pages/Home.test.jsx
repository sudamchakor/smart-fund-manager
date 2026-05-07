import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from '../../pages/Home';

// Mock the lazy loaded OnboardingModal to simplify testing
jest.mock('../features/profile/tabs/OnboardingModal', () => {
  return function MockOnboardingModal({ open, onClose }) {
    return open ? (
      <div data-testid="onboarding-modal">
        <button onClick={onClose} data-testid="close-onboarding">
          Close
        </button>
      </div>
    ) : null;
  };
});

describe('Home Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure a clean state
    localStorage.clear();
    jest.clearAllMocks();
  });

  const renderHome = () => {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </HelmetProvider>
    );
  };

  test('renders the hero section correctly', () => {
    renderHome();
    expect(screen.getByText(/SmartFund/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Free financial tools in India/i)).toBeInTheDocument();
  });

  test('renders all system modules', () => {
    renderHome();
    const modules = [
      'Wealth Dashboard',
      'Home Loan EMI',
      'Credit Card EMI',
      'SIP & Investment',
      'Personal Loan',
      'Income Tax Planner',
    ];
    
    modules.forEach((moduleTitle) => {
      expect(screen.getByText(moduleTitle)).toBeInTheDocument();
    });
  });

  test('shows onboarding modal when hasOnboarded is not in localStorage', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
    });
  });

  test('does not show onboarding modal when hasOnboarded is in localStorage', () => {
    localStorage.setItem('hasOnboarded', 'true');
    renderHome();
    
    expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
  });

  test('closes onboarding modal and updates localStorage on close', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('close-onboarding'));

    await waitFor(() => {
      expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
    });
    
    expect(localStorage.getItem('hasOnboarded')).toBe('true');
  });
});