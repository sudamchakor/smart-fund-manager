import {
  Calculate as CalculateIcon,
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as TaxIcon,
  Payments as PersonalLoanIcon,
} from '@mui/icons-material';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getDataBase } from '../../firebaseConfig';

export const CALCULATORS = [
  { path: '/calculator', label: 'Home Loan EMI', icon: CalculateIcon },
  {
    path: '/credit-card-emi',
    label: 'Credit Card EMI',
    icon: CreditCardIcon,
  },
  { path: '/investment', label: 'Investment', icon: TrendingUpIcon },
  {
    path: '/personal-loan',
    label: 'Personal Loan',
    icon: PersonalLoanIcon,
  },
  { path: '/tax-calculator', label: 'Tax Calculator', icon: TaxIcon },
];

export const isExportPage = (pathname) =>
  ['/calculator', '/profile', '/tax-calculator'].some((path) =>
    pathname.startsWith(path),
  );

export const isCloudPage = (pathname) =>
  ['/calculator', '/profile'].some((path) => pathname.startsWith(path));

export const exportSchedule = async ({ format, calculatedValues, enqueueSnackbar }) => {
  if (format === 'pdf') {
    window.print();
    return;
  }

  if (!calculatedValues?.schedule || calculatedValues.schedule.length === 0) {
    enqueueSnackbar('No data to export', { variant: 'info' });
    return;
  }

  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(calculatedValues.schedule);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
  XLSX.writeFile(wb, 'SmartFund_Export.xlsx');
};

export const saveUserDataToFirestore = async ({
  user,
  emiState,
  profileState,
  enqueueSnackbar,
}) => {
  if (!user) {
    enqueueSnackbar('Sign in to save data', { variant: 'warning' });
    return;
  }

  try {
    const db = getDataBase();
    const userDocRef = doc(db, 'users', user.uid);

    await setDoc(
      userDocRef,
      {
        emiData: emiState,
        profileData: profileState,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    enqueueSnackbar('EMI and profile saved to Firestore', {
      variant: 'success',
    });
  } catch (error) {
    console.error('Error saving user data to Firestore:', error);
    throw error;
  }
};

export const loadUserDataFromFirestore = async ({ user, enqueueSnackbar }) => {
  if (!user) {
    enqueueSnackbar('Sign in to load data', { variant: 'warning' });
    return null;
  }

  const db = getDataBase();
  const userDocRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userDocRef);

  if (!docSnap.exists()) {
    enqueueSnackbar('No saved cloud data found for your account', {
      variant: 'info',
    });
    return null;
  }

  const data = docSnap.data();
  if (!data?.emiData && !data?.profileData) {
    enqueueSnackbar('No saved EMI or profile data found', {
      variant: 'info',
    });
    return null;
  }

  enqueueSnackbar('Loaded EMI and profile data from Firestore', {
    variant: 'success',
  });

  return {
    profileData: data.profileData ?? null,
    emiData: data.emiData ?? null,
  };
};
