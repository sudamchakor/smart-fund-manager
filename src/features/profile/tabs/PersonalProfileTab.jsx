import React, { useState } from "react";
import {
  Grid,
  Box,
  useMediaQuery,
  useTheme,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
} from "@mui/material";
import {
  AttachMoney,
  MoneyOff,
  AccountBalanceWallet,
} from "@mui/icons-material";
import BasicInfoDisplay from "../components/BasicInfoDisplay";
import BasicInfoEdit from "../components/BasicInfoEdit";
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

export default function PersonalProfileTab({ onEditGoal, onOpenModal }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [speedDialOpen, setSpeedDialOpen] = useState(false);

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
  const investableSurplus = useSelector(selectCurrentSurplus);
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
      name: "Future Wealth (Goals)",
      value: totalMonthlyGoalContributions,
    },
    {
      name: "Surplus",
      value: investableSurplus > 0 ? investableSurplus : 0,
    },
  ].filter((item) => item.value > 0);

  const [editingBasicInfo, setEditingBasicInfo] = useState(false);

  const handleSaveBasicInfo = (newCurrentAge, newRetirementAge) => {
    dispatch(setCurrentAge(newCurrentAge));
    dispatch(setRetirementAge(newRetirementAge));
    setEditingBasicInfo(false);
  };

  const handleModalOpen = (type) => {
    onOpenModal(type);
    setSpeedDialOpen(false);
  };

  const actions = [
    {
      icon: <AccountBalanceWallet />,
      name: "Corpus",
      handler: () => handleModalOpen("corpus"),
    },
    {
      icon: <AttachMoney />,
      name: "Income",
      handler: () => handleModalOpen("income"),
    },
    {
      icon: <MoneyOff />,
      name: "Expense",
      handler: () => handleModalOpen("expense"),
    },
  ];

  return (
    <>
      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12} md={6}>
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
              onEdit={() => setEditingBasicInfo(true)}
            />
          )}
        </Grid>

        {/* Corpus Manager */}
        <Grid item xs={12} md={6}>
          <CorpusManager onOpenModal={onOpenModal} />
        </Grid>

        {/* Income and Expense Details Row */}
        <Grid item xs={12} md={6}>
          <FinancialSection isIncome={true} onOpenModal={onOpenModal} />
        </Grid>
        <Grid item xs={12} md={6}>
          <FinancialSection
            isIncome={false}
            onEditGoal={onEditGoal}
            onOpenModal={onOpenModal}
          />
        </Grid>

        {/* Charts Row */}
        <Grid item xs={12} md={6}>
          <Box sx={{ width: "100%", minHeight: 300 }}>
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
          <Box sx={{ width: "100%", minHeight: 300 }}>
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
    </>
  );
}
