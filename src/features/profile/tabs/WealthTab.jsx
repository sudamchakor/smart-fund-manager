import React, { useRef, useEffect } from 'react';
import { Box, Stack } from '@mui/material';
import { useSelector } from 'react-redux';

// Redux Selectors
import {
  selectProfileExpenses,
  selectTotalMonthlyGoalContributions,
  selectCurrentSurplus,
} from '../../../store/profileSlice';
import { selectCalculatedValues } from '../../emiCalculator/utils/emiCalculator';

// Feature Components
import CashFlowDonutChart from '../components/CashFlowDonutChart';
import WealthProjectionEngine from '../components/WealthProjectionEngine';
// Removed: import DebtAccelerator from '../components/DebtAccelerator';
import CorrectionEngine from '../components/CorrectionEngine';
import AutoBalancer from '../components/AutoBalancer';
import AssetAllocationChart from '../components/AssetAllocationChart';

export default function WealthTab() {
  const expenses = useSelector(selectProfileExpenses) || [];
  const { emi: monthlyEmi } = useSelector(selectCalculatedValues);
  const totalMonthlyGoalContributions = useSelector(
    selectTotalMonthlyGoalContributions,
  );
  const investableSurplus = useSelector(selectCurrentSurplus);

  // Cash Flow Breakdown Logic
  const needsValue = expenses
    .filter((e) => e.category === 'basic')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const wantsValue = expenses
    .filter((e) => e.category === 'discretionary')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const donutData = [
    { name: 'Needs', value: needsValue },
    { name: 'Wants', value: wantsValue },
    { name: 'Loan EMIs', value: monthlyEmi || 0 },
    { name: 'Future Wealth (Goals)', value: totalMonthlyGoalContributions },
    { name: 'Surplus', value: investableSurplus > 0 ? investableSurplus : 0 },
  ].filter((item) => item.value > 0);

  // Component Refs for Export/Printing
  const engineRef = useRef(null);
  // Removed: const acceleratorRef = useRef(null);
  const allocationChartRef = useRef(null);

  useEffect(() => {
    window.__wealthEngineRef = engineRef;
    // Removed: window.__debtAcceleratorRef = acceleratorRef;
    window.__allocationChartRef = allocationChartRef;

    return () => {
      window.__wealthEngineRef = null;
      // Removed: window.__debtAcceleratorRef = null;
      window.__allocationChartRef = null;
    };
  }, []);

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Stack completely ignores null components, eliminating dead space */}
      <Stack spacing={2.5}>
        {/* 1. Background Logic Engines */}
        <CorrectionEngine />
        <AutoBalancer />

        {/* 2. Core Projections */}
        <WealthProjectionEngine ref={engineRef} />
        <AssetAllocationChart ref={allocationChartRef} />

        {/* 3. Current State Analysis */}
        <Box sx={{ height: '100%', minHeight: 350 }}>
          <CashFlowDonutChart donutData={donutData} />
        </Box>

        {/* 4. Actionable Optimization Tools */}
        {/* Removed: <DebtAccelerator ref={acceleratorRef} /> */}
      </Stack>
    </Box>
  );
}