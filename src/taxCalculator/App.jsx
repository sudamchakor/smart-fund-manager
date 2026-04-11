import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import store from './store'; // Assuming you create a standard root store configureStore
import TaxDashboard from './containers/TaxDashboard';

// MUI Theme Configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue
    },
    secondary: {
      main: '#f50057', // Pinkish red
    },
    success: {
      main: '#4caf50',
      light: '#e8f5e9',
      contrastText: '#1b5e20',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <TaxDashboard />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
