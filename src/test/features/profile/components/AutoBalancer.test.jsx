import React from 'react';
import { render, screen } from '@testing-library/react';
import AutoBalancer from '../../../../features/profile/components/AutoBalancer.jsx'; // Corrected path
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const mockStore = configureStore([]);
const store = mockStore({});
const theme = createTheme();

describe('AutoBalancer', () => {
  it('renders without crashing', () => {
    render(<Provider store={store}><ThemeProvider theme={theme}><AutoBalancer /></ThemeProvider></Provider>);
    expect(screen.getByText(/Auto Balancer/i)).toBeInTheDocument(); // Placeholder
  });
});
