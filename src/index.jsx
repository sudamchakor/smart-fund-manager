import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css'; // Updated import
import './styles/theme.css'; // New import
import App from './App';
import { HashRouter } from 'react-router-dom'; // Changed to HashRouter

// src/index.js
import {
  Box,
  Typography,
  Stack,
  Container,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';

// Only keep the "Above the Fold" essentials to lower Total Blocking Time
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
