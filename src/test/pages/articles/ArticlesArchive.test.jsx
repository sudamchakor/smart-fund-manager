import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ArticlesArchive from '../../../../src/pages/articles/ArticlesArchive';
import '@testing-library/jest-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Mock react-router-dom's Link
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ to, children, ...props }) => (
    <a href={to} onClick={(e) => { e.preventDefault(); mockNavigate(to); }} {...props}>
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
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
}));

// Mock child components
jest.mock(
  '../../../../src/components/articles/ArticleCard',
  () =>
    ({ article }) => (
      <div data-testid={`article-card-${article.id}`}>{article.title}</div>
    ),
);
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

describe('ArticlesArchive Component', () => {
  const mockArticlesData = [
    {
      id: '1',
      title: 'The Future of Finance',
      excerpt: 'Summary 1',
      category: 'Finance',
      createdAt: { toDate: () => new Date('2023-01-15') },
    },
    {
      id: '2',
      title: 'AI in Investing',
      excerpt: 'Summary 2',
      category: 'Technology',
      createdAt: { toDate: () => new Date('2023-01-10') },
    },
    {
      id: '3',
      title: 'Tax Saving Strategies',
      excerpt: 'Summary 3',
      category: 'Finance',
      createdAt: { toDate: () => new Date('2023-01-20') },
    },
  ];

  const renderComponent = (isAuthenticated = false) => {
    mockUseAuth.mockReturnValue({ isAuthenticated });
    return render(
      <Router>
        <ArticlesArchive />
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
    collection.mockReturnValue('articles-collection-ref');
    query.mockImplementation((colRef, ...args) => ({ colRef, args }));
    orderBy.mockImplementation((field, direction) => ({ field, direction }));
  });

  // --- Initial Loading and Error States ---
  it('shows loading spinner initially', () => {
    getDocs.mockReturnValueOnce(new Promise(() => {})); // Never resolve
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('hides loading spinner and displays articles after fetching', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('The Future of Finance')).toBeInTheDocument();
      expect(screen.getByText('AI in Investing')).toBeInTheDocument();
    });
  });

  it('displays error message if fetching articles fails', async () => {
    getDocs.mockRejectedValueOnce(new Error('Failed to fetch'));
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText('No articles found matching your criteria.'),
      ).toBeInTheDocument();
    });
  });

  // --- PageHeader ---
  it('renders PageHeader with correct title, subtitle, and icon', () => {
    renderComponent();
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
    expect(screen.getByText('Finance Articles')).toBeInTheDocument();
    expect(
      screen.getByText('Stay informed with our latest insights and guides.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-header-icon')).toBeInTheDocument(); // ArticleIcon
  });

  // --- Search and Filter ---
  it('filters articles by search term', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText('The Future of Finance')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText('Search Articles'), {
      target: { value: 'future' },
    });
    expect(screen.getByText('The Future of Finance')).toBeInTheDocument();
    expect(screen.queryByText('AI in Investing')).not.toBeInTheDocument();
  });

  it('filters articles by category', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText('The Future of Finance')).toBeInTheDocument(),
    );

    fireEvent.mouseDown(screen.getByLabelText('Category'));
    fireEvent.click(screen.getByText('Technology'));

    expect(screen.getByText('AI in Investing')).toBeInTheDocument();
    expect(screen.queryByText('The Future of Finance')).not.toBeInTheDocument();
    expect(screen.queryByText('Tax Saving Strategies')).not.toBeInTheDocument();
  });

  it('filters articles by search term and category combined', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText('The Future of Finance')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText('Search Articles'), {
      target: { value: 'tax' },
    });
    fireEvent.mouseDown(screen.getByLabelText('Category'));
    fireEvent.click(screen.getByText('Finance'));

    expect(screen.getByText('Tax Saving Strategies')).toBeInTheDocument();
    expect(screen.queryByText('The Future of Finance')).not.toBeInTheDocument();
    expect(screen.queryByText('AI in Investing')).not.toBeInTheDocument();
  });

  it('resets filters when "All" category is selected', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText('The Future of Finance')).toBeInTheDocument(),
    );

    fireEvent.mouseDown(screen.getByLabelText('Category'));
    fireEvent.click(screen.getByText('Technology'));
    expect(screen.queryByText('The Future of Finance')).not.toBeInTheDocument();

    fireEvent.mouseDown(screen.getByLabelText('Category'));
    fireEvent.click(screen.getByText('All'));
    expect(screen.getByText('The Future of Finance')).toBeInTheDocument();
    expect(screen.getByText('AI in Investing')).toBeInTheDocument();
    expect(screen.getByText('Tax Saving Strategies')).toBeInTheDocument();
  });

  it('displays "No articles found" message when filters yield no results', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText('The Future of Finance')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText('Search Articles'), {
      target: { value: 'nonexistent' },
    });
    expect(
      screen.getByText('No articles found matching your criteria.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('The Future of Finance')).not.toBeInTheDocument();
  });

  // --- Add Article Button ---
  it('renders "Add Article" button if user is authenticated', async () => {
    renderComponent(true); // isAuthenticated = true
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Add Article' }),
      ).toBeInTheDocument();
    });
  });

  it('does not render "Add Article" button if user is not authenticated', async () => {
    renderComponent(false); // isAuthenticated = false
    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: 'Add Article' }),
      ).not.toBeInTheDocument();
    });
  });

  it('navigates to /admin/write-article when "Add Article" button is clicked', async () => {
    renderComponent(true);
    await waitFor(() => {
      fireEvent.click(screen.getByRole('link', { name: 'Add Article' }));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/write-article');
    });
  });

  // --- Edge Cases ---
  it('handles empty allArticles array gracefully', async () => {
    getDocs.mockResolvedValueOnce({ docs: [] });
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText('No articles found matching your criteria.'),
      ).toBeInTheDocument();
    });
  });

  it('ensures categories list is unique and includes "All"', async () => {
    renderComponent();
    await waitFor(() => {
      fireEvent.mouseDown(screen.getByLabelText('Category'));
      const options = screen.getAllByRole('option');
      expect(options.map((opt) => opt.textContent)).toEqual([
        'All',
        'Finance',
        'Technology',
      ]);
    });
  });
});
