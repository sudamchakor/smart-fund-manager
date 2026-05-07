import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminProfile from '../../../../src/pages/admin/AdminProfile';
import '@testing-library/jest-dom';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ to, children }) => <a href={to}>{children}</a>, // Mock Link component
}));

// Mock useAuth hook (corrected path)
jest.mock('../../../../src/hooks/useAuth.js', () => ({
  useAuth: jest.fn(),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(() => 'mock-doc-ref'),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  updateProfile: jest.fn(),
  deleteUser: jest.fn(),
  EmailAuthProvider: { credential: jest.fn() },
  reauthenticateWithCredential: jest.fn(),
  updatePassword: jest.fn(),
}));

// Mock PageHeader
jest.mock(
  '../../../../src/components/common/PageHeader',
  () =>
    ({ title, subtitle, icon: Icon }) => (
      <div data-testid="mock-page-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {Icon && <Icon data-testid="mock-header-icon" />}
      </div>
    ),
);

describe('AdminProfile Component', () => {
  const mockUser = {
    uid: 'test-uid',
    displayName: 'Test Admin',
    email: 'test@example.com',
    providerData: [{ providerId: 'password' }],
  };
  const mockLogout = jest.fn();

  const renderComponent = (authLoading = false, user = mockUser) => {
    const safeUser = user ? { ...user, providerData: user.providerData || [{ providerId: 'password' }] } : null;
    require('../../../../src/hooks/useAuth.js').useAuth.mockReturnValue({
      user: safeUser,
      loading: authLoading,
      logout: mockLogout,
    });
    return render(
      <Router>
        <AdminProfile />
      </Router>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ displayName: 'Fetched Name', bio: 'Fetched Bio' }),
    });
    setDoc.mockResolvedValue();
    updateProfile.mockResolvedValue();
    deleteUser.mockResolvedValue();
    reauthenticateWithCredential.mockResolvedValue();
    updatePassword.mockResolvedValue();
    EmailAuthProvider.credential.mockReturnValue('mock-credential');
  });

  // --- Initial Loading and Redirection ---
  it('shows loading spinner when authLoading is true', () => {
    renderComponent(true);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to /admin/login if user is null and not loading', () => {
    renderComponent(false, null);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
  });

  it('does not render anything if user is null but authLoading is true', () => {
    renderComponent(true, null);
    expect(screen.queryByText('Profile Details')).not.toBeInTheDocument();
  });

  // --- Profile Details Section ---
  it('renders profile details fields with fetched data', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByLabelText(/Display Name/i)).toHaveValue('Fetched Name');
      expect(screen.getByLabelText(/Bio/i)).toHaveValue('Fetched Bio');
    });
  });

  it('initializes profile data with user.displayName if no firestore profile exists', async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByLabelText(/Display Name/i)).toHaveValue('Test Admin');
      expect(screen.getByLabelText(/Bio/i)).toHaveValue('');
    });
  });

  it('updates profile data on input change', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText(/Display Name/i)).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText(/Display Name/i), {
      target: { value: 'New Name' },
    });
    fireEvent.change(screen.getByLabelText(/Bio/i), {
      target: { value: 'New Bio' },
    });

    expect(screen.getByLabelText(/Display Name/i)).toHaveValue('New Name');
    expect(screen.getByLabelText(/Bio/i)).toHaveValue('New Bio');
  });

  it('saves profile data to Firebase Auth and Firestore', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText(/Display Name/i)).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText(/Display Name/i), {
      target: { value: 'Updated Name' },
    });
    fireEvent.change(screen.getByLabelText(/Bio/i), {
      target: { value: 'Updated Bio' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save Profile/i }));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'Updated Name',
      });
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        { displayName: 'Updated Name', bio: 'Updated Bio' },
        { merge: true },
      );
      expect(
        screen.getByText('Profile updated successfully!'),
      ).toBeInTheDocument();
    });
  });

  it('shows error snackbar if profile save fails', async () => {
    setDoc.mockRejectedValueOnce(new Error('Firestore error'));
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText(/Display Name/i)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Save Profile/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Error saving profile: Firestore error'),
      ).toBeInTheDocument();
    });
  });

  // --- Change Password Section ---
  it('renders change password fields', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Change Password/i }),
      ).toBeInTheDocument();
    });
  });

  it('changes password successfully', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => {
      expect(EmailAuthProvider.credential).toHaveBeenCalledWith(
        'test@example.com',
        'oldpass',
      );
      expect(reauthenticateWithCredential).toHaveBeenCalledWith(
        mockUser,
        'mock-credential',
      );
      expect(updatePassword).toHaveBeenCalledWith(mockUser, 'newpass123');
      expect(
        screen.getByText('Password updated successfully!'),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Current Password/i)).toHaveValue('');
    });
  });

  it('shows error if password fields are empty', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    await waitFor(() => {
      expect(
        screen.getByText('All password fields are required.'),
      ).toBeInTheDocument();
    });
  });

  it('shows error if new passwords do not match', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'newpass456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    await waitFor(() => {
      expect(
        screen.getByText('New password and confirm password do not match.'),
      ).toBeInTheDocument();
    });
  });

  it('shows error if new password is too short', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    await waitFor(() => {
      expect(
        screen.getByText('New password must be at least 6 characters long.'),
      ).toBeInTheDocument();
    });
  });

  it('handles password change re-authentication error', async () => {
    reauthenticateWithCredential.mockRejectedValueOnce({
      code: 'getAuthentication/wrong-password',
      message: 'Wrong password',
    });
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: 'wrongoldpass' },
    });
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Incorrect current password.'),
      ).toBeInTheDocument();
    });
  });

  it('handles password change weak password error', async () => {
    reauthenticateWithCredential.mockResolvedValueOnce();
    updatePassword.mockRejectedValueOnce({
      code: 'getAuthentication/weak-password',
      message: 'Weak password',
    });
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Password is too weak. Please choose a stronger password.',
        ),
      ).toBeInTheDocument();
    });
  });

  // --- Delete Account Section ---
  it('opens confirm delete dialog when "Delete My Account" is clicked', async () => {
    renderComponent();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Delete My Account/i }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Delete My Account/i }));
    await waitFor(() => {
      expect(screen.getByText('Confirm Account Deletion')).toBeInTheDocument();
    });
  });

  it('deletes account and profile on confirmation', async () => {
    renderComponent();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Delete My Account/i }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Delete My Account/i }));
    fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));

    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith(mockUser);
      expect(deleteDoc).toHaveBeenCalledWith(expect.any(Object));
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText('Profile and account deleted successfully!'),
      ).toBeInTheDocument();
    });
  });

  it('opens re-authentication dialog if delete fails due to recent login requirement', async () => {
    deleteUser.mockRejectedValueOnce({
      code: 'getAuthentication/requires-recent-login',
      message: 'Requires recent login',
    });
    renderComponent();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Delete My Account/i }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Delete My Account/i }));
    fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Re-authenticate to Delete Account'),
      ).toBeInTheDocument();
    });
  });

  it('re-authenticates and retries deletion', async () => {
    deleteUser.mockRejectedValueOnce({
      code: 'getAuthentication/requires-recent-login',
      message: 'Requires recent login',
    });
    renderComponent();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Delete My Account/i }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Delete My Account/i }));
    fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));

    await waitFor(() =>
      expect(
        screen.getByText('Re-authenticate to Delete Account'),
      ).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'reauthpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Re-authenticate/i }));

    await waitFor(() => {
      expect(EmailAuthProvider.credential).toHaveBeenCalledWith(
        'test@example.com',
        'reauthpass',
      );
      expect(reauthenticateWithCredential).toHaveBeenCalledWith(
        mockUser,
        'mock-credential',
      );
      expect(deleteUser).toHaveBeenCalledTimes(2); // Called once, then retried
    });
  });

  it('shows error if re-authentication fails', async () => {
    deleteUser.mockRejectedValueOnce({
      code: 'getAuthentication/requires-recent-login',
      message: 'Requires recent login',
    });
    reauthenticateWithCredential.mockRejectedValueOnce(
      new Error('Reauth failed'),
    );
    renderComponent();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Delete My Account/i }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Delete My Account/i }));
    fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Re-authenticate to Delete Account'),
      ).toBeInTheDocument();
    });
  });

  it('closes re-authentication dialog on cancel', async () => {
    deleteUser.mockRejectedValueOnce({
      code: 'getAuthentication/requires-recent-login',
      message: 'Requires recent login',
    });
    renderComponent();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Delete My Account/i }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Delete My Account/i }));
    fireEvent.click(screen.getByRole('button', { name: /Delete Account/i }));

    await waitFor(() =>
      expect(
        screen.getByText('Re-authenticate to Delete Account'),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(
      screen.queryByText('Re-authenticate to Delete Account'),
    ).not.toBeInTheDocument();
  });
});
