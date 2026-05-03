import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Container,
  InputAdornment,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import { Link } from 'react-router-dom';

// Firestore Imports
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

import ArticleCard from '../../components/articles/ArticleCard';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import SuspenseFallback from '../../components/common/SuspenseFallback'; // Import SuspenseFallback

const ArticlesArchive = () => {
  const { isAuthenticated } = useAuth();

  // States
  const [allArticles, setAllArticles] = useState([]); // Master list from DB
  const [filteredArticles, setFilteredArticles] = useState([]); // Displayed list
  const [loading, setLoading] = useState(true); // Reintroduced loading state for data fetching
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // 1. Fetch data from Firestore on mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        const articlesCollection = collection(db, 'articles');
        // We order by timestamp so newest articles appear first
        const q = query(articlesCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const fetchedArticles = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAllArticles(fetchedArticles);
        setFilteredArticles(fetchedArticles);
      } catch (error) {
        console.error('Error fetching articles: ', error);
        // Optionally, you could set an error state here to display an error message
      } finally {
        setLoading(false); // Set loading to false after fetching (success or error)
      }
    };

    fetchArticles();
  }, []);

  // 2. Handle Filtering (Client-side)
  useEffect(() => {
    let result = allArticles;

    if (searchTerm) {
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(
        (article) => article.category === selectedCategory,
      );
    }

    setFilteredArticles(result);
  }, [searchTerm, selectedCategory, allArticles]);

  // Derived categories list from all articles
  const categories = [
    'All',
    ...new Set(allArticles.map((article) => article.category)),
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Finance Articles"
        subtitle="Stay informed with our latest insights and guides."
        icon={ArticleIcon}
      />

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
        }}
      >
        <TextField
          label="Search Articles"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Category"
          variant="outlined"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
        {isAuthenticated && (
          <Button
            component={Link}
            to="/admin/write-article"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ flexShrink: 0, mt: { xs: 2, sm: 0 } }}
          >
            Add Article
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <SuspenseFallback message="" /> {/* Show SuspenseFallback without message */}
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <ArticleCard article={article} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="h6" color="text.secondary" align="center">
                No articles found matching your criteria.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default ArticlesArchive;
