import React from 'react';
import { render, screen } from '@testing-library/react';
import FdCalculatorForm from '../../../../../src/features/investment/tabs/FdCalculatorForm';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const mockStore = configureStore([]);
const store = mockStore({
  emi: {
    currency: '₹', // Provide the currency in the mock store
  },
  profile: {
    // Add any other profile state that FdCalculatorForm might need
    expectedReturnRate: 0.07,
  },
});
const theme = createTheme();

describe('FdCalculatorForm', () => {
  it('renders without crashing', () => {
    render(<Provider store={store}><ThemeProvider theme={theme}><FdCalculatorForm /></ThemeProvider></Provider>); // Wrap with Provider and ThemeProvider
    expect(screen.getByText(/FD Calculator/i)).toBeInTheDocument();
  });
});
