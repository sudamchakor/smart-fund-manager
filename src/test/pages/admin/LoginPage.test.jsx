import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginPage from '../../../../src/pages/admin/LoginPage';
import '@testing-library/jest-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { getAuthentication } from '../../../../src/firebaseConfig';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock firebase/auth functions
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  GithubAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}));

// Mock getAuthentication
jest.mock('../../../../src/firebaseConfig', () => ({
  getAuthentication: jest.fn(() => ({})),
}));

describe('LoginPage Component', () => {
  const renderComponent = () => {
    return render(
      <Router>
        <LoginPage />
      </Router>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    signInWithEmailAndPassword.mockResolvedValue({});
    signInWithPopup.mockResolvedValue({});
  });

  // --- Basic Rendering ---
  it('renders the login form elements', () => {
    renderComponent();
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Login with Email/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Login with Google/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Login with GitHub/i }),
    ).toBeInTheDocument();
  });

  // --- Email/Password Login ---
  it('handles email/password login successfully', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login with Email/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        'test@example.com',
        'password123',
      );
      expect(screen.getByText('Login successful!')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });
  });

  it('handles email/password login failure', async () => {
    const errorMessage = 'Invalid credentials';
    signInWithEmailAndPassword.mockRejectedValueOnce({ message: errorMessage });

    renderComponent();
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login with Email/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('shows loading state during email/password login', async () => {
    signInWithEmailAndPassword.mockReturnValueOnce(new Promise(() => {})); // Never resolve

    renderComponent();
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login with Email/i }));

    expect(
      screen.getByRole('button', { name: 'Logging In...' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  // --- Social Logins ---
  it('handles Google login successfully', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Login with Google/i }));

    await waitFor(() => {
      expect(GoogleAuthProvider).toHaveBeenCalledTimes(1);
      expect(signInWithPopup).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(GoogleAuthProvider),
      );
      expect(screen.getByText('Google login successful!')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });
  });

  it('handles Google login failure', async () => {
    const errorMessage = 'Google login failed';
    signInWithPopup.mockRejectedValueOnce({ message: errorMessage });

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Login with Google/i }));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledTimes(1);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('handles GitHub login successfully', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Login with GitHub/i }));

    await waitFor(() => {
      expect(GithubAuthProvider).toHaveBeenCalledTimes(1);
      expect(signInWithPopup).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(GithubAuthProvider),
      );
      expect(screen.getByText('GitHub login successful!')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });
  });

  it('handles GitHub login failure', async () => {
    const errorMessage = 'GitHub login failed';
    signInWithPopup.mockRejectedValueOnce({ message: errorMessage });

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Login with GitHub/i }));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledTimes(1);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('shows loading state during social login', async () => {
    signInWithPopup.mockReturnValueOnce(new Promise(() => {})); // Never resolve

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Login with Google/i }));

    expect(
      screen.getByRole('button', { name: /Login with Google/i }),
    ).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  // --- Snackbar ---
  it('closes snackbar when close button is clicked', async () => {
    const errorMessage = 'Test error';
    signInWithEmailAndPassword.mockRejectedValueOnce({ message: errorMessage });

    renderComponent();
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login with Email/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close' })); // Close button on Snackbar Alert
    
    await waitFor(() => {
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });
  });
});
