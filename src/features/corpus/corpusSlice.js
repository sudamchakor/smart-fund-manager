import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  assets: [],
  investmentTypes: [
    { value: 'Equity', label: 'Equity (Stocks, Mutual Funds)' },
    { value: 'Debt', label: 'Debt (Bonds, FDs, PPF)' },
    { value: 'Gold', label: 'Gold (Digital, Physical, SGBs)' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'NPS', label: 'National Pension System (NPS)' },
    { value: 'Cash', label: 'Cash & Equivalents' },
  ],
};

const corpusSlice = createSlice({
  name: 'corpus',
  initialState,
  reducers: {
    addAsset: (state, action) => {
      const { label, value, expectedReturn, category } = action.payload;
      const newAsset = {
        id: Date.now(),
        label,
        value: parseFloat(value) || 0,
        expectedReturn: parseFloat(expectedReturn) || 0,
        category,
      };
      state.assets.push(newAsset);
    },
    updateAsset: (state, action) => {
      const index = state.assets.findIndex(
        (asset) => asset.id === action.payload.id,
      );
      if (index !== -1) {
        state.assets[index] = { ...state.assets[index], ...action.payload };
      }
    },
    removeAsset: (state, action) => {
      state.assets = state.assets.filter(
        (asset) => asset.id !== action.payload,
      );
    },
    addInvestmentType: (state, action) => {
      state.investmentTypes.push(action.payload);
    },
    removeInvestmentType: (state, action) => {
      state.investmentTypes = state.investmentTypes.filter(
        (type) => type.value !== action.payload,
      );
    },
  },
});

export const {
  addAsset,
  updateAsset,
  removeAsset,
  addInvestmentType,
  removeInvestmentType,
} = corpusSlice.actions;

export const selectAllAssets = (state) => state.corpus.assets;
export const selectInvestmentTypes = (state) => state.corpus.investmentTypes;

export const selectTotalCorpus = createSelector([selectAllAssets], (assets) =>
  assets.reduce((total, asset) => total + asset.value, 0),
);

export const selectWeightedAverageReturn = createSelector(
  [selectAllAssets, selectTotalCorpus],
  (assets, totalCorpus) => {
    if (totalCorpus === 0) return 0;
    const weightedSum = assets.reduce(
      (sum, asset) => sum + asset.value * asset.expectedReturn,
      0,
    );
    return weightedSum / totalCorpus;
  },
);

export default corpusSlice.reducer;
