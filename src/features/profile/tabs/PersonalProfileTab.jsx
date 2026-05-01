import React, { useState } from "react";
import {
  Grid,
  Box,
  useMediaQuery,
  useTheme,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import {
  AttachMoney,
  MoneyOff,
  AccountBalanceWallet,
  Edit as EditIcon,
} from "@mui/icons-material";
import BasicInfoDisplay from "../components/BasicInfoDisplay";
import BasicInfoEdit from "../components/BasicInfoEdit";
import FinancialSettings from "../components/FinancialSettings"; // Import FinancialSettings
import { useDispatch, useSelector } from "react-redux";
import {
  selectProfileExpenses,
  selectCurrentAge,
  selectRetirementAge,
  setCurrentAge,
  setRetirementAge,
  selectTotalMonthlyGoalContributions,
  selectIndividualGoalInvestmentContributions,
  selectGoals,
  selectPrioritizedGoalFunding, // Import selectPrioritizedGoalFunding
  selectCurrentSurplus,
  selectCareerGrowthRate,
  selectIncomes,
  selectGeneralInflationRate,
} from "../../../store/profileSlice";
import { selectCalculatedValues } from "../../emiCalculator/utils/emiCalculator";
import CashFlowDonutChart from "../components/CashFlowDonutChart";
import ProjectedCashFlowChart from "../components/ProjectedCashFlowChart";
import FinancialSection from "../components/FinancialSection";
import CorpusManager from "../../corpus/CorpusManager";
import FinancialModal from "../components/FinancialModal";

export default function PersonalProfileTab({ onEditGoal }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalAsset, setModalAsset] = useState(null);
  const [modalMode, setModalMode] = useState("add");

  const expenses = useSelector(selectProfileExpenses) || [];
  const incomes = useSelector(selectIncomes) || [];
  const currentAge = useSelector(selectCurrentAge) || 30;
  const retirementAge = useSelector(selectRetirementAge) || 60;
  const careerGrowthRaw = useSelector(selectCareerGrowthRate);
  const careerGrowthRate =
    typeof careerGrowthRaw === "object"
      ? careerGrowthRaw.value
      : careerGrowthRaw || 0;
  const careerGrowthType =
    typeof careerGrowthRaw === "object" ? careerGrowthRaw.type : "percentage";
  const generalInflationRate = useSelector(selectGeneralInflationRate) || 0.06;

  const { emi: monthlyEmi } = useSelector(selectCalculatedValues);
  const emiState = useSelector(
    (state) => state.emi || state.emiCalculator || {},
  );

  const totalMonthlyGoalContributions = useSelector(
    selectTotalMonthlyGoalContributions,
  );
  const individualGoalInvestments = useSelector(
    selectIndividualGoalInvestmentContributions,
  );
  const goalsWithFunding = useSelector(selectPrioritizedGoalFunding) || []; // Get goals with funding details
  const goals = useSelector(selectGoals) || [];

  const needsValue = expenses
    .filter((e) => e.category === "basic")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const wantsValue = expenses
    .filter((e) => e.category === "discretionary")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const donutData = [
    {
      name: "Needs",
      value: needsValue,
    },
    {
      name: "Wants",
      value: wantsValue,
    },
    { name: "Loan EMIs", value: monthlyEmi || 0 },
    {
      name: "Future Wealth",
      value: totalMonthlyGoalContributions,
    },
  ].filter((item) => item.value > 0);

  const handleSaveBasicInfo = (newCurrentAge, newRetirementAge) => {
    dispatch(setCurrentAge(newCurrentAge));
    dispatch(setRetirementAge(newRetirementAge));
    setEditingBasicInfo(false);
  };

  const handleOpenFinancialModal = (type, assetData = null, mode = "add") => {
    setModalType(type);
    setModalAsset(assetData);
    setModalMode(mode);
    setModalOpen(true);
    setSpeedDialOpen(false);
  };

  const handleCloseFinancialModal = () => {
    setModalOpen(false);
    setModalType("");
    setModalAsset(null);
    setModalMode("add");
  };

  const actions = [
    {
      icon: <AccountBalanceWallet />,
      name: "Corpus",
      handler: () => handleOpenFinancialModal("corpus", null, "add"),
    },
    {
      icon: <AttachMoney />,
      name: "Income",
      handler: () => handleOpenFinancialModal("income", null, "add"),
    },
    {
      icon: <MoneyOff />,
      name: "Expense",
      handler: () => handleOpenFinancialModal("expense", null, "add"),
    },
  ];

  return (
    <>
      <Grid container spacing={2}>
        {/* Card 1: Basic Information */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "520px", // Matches Financial Settings
              display: "flex",
              flexDirection: "column",
              boxShadow: 1,
              borderRadius: 2,
            }}
          >
            <CardHeader
              sx={{ py: 1.5, px: 2 }}
              title={
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Basic Information
                </Typography>
              }
              action={
                !editingBasicInfo && (
                  <IconButton
                    size="small"
                    onClick={() => setEditingBasicInfo(true)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )
              }
            />
            <Divider />
            <CardContent sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
              {editingBasicInfo ? (
                <BasicInfoEdit
                  currentAge={currentAge}
                  retirementAge={retirementAge}
                  onSave={handleSaveBasicInfo}
                  onCancel={() => setEditingBasicInfo(false)}
                />
              ) : (
                <BasicInfoDisplay
                  currentAge={currentAge}
                  retirementAge={retirementAge}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Financial Settings */}
        <Grid item xs={12} md={6}>
          <FinancialSettings />
        </Grid>

        {/* Following sections: Corpus, Income, Expenses */}
        <Grid item xs={12} md={6}>
          <CorpusManager onOpenModal={handleOpenFinancialModal} />
        </Grid>

        <Grid item xs={12} md={6}>
          <FinancialSection
            isIncome={true}
            onOpenModal={handleOpenFinancialModal}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FinancialSection
            isIncome={false}
            onEditGoal={onEditGoal}
            goalsWithFunding={goalsWithFunding}
            onOpenModal={handleOpenFinancialModal}
          />
        </Grid>

        {/* Charts Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ width: "100%", height: 320 }}>
            <ProjectedCashFlowChart
              currentAge={currentAge}
              retirementAge={retirementAge}
              careerGrowthRate={careerGrowthRate}
              careerGrowthType={careerGrowthType}
              monthlyEmi={monthlyEmi}
              emiState={emiState}
              individualGoalInvestments={individualGoalInvestments}
              goals={goals}
              expenses={expenses}
              incomes={incomes}
              inflationRate={generalInflationRate}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ width: "100%", height: 320 }}>
            <CashFlowDonutChart donutData={donutData} />
          </Box>
        </Grid>
      </Grid>

      {isSmallScreen && (
        <SpeedDial
          ariaLabel="SpeedDial for financial actions"
          sx={{ position: "fixed", bottom: 80, right: 16, zIndex: 9999 }}
          icon={<SpeedDialIcon />}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          open={speedDialOpen}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.handler}
              tooltipOpen
            />
          ))}
        </SpeedDial>
      )}
      <FinancialModal
        open={modalOpen}
        onClose={handleCloseFinancialModal}
        type={modalType}
        asset={modalAsset}
        mode={modalMode}
      />
    </>
  );
}
