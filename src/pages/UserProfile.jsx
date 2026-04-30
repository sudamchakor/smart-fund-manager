import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Alert,
  Link,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  selectCurrentSurplus,
  selectDebtFreeCountdown,
} from "../store/profileSlice";
import { selectCurrency } from "../store/emiSlice";
import PersonalProfileTab from "../features/profile/tabs/PersonalProfileTab";
import FutureGoalsTab from "../features/profile/tabs/FutureGoalsTab";
import WealthTab from "../features/profile/tabs/WealthTab";
import OnboardingModal from "../features/profile/tabs/OnboardingModal";
import FinancialModal from "../features/profile/components/FinancialModal";

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
      {value === index && <Box sx={{ p: { xs: 1, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export default function UserProfile() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const getTabIndex = (tabParam) => {
    if (tabParam === "goals") return 1;
    if (tabParam === "wealth") return 2;
    return 0;
  };

  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab");

  const [tabValue, setTabValue] = useState(() => getTabIndex(tabParam));
  const [goalToEditId, setGoalToEditId] = useState(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [isProfileCreated, setIsProfileCreated] = useState(
    localStorage.getItem("isProfileCreated") === "true",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");

  useEffect(() => {
    setTabValue(getTabIndex(tabParam));
    if (tabParam !== "goals") {
      setGoalToEditId(null);
    }
  }, [tabParam]);

  const handleTabChange = (event, newValue) => {
    let newTabName = "personal";
    if (newValue === 1) newTabName = "goals";
    if (newValue === 2) newTabName = "wealth";
    navigate(`/profile?tab=${newTabName}`);
    setGoalToEditId(null);
  };

  const handleEditGoal = (goalId) => {
    setGoalToEditId(goalId);
    navigate(`/profile?tab=goals`);
  };

  const handleOnboardingClose = () => {
    setOnboardingOpen(false);
    setIsProfileCreated(localStorage.getItem("isProfileCreated") === "true");
  };

  const handleModalOpen = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalType("");
  };

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
          <Link
            component="button"
            variant="inherit"
            onClick={() => setOnboardingOpen(true)}
            sx={{ fontWeight: "bold", verticalAlign: "baseline" }}
          >
            create profile
          </Link>
          .
        </Alert>
      )}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          width: "100%",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "primary.main",
            },
            "& .MuiTab-root": {
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main",
              },
            },
          }}
        >
          <Tab label="Profile" />
          <Tab label="Goals" />
          <Tab label="Wealth" />
        </Tabs>
      </Box>

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

      <OnboardingModal open={onboardingOpen} onClose={handleOnboardingClose} />
      <FinancialModal
        open={modalOpen}
        onClose={handleModalClose}
        type={modalType}
      />

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
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-around",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 0 },
          zIndex: 1000,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontSize: { xs: "0.9rem", sm: "1.1rem" } }}
        >
          Current Surplus:{" "}
          <strong>
            {formatCurrency(investableSurplus.toFixed(0))} / month
          </strong>
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontSize: { xs: "0.9rem", sm: "1.1rem" } }}
        >
          Debt-Free Countdown: <strong>{debtFreeCountdown}</strong>
        </Typography>
      </Box>
    </Box>
  );
}
