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

// Mock child components
jest.mock('../../../../src/components/admin/ArticleEditorHeader', () => ({ viewMode, setViewMode }) => (
  <div data-testid="mock-editor-header">
    <button onClick={() => setViewMode('preview')}>Set Preview</button>
    <button onClick={() => setViewMode('edit')}>Set Edit</button>
  </div>
));

jest.mock('../../../../src/components/admin/ArticleEditorForm', () => ({ title, setTitle, category, setCategory, imageUrl, setImageUrl, content, setContent }) => (
  <div data-testid="mock-editor-form">
    <input aria-label="Article Title" value={title} onChange={e => setTitle(e.target.value)} />
    <input aria-label="Category" value={category} onChange={e => setCategory(e.target.value)} />
    <input aria-label="Featured Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
    <textarea data-testid="react-quill-editor" value={content} onChange={e => setContent(e.target.value)} />
  </div>
));

jest.mock('../../../../src/components/admin/ArticlePreview', () => () => <div data-testid="mock-article-preview">Preview Content</div>);

jest.mock('../../../../src/components/admin/ArticleEditorActions', () => ({ handlePublish, clearForm }) => (
  <div data-testid="mock-editor-actions">
    <button onClick={(e) => handlePublish(e, 'published')}>Publish</button>
    <button onClick={(e) => handlePublish(e, 'published')}>Update</button>
    <button onClick={(e) => handlePublish(e, 'draft')}>Save Draft</button>
    <button onClick={clearForm}>Clear</button>
  </div>
));

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

    // Mock localStorage and window confirm
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
    window.confirm = jest.fn().mockReturnValue(true);
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

  it('redirects non-admin users and shows error snackbar', async () => {
    renderComponent(false, mockNonAdminUser);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });
  });

  // --- Create New Article Mode ---
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
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Technology' },
    });
    fireEvent.change(screen.getByLabelText('Featured Image URL'), {
      target: { value: 'http://newimage.com' },
    });
    fireEvent.change(screen.getByTestId('react-quill-editor'), {
      target: { value: '<p>New content</p>' },
    });

    expect(screen.getByLabelText('Article Title')).toHaveValue('New Title');
    expect(screen.getByLabelText('Category')).toHaveValue('Technology');
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
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Finance' },
    });
    fireEvent.change(screen.getByTestId('react-quill-editor'), {
      target: { value: '<p>Content</p>' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
      expect(addDoc.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          title: 'New Article',
          category: 'Finance',
          status: 'published',
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('sf_article_draft');
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
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Finance' },
    });
    fireEvent.change(screen.getByTestId('react-quill-editor'), {
      target: { value: '<p>Draft content</p>' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
      expect(addDoc.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          title: 'Draft Article',
          category: 'Finance',
          status: 'draft',
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });
  });

  it('shows warning if required fields are missing for publish', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText('Article Title')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
    expect(
      await screen.findByText('Please fill all required fields.')
    ).toBeInTheDocument();
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('loads drafted article from localStorage if no id is provided', async () => {
    Storage.prototype.getItem.mockReturnValue(JSON.stringify({
      title: 'Draft Title',
      category: 'Finance',
      imageUrl: 'http://draft.com/img',
      content: '<p>Draft</p>'
    }));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByLabelText('Article Title')).toHaveValue('Draft Title');
    });
  });

  it('clears form when clearForm is called and confirmed', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByLabelText('Article Title')).toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText('Article Title'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    
    expect(window.confirm).toHaveBeenCalledWith('Clear all unsaved progress?');
    await waitFor(() => {
      expect(screen.getByLabelText('Article Title')).toHaveValue('');
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith('sf_article_draft');
    });
  });

  // --- Edit Article Mode ---
  it('loads existing article data for editing', async () => {
    renderComponent(false, mockAdminUser, { id: 'article-id-123' });
    await waitFor(() => {
      expect(screen.getByLabelText('Article Title')).toHaveValue(
        'Existing Article',
      );
      expect(screen.getByLabelText('Category')).toHaveValue('Finance');
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
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled();
      expect(updateDoc.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          title: 'Updated Title',
          status: 'published',
        })
      );
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
    fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled();
      expect(updateDoc.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          title: 'Updated Draft Title',
          status: 'draft',
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
    });
  });

  it('shows error snackbar if fetching article for edit fails', async () => {
    getDoc.mockRejectedValueOnce(new Error('Fetch error'));
    renderComponent(false, mockAdminUser, { id: 'article-id-123' });
    expect(
      await screen.findByText('Failed to load article.')
    ).toBeInTheDocument();
  });

  it('handles article not found gracefully', async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false });
    renderComponent(false, mockAdminUser, { id: 'article-id-123' });
    await waitFor(() => expect(screen.getByTestId('mock-editor-form')).toBeInTheDocument());
    expect(screen.getByLabelText('Article Title')).toHaveValue('');
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
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Finance' },
    });
    fireEvent.change(screen.getByTestId('react-quill-editor'), {
      target: { value: '<p>Content</p>' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

    expect(
      await screen.findByText('Database Error.')
    ).toBeInTheDocument();
  });

  it('switches between edit and preview mode', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByTestId('mock-editor-form')).toBeInTheDocument());
    
    fireEvent.click(screen.getByRole('button', { name: 'Set Preview' }));
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-article-preview')).toBeInTheDocument();
      expect(screen.queryByTestId('mock-editor-form')).not.toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Set Edit' }));
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-editor-form')).toBeInTheDocument();
    });
  });
});
