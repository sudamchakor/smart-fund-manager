import corpusReducer, {
  addAsset,
  updateAsset,
  removeAsset,
  addInvestmentType,
  removeInvestmentType,
} from '../../../../src/features/corpus/corpusSlice';

describe('corpusSlice', () => {
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

  it('should return the initial state', () => {
    expect(corpusReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle addAsset', () => {
    const newAsset = {
      label: 'Stocks',
      value: 10000,
      expectedReturn: 0.12,
      category: 'Equity',
    };
    const result = corpusReducer(initialState, addAsset(newAsset));
    expect(result.assets.length).toBe(1);
    expect(result.assets[0]).toEqual(expect.objectContaining(newAsset));
  });

  it('should handle updateAsset', () => {
    const stateWithAsset = {
      ...initialState,
      assets: [
        {
          id: 1,
          label: 'Stocks',
          value: 10000,
          expectedReturn: 0.12,
          category: 'Equity',
        },
      ],
    };
    const updatedAsset = { id: 1, value: 15000 };
    const result = corpusReducer(stateWithAsset, updateAsset(updatedAsset));
    expect(result.assets[0].value).toBe(15000);
  });

  it('should handle removeAsset', () => {
    const stateWithAsset = {
      ...initialState,
      assets: [
        {
          id: 1,
          label: 'Stocks',
          value: 10000,
          expectedReturn: 0.12,
          category: 'Equity',
        },
      ],
    };
    const result = corpusReducer(stateWithAsset, removeAsset(1));
    expect(result.assets.length).toBe(0);
  });

  it('should handle addInvestmentType', () => {
    const newType = { value: 'Crypto', label: 'Cryptocurrency' };
    const result = corpusReducer(initialState, addInvestmentType(newType));
    expect(result.investmentTypes.length).toBe(7);
    expect(result.investmentTypes[6]).toEqual(newType);
  });

  it('should handle removeInvestmentType', () => {
    const result = corpusReducer(initialState, removeInvestmentType('Equity'));
    expect(result.investmentTypes.length).toBe(5);
    expect(
      result.investmentTypes.find((t) => t.value === 'Equity'),
    ).toBeUndefined();
  });
});
