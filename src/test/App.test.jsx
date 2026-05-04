import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock all lazy-loaded pages and components
jest.mock('../components/layout/Header', () => () => (
  <div data-testid="mock-header">Header</div>
));
jest.mock('../components/layout/AdminHeader', () => () => (
  <div data-testid="mock-admin-header">AdminHeader</div>
));
jest.mock('../components/layout/Footer', () => () => (
  <div data-testid="mock-footer">Footer</div>
));
jest.mock('../components/common/SuspenseFallback', () => () => (
  <div data-testid="mock-suspense-fallback">Loading...</div>
));

// Unified mock for FAQ, allowing mockImplementationOnce for error testing
const MockFAQ = jest.fn(() => <div data-testid="mock-faq">FAQ</div>);
jest.mock('../pages/FAQ', () => MockFAQ);

jest.mock('../pages/Home', () => () => <div data-testid="mock-home">Home</div>);
jest.mock('../pages/SettingsPage', () => () => (
  <div data-testid="mock-settings-page">SettingsPage</div>
));
jest.mock('../pages/UserProfile', () => () => (
  <div data-testid="mock-user-profile">UserProfile</div>
));
jest.mock('../pages/TaxCalculator', () => () => (
  <div data-testid="mock-tax-calculator">TaxCalculator</div>
));
jest.mock('../pages/InvestmentCalculator', () => () => (
  <div data-testid="mock-investment-calculator">InvestmentCalculator</div>
));
jest.mock('../pages/NotFoundPage', () => () => (
  <div data-testid="mock-not-found-page">NotFoundPage</div>
));
jest.mock('../pages/PrivacyPolicy', () => () => (
  <div data-testid="mock-privacy-policy">PrivacyPolicy</div>
));
jest.mock('../pages/Calculator', () => () => (
  <div data-testid="mock-calculator">Calculator</div>
));
jest.mock('../pages/TermsOfService', () => () => (
  <div data-testid="mock-terms-of-service">TermsOfService</div>
));
jest.mock('../pages/ContactUs', () => () => (
  <div data-testid="mock-contact-us">ContactUs</div>
));
jest.mock('../pages/CreditCardEmiCalculator', () => () => (
  <div data-testid="mock-credit-card-emi-calculator">
    CreditCardEmiCalculator
  </div>
));
jest.mock('../pages/PersonalLoanCalculator', () => () => (
  <div data-testid="mock-personal-loan-calculator">PersonalLoanCalculator</div>
));
jest.mock('../pages/articles/ArticlesArchive', () => () => (
  <div data-testid="mock-articles-archive">ArticlesArchive</div>
));
jest.mock('../pages/articles/SingleArticle', () => () => (
  <div data-testid="mock-single-article">SingleArticle</div>
));
jest.mock('../pages/admin/WriteArticle', () => () => (
  <div data-testid="mock-write-article">WriteArticle</div>
));
jest.mock('../pages/admin/AdminArticles', () => () => (
  <div data-testid="mock-admin-articles">AdminArticles</div>
));
jest.mock('../pages/admin/LoginPage', () => () => (
  <div data-testid="mock-login-page">LoginPage</div>
));
jest.mock('../pages/admin/AdminProfile', () => () => (
  <div data-testid="mock-admin-profile">AdminProfile</div>
));

// Mock Redux store and persistence
jest.mock('../store', () => ({
  __esModule: true,
  default: {
    getState: () => ({
      emi: {
        themeMode: 'light',
        designSystem: 'material',
        visualStyle: 'flat',
      },
      profile: {},
      emiCalculator: { emi: 0, schedule: [] },
    }),
    subscribe: jest.fn(() => jest.fn()),
    dispatch: jest.fn(),
  },
  persistor: {
    // Mock persistor methods if they are called directly in App.jsx
    // For PersistGate, it usually just needs to be an object
  },
}));

jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }) => <>{children}</>,
}));

jest.mock('react-helmet-async', () => ({
  HelmetProvider: ({ children }) => <>{children}</>,
}));

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => <>{children}</>, // Render children directly for testing
}));

