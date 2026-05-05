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
// REMOVED: import AdminHeader from './components/layout/AdminHeader'; // This was causing Firebase to load early
import Footer from './components/layout/Footer';
import SuspenseFallback from './components/common/SuspenseFallback';
import ErrorBoundary from './components/common/ErrorBoundary';

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

// Lazy Load FirebaseWrapper and Auth-related components
const FirebaseWrapper = lazy(
  () => import('./components/layout/FirebaseWrapper'),
);
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));
const AdminRedirect = lazy(() => import('./components/auth/AdminRedirect'));
const AdminHeader = lazy(() => import('./components/layout/AdminHeader')); // LAZY LOAD ADMIN HEADER

// New Layout Component for Admin that includes the AdminHeader
const AdminLayout = () => (
  <>
    <Suspense fallback={<SuspenseFallback />}>
      <AdminHeader />
    </Suspense>
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
                {/* Wrap FirebaseWrapper with Suspense to lazy load it */}
                <Route
                  element={
                    <Suspense fallback={<SuspenseFallback />}>
                      <FirebaseWrapper />
                    </Suspense>
                  }
                >
                  {/* Public Article Pages */}
                  <Route path="/articles" element={<ArticlesArchive />} />
                  <Route path="/articles/:id" element={<SingleArticle />} />

                  {/* Admin Pages (Wrapped in AdminHeader) */}
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/login" element={<LoginPage />} />
                    <Route
                      path="/admin"
                      element={
                        <Suspense fallback={<SuspenseFallback />}>
                          <AdminRedirect />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/admin/articles"
                      element={
                        <Suspense fallback={<SuspenseFallback />}>
                          <ProtectedRoute>
                            <AdminArticles />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/admin/articles/new"
                      element={
                        <Suspense fallback={<SuspenseFallback />}>
                          <ProtectedRoute>
                            <WriteArticle />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/admin/articles/edit/:id"
                      element={
                        <Suspense fallback={<SuspenseFallback />}>
                          <ProtectedRoute>
                            <WriteArticle />
                          </ProtectedRoute>
                        </Suspense>
                      }
                    />
                    <Route
                      path="/admin/profile"
                      element={
                        <Suspense fallback={<SuspenseFallback />}>
                          <ProtectedRoute>
                            <AdminProfile />
                          </ProtectedRoute>
                        </Suspense>
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
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </HelmetProvider>
        </LocalizationProvider>
      </PersistGate>
    </Provider>
  );
}
