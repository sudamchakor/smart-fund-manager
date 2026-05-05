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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';

const AdminArticleTable = ({
  articles,
  page,
  rowsPerPage,
  confirmDelete,
  formatFullDate,
}) => {
  return (
    <Table>
      <TableHead sx={{ bgcolor: '#fcfcfc' }}>
        <TableRow>
          <TableCell sx={{ fontWeight: 800 }}>Article Details</TableCell>
          <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
          <TableCell sx={{ fontWeight: 800 }}>Created At</TableCell>
          <TableCell align="right" sx={{ fontWeight: 800 }}>
            Actions
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {articles
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((art) => (
            <TableRow key={art.id} hover>
              <TableCell>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {art.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  By {art.authorName || 'Admin'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={art.category}
                  size="small"
                  sx={{ fontWeight: 600, bgcolor: '#f0f0f0' }}
                />
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {formatFullDate(art.createdAt)}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Edit Article">
                  <IconButton
                    component={Link}
                    to={`/admin/articles/edit/${art.id}`}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Article">
                  <IconButton
                    onClick={() => confirmDelete(art.id, 'articles')}
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

export default AdminArticleTable;
