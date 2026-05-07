import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import SingleArticle from '../../../../src/pages/articles/SingleArticle';
import '@testing-library/jest-dom';
import { doc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// Mock react-router-dom hooks
const mockUseParams = jest.fn();
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
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
  doc: jest.fn(),
  getDoc: jest.fn(),
  deleteDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Mock categoryIcons and ImageIcon
jest.mock('../../../../src/utils/articleCategories', () => ({
  categoryIcons: {
    Finance: () => <svg data-testid="FinanceIcon" />,
    Tech: () => <svg data-testid="TechIcon" />,
  },
}));
jest.mock('@mui/icons-material/Image', () => (props) => (
  <svg data-testid="ImageIcon" {...props} />
));

describe('SingleArticle Component', () => {
  const mockArticleData = {
    id: 'test-article-id',
    title: 'Test Article Title',
    authorId: 'some-user-id',
    category: 'Finance',
    imageUrl: 'http://example.com/image.jpg',
    content: 'This is the first paragraph.\nThis is the second paragraph.',
    date: { toDate: () => new Date('2023-01-15T10:00:00Z') },
    createdAt: { toDate: () => new Date('2023-01-14T09:00:00Z') },
    updatedAt: { toDate: () => new Date('2023-01-16T11:00:00Z') },
    readTime: '7',
  };

  const renderComponent = (
    authLoading = false,
    user = null,
    articleId = 'test-article-id',
  ) => {
    mockUseParams.mockReturnValue({ id: articleId });
    mockUseAuth.mockReturnValue({ 
      user, 
      loading: authLoading, 
      isAdmin: !!user, 
      isAuthenticated: !!user 
    });
    return render(
      <Router>
        <SingleArticle />
      </Router>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    getDoc.mockResolvedValue({
      exists: () => true,
      id: mockArticleData.id,
      data: () => mockArticleData,
    });
    deleteDoc.mockResolvedValue();
    onSnapshot.mockImplementation((...args) => {
      const callback = args.find(arg => typeof arg === 'function');
      if (callback) {
        try { callback({ docs: [] }); } catch (e) {}
      } else if (args[1] && typeof args[1].next === 'function') {
        try { args[1].next({ docs: [] }); } catch (e) {}
      }
      return jest.fn(); // Mock valid unsubscribe function
    });
    jest.spyOn(window, 'confirm').mockReturnValue(true); // Default to confirming deletion
    jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- Initial Loading and Error States ---
  it('shows loading spinner when authLoading is true', () => {
    getDoc.mockReturnValueOnce(new Promise(() => {})); // Never resolve
    renderComponent(true);
    expect(screen.getByTestId('suspense-message')).toBeInTheDocument();
  });

  it('shows loading spinner when article is loading', () => {
    getDoc.mockReturnValueOnce(new Promise(() => {})); // Never resolve
    renderComponent();
    expect(screen.getByTestId('suspense-message')).toBeInTheDocument();
  });

  it('renders empty state if article does not exist', async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false });
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByText('Test Article Title')).not.toBeInTheDocument();
    });
  });

  it('renders empty state if fetching article fails', async () => {
    getDoc.mockRejectedValueOnce(new Error('Fetch error'));
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByText('Test Article Title')).not.toBeInTheDocument();
    });
  });

  // --- Article Content Display ---
  it('renders article title, category, and date', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      expect(screen.getByText('Finance')).toBeInTheDocument();
      expect(screen.getByText('14/1/2023')).toBeInTheDocument();
      expect(screen.getByText(/7/)).toBeInTheDocument();
    });
  });

  it('renders article content paragraphs', async () => {
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText(/This is the first paragraph/i),
      ).toBeInTheDocument();
    });
  });

  // --- Navigation ---
  it('renders "Back to Articles" link pointing to /articles', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByText('Test Article Title')).toBeInTheDocument());
    const backLink = screen.getByRole('link', { name: /Back to Articles/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/articles');
  });
});
