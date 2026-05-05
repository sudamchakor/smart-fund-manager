import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Box, Tabs, Tab, useTheme, alpha } from '@mui/material';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  selectCurrentSurplus,
  selectDebtFreeCountdown,
} from '../store/profileSlice';
import { selectCurrency } from '../store/emiSlice';
import CustomTabPanel from '../components/CustomTabPanel';
import PreviewBanner from '../components/PreviewBanner';
import FloatingStatusIsland from '../components/FloatingStatusIsland';
import SuspenseFallback from '../components/common/SuspenseFallback';

// Feature Tabs
const PersonalProfileTab = lazy(
  () => import('../features/profile/tabs/PersonalProfileTab'),
);
const FutureGoalsTab = lazy(
  () => import('../features/profile/tabs/FutureGoalsTab'),
);
const WealthTab = lazy(() => import('../features/profile/tabs/WealthTab'));
const OnboardingModal = lazy(
  () => import('../features/profile/tabs/OnboardingModal'),
);
const FinancialModal = lazy(
  () => import('../features/profile/components/FinancialModal'),
);

export default function UserProfile() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab Logic
  const getTabIndex = (tabParam) => {
    const map = { goals: 1, wealth: 2 };
    return map[tabParam] || 0;
  };

  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');

  const [tabValue, setTabValue] = useState(() => getTabIndex(tabParam));
  const [goalToEditId, setGoalToEditId] = useState(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  // Profile Status
  const [isProfileCreated, setIsProfileCreated] = useState(
    localStorage.getItem('isProfileCreated') === 'true',
  );

  useEffect(() => {
    setTabValue(getTabIndex(tabParam));
    if (tabParam !== 'goals') setGoalToEditId(null);
  }, [tabParam]);

  const handleTabChange = (event, newValue) => {
    const tabs = ['personal', 'goals', 'wealth'];
    navigate(`/profile?tab=${tabs[newValue]}`);
    setGoalToEditId(null);
  };

  const handleEditGoal = (goalId) => {
    setGoalToEditId(goalId);
    navigate(`/profile?tab=goals`);
  };

  const handleModalOpen = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  // Data Selectors
  const investableSurplus = useSelector(selectCurrentSurplus);
  const debtFreeCountdown = useSelector(selectDebtFreeCountdown);
  const currency = useSelector(selectCurrency);

  return (
    // FIX: Greatly increased 'pb' (padding-bottom) so the user can scroll past the floating footer
    <Box sx={{ width: '100%', pb: { xs: 16, sm: 20 } }}>
      {/* 1. Integrated Action Banner */}
      {!isProfileCreated && (
        <Suspense fallback={<SuspenseFallback />}>
          <PreviewBanner onOpenOnboarding={() => setOnboardingOpen(true)} />
        </Suspense>
      )}

      {/* 2. Command Center Navigation (Tabs) */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: alpha(theme.palette.divider, 0.1),
          bgcolor: alpha(theme.palette.background.paper, 0.5),
          borderRadius: 2,
          mb: 1,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              backgroundColor: 'primary.main',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab label="My Profile" />
          <Tab label="Financial Goals" />
          <Tab label="Wealth Dashboard" />
        </Tabs>
      </Box>

      {/* 3. Tab Content Area */}
      <Box>
        <Suspense fallback={<SuspenseFallback />}>
          <CustomTabPanel value={tabValue} index={0}>
            <PersonalProfileTab
              onEditGoal={handleEditGoal}
              onOpenModal={handleModalOpen}
            />
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={1}>
            <FutureGoalsTab goalToEditId={goalToEditId} />
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={2}>
            <WealthTab />
          </CustomTabPanel>
        </Suspense>
      </Box>

      {/* Modals */}
      <Suspense fallback={<SuspenseFallback />}>
        <OnboardingModal
          open={onboardingOpen}
          onClose={() => {
            setOnboardingOpen(false);
            setIsProfileCreated(
              localStorage.getItem('isProfileCreated') === 'true',
            );
          }}
        />
        <FinancialModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
        />
      </Suspense>

      {/* 4. High-End Floating Status Island */}
      <Suspense fallback={<SuspenseFallback />}>
        <FloatingStatusIsland
          investableSurplus={investableSurplus}
          debtFreeCountdown={debtFreeCountdown}
          currency={currency}
        />
      </Suspense>
    </Box>
  );
}
