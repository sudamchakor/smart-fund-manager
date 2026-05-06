import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AdminHeader from '../../../components/layout/AdminHeader';
import '@testing-library/jest-dom';
import useMediaQuery from '@mui/material/useMediaQuery';

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Material-UI useMediaQuery
jest.mock('@mui/material/useMediaQuery');

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('AdminHeader Component', () => {
  const renderComponent = (
    initialPath = '/admin/articles',
    isMobile = false,
    authState = { user: null, logout: jest.fn() },
  ) => {
    mockUseLocation.mockReturnValue({ pathname: initialPath });
    useMediaQuery.mockReturnValue(isMobile);
    mockUseAuth.mockReturnValue(authState);

    return render(
      <ThemeProvider theme={theme}>
        <Router>
          <AdminHeader />
        </Router>
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Desktop View Tests ---
  describe('Desktop View', () => {
    it('renders admin dashboard title and navigation buttons when authenticated', () => {
      renderComponent('/admin/articles', false, {
        user: { uid: '123', displayName: 'Admin User' },
        logout: jest.fn(),
      });
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Manage Articles' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Create Article' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'My Author Profile' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Go to App' }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Admin User/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Logout' }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Open drawer' })).not.toBeInTheDocument(); // Mobile menu icon
    });

    it('navigates to /admin/articles when Admin Dashboard title is clicked', () => {
      renderComponent('/admin/profile', false, {
        user: { uid: '123' },
        logout: jest.fn(),
      });
      fireEvent.click(screen.getByText('Admin Dashboard'));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });

    it('navigates to /admin/articles when "Manage Articles" button is clicked', () => {
      renderComponent('/admin/profile', false, {
        user: { uid: '123' },
        logout: jest.fn(),
      });
      fireEvent.click(screen.getByRole('button', { name: 'Manage Articles' }));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });

    it('navigates to /admin/articles/new when "Create Article" button is clicked', () => {
      renderComponent('/admin/articles', false, {
        user: { uid: '123' },
        logout: jest.fn(),
      });
      fireEvent.click(screen.getByRole('button', { name: 'Create Article' }));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles/new');
    });

    it('navigates to /admin/profile when "My Author Profile" button is clicked', () => {
      renderComponent('/admin/articles', false, {
        user: { uid: '123' },
        logout: jest.fn(),
      });
      fireEvent.click(
        screen.getByRole('button', { name: 'My Author Profile' }),
      );
      expect(mockNavigate).toHaveBeenCalledWith('/admin/profile');
    });

    it('navigates to / when "Go to App" button is clicked', () => {
      renderComponent('/admin/articles', false, {
        user: { uid: '123' },
        logout: jest.fn(),
      });
      fireEvent.click(screen.getByRole('button', { name: 'Go to App' }));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('calls logout and navigates to / when "Logout" button is clicked', () => {
      const mockLogout = jest.fn();
      renderComponent('/admin/articles', false, {
        user: { uid: '123' },
        logout: mockLogout,
      });
      fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/login'); // Should navigate to login
    });

    it('displays user email if displayName is not available', () => {
      renderComponent('/admin/articles', false, {
        user: { uid: '123', email: 'admin@example.com' },
        logout: jest.fn(),
      });
      expect(
        screen.getByText(/admin@example\.com/i),
      ).toBeInTheDocument();
    });

    it('does not render welcome message or logout button if user is null', () => {
      renderComponent('/admin/articles', false, {
        user: null,
        logout: jest.fn(),
      });
      expect(screen.queryByText(/Welcome,/i)).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Logout' }),
      ).not.toBeInTheDocument();
    });
  });

  // --- Mobile View Tests ---
  describe('Mobile View', () => {
    it('renders mobile menu icon and admin dashboard title, hides desktop nav', () => {
      renderComponent('/admin/articles', true, {
        user: { uid: '123' },
        logout: jest.fn(),
      }); // isMobile = true
      expect(screen.getByRole('button', { name: 'Open drawer' })).toBeInTheDocument();
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Manage Articles' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Create Article' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'My Author Profile' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Go to App' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/Welcome,/i)).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Logout' }),
      ).not.toBeInTheDocument();
    });

    it('opens and closes the Drawer when menu icon is clicked', () => {
      renderComponent('/admin/articles', true, {
        user: { uid: '123' },
        logout: jest.fn(),
      });
      const menuButton = screen.getByRole('button', { name: 'Open drawer' });
      fireEvent.click(menuButton);
      // We expect the drawer to be open. Material UI drawers might have different roles based on implementation.
      // Usually looking for a unique item in the drawer is safer.
      expect(screen.getAllByText('Admin Dashboard')[1]).toBeInTheDocument(); // Drawer header
      
      // Closing is tricky to test generically with MUI Drawer, usually involves clicking backdrop or a close button if present.
    });

    it('navigates to /admin/articles from drawer when "Manage Articles" is clicked', () => {
      renderComponent('/admin/profile', true, {
        user: { uid: '123' },
        logout: jest.fn(),
      });
      fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
      fireEvent.click(screen.getByRole('button', { name: 'Manage Articles' }));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });

    it('navigates to /admin/articles/new when "Create Article" is clicked', () => {
      renderComponent('/admin/articles', true, {
        user: { uid: '123' },
        logout: jest.fn(),
      });
      fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
      fireEvent.click(screen.getByRole('button', { name: 'Create Article' }));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles/new');
    });

    it('navigates to /admin/profile from drawer when "Author Profile" is clicked', () => {
      renderComponent('/admin/articles', true, {
        user: { uid: '123' },
        logout: jest.fn(),
      });
      fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
      fireEvent.click(screen.getByRole('button', { name: 'My Author Profile' })); // Should be My Author Profile based on component
      expect(mockNavigate).toHaveBeenCalledWith('/admin/profile');
    });

    it('navigates to / from drawer when "Go to App" is clicked', () => {
      renderComponent('/admin/articles', true, {
        user: { uid: '123' },
        logout: jest.fn(),
      });
      fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
      fireEvent.click(screen.getByRole('button', { name: 'Go to App' }));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('calls logout and navigates to /admin/login from drawer when "Logout" is clicked', () => {
      const mockLogout = jest.fn();
      renderComponent('/admin/articles', true, {
        user: { uid: '123' },
        logout: mockLogout,
      });
      fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
      fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
    });

    it('does not render logout button in drawer if user is null', () => {
      renderComponent('/admin/articles', true, {
        user: null,
        logout: jest.fn(),
      });
      fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
      expect(
        screen.queryByRole('button', { name: 'Logout' }),
      ).not.toBeInTheDocument();
    });
  });
});