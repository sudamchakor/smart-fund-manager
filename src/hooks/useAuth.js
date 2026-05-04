import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuthentication, getDataBase } from '../firebaseConfig'; // Keeping your names

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Call getAuthentication() as a function here
    const unsubscribe = onAuthStateChanged(
      getAuthentication(),
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const manageAuthorProfile = async () => {
      if (user) {
        // Call getDataBase() as a function here
        const profileRef = doc(getDataBase(), 'authorProfiles', user.uid);
        const profileData = {
          uid: user.uid,
          displayName: user.displayName || user.email,
          email: user.email,
          photoURL: user.photoURL || null,
          lastLogin: serverTimestamp(),
          providerData: user.providerData || [],
        };
        try {
          await setDoc(profileRef, profileData, { merge: true });
          console.log('Author profile managed in Firestore');
        } catch (error) {
          console.error('Error managing author profile:', error);
        }
      }
    };

    if (user) {
      manageAuthorProfile();
    }
  }, [user]);

  const firebaseLogout = async () => {
    setLoading(true);
    try {
      // Call getAuthentication() as a function here
      await signOut(getAuthentication());
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout: firebaseLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