describe('App Component Routing and Layout', () => {
  const setup = (
    initialEntries = ['/'],
    authState = { user: null, loading: false },
    AppToRender = App, // Allow passing a different App component for specific tests
  ) => {
    mockUseAuth.mockReturnValue(authState);
    // Mock document.body.setAttribute for theme testing
    jest.spyOn(document.body, 'setAttribute');

    render(
      <MemoryRouter
        initialEntries={initialEntries}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AppToRender />
      </MemoryRouter>,
    );
  };

  afterEach(() => {
    cleanup(); // Clean up the DOM after each test
  });

  beforeEach(() => {
    // Reset mockUseAuth to its default (unauthenticated) state
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    // Clear any previous spies on document.body.setAttribute
    if (document.body.setAttribute.mockRestore) {
      document.body.setAttribute.mockRestore();
    }
    // Clear all mock implementations and call history for MockFAQ
    MockFAQ.mockClear();
    // Reset MockFAQ to its default implementation
    MockFAQ.mockImplementation(() => <div data-testid="mock-faq">FAQ</div>);
  });

  // --- General Layout Tests ---
  it('renders Header and Footer on non-admin routes', async () => {
    setup(['/']);
    await waitFor(() => {
      expect(screen.getByTestId('mock-header')).toBeInTheDocument();
      expect(screen.queryByTestId('mock-admin-header')).not.toBeInTheDocument();
      expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });
  });

  it('renders AdminHeader and Footer on admin routes', async () => {
    setup(['/admin/articles'], { user: { uid: 'admin123' }, loading: false });
    await waitFor(() => {
      expect(screen.queryByTestId('mock-header')).not.toBeInTheDocument();
      expect(screen.getByTestId('mock-admin-header')).toBeInTheDocument();
      expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });
  });

  it('applies theme attributes to document.body', async () => {
    setup(['/']);
    await waitFor(() => {
      expect(document.body.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'light',
      );
      expect(document.body.setAttribute).toHaveBeenCalledWith(
        'data-arch',
        'material',
      );
      expect(document.body.setAttribute).toHaveBeenCalledWith(
        'data-style',
        'flat',
      );
    });
  });

  // --- Public Routes ---
  it('renders Home page on "/" route', async () => {
    setup(['/']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-home')).toBeInTheDocument(),
    );
  });

  it('renders Calculator page on "/calculator" route', async () => {
    setup(['/calculator']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-calculator')).toBeInTheDocument(),
    );
  });

  it('renders UserProfile page on "/profile" route', async () => {
    setup(['/profile']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-user-profile')).toBeInTheDocument(),
    );
  });

  it('renders SettingsPage page on "/settings" route', async () => {
    setup(['/settings']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-settings-page')).toBeInTheDocument(),
    );
  });

  it('renders CreditCardEmiCalculator page on "/credit-card-emi" route', async () => {
    setup(['/credit-card-emi']);
    await waitFor(() =>
      expect(
        screen.getByTestId('mock-credit-card-emi-calculator'),
      ).toBeInTheDocument(),
    );
  });

  it('renders PersonalLoanCalculator page on "/personal-loan" route', async () => {
    setup(['/personal-loan']);
    await waitFor(() =>
      expect(
        screen.getByTestId('mock-personal-loan-calculator'),
      ).toBeInTheDocument(),
    );
  });

  it('renders InvestmentCalculator page on "/investment" and its sub-routes', async () => {
    const investmentRoutes = [
      '/investment',
      '/investment/sip',
      '/investment/lumpsum',
      '/investment/step-up-sip',
      '/investment/swp',
      '/investment/fd',
    ];
    for (const route of investmentRoutes) {
      setup([route]);
      await waitFor(() =>
        expect(
          screen.getByTestId('mock-investment-calculator'),
        ).toBeInTheDocument(),
      );
      cleanup(); // Clean up after each route check
    }
  });

  it('renders TaxCalculator page on "/tax-calculator" route', async () => {
    setup(['/tax-calculator']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-tax-calculator')).toBeInTheDocument(),
    );
  });

  it('renders FAQ page on "/faq" route', async () => {
    setup(['/faq']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-faq')).toBeInTheDocument(),
    );
  });

  it('renders PrivacyPolicy page on "/privacy-policy" route', async () => {
    setup(['/privacy-policy']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-privacy-policy')).toBeInTheDocument(),
    );
  });

  it('renders TermsOfService page on "/terms-of-service" route', async () => {
    setup(['/terms-of-service']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-terms-of-service')).toBeInTheDocument(),
    );
  });

  it('renders ContactUs page on "/contact-us" route', async () => {
    setup(['/contact-us']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-contact-us')).toBeInTheDocument(),
    );
  });

  it('renders ArticlesArchive page on "/articles" route', async () => {
    setup(['/articles']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-articles-archive')).toBeInTheDocument(),
    );
  });

  it('renders SingleArticle page on "/articles/:id" route', async () => {
    setup(['/articles/123']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-single-article')).toBeInTheDocument(),
    );
  });

  it('renders LoginPage on "/admin/login" route', async () => {
    setup(['/admin/login']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-login-page')).toBeInTheDocument(),
    );
  });

  it('renders NotFoundPage for unknown routes', async () => {
    setup(['/non-existent-route']);
    await waitFor(() =>
      expect(screen.getByTestId('mock-not-found-page')).toBeInTheDocument(),
    );
  });

  // --- Admin Routes (ProtectedRoute and AdminRedirect) ---
  describe('AdminRedirect component', () => {
    it('redirects to /admin/login if user is not authenticated', async () => {
      setup(['/admin'], { user: null, loading: false });
      // Expect LoginPage to be rendered due to redirect
      await waitFor(() =>
        expect(screen.getByTestId('mock-login-page')).toBeInTheDocument(),
      );
    });

    it('redirects to /admin/articles if user is authenticated', async () => {
      setup(['/admin'], { user: { uid: 'admin123' }, loading: false });
      // Expect AdminArticles to be rendered due to redirect
      await waitFor(() =>
        expect(screen.getByTestId('mock-admin-articles')).toBeInTheDocument(),
      );
    });

    it('shows SuspenseFallback when authentication is loading', async () => {
      setup(['/admin'], { user: null, loading: true });
      await waitFor(() =>
        expect(
          screen.getByTestId('mock-suspense-fallback'),
        ).toBeInTheDocument(),
      );
    });
  });

  describe('ProtectedRoute component', () => {
    it('renders children for authenticated users', async () => {
      setup(['/admin/articles'], { user: { uid: 'admin123' }, loading: false });
      await waitFor(() =>
        expect(screen.getByTestId('mock-admin-articles')).toBeInTheDocument(),
      );
    });

    it('redirects to /admin/login for unauthenticated users', async () => {
      setup(['/admin/articles'], { user: null, loading: false });
      await waitFor(() =>
        expect(screen.getByTestId('mock-login-page')).toBeInTheDocument(),
      );
    });

    it('shows SuspenseFallback when authentication is loading', async () => {
      setup(['/admin/articles'], { user: null, loading: true });
      await waitFor(() =>
        expect(
          screen.getByTestId('mock-suspense-fallback'),
        ).toBeInTheDocument(),
      );
    });

    it('renders WriteArticle for authenticated users on /admin/articles/new', async () => {
      setup(['/admin/articles/new'], {
        user: { uid: 'admin123' },
        loading: false,
      });
      await waitFor(() =>
        expect(screen.getByTestId('mock-write-article')).toBeInTheDocument(),
      );
    });

    it('renders WriteArticle for authenticated users on /admin/articles/edit/:id', async () => {
      setup(['/admin/articles/edit/456'], {
        user: { uid: 'admin123' },
        loading: false,
      });
      await waitFor(() =>
        expect(screen.getByTestId('mock-write-article')).toBeInTheDocument(),
      );
    });

    it('renders AdminProfile for authenticated users on /admin/profile', async () => {
      setup(['/admin/profile'], { user: { uid: 'admin123' }, loading: false });
      await waitFor(() =>
        expect(screen.getByTestId('mock-admin-profile')).toBeInTheDocument(),
      );
    });
  });
});