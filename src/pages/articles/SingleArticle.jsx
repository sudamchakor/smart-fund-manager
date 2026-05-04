import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, LinearProgress, Paper } from '@mui/material';

// Firestore
import { doc, getDoc } from 'firebase/firestore';
import { getDataBase } from '../../firebaseConfig';
import SuspenseFallback from '../../components/common/SuspenseFallback';

// New Components
import ArticleHeader from '../../components/articles/ArticleHeader';
import ArticleSpeechPlayer from '../../components/articles/ArticleSpeechPlayer';
import ArticleContentDisplay from '../../components/articles/ArticleContentDisplay';
import CommentsSection from '../../components/articles/CommentsSection';

const SingleArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        const docRef = doc(getDataBase(), 'articles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
        } else {
          navigate('/articles');
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [id, navigate]);

  const toggleSpeech = () => {
    const synth = window.speechSynthesis;
    if (!synth || !article?.content) return;

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

    // If not speaking, start new speech
    synth.cancel(); // Stop any ongoing speech
    const plainText = article.content.replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    setIsSpeaking(true);
    setIsPaused(false);
    synth.speak(utterance);
  };

  if (loading) return <SuspenseFallback />;
  if (!article) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fcfcfc', width: '100%' }}>
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

      <ArticleHeader article={article} />

      <Container
        maxWidth="md"
        sx={{ mt: -4, pb: 10, position: 'relative', zIndex: 2 }}
      >
        <Paper
          elevation={4}
          sx={{ p: { xs: 2, sm: 4, md: 8 }, borderRadius: { xs: 2, md: 6 } }}
        >
          <ArticleSpeechPlayer
            isSpeaking={isSpeaking}
            isPaused={isPaused}
            toggleSpeech={toggleSpeech}
          />

          <ArticleContentDisplay content={article.content} />

          <CommentsSection articleId={id} />
        </Paper>
      </Container>
    </Box>
  );
};

export default SingleArticle;
