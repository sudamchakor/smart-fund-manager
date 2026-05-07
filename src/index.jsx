import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css'; // Updated import
import './styles/theme.css'; // New import
import App from './App';
import { HashRouter } from 'react-router-dom'; // Changed to HashRouter
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import {
  Box,
  Typography,
  Stack,
  Container,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';

const _MUI_SHIELD = {
  Box,
  Typography,
  Stack,
  Container,
  ThemeProvider,
  CssBaseline,
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
