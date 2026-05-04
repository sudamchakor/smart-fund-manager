import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import * as corpusSlice from '../../../../src/features/corpus/corpusSlice';
import * as formatting from '../../../../src/utils/formatting';
import '@testing-library/jest-dom';

import * as CorpusManagerModule from '../../../../src/features/corpus/CorpusManager';
const CorpusManager =
  CorpusManagerModule.default || CorpusManagerModule.CorpusManager;

// Mock Material-UI Icons
jest.mock('@mui/icons-material/Add', () => (props) => (
  <svg data-testid="AddIcon" {...props} />
));
jest.mock('@mui/icons-material/Delete', () => (props) => (
  <svg data-testid="DeleteIcon" {...props} />
));
jest.mock('@mui/icons-material/Edit', () => (props) => (
  <svg data-testid="EditIcon" {...props} />
));
jest.mock('@mui/icons-material/TrendingUp', () => (props) => (
  <svg data-testid="TrendingUpIcon" {...props} />
));
jest.mock('@mui/icons-material/AccountBalanceWallet', () => (props) => (
  <svg data-testid="AccountBalanceWalletIcon" {...props} />
));
jest.mock('@mui/icons-material/AccountBalanceWalletOutlined', () => (props) => (
  <svg data-testid="AccountBalanceWalletOutlinedIcon" {...props} />
));

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
const mockUseSelector = require('react-redux').useSelector;
const mockUseDispatch = require('react-redux').useDispatch;

// Mock corpusSlice selectors and actions
jest.mock('../../../../src/features/corpus/corpusSlice', () => ({
  selectAllAssets: jest.fn(),
  selectTotalCorpus: jest.fn(),
  selectWeightedAverageReturn: jest.fn(),
  removeAsset: jest.fn((id) => ({ type: 'corpus/removeAsset', payload: id })),
}));

