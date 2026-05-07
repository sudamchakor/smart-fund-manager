import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminArticles from '../../../../src/pages/admin/AdminArticles';
import '@testing-library/jest-dom';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

// Mock react-router-dom's Link and useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
}));

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../../../../src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock ADMIN_UID
jest.mock('../../../../src/utils/constants', () => ({
  ADMIN_UID: 'admin-uid-123',
}));

// Mock formatDate from utils/formatting
jest.mock('../../../../src/utils/formatting', () => ({
  formatDate: jest.fn((date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  }),
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

describe('AdminArticles Component', () => {
  const mockAdminUser = { uid: 'admin-uid-123', displayName: 'Admin User' };
  const mockNonAdminUser = {
    uid: 'non-admin-uid',
    displayName: 'Regular User',
  };

  const mockArticlesData = [
    {
      id: '1',
      title: 'Article One',
      category: 'Finance',
      authorName: 'Admin User',
      createdAt: { toDate: () => new Date('2023-01-01T12:00:00Z') },
      updatedAt: { toDate: () => new Date('2023-01-02T12:00:00Z') },
    },
    {
      id: '2',
      title: 'Article Two',
      category: 'Technology',
      authorName: 'Admin User',
      createdAt: { toDate: () => new Date('2023-02-01T12:00:00Z') },
      updatedAt: { toDate: () => new Date('2023-02-03T12:00:00Z') },
    },
  ];

  const renderComponent = (authLoading = false, user = mockAdminUser) => {
    mockUseAuth.mockReturnValue({ user, loading: authLoading });
    return render(
      <Router>
        <AdminArticles />
      </Router>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getDocs.mockResolvedValue({
      docs: mockArticlesData.map((article) => ({
        id: article.id,
        data: () => article,
      })),
    });
    deleteDoc.mockResolvedValue();
    jest.spyOn(window, 'confirm').mockReturnValue(true); // Default to confirming deletion
    jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert
  });

  // --- Initial Loading and Error States ---
  it('shows loading spinner when authLoading is true', () => {
    renderComponent(true);
    expect(screen.getByTestId('suspense-message')).toBeInTheDocument();
  });

  it('shows loading spinner when articles are loading', () => {
    getDocs.mockReturnValueOnce(new Promise(() => {})); // Never resolve
    renderComponent();
    expect(screen.getByTestId('suspense-message')).toBeInTheDocument();
  });

  it('displays error message if fetching articles fails', async () => {
    getDocs.mockRejectedValueOnce(new Error('Failed to fetch'));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument(); // Check for Alert component
      expect(screen.getByText('Error loading dashboard data.')).toBeInTheDocument();
    });
  });

  // --- Admin View ---
  it('renders Admin Console header', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Admin Console')).toBeInTheDocument();
    });
  });

  it('renders "Create Article" button as a Link for admin', async () => {
    renderComponent();
    await waitFor(() => {
      const addButton = screen.getByRole('link', { name: /create article/i });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveAttribute('href', '/admin/articles/new');
    });
  });

  it('renders a table with articles for admin', async () => {
    renderComponent();
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(screen.getByText('Article Details')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Created At')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();

      expect(screen.getByText('Article One')).toBeInTheDocument();
      expect(screen.getByText('Finance')).toBeInTheDocument();
      expect(screen.getByText('1/1/2023')).toBeInTheDocument();
    });
  });

  it('navigates to edit page when edit button is clicked', async () => {
    renderComponent();
    await waitFor(() => {
      fireEvent.click(screen.getAllByTestId('EditIcon')[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles/edit/1');
    });
  });

  it('deletes an article when delete button is clicked and confirmed', async () => {
    renderComponent();
    await waitFor(() => {
      fireEvent.click(screen.getAllByTestId('DeleteIcon')[0]);
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this article?',
      );
      expect(deleteDoc).toHaveBeenCalledWith(
        expect.any(Object),
        'articles',
        '1',
      );
      // Re-fetch is triggered, so the article should disappear from the list
      expect(screen.queryByText('Article One')).not.toBeInTheDocument();
    });
  });

  it('does not delete an article if confirmation is cancelled', async () => {
    window.confirm.mockReturnValue(false); // User cancels
    renderComponent();
    await waitFor(() => {
      fireEvent.click(screen.getAllByTestId('DeleteIcon')[0]);
      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(deleteDoc).not.toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
      expect(screen.getByText('Article One')).toBeInTheDocument(); // Article still in list
    });
  });

  it('shows alert if article deletion fails', async () => {
    deleteDoc.mockRejectedValueOnce(new Error('Delete failed'));
    renderComponent();
    await waitFor(() => {
      fireEvent.click(screen.getAllByTestId('DeleteIcon')[0]);
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  it('formats string dates correctly', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: '3',
          data: () => ({
            id: '3',
            title: 'Article Three',
            category: 'Finance',
            authorName: 'Admin User',
            createdAt: '2023-03-01T00:00:00Z',
            updatedAt: '2023-03-02T00:00:00Z',
          }),
        },
      ],
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('3/1/2023')).toBeInTheDocument();
      expect(screen.getByText('3/2/2023')).toBeInTheDocument();
    });
  });

  // --- Non-Admin View ---
  it('redirects to /admin/login if user is null and not loading', async () => {
    renderComponent(false, null);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
    });
  });

  it('does not show "Create Article" button for non-admin users', async () => {
    renderComponent(false, mockNonAdminUser);
    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: /create article/i }),
      ).not.toBeInTheDocument();
    });
  });

  it('does not show "Actions" column for non-admin users', async () => {
    renderComponent(false, mockNonAdminUser);
    await waitFor(() => {
      expect(screen.queryByText('Actions')).not.toBeInTheDocument();
      expect(screen.queryByTestId('EditIcon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('DeleteIcon')).not.toBeInTheDocument();
    });
  });

  // --- Empty State ---
  it('handles empty state gracefully when there are no articles', async () => {
    getDocs.mockResolvedValueOnce({ docs: [] }); // No articles
    renderComponent();
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByText('Article One')).not.toBeInTheDocument();
    });
  });
});
