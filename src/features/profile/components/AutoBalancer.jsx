import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  Slider,
} from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  selectCurrentSurplus,
  selectProfileExpenses,
  selectStepUpPercentage,
  updateExpense,
  setStepUpPercentage,
} from '../../../store/profileSlice';
import { selectCurrency } from '../../../store/emiSlice';
import { formatCurrency } from '../../../utils/formatting';

const AutoBalancer = () => {
  const dispatch = useDispatch();
  const surplus = useSelector(selectCurrentSurplus);
  const expenses = useSelector(selectProfileExpenses);
  const currentStepUp = useSelector(selectStepUpPercentage);
  const currency = useSelector(selectCurrency);

  const [maxReductionPercent, setMaxReductionPercent] = useState(20);
  const [hasSucceeded, setHasSucceeded] = useState(false);

  const simulation = useMemo(() => {
    if (surplus >= 0) return null;

    const deficit = Math.abs(surplus);
    const basicExpenses = expenses.filter(e => e.category === 'basic');
    const totalBasic = basicExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (totalBasic === 0) {
        return {
            achievable: false,
            message: "You have a deficit but no 'Basic Needs' expenses were found to reduce. Please adjust other expense categories or increase your income.",
            deficit,
            requiredReduction: 0,
            newStepUp: currentStepUp,
            basicExpenses: [],
            totalBasic: 0,
        };
    }

    const maxAllowedReduction = totalBasic * (maxReductionPercent / 100);

    let newStepUp = currentStepUp;
    let requiredReduction = 0;
    let achievable = false;
    let message = "";

    if (maxAllowedReduction >= deficit) {
      requiredReduction = deficit;
      achievable = true;
      const reductionPercentNeeded = ((requiredReduction / totalBasic) * 100).toFixed(1);
      
      message = `We can achieve a positive surplus by reducing your Basic Needs by ${reductionPercentNeeded}% (${formatCurrency(requiredReduction, currency)}).`;

      if (currentStepUp < 0.10) {
          newStepUp = 0.10;
          message += ` We also suggest increasing your Step-up % to 10% to aggressively grow your investments.`;
      }
    } else {
      requiredReduction = maxAllowedReduction;
      achievable = false;
      message = `Even with a maximum ${maxReductionPercent}% reduction in Basic Needs, you still have a deficit of ${formatCurrency(deficit - requiredReduction, currency)}. You need to increase income or reduce goals/discretionary spending.`;
    }

    return {
      deficit,
      requiredReduction,
      achievable,
      message,
      newStepUp,
      basicExpenses,
      totalBasic,
    };
  }, [surplus, expenses, currentStepUp, maxReductionPercent, currency]);

  const applySimulation = () => {
    if (!simulation || !simulation.achievable) return;
    
    const { totalBasic, basicExpenses, requiredReduction, newStepUp } = simulation;

    if (totalBasic > 0) {
        basicExpenses.forEach(exp => {
            const proportion = exp.amount / totalBasic;
            const reductionForThisExp = requiredReduction * proportion;
            
            dispatch(updateExpense({
                ...exp,
                amount: Math.max(0, Math.round(exp.amount - reductionForThisExp))
            }));
        });
    }

    if (newStepUp !== currentStepUp) {
        dispatch(setStepUpPercentage(newStepUp));
    }
    
    setHasSucceeded(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => setHasSucceeded(false), 5000);
  };

  if (surplus >= 0 && !hasSucceeded) {
    return null;
  }

  return (
    <Card sx={{ mt: 3, mb: 4, bgcolor: '#f3e5f5', border: '1px solid #ce93d8' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BuildCircleIcon sx={{ color: 'secondary.main', mr: 1 }} />
          <Typography variant="h6" color="secondary.main">
            Auto-Balancer
          </Typography>
        </Box>

        {hasSucceeded ? (
             <Box sx={{ textAlign: 'center', py: 2 }}>
                 <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
                 <Typography variant="h5" color="success.main" gutterBottom>
                     Success Roadmap
                 </Typography>
                 <Typography variant="body1">
                     Your budget has been successfully balanced! Your Basic Needs were reduced and your Step-up percentage was optimized.
                 </Typography>
             </Box>
        ) : (
            <>
                <Typography variant="body2" paragraph>
                Use this tool to find a path to a positive surplus by allowing the system to suggest reductions to your <strong>Basic Needs</strong>.
                </Typography>

                <Box sx={{ px: 2, mb: 3 }}>
                    <Typography gutterBottom variant="subtitle2">
                        Maximum acceptable reduction to Basic Needs: {maxReductionPercent}%
                    </Typography>
                    <Slider
                        value={maxReductionPercent}
                        min={5}
                        max={50}
                        step={5}
                        onChange={(e, val) => setMaxReductionPercent(val)}
                        valueLabelDisplay="auto"
                        color="secondary"
                    />
                </Box>

                {simulation && (
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="body1" paragraph>
                            {simulation.message}
                        </Typography>

                        {simulation.achievable ? (
                             <Button 
                                variant="contained" 
                                color="secondary" 
                                onClick={applySimulation}
                                fullWidth
                            >
                                Apply Auto-Balance
                            </Button>
                        ) : (
                             <Alert severity="error">
                                {simulation.totalBasic === 0 
                                    ? "Cannot proceed without 'Basic Needs' expenses to adjust."
                                    : "Auto-balance could not be achieved with the current reduction limit."
                                }
                             </Alert>
                        )}
                    </Box>
                )}
            </>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoBalancer;