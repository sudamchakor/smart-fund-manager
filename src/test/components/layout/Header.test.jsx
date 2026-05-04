import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Header from '../../../components/layout/Header';
import '@testing-library/jest-dom';
import useMediaQuery from '@mui/material/useMediaQuery';

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

// Mock react-redux hooks
const mockUseSelector = jest.fn();
const mockUseDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useSelector: (selector) => mockUseSelector(selector),
  useDispatch: () => mockUseDispatch,
}));

// Mock notistack
const mockEnqueueSnackbar = jest.fn();
jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar }),
}));

// Mock redux-persist storage
jest.mock('redux-persist/lib/storage', () => ({
  removeItem: jest.fn(),
}));
const mockStorage = require('redux-persist/lib/storage');

// Mock xlsx library
const mockJsonToSheet = jest.fn();
const mockBookNew = jest.fn();
const mockBookAppendSheet = jest.fn();
const mockWriteFile = jest.fn();
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: mockJsonToSheet,
    book_new: mockBookNew,
    book_append_sheet: mockBookAppendSheet,
  },
  writeFile: mockWriteFile,
}));

// Mock Material-UI useMediaQuery
jest.mock('@mui/material/useMediaQuery');

// Mock window.print and window.confirm
const mockWindowPrint = jest.fn();
const mockWindowConfirm = jest.fn();
const mockWindowLocationReload = jest.fn();
const mockLocalStorageClear = jest.fn();

Object.defineProperty(window, 'print', { value: mockWindowPrint });
Object.defineProperty(window, 'confirm', { value: mockWindowConfirm });
Object.defineProperty(window, 'location', {
  value: { reload: mockWindowLocationReload },
  writable: true,
});
Object.defineProperty(window, 'localStorage', {
  value: { clear: mockLocalStorageClear },
  writable: true,
});

const mockStore = configureStore([]);
const theme = createTheme(); // Create a basic theme for ThemeProvider

