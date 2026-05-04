import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBTwyWTwZ7lDHM4bQ1L-qgoR2rXWGQlOhE',
  authDomain: 'smartfund-manager.firebaseapp.com',
  projectId: 'smartfund-manager',
  storageBucket: 'smartfund-manager.firebasestorage.app',
  messagingSenderId: '169594247602',
  appId: '1:169594247602:web:e3ed6548ec3f6615736cab',
};

const getFirebaseApp = () => {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
};

// Keeping your naming: getAuthentication and getDataBase are now functions that return the instance
export const getAuthentication = () => getAuth(getFirebaseApp());
export const getDataBase = () => getFirestore(getFirebaseApp());
