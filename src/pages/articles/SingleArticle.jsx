import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Chip,
  Stack,
  Divider,
  Button,
  useTheme,
  // CircularProgress, // Removed CircularProgress import
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Firestore Imports
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Centralized category imports
import { categoryIcons } from '../../utils/articleCategories';
import { useAuth } from '../../hooks/useAuth'; // Import useAuth
import SuspenseFallback from '../../components/common/SuspenseFallback'; // Import SuspenseFallback

const SingleArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth(); // Get user from useAuth, authLoading is handled higher up

  // States
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true); // Keep internal loading for data fetching

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Handle Firestore Timestamp conversion if 'date' is a Timestamp object
          const formattedDate = data.date?.toDate
            ? data.date.toDate().toLocaleDateString()
            : data.date;

          setArticle({
            id: docSnap.id,
            ...data,
            date: formattedDate,
          });
        } else {
          console.log('No such document!');
          setArticle(null); // Explicitly set to null if not found
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setArticle(null); // Set to null on error to show "Article Not Found"
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'articles', id));
        alert('Article deleted successfully!');
        navigate('/articles'); // Redirect to articles archive after deletion
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Failed to delete article.');
      }
    }
  };

  // Helper to format Firestore Timestamps
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) { // Only use internal loading for article data fetching
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <SuspenseFallback message="" /> {/* Use SuspenseFallback without message */}
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" color="error" align="center">
          Article Not Found
        </Typography>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            component={Link}
            to="/articles"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Back to Articles
          </Button>
        </Box>
      </Container>
    );
  }

  const IconComponent = categoryIcons[article.category] || ImageIcon;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          component={Link}
          to="/articles"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to Articles
        </Button>
        {user && ( // Conditionally render edit/delete buttons if user is logged in
          <Stack direction="row" spacing={1}>
            <Button
              component={Link}
              to={`/admin/articles/edit/${article.id}`}
              startIcon={<EditIcon />}
              variant="contained"
              color="primary"
            >
              Edit
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              variant="outlined"
              color="error"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Stack>
        )}
      </Box>

      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700 }}
      >
        {article.title}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Chip label={article.category} color="primary" size="small" />
        <Typography variant="body2" color="text.secondary">
          {article.date} • {article.readTime || '5 min'} read
        </Typography>
      </Stack>

      {/* Display Created At and Updated At */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Created: {formatDate(article.createdAt)}
        </Typography>
        {article.updatedAt && (
          <Typography variant="caption" color="text.secondary">
            Updated: {formatDate(article.updatedAt)}
          </Typography>
        )}
      </Stack>


      {article.imageUrl ? (
        <Box
          component="img"
          src={article.imageUrl}
          alt={article.title}
          sx={{
            width: '100%',
            maxHeight: 400,
            objectFit: 'cover',
            borderRadius: 2,
            mb: 3,
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.grey[200],
            color: theme.palette.grey[600],
            borderRadius: 2,
            mb: 3,
          }}
        >
          <IconComponent sx={{ fontSize: 120 }} />
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      <Typography variant="body1" component="div" sx={{ lineHeight: 1.7 }}>
        {article.content?.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </Typography>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          component={Link}
          to="/articles"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to Articles
        </Button>
      </Box>
    </Container>
  );
};

export default SingleArticle;