describe('Header Component', () => {
  const defaultStoreState = {
    emi: {
      themeMode: 'light',
      currency: '₹',
      autoSave: true,
    },
    profile: {
      isAuthenticated: false,
      user: null,
    },
    emiCalculator: {
      loanAmount: 100000,
      interestRate: 10,
      loanTenure: 120,
      prepayments: [],
      emi: 1000,
      totalInterest: 50000,
      totalPayment: 150000,
      schedule: [{ month: 1, date: 'Jan 2025' }],
    },
  };

  const renderComponent = (initialPath = '/', isMobile = false) => {
    mockUseLocation.mockReturnValue({ pathname: initialPath });
    useMediaQuery.mockReturnValue(isMobile);

    mockUseSelector.mockImplementation((selector) => {
      if (selector.name === 'selectCalculatedValues') {
        return defaultStoreState.emiCalculator;
      }
      return selector(defaultStoreState);
    });

    return render(
      <Provider store={mockStore(defaultStoreState)}>
        <ThemeProvider theme={theme}>
          <Header />
        </ThemeProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowConfirm.mockReturnValue(true); // Default to confirming actions
  });

  // --- Desktop View Tests ---
  describe('Desktop View', () => {
    it('renders app title and main navigation buttons', () => {
      renderComponent('/');
      expect(screen.getByText('SmartFund Manager')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Home Loan EMI' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Articles' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Help & FAQ' })).toBeInTheDocument();
      expect(screen.getByLabelText('Account Circle')).toBeInTheDocument(); // Profile icon
      expect(screen.queryByLabelText('Menu')).not.toBeInTheDocument(); // No mobile menu icon
    });

    it('navigates to home when app title is clicked', () => {
      renderComponent('/calculator');
      fireEvent.click(screen.getByText('SmartFund Manager'));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('opens Calculators dropdown menu when "Home Loan EMI" button is clicked', () => {
      renderComponent('/calculator');
      fireEvent.click(screen.getByRole('button', { name: 'Home Loan EMI' }));
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByText('Credit Card EMI')).toBeInTheDocument();
    });

    it('navigates to selected calculator when menu item is clicked', () => {
      renderComponent('/calculator');
      fireEvent.click(screen.getByRole('button', { name: 'Home Loan EMI' }));
      fireEvent.click(screen.getByText('Investment'));
      expect(mockNavigate).toHaveBeenCalledWith('/investment');
    });

    it('highlights the current calculator in the dropdown', () => {
      renderComponent('/investment/sip');
      fireEvent.click(screen.getByRole('button', { name: 'Investment' }));
      const investmentMenuItem = screen.getByText('Investment').closest('.MuiMenuItem-root');
      expect(investmentMenuItem).toHaveAttribute('aria-selected', 'true');
    });

    it('navigates to Articles page when "Articles" button is clicked', () => {
      renderComponent('/');
      fireEvent.click(screen.getByRole('button', { name: 'Articles' }));
      expect(mockNavigate).toHaveBeenCalledWith('/articles');
    });

    it('opens Export menu when "Export" button is clicked', () => {
      renderComponent('/calculator'); // Path where export is shown
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
      expect(screen.getByText('Download Excel')).toBeInTheDocument();
    });

    it('calls window.print when "Download PDF" is clicked', () => {
      renderComponent('/calculator');
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      fireEvent.click(screen.getByText('Download PDF'));
      expect(mockWindowPrint).toHaveBeenCalledTimes(1);
    });

    it('calls XLSX functions when "Download Excel" is clicked with data', async () => {
      renderComponent('/calculator');
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      fireEvent.click(screen.getByText('Download Excel'));
      await waitFor(() => {
        expect(mockJsonToSheet).toHaveBeenCalledWith(defaultStoreState.emiCalculator.schedule);
        expect(mockBookNew).toHaveBeenCalledTimes(1);
        expect(mockBookAppendSheet).toHaveBeenCalledTimes(1);
        expect(mockWriteFile).toHaveBeenCalledWith(expect.any(Object), 'SmartFund_Export.xlsx');
      });
    });

    it('shows snackbar if "Download Excel" is clicked with no schedule data', async () => {
      mockUseSelector.mockImplementation((selector) => {
        if (selector.name === 'selectCalculatedValues') {
          return { schedule: [] }; // No schedule data
        }
        return selector(defaultStoreState);
      });
      renderComponent('/calculator');
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      fireEvent.click(screen.getByText('Download Excel'));
      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith('No data to export', { variant: 'info' });
        expect(mockWriteFile).not.toHaveBeenCalled();
      });
    });

    it('navigates to FAQ page when "Help & FAQ" icon button is clicked', () => {
      renderComponent('/');
      fireEvent.click(screen.getByLabelText('Help & FAQ'));
      expect(mockNavigate).toHaveBeenCalledWith('/faq');
    });

    it('opens Profile dropdown menu when Profile icon is clicked', () => {
      renderComponent('/');
      fireEvent.click(screen.getByLabelText('Account Circle'));
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByText('Personal Profile')).toBeInTheDocument();
      expect(screen.getByText('Reset All Data')).toBeInTheDocument();
    });

    it('navigates to profile tabs when menu items are clicked', () => {
      renderComponent('/');
      fireEvent.click(screen.getByLabelText('Account Circle'));
      fireEvent.click(screen.getByText('Financial Goals'));
      expect(mockNavigate).toHaveBeenCalledWith('/profile?tab=goals');
    });

    it('calls handleResetData when "Reset All Data" is clicked and confirmed', () => {
      renderComponent('/');
      fireEvent.click(screen.getByLabelText('Account Circle'));
      fireEvent.click(screen.getByText('Reset All Data'));
      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockUseDispatch).toHaveBeenCalledWith(expect.any(Object)); // resetEmiState action
      expect(mockStorage.removeItem).toHaveBeenCalledWith('persist:app_v1');
      expect(mockLocalStorageClear).toHaveBeenCalledTimes(1);
      expect(mockWindowLocationReload).toHaveBeenCalledTimes(1);
    });

    it('does not call handleResetData when "Reset All Data" is clicked and cancelled', () => {
      mockWindowConfirm.mockReturnValue(false); // User cancels
      renderComponent('/');
      fireEvent.click(screen.getByLabelText('Account Circle'));
      fireEvent.click(screen.getByText('Reset All Data'));
      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockUseDispatch).not.toHaveBeenCalled();
      expect(mockStorage.removeItem).not.toHaveBeenCalled();
      expect(mockLocalStorageClear).not.toHaveBeenCalled();
      expect(mockWindowLocationReload).not.toHaveBeenCalled();
    });

    it('does not show Export button on non-allowed paths', () => {
      renderComponent('/faq'); // FAQ is not in allowed paths
      expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    });
  });

  // --- Mobile View Tests ---
  describe('Mobile View', () => {
    it('renders mobile menu icon and app title, hides desktop nav', () => {
      renderComponent('/', true); // isMobile = true
      expect(screen.getByLabelText('Menu')).toBeInTheDocument();
      expect(screen.getByText('SmartFund Manager')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Home Loan EMI' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Articles' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Help & FAQ')).not.toBeInTheDocument();
    });

    it('opens and closes the Drawer when menu icon is clicked', () => {
      renderComponent('/', true);
      const menuButton = screen.getByLabelText('Menu');
      fireEvent.click(menuButton);
      expect(screen.getByRole('presentation', { name: 'Floating Action Menu' })).toBeInTheDocument(); // Drawer is a presentation role
      expect(screen.getByText('SmartFund Manager')).toBeInTheDocument(); // Drawer header

      fireEvent.click(menuButton); // Click again to close
      expect(screen.queryByRole('presentation', { name: 'Floating Action Menu' })).not.toBeInTheDocument();
    });

    it('navigates to home from drawer when app title is clicked', () => {
      renderComponent('/calculator', true);
      fireEvent.click(screen.getByLabelText('Menu'));
      fireEvent.click(screen.getByText('SmartFund Manager'));
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(screen.queryByRole('presentation', { name: 'Floating Action Menu' })).not.toBeInTheDocument(); // Drawer should close
    });

    it('toggles Calculators collapse in drawer', () => {
      renderComponent('/', true);
      fireEvent.click(screen.getByLabelText('Menu'));
      const calculatorsButton = screen.getByRole('button', { name: 'Calculators' });
      fireEvent.click(calculatorsButton); // Open
      expect(screen.getByText('Credit Card EMI')).toBeInTheDocument();
      fireEvent.click(calculatorsButton); // Close
      expect(screen.queryByText('Credit Card EMI')).not.toBeInTheDocument();
    });

    it('navigates to selected calculator from drawer', () => {
      renderComponent('/', true);
      fireEvent.click(screen.getByLabelText('Menu'));
      fireEvent.click(screen.getByRole('button', { name: 'Calculators' })); // Open collapse
      fireEvent.click(screen.getByText('Investment'));
      expect(mockNavigate).toHaveBeenCalledWith('/investment');
      expect(screen.queryByRole('presentation', { name: 'Floating Action Menu' })).not.toBeInTheDocument(); // Drawer should close
    });

    it('navigates to Articles from drawer', () => {
      renderComponent('/', true);
      fireEvent.click(screen.getByLabelText('Menu'));
      fireEvent.click(screen.getByRole('button', { name: 'Articles' }));
      expect(mockNavigate).toHaveBeenCalledWith('/articles');
    });

    it('toggles My Account collapse in drawer', () => {
      renderComponent('/', true);
      fireEvent.click(screen.getByLabelText('Menu'));
      const myAccountButton = screen.getByRole('button', { name: 'My Account' });
      fireEvent.click(myAccountButton); // Open
      expect(screen.getByText('Profile Details')).toBeInTheDocument();
      fireEvent.click(myAccountButton); // Close
      expect(screen.queryByText('Profile Details')).not.toBeInTheDocument();
    });

    it('navigates to profile tabs from drawer', () => {
      renderComponent('/', true);
      fireEvent.click(screen.getByLabelText('Menu'));
      fireEvent.click(screen.getByRole('button', { name: 'My Account' })); // Open collapse
      fireEvent.click(screen.getByText('Wealth Dashboard'));
      expect(mockNavigate).toHaveBeenCalledWith('/profile?tab=wealth');
      expect(screen.queryByRole('presentation', { name: 'Floating Action Menu' })).not.toBeInTheDocument(); // Drawer should close
    });

    it('navigates to Settings from drawer', () => {
      renderComponent('/', true);
      fireEvent.click(screen.getByLabelText('Menu'));
      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    it('navigates to Help & FAQ from drawer', () => {
      renderComponent('/', true);
      fireEvent.click(screen.getByLabelText('Menu'));
      fireEvent.click(screen.getByRole('button', { name: 'Help & FAQ' }));
      expect(mockNavigate).toHaveBeenCalledWith('/faq');
    });

    it('calls handleResetData from drawer when "Clear All Data" is clicked and confirmed', () => {
      renderComponent('/', true);
      fireEvent.click(screen.getByLabelText('Menu'));
      fireEvent.click(screen.getByRole('button', { name: 'Clear All Data' }));
      expect(mockWindowConfirm).toHaveBeenCalledTimes(1);
      expect(mockUseDispatch).toHaveBeenCalledWith(expect.any(Object)); // resetEmiState action
      expect(mockStorage.removeItem).toHaveBeenCalledWith('persist:app_v1');
      expect(mockLocalStorageClear).toHaveBeenCalledTimes(1);
      expect(mockWindowLocationReload).toHaveBeenCalledTimes(1);
    });
  });
});