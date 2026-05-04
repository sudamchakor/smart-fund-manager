import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ArticleCard from '../../../components/articles/ArticleCard';
import '@testing-library/jest-dom';

// Mock react-router-dom's Link component
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props} data-testid={`link-to-${to.replace(/\//g, '-')}`}>
      {children}
    </a>
  ),
}));

// Mock DataCard to isolate ArticleCard's rendering
jest.mock('../../../components/common/DataCard', () => ({ children, sx }) => (
  <div data-testid="mock-data-card" style={sx}>
    {children}
  </div>
));

// Mock categoryIcons and ImageIcon
jest.mock('../../../utils/articleCategories', () => ({
  categoryIcons: {
    Finance: () => <svg data-testid="FinanceIcon" />,
    Tech: () => <svg data-testid="TechIcon" />,
  },
}));
jest.mock('@mui/icons-material/Image', () => (props) => <svg data-testid="ImageIcon" {...props} />);

const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('ArticleCard Component', () => {
  const mockArticle = {
    id: '1',
    title: 'The Future of Finance',
    description: 'An in-depth look at upcoming financial trends.',
    excerpt: 'A brief summary of the article content.',
    imageUrl: 'https://example.com/finance.jpg',
    category: 'Finance',
    author: 'Jane Doe',
    createdAt: new Date('2023-01-15T10:00:00Z'),
    updatedAt: new Date('2023-01-16T11:00:00Z'),
  };

  const renderComponent = (articleProps = mockArticle) => {
    return render(
      <ThemeProvider theme={theme}>
        <ArticleCard article={articleProps} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Positive Scenarios ---
  it('renders article details correctly with an image', () => {
    renderComponent();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('The Future of Finance')).toBeInTheDocument();
    expect(screen.getByText('A brief summary of the article content.')).toBeInTheDocument();
    expect(screen.getByText('Created: 1/15/2023')).toBeInTheDocument();
    expect(screen.getByText('Updated: 1/16/2023')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read More' })).toHaveAttribute('href', '/articles/1');
    expect(screen.queryByTestId('ImageIcon')).not.toBeInTheDocument(); // Should use image
    expect(screen.queryByTestId('FinanceIcon')).not.toBeInTheDocument(); // Should use image
  });

  it('renders category icon when no imageUrl is provided', () => {
    const articleWithoutImage = { ...mockArticle, imageUrl: '', category: 'Finance' };
    renderComponent(articleWithoutImage);
    expect(screen.getByTestId('FinanceIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('ImageIcon')).not.toBeInTheDocument(); // Should use category icon
  });

  it('renders fallback ImageIcon when no imageUrl and unknown category', () => {
    const articleWithoutImage = { ...mockArticle, imageUrl: '', category: 'Unknown' };
    renderComponent(articleWithoutImage);
    expect(screen.getByTestId('ImageIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('FinanceIcon')).not.toBeInTheDocument(); // Should use fallback
  });

  it('formats createdAt and updatedAt from Firestore-like Timestamp objects', () => {
    const firestoreTimestampArticle = {
      ...mockArticle,
      createdAt: { toDate: () => new Date('2023-02-01T00:00:00Z') },
      updatedAt: { toDate: () => new Date('2023-02-02T00:00:00Z') },
    };
    renderComponent(firestoreTimestampArticle);
    expect(screen.getByText('Created: 2/1/2023')).toBeInTheDocument();
    expect(screen.getByText('Updated: 2/2/2023')).toBeInTheDocument();
  });

  it('formats createdAt and updatedAt from string dates', () => {
    const stringDateArticle = {
      ...mockArticle,
      createdAt: '2023-03-01T00:00:00Z',
      updatedAt: '2023-03-02T00:00:00Z',
    };
    renderComponent(stringDateArticle);
    expect(screen.getByText('Created: 3/1/2023')).toBeInTheDocument();
    expect(screen.getByText('Updated: 3/2/2023')).toBeInTheDocument();
  });

  // --- Negative Scenarios / Edge Cases ---
  it('renders correctly with minimal article data (only id, title, excerpt)', () => {
    const minimalArticle = {
      id: '2',
      title: 'Minimal Article',
      excerpt: 'Short excerpt.',
      category: 'Tech',
    };
    renderComponent(minimalArticle);
    expect(screen.getByText('Minimal Article')).toBeInTheDocument();
    expect(screen.getByText('Short excerpt.')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByTestId('TechIcon')).toBeInTheDocument(); // No image, so category icon
    expect(screen.queryByText('Created:')).not.toBeInTheDocument(); // No createdAt
    expect(screen.queryByText('Updated:')).not.toBeInTheDocument(); // No updatedAt
  });

  it('handles missing createdAt and updatedAt gracefully', () => {
    const articleWithoutDates = { ...mockArticle, createdAt: undefined, updatedAt: undefined };
    renderComponent(articleWithoutDates);
    expect(screen.queryByText('Created:')).not.toBeInTheDocument();
    expect(screen.queryByText('Updated:')).not.toBeInTheDocument();
  });

  it('handles null createdAt and updatedAt gracefully', () => {
    const articleWithNullDates = { ...mockArticle, createdAt: null, updatedAt: null };
    renderComponent(articleWithNullDates);
    expect(screen.queryByText('Created:')).not.toBeInTheDocument();
    expect(screen.queryByText('Updated:')).not.toBeInTheDocument();
  });

  it('handles invalid date strings for createdAt and updatedAt', () => {
    const articleWithInvalidDates = { ...mockArticle, createdAt: 'invalid-date', updatedAt: 'another-invalid-date' };
    renderComponent(articleWithInvalidDates);
    expect(screen.getByText('Created: Invalid Date')).toBeInTheDocument();
    expect(screen.getByText('Updated: Invalid Date')).toBeInTheDocument();
  });

  it('renders without crashing if article prop is empty (though prop-types should prevent this)', () => {
    const emptyArticle = { id: '3', title: '', excerpt: '' }; // Minimum required to not crash
    renderComponent(emptyArticle);
    expect(screen.getByRole('link', { name: 'Read More' })).toHaveAttribute('href', '/articles/3');
  });
});