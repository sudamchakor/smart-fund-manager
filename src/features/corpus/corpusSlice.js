import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  assets: [
    { id: nanoid(), label: 'Equity', value: 100000, expectedReturn: 12, category: 'Equity' },
    { id: nanoid(), label: 'Debt', value: 50000, expectedReturn: 8, category: 'Debt' },
  ],
};

const corpusSlice = createSlice({
  name: 'corpus',
  initialState,
  reducers: {
    addAsset: {
      reducer(state, action) {
        state.assets.push(action.payload);
      },
      prepare(label, value, expectedReturn, category) {
        return {
          payload: {
            id: nanoid(),
            label,
            value: parseFloat(value),
            expectedReturn: parseFloat(expectedReturn),
            category,
          },
        };
      },
    },
    removeAsset(state, action) {
      state.assets = state.assets.filter((asset) => asset.id !== action.payload);
    },
    updateAsset(state, action) {
      const { id, ...updatedAsset } = action.payload;
      const existingAsset = state.assets.find((asset) => asset.id === id);
      if (existingAsset) {
        Object.assign(existingAsset, updatedAsset);
      }
    },
  },
});

export const { addAsset, removeAsset, updateAsset } = corpusSlice.actions;

export const selectAllAssets = (state) => state.corpus.assets;

export const selectTotalCorpus = (state) =>
  state.corpus.assets.reduce((total, asset) => (total) + (+asset.value), 0);

export const selectWeightedAverageReturn = (state) => {
  const totalCorpus = selectTotalCorpus(state);
  if (totalCorpus === 0) return 0;
  const weightedReturn = state.corpus.assets.reduce(
    (total, asset) => total + asset.value * asset.expectedReturn,
    0
  );
  return weightedReturn / totalCorpus;
};

export const selectProjectedCorpus = (state, years) => {
  return state.corpus.assets.reduce((total, asset) => {
    const { value, expectedReturn } = asset;
    const futureValue = value * Math.pow(1 + expectedReturn / 100, years);
    return total + futureValue;
  }, 0);
};

export default corpusSlice.reducer;