import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import 'react-quill/dist/quill.snow.css';
import {
  Box,
  Container,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Fade,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

// Firebase Imports
import { getDataBase } from '../../firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

// Utils / Config
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_UID } from '../../utils/constants';

// New Components
import ArticleEditorHeader from '../../components/admin/ArticleEditorHeader';
import ArticleEditorForm from '../../components/admin/ArticleEditorForm';
import ArticlePreview from '../../components/admin/ArticlePreview';
import ArticleEditorActions from '../../components/admin/ArticleEditorActions';

const WriteArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const quillRef = useRef(null);

  // --- Form State ---
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');

  // --- UI State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // --- WYSIWYG Modules Configuration ---
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ script: 'sub' }, { script: 'super' }],
        [{ color: [] }, { background: [] }],
        [
          { list: 'ordered' },
          { list: 'bullet' },
          { indent: '-1' },
          { indent: '+1' },
        ],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    }),
    [],
  );

  // --- Helpers: Word Count & Stats ---
  const getStats = useCallback(() => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    const readTime = Math.ceil(words / 200);
    return { words, readTime };
  }, [content]);

  const stats = getStats();

  // --- Effect: Authorization Logic ---
  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate('/admin/login');
      else if (user.uid !== ADMIN_UID) {
        setSnackbar({
          open: true,
          message: 'Unauthorized access.',
          severity: 'error',
        });
        navigate('/admin/articles');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, authLoading, navigate]);

  // --- Effect: Load Article (Edit Mode) or Local Draft (New Mode) ---
  useEffect(() => {
    const loadData = async () => {
      if (id && isAuthorized) {
        try {
          const docSnap = await getDoc(doc(getDataBase(), 'articles', id));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || '');
            setCategory(data.category || '');
            setImageUrl(data.imageUrl || '');
            setContent(data.content || '');
          }
        } catch (err) {
          setSnackbar({
            open: true,
            message: 'Failed to load article.',
            severity: 'error',
          });
        }
      } else if (!id && isAuthorized) {
        const savedDraft = localStorage.getItem('sf_article_draft');
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          setTitle(parsed.title || '');
          setCategory(parsed.category || '');
          setImageUrl(parsed.imageUrl || '');
          setContent(parsed.content || '');
        }
      }
    };
    loadData();
  }, [id, isAuthorized]);

  // --- Effect: Auto-save Draft ---
  useEffect(() => {
    if (!id && isAuthorized && (title || content)) {
      const draft = {
        title,
        category,
        imageUrl,
        content,
        timestamp: Date.now(),
      };
      localStorage.setItem('sf_article_draft', JSON.stringify(draft));
    }
  }, [title, category, imageUrl, content, id, isAuthorized]);

  // --- Effect: Block navigation if unsaved ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if ((title || content) && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, content, isSubmitting]);

  // --- Handlers ---
  const handlePublish = async (e, status = 'published') => {
    if (e) e.preventDefault();
    if (!title || !content || !category) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields.',
        severity: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const articleData = {
        title,
        category,
        imageUrl,
        content,
        status,
        updatedAt: serverTimestamp(),
        authorUid: user.uid,
        authorName: user.displayName || user.email,
      };

      if (id) {
        await updateDoc(doc(getDataBase(), 'articles', id), articleData);
      } else {
        await addDoc(collection(getDataBase(), 'articles'), {
          ...articleData,
          createdAt: serverTimestamp(),
        });
        localStorage.removeItem('sf_article_draft');
      }
      navigate('/admin/articles');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Database Error.',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    if (window.confirm('Clear all unsaved progress?')) {
      setTitle('');
      setContent('');
      setImageUrl('');
      setCategory('');
      localStorage.removeItem('sf_article_draft');
    }
  };

  if (authLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  if (!isAuthorized) return null;

  return (
    <Fade in timeout={800}>
      <Box
        sx={
          isFullScreen
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 1300,
                bgcolor: 'background.paper',
                overflowY: 'auto',
                p: { xs: 1, md: 4 },
              }
            : {}
        }
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <ArticleEditorHeader
            id={id}
            stats={stats}
            viewMode={viewMode}
            setViewMode={setViewMode}
            isFullScreen={isFullScreen}
            setIsFullScreen={setIsFullScreen}
          />

          <Paper
            elevation={isFullScreen ? 0 : 3}
            sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}
          >
            {viewMode === 'edit' ? (
              <ArticleEditorForm
                title={title}
                setTitle={setTitle}
                category={category}
                setCategory={setCategory}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                content={content}
                setContent={setContent}
                quillRef={quillRef}
                modules={modules}
                isFullScreen={isFullScreen}
              />
            ) : (
              <ArticlePreview
                title={title}
                category={category}
                imageUrl={imageUrl}
                content={content}
              />
            )}

            <ArticleEditorActions
              id={id}
              isSubmitting={isSubmitting}
              handlePublish={handlePublish}
              clearForm={clearForm}
            />
          </Paper>
        </Container>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default WriteArticle;