// Mock formatting.formatCurrency
jest
  .spyOn(formatting, 'formatCurrency')
  .mockImplementation((value, currency) => {
    if (typeof value !== 'number' || isNaN(value)) return `${currency}0`;
    return `${currency}${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  });

// Mock SectionHeader
jest.mock('../../../../src/components/common/SectionHeader', () => ({
  __esModule: true,
  default: ({ title, icon }) => (
    <div data-testid="mock-section-header">
      {icon}
      <h2>{title}</h2>
    </div>
  ),
}));

const mockStore = configureStore([]);
const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('CorpusManager Component', () => {
  const mockAssets = [
    { id: '1', label: 'Equity Fund', value: 100000, expectedReturn: 12 },
    { id: '2', label: 'Debt Bond', value: 50000, expectedReturn: 7 },
    { id: '3', label: 'Fixed Deposit', value: 20000, expectedReturn: 6 },
  ];
  const mockTotalCorpus = 170000;
  const mockWeightedAverageReturn = 10.5;
  const mockCurrency = '₹';
  const mockOnOpenModal = jest.fn();

  const renderComponent = (assets = mockAssets) => {
    mockUseSelector.mockImplementation((selector) => {
      if (selector === corpusSlice.selectAllAssets) return assets;
      if (selector === corpusSlice.selectTotalCorpus) return mockTotalCorpus;
      if (selector === corpusSlice.selectWeightedAverageReturn)
        return mockWeightedAverageReturn;
      if (selector.name === 'selectCurrency') return mockCurrency;
      return undefined;
    });
    return render(
      <Provider store={mockStore({})}>
        <ThemeProvider theme={theme}>
          <CorpusManager onOpenModal={mockOnOpenModal} />
        </ThemeProvider>
      </Provider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDispatch.mockReturnValue(jest.fn()); // Mock dispatch
    formatting.formatCurrency.mockClear();
    formatting.formatCurrency.mockImplementation((value, currency) => {
      if (typeof value !== 'number' || isNaN(value)) return `${currency}0`;
      return `${currency}${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    });
  });

  // --- Header and Add Asset Button ---
  it('renders SectionHeader with correct title and icon', () => {
    renderComponent();
    expect(screen.getByTestId('mock-section-header')).toBeInTheDocument();
    expect(screen.getByText('Investment Corpus')).toBeInTheDocument();
    expect(screen.getByTestId('AccountBalanceWalletIcon')).toBeInTheDocument();
  });

  it('renders "Add Asset" button and calls onOpenModal when clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Add Asset' }));
    expect(mockOnOpenModal).toHaveBeenCalledWith('corpus', null, 'add');
    expect(screen.getByTestId('AddIcon')).toBeInTheDocument();
  });

  // --- Asset List Display ---
  it('renders all assets in the corpus', () => {
    renderComponent();
    expect(screen.getByText('Equity Fund')).toBeInTheDocument();
    expect(screen.getByText('Debt Bond')).toBeInTheDocument();
    expect(screen.getByText('Fixed Deposit')).toBeInTheDocument();
  });

  it('displays asset value and expected return', () => {
    renderComponent();
    expect(screen.getByText('Equity Fund').closest('div')).toHaveTextContent(
      '₹1,00,000',
    );
    expect(screen.getByText('Equity Fund').closest('div')).toHaveTextContent(
      '12.00% Return',
    );
  });

  it('applies correct color based on asset label', () => {
    renderComponent();
    const equityAsset = screen.getByText('Equity Fund').closest('.MuiBox-root');
    expect(equityAsset).toHaveStyle(
      `border-left: 5px solid ${theme.palette.success.main}`,
    );

    const debtAsset = screen.getByText('Debt Bond').closest('.MuiBox-root');
    expect(debtAsset).toHaveStyle(
      `border-left: 5px solid ${theme.palette.info.main}`,
    );

    const fdAsset = screen.getByText('Fixed Deposit').closest('.MuiBox-root');
    expect(fdAsset).toHaveStyle(
      `border-left: 5px solid ${theme.palette.info.main}`,
    );
  });

  it('calls onOpenModal for editing when Edit button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getAllByLabelText('Edit')[0]);
    expect(mockOnOpenModal).toHaveBeenCalledWith(
      'corpus',
      mockAssets[0],
      'edit',
    );
    expect(screen.getByTestId('EditIcon')).toBeInTheDocument();
  });

  it('dispatches removeAsset when Delete button is clicked', () => {
    const mockDispatch = jest.fn();
    mockUseDispatch.mockReturnValue(mockDispatch);
    renderComponent();
    fireEvent.click(screen.getAllByLabelText('Delete')[0]);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'corpus/removeAsset',
      payload: '1',
    });
    expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
  });

  // --- Empty Corpus State ---
  it('displays "No assets in your corpus yet." when assets array is empty', () => {
    renderComponent([]);
    expect(
      screen.getByText('No assets in your corpus yet.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Click "Add Asset" to start tracking your investments.'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('AccountBalanceWalletOutlinedIcon'),
    ).toBeInTheDocument();
  });

  // --- Footer Summary ---
  it('displays total corpus and weighted average return in the footer', () => {
    renderComponent();
    expect(screen.getByText('Total Corpus')).toBeInTheDocument();
    expect(screen.getByText('₹1,70,000')).toBeInTheDocument();
    expect(screen.getByText('Avg. Return')).toBeInTheDocument();
    expect(screen.getByText('10.50%')).toBeInTheDocument();
  });

  // --- Edge Cases / Negative Scenarios ---
  it('handles asset with non-numeric expectedReturn gracefully', () => {
    const assetsWithInvalidReturn = [
      { id: '4', label: 'Invalid Asset', value: 1000, expectedReturn: 'abc' },
    ];
    renderComponent(assetsWithInvalidReturn);
    expect(screen.getByText('Invalid Asset').closest('div')).toHaveTextContent(
      '0.00% Return',
    );
  });

  it('handles asset with missing expectedReturn gracefully', () => {
    const assetsWithMissingReturn = [
      { id: '5', label: 'Missing Return Asset', value: 1000 },
    ];
    renderComponent(assetsWithMissingReturn);
    expect(
      screen.getByText('Missing Return Asset').closest('div'),
    ).toHaveTextContent('0.00% Return');
  });

  it('handles asset with zero value gracefully', () => {
    const assetsWithZeroValue = [
      { id: '6', label: 'Zero Value Asset', value: 0, expectedReturn: 5 },
    ];
    renderComponent(assetsWithZeroValue);
    expect(
      screen.getByText('Zero Value Asset').closest('div'),
    ).toHaveTextContent('₹0');
  });

  it('ensures formatting.formatCurrency is called with correct currency', () => {
    renderComponent();
    expect(formatting.formatCurrency).toHaveBeenCalledWith(100000, '₹');
    expect(formatting.formatCurrency).toHaveBeenCalledWith(
      mockTotalCorpus,
      '₹',
    );
  });
});
