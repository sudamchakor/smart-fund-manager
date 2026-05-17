import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Chip,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import CalculateIcon from '@mui/icons-material/Calculate';
import { updateGoalPriority } from '../../store/profileSlice';
import { formatCurrency } from '../../utils/formatting';
import { getWellInputStyle } from '../../styles/formStyles';
import ProgressLine from './ProgressLine';

const EditableGoalItem = ({
  goal,
  currency,
  onEdit,
  onDelete,
  onOpenBridgeGapModal,
  isSelected,
  onSelect,
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const handlePriorityChange = (e) => {
    dispatch(updateGoalPriority({ goalId: goal.id, priority: e.target.value }));
  };

  const getPriorityProps = (priority) => {
    switch (priority) {
      case 1:
        return { label: 'High', color: 'error' };
      case 2:
        return { label: 'Medium', color: 'warning' };
      case 3:
        return { label: 'Low', color: 'info' };
      default:
        return { label: 'Medium', color: 'warning' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Fully Funded':
        return 'success';
      case 'Partially Funded':
        return 'warning';
      case 'At Risk':
        return 'error';
      default:
        return 'default';
    }
  };

  const priorityProps = getPriorityProps(goal.priority);

  const selectedStyles = {
    borderColor: theme.palette.primary.main,
    bgcolor: alpha(theme.palette.primary.main, 0.08),
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: theme.spacing(1.5),
        pl: isSelected ? theme.spacing(1) : theme.spacing(1.5),
        mb: theme.spacing(1.5),
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        bgcolor: alpha(theme.palette.background.paper, 0.5),
        borderRadius: theme.shape.borderRadius,
        position: 'relative',
        boxShadow: `0 2px 6px ${alpha(theme.palette.common.black || '#000', 0.01)}`,
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.4),
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.05)}`,
        },
        ...(isSelected && selectedStyles),
      }}
      onClick={() => onSelect(goal.id)}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 1,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                fontSize: '0.9rem',
                color: theme.palette.text.primary,
              }}
            >
              {goal.name}
            </Typography>
            <Chip
              label={priorityProps.label}
              color={priorityProps.color}
              size="small"
              sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: 'primary.main',
              fontWeight: 800,
              display: 'block',
              mb: 0.25,
            }}
          >
            Target: {formatCurrency(goal.targetAmount, currency)}
          </Typography>
          {goal.inflationAdjustedTarget && (
            <Tooltip
              title="Target adjusted for inflation in today's money."
              arrow
              placement="top"
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.7rem',
                }}
              >
                <InfoIcon sx={{ fontSize: '0.75rem' }} />
                Real Value:{' '}
                {formatCurrency(goal.inflationAdjustedTarget, currency)}
              </Typography>
            </Tooltip>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.25 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(goal);
            }}
            color="primary"
            sx={{ p: 0.5 }}
          >
            <EditIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(goal.id);
            }}
            color="error"
            sx={{ p: 0.5 }}
          >
            <DeleteIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
      </Box>

      <ProgressLine
        plans={goal.investmentPlans}
        targetAmount={goal.targetAmount}
        currency={currency}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1.25,
        }}
      >
        <FormControl variant="standard" size="small" sx={{ minWidth: 120 }}>
          <Select
            value={goal.priority || 2}
            onChange={handlePriorityChange}
            displayEmpty
            disableUnderline
            sx={{
              ...getWellInputStyle(theme, priorityProps.color),
              fontSize: '0.7rem',
              py: 0.1,
              color: theme.palette.text.primary,
            }}
          >
            <MenuItem value={1} sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              High Priority
            </MenuItem>
            <MenuItem value={2} sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              Medium Priority
            </MenuItem>
            <MenuItem value={3} sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              Low Priority
            </MenuItem>
          </Select>
        </FormControl>
        <Chip
          label={goal.status}
          color={getStatusColor(goal.status)}
          size="small"
          sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
        />
      </Box>

      {(goal.status === 'Partially Funded' || goal.status === 'At Risk') && (
        <Button
          variant="outlined"
          size="small"
          color="warning"
          startIcon={<CalculateIcon sx={{ fontSize: '0.9rem' }} />}
          onClick={(e) => {
            e.stopPropagation();
            onOpenBridgeGapModal(goal);
          }}
          sx={{
            mt: 1.5,
            width: '100%',
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.75rem',
            py: 0.4,
          }}
        >
          Calculate Required Monthly SIP
        </Button>
      )}
    </Paper>
  );
};

export default EditableGoalItem;
