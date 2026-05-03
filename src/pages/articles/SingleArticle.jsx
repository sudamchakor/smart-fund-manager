import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Stack,
  useTheme,
  IconButton,
  Paper,
  LinearProgress,
  useMediaQuery,
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Firestore
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../hooks/useAuth';
import SuspenseFallback from '../../components/common/SuspenseFallback';

const SingleArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useAuth();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((window.pageYOffset / totalHeight) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setArticle({ id: docSnap.id, ...docSnap.data() });
        else navigate('/articles');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
    return () => window.speechSynthesis.cancel();
  }, [id, navigate]);

  const toggleSpeech = () => {
    const synth = window.speechSynthesis;
    if (isSpeaking && !isPaused) {
      synth.pause();
      setIsPaused(true);
      return;
    }
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      return;
    }
    const plainText = article.content.replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    setIsSpeaking(true);
    synth.speak(utterance);
  };

  if (loading) return <SuspenseFallback />;
  if (!article) return null;

  const heroImage =
    article.imageUrl ||
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#fcfcfc',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      {/* 1. STICKY PROGRESS BAR */}
      <LinearProgress
        variant="determinate"
        value={scrollProgress}
        sx={{
          position: 'fixed',
          top: { xs: '56px', sm: '64px' },
          left: 0,
          right: 0,
          zIndex: 10000,
          height: 5,
          bgcolor: 'rgba(0,0,0,0.05)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #FF9800 0%, #FF5722 100%)',
          },
        }}
      />

      {/* 2. HERO SECTION - Fixed width and text wrapping */}
      <Box
        sx={{
          width: '100%',
          minHeight: { xs: '60vh', md: '60vh' },
          position: 'relative',
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.9)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: isMobile ? 'scroll' : 'fixed',
          display: 'flex',
          alignItems: 'flex-end',
          pt: { xs: 12, md: 0 }, // Extra space for top navbar on mobile
        }}
      >
        <Container maxWidth="md" sx={{ pb: { xs: 8, md: 12 } }}>
          <Stack spacing={2}>
            <Box>
              <Button
                startIcon={<ArrowBackIcon />}
                component={Link}
                to="/articles"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  mb: 1,
                  p: 0,
                  textTransform: 'none',
                }}
              >
                Back to Articles
              </Button>
            </Box>
            <Chip
              label={article.category}
              sx={{
                bgcolor: '#FF9800',
                color: '#fff',
                fontWeight: 800,
                width: 'fit-content',
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                color: '#fff',
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2,
                textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {article.title}
            </Typography>
            <Stack
              direction="row"
              spacing={3}
              sx={{ color: 'rgba(255,255,255,0.9)' }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon fontSize="small" />
                <Typography variant="subtitle2">
                  {article.readTime || '5'} min read
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="subtitle2">
                  {article.createdAt?.toDate().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* 3. RESPONSIVE CONTENT AREA */}
      <Container
        maxWidth="md"
        sx={{
          mt: -4,
          pb: 10,
          position: 'relative',
          zIndex: 2,
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, sm: 4, md: 8 },
            borderRadius: { xs: 2, md: 6 },
            overflow: 'hidden',
          }}
        >
          {/* TTS Player Box */}
          <Paper
            variant="outlined"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              p: 2,
              mb: 4,
              borderRadius: 4,
              bgcolor: '#f8fdfc',
              gap: 2,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                color: '#004d40',
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              {isSpeaking ? '🔊 AI is reading...' : 'Listen to this article'}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              width={{ xs: '100%', sm: 'auto' }}
              justifyContent="center"
            >
              <Button
                fullWidth={isMobile}
                variant="contained"
                onClick={toggleSpeech}
                startIcon={
                  isSpeaking && !isPaused ? (
                    <PauseRoundedIcon />
                  ) : (
                    <PlayArrowRoundedIcon />
                  )
                }
                sx={{ borderRadius: 3, bgcolor: '#004d40', px: 4 }}
              >
                {isSpeaking && !isPaused ? 'Pause' : 'Play'}
              </Button>
              {isSpeaking && (
                <IconButton
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }}
                  color="error"
                >
                  <StopRoundedIcon />
                </IconButton>
              )}
            </Stack>
          </Paper>

          {/* Article Body */}
          <Box
            sx={{
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              '& p': {
                fontSize: { xs: '1.05rem', md: '1.25rem' },
                lineHeight: 1.8,
                mb: 3,
                color: '#2d3436',
              },
              '& h1, & h2, & h3': {
                mt: 4,
                mb: 2,
                fontWeight: 800,
                lineHeight: 1.3,
                color: '#111',
              },
              '& h1': { fontSize: { xs: '1.8rem', md: '2.5rem' } },
              '& h2': { fontSize: { xs: '1.5rem', md: '2.2rem' } },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 2,
                my: 2,
              },
              '& table': {
                display: 'block',
                width: '100%',
                overflowX: 'auto',
                borderCollapse: 'collapse',
                my: 4,
              },
              '& blockquote': {
                borderLeft: '6px solid #FF9800',
                pl: { xs: 2, md: 4 },
                py: 1,
                my: 4,
                bgcolor: '#fff9f2',
                borderRadius: '0 8px 8px 0',
                fontStyle: 'italic',
                '& p': { mb: 0, fontSize: { xs: '1.1rem', md: '1.3rem' } },
              },
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SingleArticle;
