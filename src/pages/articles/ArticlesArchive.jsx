import React, { useState, useEffect } from 'react';
import { Box, Container, useTheme } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getDataBase } from '../../firebaseConfig';

import PageHeader from '../../components/common/PageHeader';
import SuspenseFallback from '../../components/common/SuspenseFallback';
import ArticleFilterAndSearch from '../../components/articles/ArticleFilterAndSearch';
import ArticleGridDisplay from '../../components/articles/ArticleGridDisplay';
import ArticlePagination from '../../components/articles/ArticlePagination';

const ArticlesArchive = () => {
  const theme = useTheme();

  // Data States
  const [allArticles, setAllArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Pagination States
  const [page, setPage] = useState(1);
  const articlesPerPage = 6; // Set how many articles per page

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(getDataBase(), 'articles'),
          orderBy('createdAt', 'desc'),
        );
        const querySnapshot = await getDocs(q);

        const fetchedArticles = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((a) => a && a.title);

        setAllArticles(fetchedArticles);
        setFilteredArticles(fetchedArticles);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Filter Logic + Page Reset
  useEffect(() => {
    const result = allArticles.filter((a) => {
      const matchesSearch =
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat =
        selectedCategory === 'All' || a.category === selectedCategory;
      return matchesSearch && matchesCat;
    });

    setFilteredArticles(result);
    setPage(1); // Reset to first page whenever filters change
  }, [searchTerm, selectedCategory, allArticles]);

  // Pagination Logic
  const indexOfLastArticle = page * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(
    indexOfFirstArticle,
    indexOfLastArticle,
  );
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
    // Smooth scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    'All',
    ...new Set(allArticles.map((a) => a.category).filter(Boolean)),
  ];

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: '100vh',
        pb: 10,
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <PageHeader
          title="Knowledge Hub"
          subtitle="Empowering your financial journey with expert insights."
          icon={ArticleIcon}
        />

        <ArticleFilterAndSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        {loading ? (
          <SuspenseFallback message="" />
        ) : (
          <>
            <ArticleGridDisplay
              articles={currentArticles}
              loading={loading}
              filteredArticlesCount={filteredArticles.length}
            />

            <ArticlePagination
              totalPages={totalPages}
              page={page}
              handlePageChange={handlePageChange}
            />
          </>
        )}
      </Container>
    </Box>
  );
};

export default ArticlesArchive;
