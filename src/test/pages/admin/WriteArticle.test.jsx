import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import WriteArticle from '../../../../src/pages/admin/WriteArticle';
import '@testing-library/jest-dom';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
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
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

// Mock ReactQuill
jest.mock('react-quill', () => {
  const MockReactQuill = ({ value, onChange, ...props }) => (
    <textarea
      data-testid="react-quill-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
  return MockReactQuill;
});

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

// Mock articleCategories
jest.mock('../../../../src/utils/articleCategories', () => ({
  articleCategories: ['Finance', 'Technology', 'Health'],
}));

// Mock ADMIN_UID
jest.mock('../../../../src/utils/constants', () => ({
  ADMIN_UID: 'admin-uid-123',
}));

describe('WriteArticle Component', () => {
  const mockAdminUser = {
    uid: 'admin-uid-123',
    displayName: 'Admin User',
    email: 'admin@example.com',
  };
  const mockNonAdminUser = {
    uid: 'non-admin-uid',
    displayName: 'Regular User',
  };

  const renderComponent = (
    authLoading = false,
    user = mockAdminUser,
    params = {},
  ) => {
    mockUseAuth.mockReturnValue({ user, loading: authLoading });
    mockUseParams.mockReturnValue(params);
    return render(
      <Router>
        <WriteArticle />
      </Router>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        title: 'Existing Article',
        category: 'Finance',
        imageUrl: 'http://example.com/img.jpg',
        content: '<p>Existing content</p>',
      }),
    });
    addDoc.mockResolvedValue({ id: 'new-article-id' });
    updateDoc.mockResolvedValue();
  });

  // --- Authentication and Authorization ---
  it('shows loading spinner when authLoading is true', () => {
    renderComponent(true);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to /admin/login if user is null and not loading', async () => {
    renderComponent(false, null);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
    });
  });

  it('redirects non-admin users to /admin/articles and shows error snackbar', async () => {
    renderComponent(false, mockNonAdminUser);
    await waitFor(() => {
      expect(
        screen.getByText('You are not authorized to write or edit articles.'),
      ).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });
  });

  it('renders unauthorized message if user is not admin', async () => {
    renderComponent(false, mockNonAdminUser);
    await waitFor(() => {
      expect(
        screen.getByText('You are not authorized to access this page.'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Go to Articles' }),
      ).toBeInTheDocument();
    });
  });

  // --- Create New Article Mode ---
  it('renders "Create Article" header in new article mode', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Create Article')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Draft and format high-quality financial content for the platform.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('allows input for title, category, image URL, and content', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByLabelText('Article Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Featured Image URL')).toBeInTheDocument();
      expect(screen.getByTestId('react-quill-editor')).toBeInTheDocument();
    });
  });

  it('handles input changes for all fields', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText('Article Title')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText('Article Title'), {
      target: { value: 'New Title' },
    });
    fireEvent.mouseDown(screen.getByLabelText('Category'));
    fireEvent.click(screen.getByText('Technology'));
    fireEvent.change(screen.getByLabelText('Featured Image URL'), {
      target: { value: 'http://newimage.com' },
    });
    fireEvent.change(screen.getByTestId('react-quill-editor'), {
      target: { value: '<p>New content</p>' },
    });

    expect(screen.getByLabelText('Article Title')).toHaveValue('New Title');
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByLabelText('Featured Image URL')).toHaveValue(
      'http://newimage.com',
    );
    expect(screen.getByTestId('react-quill-editor')).toHaveValue(
      '<p>New content</p>',
    );
  });

  it('publishes a new article successfully', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText('Article Title')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText('Article Title'), {
      target: { value: 'New Article' },
    });
    fireEvent.mouseDown(screen.getByLabelText('Category'));
    fireEvent.click(screen.getByText('Finance'));
    fireEvent.change(screen.getByTestId('react-quill-editor'), {
      target: { value: '<p>Content</p>' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Publish Now' }));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(expect.any(Object), {
        title: 'New Article',
        category: 'Finance',
        imageUrl: '',
        content: '<p>Content</p>',
        status: 'published',
        updatedAt: 'mock-timestamp',
        authorUid: mockAdminUser.uid,
        authorName: mockAdminUser.displayName,
        createdAt: 'mock-timestamp',
      });
      expect(
        screen.getByText('Article published successfully!'),
      ).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
      expect(screen.getByLabelText('Article Title')).toHaveValue(''); // Form reset
    });
  });

  it('saves a new article as draft', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText('Article Title')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText('Article Title'), {
      target: { value: 'Draft Article' },
    });
    fireEvent.mouseDown(screen.getByLabelText('Category'));
    fireEvent.click(screen.getByText('Finance'));
    fireEvent.change(screen.getByTestId('react-quill-editor'), {
      target: { value: '<p>Draft content</p>' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(expect.any(Object), {
        title: 'Draft Article',
        category: 'Finance',
        imageUrl: '',
        content: '<p>Draft content</p>',
        status: 'draft',
        updatedAt: 'mock-timestamp',
        authorUid: mockAdminUser.uid,
        authorName: mockAdminUser.displayName,
        createdAt: 'mock-timestamp',
      });
      expect(screen.getByText('Draft saved!')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });
  });

  it('shows warning if required fields are missing for publish', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText('Article Title')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Publish Now' }));
    await waitFor(() => {
      expect(
        screen.getByText('Please fill in Title, Category, and Content.'),
      ).toBeInTheDocument();
    });
    expect(addDoc).not.toHaveBeenCalled();
  });

  // --- Edit Article Mode ---
  it('renders "Edit Article" header in edit mode', async () => {
    renderComponent(false, mockAdminUser, { id: 'article-id-123' });
    await waitFor(() => {
      expect(screen.getByText('Edit Article')).toBeInTheDocument();
      expect(
        screen.getByText('Modify and update your existing article.'),
      ).toBeInTheDocument();
    });
  });

  it('loads existing article data for editing', async () => {
    renderComponent(false, mockAdminUser, { id: 'article-id-123' });
    await waitFor(() => {
      expect(screen.getByLabelText('Article Title')).toHaveValue(
        'Existing Article',
      );
      expect(screen.getByText('Finance')).toBeInTheDocument(); // Category
      expect(screen.getByLabelText('Featured Image URL')).toHaveValue(
        'http://example.com/img.jpg',
      );
      expect(screen.getByTestId('react-quill-editor')).toHaveValue(
        '<p>Existing content</p>',
      );
    });
  });

  it('updates an existing article successfully', async () => {
    renderComponent(false, mockAdminUser, { id: 'article-id-123' });
    await waitFor(() =>
      expect(screen.getByLabelText('Article Title')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText('Article Title'), {
      target: { value: 'Updated Title' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update Article' }));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), {
        title: 'Updated Title',
        category: 'Finance',
        imageUrl: 'http://example.com/img.jpg',
        content: '<p>Existing content</p>',
        status: 'published',
        updatedAt: 'mock-timestamp',
        authorUid: mockAdminUser.uid,
        authorName: mockAdminUser.displayName,
      });
      expect(
        screen.getByText('Article updated and published successfully!'),
      ).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });
  });

  it('saves changes to an existing article as draft', async () => {
    renderComponent(false, mockAdminUser, { id: 'article-id-123' });
    await waitFor(() =>
      expect(screen.getByLabelText('Article Title')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText('Article Title'), {
      target: { value: 'Updated Draft Title' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), {
        title: 'Updated Draft Title',
        category: 'Finance',
        imageUrl: 'http://example.com/img.jpg',
        content: '<p>Existing content</p>',
        status: 'draft',
        updatedAt: 'mock-timestamp',
        authorUid: mockAdminUser.uid,
        authorName: mockAdminUser.displayName,
      });
      expect(screen.getByText('Draft updated!')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });
  });

  it('shows error snackbar if fetching article for edit fails', async () => {
    getDoc.mockRejectedValueOnce(new Error('Fetch error'));
    renderComponent(false, mockAdminUser, { id: 'article-id-123' });
    await waitFor(() => {
      expect(
        screen.getByText('Error loading article for editing.'),
      ).toBeInTheDocument();
    });
  });

  it('redirects if article not found for editing', async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false });
    renderComponent(false, mockAdminUser, { id: 'article-id-123' });
    await waitFor(() => {
      expect(screen.getByText('Article not found.')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });
  });

  // --- General Error Handling ---
  it('shows error snackbar if publish/save fails due to Firestore error', async () => {
    addDoc.mockRejectedValueOnce(new Error('Firestore write error'));
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText('Article Title')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText('Article Title'), {
      target: { value: 'New Article' },
    });
    fireEvent.mouseDown(screen.getByLabelText('Category'));
    fireEvent.click(screen.getByText('Finance'));
    fireEvent.change(screen.getByTestId('react-quill-editor'), {
      target: { value: '<p>Content</p>' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Publish Now' }));

    await waitFor(() => {
      expect(
        screen.getByText('Error connecting to database.'),
      ).toBeInTheDocument();
    });
  });

  it('navigates back when Cancel button is clicked', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText('Article Title')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
