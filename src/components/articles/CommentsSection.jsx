import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { getDataBase } from '../../firebaseConfig';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

const CommentsSection = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5); // Show 5 comments initially
  const [guestName, setGuestName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const formRef = useRef(null);

  useEffect(() => {
    if (!articleId) return;

    const q = query(
      collection(getDataBase(), 'comments'),
      where('articleId', '==', articleId),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetched);
    });

    return () => unsubscribe();
  }, [articleId]);

  // Logic to separate root comments from replies
  const rootComments = comments.filter((c) => !c.parentId);

  // Slice the root comments based on visibleCount
  const visibleRootComments = rootComments.slice(0, visibleCount);

  const getReplies = (parentId) =>
    comments
      .filter((c) => c.parentId === parentId)
      .sort(
        (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0),
      );

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  return (
    <Box sx={{ mt: 6 }} ref={formRef}>
      <Divider sx={{ mb: 4 }} />
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Community Discussion ({comments.length})
      </Typography>

      <CommentForm
        guestName={guestName}
        setGuestName={setGuestName}
        newComment={newComment}
        setNewComment={setNewComment}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        // ... (Pass other props as per your CommentForm needs)
      />

      <Box sx={{ mt: 3 }}>
        {visibleRootComments.length > 0 ? (
          <>
            {visibleRootComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                getReplies={getReplies}
                onReplyClick={(id, user) => {
                  setReplyTo({ id, userName: user });
                  formRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            ))}

            {/* LOAD MORE BUTTON */}
            {rootComments.length > visibleCount && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  sx={{ borderRadius: 20, textTransform: 'none', px: 4 }}
                >
                  Load More Comments
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', mt: 4 }}
          >
            No comments yet.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CommentsSection;
