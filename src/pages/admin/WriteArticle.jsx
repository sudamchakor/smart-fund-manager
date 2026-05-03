import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Container,
  Paper,
  Snackbar,
  Alert,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ArticleIcon from '@mui/icons-material/Article';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';

// Firebase Imports
import { db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

// Centralized category imports
import { articleCategories } from '../../utils/articleCategories';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_UID } from '../../utils/constants'; // Import ADMIN_UID

const WriteArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed loadingArticle state, as Suspense handles initial component loading
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Not authenticated
        navigate('/admin/login');
      } else if (user.uid !== ADMIN_UID) {
        // Authenticated but not admin
        setSnackbar({
          open: true,
          message: 'You are not authorized to write or edit articles.',
          severity: 'error',
        });
        navigate('/admin/articles'); // Redirect non-admin users
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchArticle = async () => {
      if (id) {
        try {
          // Removed setLoadingArticle(true);
          const docRef = doc(db, 'articles', id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || '');
            setCategory(data.category || '');
            setImageUrl(data.imageUrl || '');
            setContent(data.content || '');
          } else {
            console.log('No such document!');
            setSnackbar({
              open: true,
              message: 'Article not found.',
              severity: 'error',
            });
            navigate('/admin/articles');
          }
        } catch (error) {
          console.error('Error fetching article for edit:', error);
          setSnackbar({
            open: true,
            message: 'Error loading article for editing.',
            severity: 'error',
          });
        } finally {
          // Removed setLoadingArticle(false);
        }
      }
    };

    // Only fetch if authenticated and is admin
    if (!authLoading && user && user.uid === ADMIN_UID) {
      fetchArticle();
    }
    // No need for an else if to setLoadingArticle(false) as it's removed
  }, [id, navigate, user, authLoading]);

  const handlePublish = async (e, status = 'published') => {
    if (e) e.preventDefault();

    if (!user || user.uid !== ADMIN_UID) {
      setSnackbar({
        open: true,
        message: 'You are not authorized to perform this action.',
        severity: 'error',
      });
      return;
    }

    if (!title || !content || !category) {
      setSnackbar({
        open: true,
        message: 'Please fill in Title, Category, and Content.',
        severity: 'warning',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Embed author information directly into the article
      const authorUid = user.uid;
      const authorName = user.displayName || user.email; // Use displayName or fallback to email

      const articleData = {
        title,
        category,
        imageUrl,
        content,
        status,
        updatedAt: serverTimestamp(),
        authorUid, // Store author UID
        authorName, // Store author Name
      };

      if (id) {
        // Update existing article
        const docRef = doc(db, 'articles', id);
        await updateDoc(docRef, articleData);
        setSnackbar({
          open: true,
          message:
            status === 'published'
              ? 'Article updated and published successfully!'
              : 'Draft updated!',
          severity: 'success',
        });
      } else {
        // Add new article
        const articlesRef = collection(db, 'articles');
        await addDoc(articlesRef, {
          ...articleData,
          createdAt: serverTimestamp(),
        });
        setSnackbar({
          open: true,
          message:
            status === 'published'
              ? 'Article published successfully!'
              : 'Draft saved!',
          severity: 'success',
        });

        // Reset form on success for new article creation
        setTitle('');
        setCategory('');
        setImageUrl('');
        setContent('');
      }
      navigate('/admin/articles'); // Redirect to admin articles list after save/publish
    } catch (error) {
      console.error('Firestore Error:', error);
      setSnackbar({
        open: true,
        message: 'Error connecting to database.',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) { // Only wait for auth to load, initial component loading handled by Suspense
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // If user is not admin, display unauthorized message
  if (!user || user.uid !== ADMIN_UID) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          You are not authorized to access this page.
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/admin/articles')}>
          Go to Articles
        </Button>
      </Container>
    );
    }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title={id ? 'Edit Article' : 'Create Article'}
        subtitle={
          id
            ? 'Modify and update your existing article.'
            : 'Draft and format high-quality financial content for the platform.'
        }
        icon={ArticleIcon}
      />

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 3, borderRadius: 2 }}>
        <form onSubmit={(e) => handlePublish(e, 'published')}>
          <Stack spacing={3}>
            <Box display="grid" gridTemplateColumns={{ md: '2fr 1fr' }} gap={2}>
              <TextField
                label="Article Title"
                variant="outlined"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Maximizing Tax Savings in 2026"
              />
              <TextField
                select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {articleCategories.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              label="Featured Image URL"
              variant="outlined"
              fullWidth
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              helperText="Paste a URL for the header image"
            />

            <Divider />

            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}
              >
                Article Content
              </Typography>
              <Box
                sx={{
                  '.ql-container': {
                    minHeight: '350px',
                    fontSize: '16px',
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  },
                  '.ql-toolbar': {
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    background: '#f8f9fa',
                  },
                }}
              >
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  placeholder="Start writing..."
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={() => handlePublish(null, 'draft')}
                disabled={isSubmitting}
              >
                {id ? 'Save Changes' : 'Save Draft'}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CloudUploadIcon />
                  )
                }
                disabled={isSubmitting}
                sx={{ px: 4 }}
              >
                {isSubmitting
                  ? id
                    ? 'Updating...'
                    : 'Publishing...'
                  : id
                  ? 'Update Article'
                  : 'Publish Now'}{' '}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WriteArticle;
