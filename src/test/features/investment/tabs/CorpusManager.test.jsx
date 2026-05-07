import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CorpusManager from '../../../../../src/features/corpus/CorpusManager';
import * as corpusSlice from '../../../../../src/store/corpusSlice';
import * as formatting from '../../../../../src/utils/formatting';
import '@testing-library/jest-dom';

// Mock Material-UI Icons
jest.mock('@mui/icons-material/Delete', () => (props) => <svg data-testid="DeleteIcon" {...props} />);
jest.mock('@mui/icons-material/Edit', () => (props) => <svg data-testid="EditIcon" {...props} />);
jest.mock('@mui/icons-material/Info', () => (props) => <svg data-testid="InfoIcon" {...props} />);

// Mock Redux hooks and slices
jest.mock('../../../../../src/store/corpusSlice', () => ({
  removeAsset: jest.fn((payload) => ({ type: 'corpus/removeAsset', payload })),
  selectAssets: jest.fn(),
  selectTotalCorpusValue: jest.fn(),
  selectWeightedAverageReturn: jest.fn(),
}));

const mockStore = configureStore([]);
const theme = createTheme();

describe('CorpusManager Component', () => {
  let store;
  const defaultAssets = [
    { id: 'asset1', label: 'Equity Fund', value: 100000, expectedReturn: 12, category: 'Equity' },
    { id: 'asset2', label: 'Debt Fund', value: 50000, expectedReturn: 7, category: 'Debt' },
  ];
  const mockOnOpenModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      emi: { currency: '₹' },
      corpus: { assets: defaultAssets }
    });
    
    corpusSlice.selectAssets.mockReturnValue(defaultAssets);
    corpusSlice.selectTotalCorpusValue.mockReturnValue(150000);
    corpusSlice.selectWeightedAverageReturn.mockReturnValue(0.1033);
    
    jest.spyOn(formatting, 'formatCurrency').mockImplementation((value, currency = '₹') => {
      return `${currency}${value.toLocaleString('en-IN')}`;
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CorpusManager onOpenModal={mockOnOpenModal} {...props} />
        </ThemeProvider>
      </Provider>
    );
  };

  it('renders the header and add button', () => {
    renderComponent();
    expect(screen.getByText(/Investment Corpus/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add New Asset/i })).toBeInTheDocument();
  });

  it('displays asset values correctly', () => {
    renderComponent();
    expect(screen.getByText('Equity Fund')).toBeInTheDocument();
    expect(screen.getByText('₹1,00,000')).toBeInTheDocument();
    expect(screen.getByText('12.0%')).toBeInTheDocument();
  });

  it('calls onOpenModal for editing when Edit button is clicked', () => {
    renderComponent();
    const editButtons = screen.getAllByTestId('EditIcon');
    fireEvent.click(editButtons[0].closest('button'));
    expect(mockOnOpenModal).toHaveBeenCalledWith('corpus', defaultAssets[0], 'edit');
  });

  it('calls onOpenModal for adding when Add New Asset is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Add New Asset/i }));
    expect(mockOnOpenModal).toHaveBeenCalledWith('corpus', null, 'add');
  });

  it('displays empty state when no assets are present', () => {
    corpusSlice.selectAssets.mockReturnValue([]);
    renderComponent();
    expect(screen.getByText(/No assets in your corpus yet/i)).toBeInTheDocument();
  });

  it('displays footer totals correctly', () => {
    renderComponent();
    expect(screen.getByText('Total Corpus')).toBeInTheDocument();
    expect(screen.getByText('₹1,50,000')).toBeInTheDocument();
    expect(screen.getByText('10.33%')).toBeInTheDocument();
  });
});
