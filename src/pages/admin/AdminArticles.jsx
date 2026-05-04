import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  TableContainer,
  Paper,
  TablePagination,
  Fade,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';

// Firestore
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { getDataBase } from '../../firebaseConfig';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_UID } from '../../utils/constants';
import SuspenseFallback from '../../components/common/SuspenseFallback';
import ConfirmationModal from '../../components/common/ConfirmationModal';

// New Components
import AdminHeader from '../../components/admin/AdminHeader';
import AdminArticleTable from '../../components/admin/AdminArticleTable';
import AdminCommentTable from '../../components/admin/AdminCommentTable';

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const { user, loading: authLoading } = useAuth();

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('articles');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const isAdmin = user && user.uid === ADMIN_UID;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Articles
      const artSnap = await getDocs(
        query(
          collection(getDataBase(), 'articles'),
          orderBy('createdAt', 'desc'),
        ),
      );
      const artData = artSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setArticles(artData);

      // 2. Fetch Comments (Sorted: Unapproved/Pending First, then Newest)
      const comSnap = await getDocs(
        query(
          collection(getDataBase(), 'comments'),
          orderBy('isApproved', 'asc'),
          orderBy('createdAt', 'desc'),
        ),
      );
      const comData = comSnap.docs.map((d) => {
        const data = d.data();
        // Find the related article title for context
        const relatedArt = artData.find((a) => a.id === data.articleId);
        return {
          id: d.id,
          ...data,
          articleTitle: relatedArt?.title || 'Unknown Article',
        };
      });
      setComments(comData);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: 'Error loading dashboard data.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveComment = async (commentId) => {
    try {
      await updateDoc(doc(getDataBase(), 'comments', commentId), {
        isApproved: true,
      });
      setComments(
        comments.map((c) =>
          c.id === commentId ? { ...c, isApproved: true } : c,
        ),
      );
      setSnackbar({
        open: true,
        message: 'Comment approved and published!',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Approval failed.',
        severity: 'error',
      });
    }
  };

  const confirmDelete = (id, type) => {
    setItemToDelete(id);
    setDeleteType(type);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDoc(doc(getDataBase(), deleteType, itemToDelete));
      if (deleteType === 'articles') {
        setArticles(articles.filter((a) => a.id !== itemToDelete));
      } else {
        setComments(comments.filter((c) => c.id !== itemToDelete));
      }
      setSnackbar({
        open: true,
        message: 'Item deleted permanently.',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({ open: true, message: 'Delete failed.', severity: 'error' });
    } finally {
      setIsModalOpen(false);
    }
  };

  // Helper for Date + Time formatting
  const formatFullDate = (ts) => {
    if (!ts) return 'N/A';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) return <SuspenseFallback />;

  return (
    <Fade in={!loading} timeout={800}>
      <Box>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <AdminHeader isAdmin={isAdmin} tabValue={tabValue} />

          <Tabs
            value={tabValue}
            onChange={(e, v) => {
              setTabValue(v);
              setPage(0);
            }}
            sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 700 } }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label={`Articles (${articles.length})`} />
            <Tab
              label={`Comments (${comments.filter((c) => !c.isApproved).length} Pending)`}
            />
          </Tabs>

          <Paper
            elevation={0}
            sx={{
              border: '1px solid #eee',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              {tabValue === 0 ? (
                <AdminArticleTable
                  articles={articles}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  confirmDelete={confirmDelete}
                  formatFullDate={formatFullDate}
                />
              ) : (
                <AdminCommentTable
                  comments={comments}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  handleApproveComment={handleApproveComment}
                  confirmDelete={confirmDelete}
                  formatFullDate={formatFullDate}
                />
              )}
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={tabValue === 0 ? articles.length : comments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        </Container>

        <ConfirmationModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title={`Confirm Permanent Deletion`}
          description={`Are you sure you want to delete this ${deleteType === 'articles' ? 'article' : 'comment'}? This cannot be undone.`}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default AdminArticles;
