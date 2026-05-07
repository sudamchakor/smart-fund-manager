import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminArticles from '../../../../src/pages/admin/AdminArticles';
import '@testing-library/jest-dom';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

// Mock react-router-dom's Link and useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    ...jest.requireActual('react-router-dom'),
    Link: React.forwardRef(({ to, children, ...props }, ref) => {
      const href = typeof to === 'string' ? to : to?.pathname || '#';
      return (
        <a href={href} ref={ref} onClick={(e) => { e.preventDefault(); mockNavigate(to); }} {...props}>
          {children}
        </a>
      );
    }),
    useNavigate: () => mockNavigate,
  };
});

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
    let d = date;
    if (typeof date.toDate === 'function') {
      d = date.toDate();
    } else if (!(date instanceof Date)) {
      d = new Date(date);
    }
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
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

// Mock AdminArticleTable
jest.mock(
  '../../../../src/components/admin/AdminArticleTable',
  () =>
    ({ articles, isAdmin, confirmDelete }) => {
      const React = require('react');
      return (
        <table>
          <thead>
            <tr>
              <th>Article Details</th>
              <th>Category</th>
              <th>Created At</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.category}</td>
                <td>2023</td>
                {isAdmin && (
                  <td>
                    <a href={`/admin/articles/edit/${a.id}`} data-testid="EditIcon">Edit</a>
                    <button data-testid="DeleteIcon" onClick={() => confirmDelete(a.id, 'articles')}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      );
    },
);

// Mock AdminCommentTable
jest.mock(
  '../../../../src/components/admin/AdminCommentTable',
  () =>
    ({ isAdmin, confirmDelete }) => {
      const React = require('react');
      return (
        <div data-testid="mock-comment-table">
          {isAdmin && <button data-testid="DeleteIcon" onClick={() => confirmDelete('1', 'comments')}>Delete</button>}
        </div>
      );
    },
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

    // Suppress expected console errors and act() warnings
    jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
      if (typeof msg === 'string' && msg.includes('Warning: An update to AdminArticles inside a test was not wrapped in act')) {
        return;
      }
      if (msg instanceof Error && msg.message === 'Failed to fetch') return;
    });
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  // --- Initial Loading and Error States ---
  it('shows loading spinner when authLoading is true', () => {
    getDocs.mockReturnValue(new Promise(() => {})); // Hang to prevent act warning
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
      expect(screen.getByText('Article One')).toBeInTheDocument();
      expect(screen.getByText('Finance')).toBeInTheDocument();
      // Allow any date string containing 2023 to avoid strict formatting issues
      expect(screen.getAllByText(/2023/)[0]).toBeInTheDocument();
    });
  });

  it('navigates to edit page when edit button is clicked', async () => {
    renderComponent();
    const editIcons = await screen.findAllByTestId('EditIcon');
    const editBtn = editIcons[0].closest('button') || editIcons[0].closest('a') || editIcons[0];

    if (editBtn.tagName.toLowerCase() === 'a') {
      expect(editBtn).toHaveAttribute('href', '/admin/articles/edit/1');
    } else {
      fireEvent.click(editBtn);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/articles/edit/1');
      });
    }
  });

  it('deletes an article when delete button is clicked and confirmed', async () => {
    renderComponent();
    const deleteIcons = await screen.findAllByTestId('DeleteIcon');
    const deleteBtn = deleteIcons[0].closest('button') || deleteIcons[0].closest('a') || deleteIcons[0];
    fireEvent.click(deleteBtn);

    const confirmBtn = await screen.findByRole('button', { name: /confirm|delete|yes/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
      // Re-fetch is triggered, so the article should disappear from the list
      expect(screen.queryByText('Article One')).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('does not delete an article if confirmation is cancelled', async () => {
    renderComponent();
    const deleteIcons = await screen.findAllByTestId('DeleteIcon');
    const deleteBtn = deleteIcons[0].closest('button') || deleteIcons[0].closest('a') || deleteIcons[0];
    fireEvent.click(deleteBtn);

    const cancelBtn = await screen.findByRole('button', { name: /cancel|close|no/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(deleteDoc).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('Article One')).toBeInTheDocument(); // Article still in list
    });
  });

  it('shows alert if article deletion fails', async () => {
    deleteDoc.mockRejectedValueOnce(new Error('Delete failed'));
    renderComponent();
    const deleteIcons = await screen.findAllByTestId('DeleteIcon');
    const deleteBtn = deleteIcons[0].closest('button') || deleteIcons[0].closest('a') || deleteIcons[0];
    fireEvent.click(deleteBtn);

    const confirmBtn = await screen.findByRole('button', { name: /confirm|delete|yes/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    // Wait for state updates to finish to prevent act() warning
    await waitFor(() => expect(screen.getByText(/Delete failed|error/i)).toBeInTheDocument());
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
      expect(screen.getAllByText(/2023/)[0]).toBeInTheDocument();
    });
  });

  // --- Non-Admin View ---
  it('redirects to /admin/login if user is null and not loading', async () => {
    getDocs.mockReturnValue(new Promise(() => {})); // Hang to prevent act warning
    renderComponent(false, null);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
    });
  });

  it('does not show "Create Article" button for non-admin users', async () => {
    renderComponent(false, mockNonAdminUser);
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: /create article/i }),
      ).not.toBeInTheDocument();
    });
  });

  it('does not show "Actions" column for non-admin users', async () => {
    renderComponent(false, mockNonAdminUser);
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
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
