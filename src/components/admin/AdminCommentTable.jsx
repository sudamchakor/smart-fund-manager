import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Link as MuiLink,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';

const AdminCommentTable = ({
  comments,
  page,
  rowsPerPage,
  handleApproveComment,
  confirmDelete,
  formatFullDate,
}) => {
  return (
    <Table>
      <TableHead sx={{ bgcolor: '#fcfcfc' }}>
        <TableRow>
          <TableCell sx={{ fontWeight: 800 }}>Comment & User</TableCell>
          <TableCell sx={{ fontWeight: 800 }}>Posted On (Article)</TableCell>
          <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
          <TableCell align="right" sx={{ fontWeight: 800 }}>
            Actions
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {comments
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((com) => (
            <TableRow
              key={com.id}
              hover
              sx={{
                bgcolor: !com.isApproved ? '#fffdf0' : 'inherit',
              }}
            >
              <TableCell>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {com.userName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#444', mb: 0.5 }}>
                  {com.text}
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  {formatFullDate(com.createdAt)}
                </Typography>
              </TableCell>
              <TableCell>
                <MuiLink
                  component={Link}
                  to={`/articles/${com.articleId}`}
                  target="_blank"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#FF9800',
                    textDecoration: 'none',
                  }}
                >
                  {com.articleTitle}{' '}
                  <OpenInNewIcon sx={{ ml: 0.5, fontSize: '0.9rem' }} />
                </MuiLink>
              </TableCell>
              <TableCell>
                {com.isApproved ? (
                  <Chip
                    label="Approved"
                    color="success"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                ) : (
                  <Chip
                    label="Pending"
                    sx={{
                      bgcolor: '#FF9800',
                      color: '#fff',
                      fontWeight: 700,
                    }}
                    size="small"
                  />
                )}
              </TableCell>
              <TableCell align="right">
                {!com.isApproved && (
                  <Tooltip title="Approve Comment">
                    <IconButton
                      onClick={() => handleApproveComment(com.id)}
                      sx={{ color: '#2e7d32' }}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Delete Comment">
                  <IconButton
                    onClick={() => confirmDelete(com.id, 'comments')}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default AdminCommentTable;
