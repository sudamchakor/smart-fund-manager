import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CardActions,
  useTheme,
} from '@mui/material';
import { Link } from 'react-router-dom';
import CategoryIconDisplay from './CategoryIconDisplay';

const ArticleCard = ({ article }) => {
  const theme = useTheme(); // Access the global theme

  if (!article) return null;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
          borderColor: theme.palette.primary.light,
        },
      }}
    >
      <CategoryIconDisplay article={article} />

      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
        <Typography
          variant="overline"
          sx={{
            color: theme.palette.info.main,
            fontWeight: 800,
            letterSpacing: 1.2,
          }} // Using a generic color here, as palette is internal to CategoryIconDisplay
        >
          {article.category || 'Resources'}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mt: 0.5,
            mb: 1.5,
            lineHeight: 1.3,
            color: theme.palette.text.primary,
          }}
        >
          {article.title || 'Insightful Reading'}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxDirection: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.excerpt ||
            'Explore this detailed guide on optimizing your financial strategy.'}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          component={Link}
          to={`/articles/${article.id}`}
          fullWidth
          variant="outlined"
          color="primary"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { bgcolor: theme.palette.primary.main, color: '#fff' },
          }}
        >
          Read Full Article
        </Button>
      </CardActions>
    </Card>
  );
};

export default ArticleCard;
