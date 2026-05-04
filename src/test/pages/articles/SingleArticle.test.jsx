import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import SingleArticle from '../../../../src/pages/articles/SingleArticle';
import '@testing-library/jest-dom';
import {
  doc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';

// Mock react-router-dom hooks
const mockUseParams = jest.fn();
const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
  useNavigate: () => mockUseNavigate,
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../../../../src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

// Mock categoryIcons and ImageIcon
jest.mock('../../../../src/utils/articleCategories', () => ({
  categoryIcons: {
    Finance: () => <svg data-testid="FinanceIcon" />,
    Tech: () => <svg data-testid="TechIcon" />,
  },
}));
jest.mock('@mui/icons-material/Image', () => (props) => <svg data-testid="ImageIcon" {...props} />);

describe('SingleArticle Component', () => {
  const mockArticleData = {
    id: 'test-article-id',
    title: 'Test Article Title',
    category: 'Finance',
    imageUrl: 'http://example.com/image.jpg',
    content: 'This is the first paragraph.\nThis is the second paragraph.',
    date: { toDate: () => new Date('2023-01-15T10:00:00Z') },
    createdAt: { toDate: () => new Date('2023-01-14T09:00:00Z') },
    updatedAt: { toDate: () => new Date('2023-01-16T11:00:00Z') },
    readTime: '7 min',
  };

  const renderComponent = (authLoading = false, user = null, articleId = 'test-article-id') => {
    mockUseParams.mockReturnValue({ id: articleId });
    mockUseAuth.mockReturnValue({ user, loading: authLoading });
    return render(
      <Router>
        <SingleArticle />
      </Router>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getDoc.mockResolvedValue({
      exists: () => true,
      id: mockArticleData.id,
      data: () => mockArticleData,
    });
    deleteDoc.mockResolvedValue();
    jest.spyOn(window, 'confirm').mockReturnValue(true); // Default to confirming deletion
    jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert
  });

  // --- Initial Loading and Error States ---
  it('shows loading spinner when authLoading is true', () => {
    renderComponent(true);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows loading spinner when article is loading', () => {
    getDoc.mockReturnValueOnce(new Promise(() => {})); // Never resolve
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays "Article Not Found" if article does not exist', async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Article Not Found')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to Articles' })).toBeInTheDocument();
    });
  });

  it('displays error message if fetching article fails', async () => {
    getDoc.mockRejectedValueOnce(new Error('Fetch error'));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Article Not Found')).toBeInTheDocument(); // Fallback to not found
    });
  });

  // --- Article Content Display ---
  it('renders article title, category, and date', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      expect(screen.getByText('Finance')).toBeInTheDocument();
      expect(screen.getByText('1/15/2023 • 7 min read')).toBeInTheDocument();
    });
  });

  it('renders created and updated dates', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Created: 1/14/2023')).toBeInTheDocument();
      expect(screen.getByText('Updated: 1/16/2023')).toBeInTheDocument();
    });
  });

  it('renders article content paragraphs', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('This is the first paragraph.')).toBeInTheDocument();
      expect(screen.getByText('This is the second paragraph.')).toBeInTheDocument();
    });
  });

  it('renders image when imageUrl is provided', async () => {
    renderComponent();
    await waitFor(() => {
      const image = screen.getByAltText('Test Article Title');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'http://example.com/image.jpg');
    });
  });

  it('renders category icon when no imageUrl is provided', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: mockArticleData.id,
      data: () => ({ ...mockArticleData, imageUrl: '' }),
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('FinanceIcon')).toBeInTheDocument();
      expect(screen.queryByAltText('Test Article Title')).not.toBeInTheDocument();
    });
  });

  it('renders fallback ImageIcon when no imageUrl and unknown category', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: mockArticleData.id,
      data: () => ({ ...mockArticleData, imageUrl: '', category: 'Unknown' }),
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('ImageIcon')).toBeInTheDocument();
    });
  });

  // --- Navigation ---
  it('navigates back to articles archive when "Back to Articles" button is clicked', async () => {
    renderComponent();
    await waitFor(() => {
      fireEvent.click(screen.getByRole('link', { name: 'Back to Articles' }));
      expect(mockNavigate).toHaveBeenCalledWith('/articles');
    });
  });

  // --- Admin Actions (Edit/Delete) ---
  it('renders Edit and Delete buttons for logged-in users', async () => {
    renderComponent(false, { uid: 'some-user-id' }); // Any logged-in user
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });
  });

  it('does not render Edit and Delete buttons for logged-out users', async () => {
    renderComponent(false, null);
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });
  });

  it('navigates to edit page when Edit button is clicked', async () => {
    renderComponent(false, { uid: 'some-user-id' });
    await waitFor(() => {
      fireEvent.click(screen.getByRole('link', { name: 'Edit' }));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles/edit/test-article-id');
    });
  });

  it('deletes article when Delete button is clicked and confirmed', async () => {
    renderComponent(false, { uid: 'some-user-id' });
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this article? This action cannot be undone.');
      expect(deleteDoc).toHaveBeenCalledWith(expect.any(Object), 'articles', 'test-article-id');
      expect(window.alert).toHaveBeenCalledWith('Article deleted successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/articles');
    });
  });

  it('does not delete article if confirmation is cancelled', async () => {
    window.confirm.mockReturnValue(false); // User cancels
    renderComponent(false, { uid: 'some-user-id' });
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(deleteDoc).not.toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('shows alert if article deletion fails', async () => {
    deleteDoc.mockRejectedValueOnce(new Error('Delete failed'));
    renderComponent(false, { uid: 'some-user-id' });
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      expect(window.alert).toHaveBeenCalledWith('Failed to delete article.');
    });
  });
});