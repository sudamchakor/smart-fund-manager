import React, { useMemo, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { HelmetProvider } from 'react-helmet-async';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store';

import { getAppTheme } from './theme/ThemeConfig';
import {
  selectThemeMode,
  selectDesignSystem,
  selectVisualStyle,
} from './store/emiSlice';

import Header from './components/layout/Header';
import AdminHeader from './components/layout/AdminHeader';
import Footer from './components/layout/Footer';
import SuspenseFallback from './components/common/SuspenseFallback';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useAuth } from './hooks/useAuth';
import FirebaseWrapper from './components/layout/FirebaseWrapper';

// Lazy Loaded Pages
const Home = lazy(() => import('./pages/Home'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const TaxCalculator = lazy(() => import('./pages/TaxCalculator'));
const InvestmentCalculator = lazy(() => import('./pages/InvestmentCalculator'));
const FAQ = lazy(() => import('./pages/FAQ'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Calculator = lazy(() => import('./pages/Calculator'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const CreditCardEMICalculator = lazy(
  () => import('./pages/CreditCardEmiCalculator'),
);
const PersonalLoanCalculator = lazy(
  () => import('./pages/PersonalLoanCalculator'),
);

// Article Module
const ArticlesArchive = lazy(() => import('./pages/articles/ArticlesArchive'));
const SingleArticle = lazy(() => import('./pages/articles/SingleArticle'));
const WriteArticle = lazy(() => import('./pages/admin/WriteArticle'));
const AdminArticles = lazy(() => import('./pages/admin/AdminArticles'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));

// ProtectedRoute component (Now safely inside AuthProvider context)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <SuspenseFallback />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};

// AdminRedirect component
const AdminRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <SuspenseFallback />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Navigate to="/admin/articles" replace />;
};

// New Layout Component for Admin that includes the AdminHeader
const AdminLayout = () => (
  <>
    <AdminHeader />
    <Outlet />
  </>
);

const AppContent = () => {
  const themeMode = useSelector(selectThemeMode);
  const designSystem = useSelector(selectDesignSystem);
  const visualStyle = useSelector(selectVisualStyle);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSingleArticle =
    location.pathname.startsWith('/articles/') &&
    location.pathname.split('/').length === 3;

  const muiTheme = useMemo(
    () => getAppTheme(themeMode, designSystem, visualStyle),
    [themeMode, designSystem, visualStyle],
  );

  useEffect(() => {
    document.body.setAttribute('data-theme', themeMode || 'dodgerblue');
    document.body.setAttribute('data-arch', designSystem || 'material');
    document.body.setAttribute('data-style', visualStyle || 'flat');
  }, [themeMode, designSystem, visualStyle]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {/* We only show the regular Header here. AdminHeader is moved inside the routes below. */}
        {!isAdminRoute && <Header />}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            pt: isSingleArticle ? 0 : { xs: '100px', md: '120px' },
            pb: { xs: '150px', md: '200px' },
            transition: 'padding 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: isSingleArticle ? '100%' : '1440px',
              mx: 'auto',
              px: isSingleArticle ? 0 : { xs: 2, md: 3 },
              flexGrow: 1,
            }}
          >
            <Suspense fallback={<SuspenseFallback />}>
              <Routes>
                {/* 1. PUBLIC ROUTES (Zero Firebase loaded here) */}
                <Route path="/" element={<Home />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route
                  path="/credit-card-emi"
                  element={<CreditCardEMICalculator />}
                />
                <Route
                  path="/personal-loan"
                  element={<PersonalLoanCalculator />}
                />
                <Route
                  path="/investment/*"
                  element={<InvestmentCalculator />}
                />
                <Route path="/tax-calculator" element={<TaxCalculator />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/contact-us" element={<ContactUs />} />

                {/* 2. FIREBASE ROUTES (Articles & Admin) */}
                <Route element={<FirebaseWrapper />}>
                  {/* Public Article Pages */}
                  <Route path="/articles" element={<ArticlesArchive />} />
                  <Route path="/articles/:id" element={<SingleArticle />} />

                  {/* Admin Pages (Wrapped in AdminHeader) */}
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/login" element={<LoginPage />} />
                    <Route path="/admin" element={<AdminRedirect />} />
                    <Route
                      path="/admin/articles"
                      element={
                        <ProtectedRoute>
                          <AdminArticles />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/articles/new"
                      element={
                        <ProtectedRoute>
                          <WriteArticle />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/articles/edit/:id"
                      element={
                        <ProtectedRoute>
                          <WriteArticle />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/profile"
                      element={
                        <ProtectedRoute>
                          <AdminProfile />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Box>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <HelmetProvider>
            {/* NOTICE: AuthProvider is removed from here and moved to FirebaseWrapper */}
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </HelmetProvider>
        </LocalizationProvider>
      </PersistGate>
    </Provider>
  );
}
