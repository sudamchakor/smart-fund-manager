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
jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    Link: React.forwardRef(({ to, children, ...props }, ref) => {
      const href = typeof to === 'string' ? to : to?.pathname || '#';
      return (
        <a href={href} ref={ref} onClick={(e) => { e.preventDefault(); mockNavigate(to); }} {...props}>
          {children}
        </a>
      );
    }),
  };
});

// Mock useAuth hook
jest.mock('../../../../src/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock firebaseConfig to supply necessary auth properties
jest.mock('../../../../src/firebaseConfig', () => ({
  db: {},
  auth: {
    currentUser: {
      uid: 'test-uid',
      email: 'test@example.com',
      providerData: [{ providerId: 'password' }],
    },
  },
  getAuthentication: jest.fn(() => ({
    auth: { 
      currentUser: { 
        uid: 'test-uid', email: 'test@example.com', providerData: [{ providerId: 'password' }] 
      } 
    },
  })),
  getDataBase: jest.fn(() => ({})),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(() => ({ id: 'mock-doc-ref' })),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: 'test-uid',
      email: 'test@example.com',
      providerData: [{ providerId: 'password' }],
    },
  })),
  updateProfile: jest.fn(),
  deleteUser: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn(),
    PROVIDER_ID: 'password',
  },
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
    require('../../../../src/hooks/useAuth').useAuth.mockReturnValue({
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

    // Re-apply mock implementations after jest.clearAllMocks()
    const { doc, getDoc, setDoc, deleteDoc } = require('firebase/firestore');
    const { getAuth, updateProfile, deleteUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } = require('firebase/auth');
    const { getAuthentication } = require('../../../../src/firebaseConfig');

    doc.mockReturnValue({ id: 'mock-doc-ref' });
    const mockAuth = {
      currentUser: {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [{ providerId: 'password' }],
      },
    };
    getAuth.mockReturnValue(mockAuth);
    getAuthentication.mockReturnValue({ auth: mockAuth });

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
      expect(setDoc).toHaveBeenCalledWith(expect.any(Object),
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
        screen.getByText(/error/i),
      ).toBeInTheDocument();
    });
  });

  // --- Change Password Section ---
  it('renders change password fields', async () => {
    renderComponent();
    
    const openBtn = await screen.findByRole('button', { name: /Change Password/i });
    fireEvent.click(openBtn);

    await waitFor(() => {
      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    });
  });

  it('changes password successfully', async () => {
    renderComponent();
    const openBtn = await screen.findByRole('button', { name: /Change Password/i });
    fireEvent.click(openBtn);

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
    
    // Get the submit button inside the modal (usually the last one matching)
    const submitBtns = screen.getAllByRole('button', { name: /Save Changes/i });
    fireEvent.click(submitBtns[submitBtns.length - 1]);

    await waitFor(() => {
      expect(EmailAuthProvider.credential).toHaveBeenCalledWith('test@example.com', 'oldpass');
      expect(reauthenticateWithCredential).toHaveBeenCalledWith(mockUser, 'mock-credential');
      expect(updatePassword).toHaveBeenCalledWith(mockUser, 'newpass123');
      expect(
        screen.getByText('Security updated!'),
      ).toBeInTheDocument();
    });
  });

  it('shows error if password fields are empty', async () => {
    renderComponent();
    const openBtn = await screen.findByRole('button', { name: /Change Password/i });
    fireEvent.click(openBtn);

    await waitFor(() =>
      expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument(),
    );

    const submitBtns = screen.getAllByRole('button', { name: /Save Changes/i });
    fireEvent.click(submitBtns[submitBtns.length - 1]);
    
    await waitFor(() => {
      expect(
        screen.getByText('Current password required.'),
      ).toBeInTheDocument();
    });
  });

  it('shows error if new passwords do not match', async () => {
    renderComponent();
    const openBtn = await screen.findByRole('button', { name: /Change Password/i });
    fireEvent.click(openBtn);

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

    const submitBtns = screen.getAllByRole('button', { name: /Save Changes/i });
    fireEvent.click(submitBtns[submitBtns.length - 1]);
    
    await waitFor(() => {
      expect(
        screen.getByText('Passwords do not match.'),
      ).toBeInTheDocument();
    });
  });

  it('shows error if new password is too short', async () => {
    renderComponent();
    const openBtn = await screen.findByRole('button', { name: /Change Password/i });
    fireEvent.click(openBtn);

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

    const submitBtns = screen.getAllByRole('button', { name: /Save Changes/i });
    fireEvent.click(submitBtns[submitBtns.length - 1]);
    
    await waitFor(() => {
      expect(
        screen.getByText('Password too short.'),
      ).toBeInTheDocument();
    });
  });

  it('handles password change re-authentication error', async () => {
    reauthenticateWithCredential.mockRejectedValueOnce({
      code: 'getAuthentication/wrong-password',
      message: 'Wrong password',
    });
    renderComponent();
    const openBtn = await screen.findByRole('button', { name: /Change Password/i });
    fireEvent.click(openBtn);

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

    const submitBtns = screen.getAllByRole('button', { name: /Save Changes/i });
    fireEvent.click(submitBtns[submitBtns.length - 1]);

    await waitFor(() => {
      expect(
        screen.getByText('Wrong password'),
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
    const openBtn = await screen.findByRole('button', { name: /Change Password/i });
    fireEvent.click(openBtn);

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

    const submitBtns = screen.getAllByRole('button', { name: /Save Changes/i });
    fireEvent.click(submitBtns[submitBtns.length - 1]);

    await waitFor(() => {
      expect(
        screen.getByText('Weak password'),
      ).toBeInTheDocument();
    });
  });

  // --- Delete Account Section ---
  it('opens confirm delete dialog when "Delete" is clicked', async () => {
    renderComponent();
    const openDeleteBtn = await screen.findByRole('button', { name: /Delete/i });
    fireEvent.click(openDeleteBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('deletes profile on confirmation', async () => {
    renderComponent();
    const openDeleteBtn = await screen.findByRole('button', { name: /Delete/i });
    fireEvent.click(openDeleteBtn);

    const confirmBtns = await screen.findAllByRole('button', { name: /(Confirm|Delete)/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
      expect(screen.getByText('Public profile deleted. Account remains active.')).toBeInTheDocument();
    });
  });

  it('opens re-authentication dialog if delete fails due to recent login requirement', async () => {
    deleteUser.mockRejectedValueOnce({
      code: 'getAuthentication/requires-recent-login',
      message: 'Requires recent login',
    });
    renderComponent();
    const openDeleteBtn = await screen.findByRole('button', { name: /Delete/i });
    fireEvent.click(openDeleteBtn);

    const fullRadio = await screen.findByDisplayValue('full');
    fireEvent.click(fullRadio);

    const confirmBtns = await screen.findAllByRole('button', { name: /(Confirm|Delete)/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Password/i),
      ).toBeInTheDocument();
    });
  });

  it('re-authenticates and re-opens delete modal', async () => {
    deleteUser.mockRejectedValueOnce({
      code: 'getAuthentication/requires-recent-login',
      message: 'Requires recent login',
    });
    renderComponent();
    
    const openDeleteBtn = await screen.findByRole('button', { name: /Delete/i });
    fireEvent.click(openDeleteBtn);

    const fullRadio = await screen.findByDisplayValue('full');
    fireEvent.click(fullRadio);

    const confirmBtns = await screen.findAllByRole('button', { name: /(Confirm|Delete)/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);

    const passInput = await screen.findByLabelText(/Password/i);
    fireEvent.change(passInput, {
      target: { value: 'reauthpass' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));

    await waitFor(() => {
      expect(reauthenticateWithCredential).toHaveBeenCalledWith(mockUser, 'mock-credential');
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
    
    const openDeleteBtn = await screen.findByRole('button', { name: /Delete/i });
    fireEvent.click(openDeleteBtn);

    const fullRadio = await screen.findByDisplayValue('full');
    fireEvent.click(fullRadio);

    const confirmBtns = await screen.findAllByRole('button', { name: /(Confirm|Delete)/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);

    const passInput = await screen.findByLabelText(/Password/i);
    fireEvent.change(passInput, {
      target: { value: 'reauthpass' },
    });
    
    const reauthBtn = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(reauthBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Invalid password. Please try again.'),
      ).toBeInTheDocument();
    });
  });

  it('closes re-authentication dialog on cancel', async () => {
    deleteUser.mockRejectedValueOnce({
      code: 'getAuthentication/requires-recent-login',
      message: 'Requires recent login',
    });
    renderComponent();
    
    const openDeleteBtn = await screen.findByRole('button', { name: /Delete/i });
    fireEvent.click(openDeleteBtn);

    const fullRadio = await screen.findByDisplayValue('full');
    fireEvent.click(fullRadio);

    const confirmBtns = await screen.findAllByRole('button', { name: /(Confirm|Delete)/i });
    fireEvent.click(confirmBtns[confirmBtns.length - 1]);

    await waitFor(() => expect(screen.getByLabelText(/Password/i)).toBeInTheDocument());

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByLabelText(/Password/i)).not.toBeInTheDocument();
    });
  });
});
