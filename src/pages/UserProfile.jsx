import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, Typography, Alert, Link } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  selectCurrentSurplus, // Import new selector
  selectDebtFreeCountdown, // Import new selector
} from "../store/profileSlice";
import { selectCurrency } from "../store/emiSlice"; // Only need currency now
import PersonalProfileTab from "../features/profile/tabs/PersonalProfileTab";
import FutureGoalsTab from "../features/profile/tabs/FutureGoalsTab";
import Settings from "../features/profile/tabs/Settings";
import OnboardingModal from "../features/profile/tabs/OnboardingModal";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserProfile() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const getTabIndex = (tabParam) => {
    if (tabParam === "goals") return 1;
    if (tabParam === "settings") return 2;
    return 0; // Default is personal
  };

  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab");

  const [tabValue, setTabValue] = useState(() => getTabIndex(tabParam));
  const [goalToEditId, setGoalToEditId] = useState(null); // New state for goal editing
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [isProfileCreated, setIsProfileCreated] = useState(localStorage.getItem("isProfileCreated") === "true");

  useEffect(() => {
    setTabValue(getTabIndex(tabParam));
    // If we switch to goals tab, clear goalToEditId if it's not explicitly set by a click
    if (tabParam !== "goals") {
      setGoalToEditId(null);
    }
  }, [tabParam]);

  const handleTabChange = (event, newValue) => {
    let newTabName = "personal";
    if (newValue === 1) newTabName = "goals";
    if (newValue === 2) newTabName = "settings";
    navigate(`/profile?tab=${newTabName}`);
    setGoalToEditId(null); // Clear goalToEditId when changing tabs
  };

  const handleEditGoal = (goalId) => {
    setGoalToEditId(goalId);
    navigate(`/profile?tab=goals`); // Switch to Future Goals tab
  };

  const handleOnboardingClose = () => {
    setOnboardingOpen(false);
    setIsProfileCreated(localStorage.getItem("isProfileCreated") === "true");
  };

  // Use new selectors for surplus and debt-free countdown
  const investableSurplus = useSelector(selectCurrentSurplus);
  const debtFreeCountdown = useSelector(selectDebtFreeCountdown);
  const currency = useSelector(selectCurrency);

  const formatCurrency = (val) =>
    `${currency}${Number(val).toLocaleString("en-IN")}`;

  return (
    <Box sx={{ width: "100%", pb: 8 }}>
      {!isProfileCreated && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your profile is not created. Please{" "}
          <Link component="button" variant="inherit" onClick={() => setOnboardingOpen(true)} sx={{ fontWeight: 'bold', verticalAlign: 'baseline' }}>
            create profile
          </Link>
          .
        </Alert>
      )}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          width: "100%", // Ensure the Box takes full width
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          variant="scrollable" // Make tabs scrollable on smaller screens
          scrollButtons="auto" // Show scroll buttons automatically
          allowScrollButtonsMobile // Allow scroll buttons on mobile
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "primary.main", // Ensure indicator color matches theme
            },
            "& .MuiTab-root": {
              color: "text.secondary", // Default tab text color
              "&.Mui-selected": {
                color: "primary.main", // Selected tab text color
              },
            },
          }}
        >
          <Tab label="Personal Profile" />
          <Tab label="Future Goals" />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {/* Tab 1: Personal Profile */}
      <CustomTabPanel value={tabValue} index={0}>
        <PersonalProfileTab onEditGoal={handleEditGoal} /> {/* Pass the handler */}
      </CustomTabPanel>

      {/* Tab 2: Future Goals */}
      <CustomTabPanel value={tabValue} index={1}>
        <FutureGoalsTab goalToEditId={goalToEditId} /> {/* Pass goalToEditId */}
      </CustomTabPanel>

      {/* Tab 3: Settings */}
      <CustomTabPanel value={tabValue} index={2}>
        <Settings />
      </CustomTabPanel>

      <OnboardingModal open={onboardingOpen} onClose={handleOnboardingClose} />

      {/* Persistent Impact Banner */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: investableSurplus < 0 ? "#b71c1c" : "primary.main",
          color: "white",
          p: 2,
          display: "flex",
          flexDirection: { xs: 'column', sm: 'row' }, // Stack vertically on extra small, row on small and up
          justifyContent: "space-around",
          alignItems: { xs: 'flex-start', sm: 'center' }, // Align items for stacked layout
          gap: { xs: 1, sm: 0 }, // Add gap when stacked
          zIndex: 1000,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
          Current Surplus:{" "}
          <strong>
            {formatCurrency(investableSurplus.toFixed(0))} / month
          </strong>
        </Typography>
        <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
          Debt-Free Countdown: <strong>{debtFreeCountdown}</strong>
        </Typography>
      </Box>
    </Box>
  );
}
