import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithCustomToken,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  updateProfile,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  isAuthenticating: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginWithNaver: () => Promise<void>;
  loginWithKakao: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, pass: string, name: string, phone: string) => Promise<User>;
  loginEmailPassword: (email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const isAdmin = user?.email === 'aeleekang27@gmail.com';
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('onAuthStateChanged fired, user:', firebaseUser?.email);
      setUser(firebaseUser);
      setLoading(false);
    });

    // Safety timeout: if auth hasn't resolved in 5 seconds, clear loading
    const timer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn('Auth state check timed out after 5s');
          return false;
        }
        return prev;
      });
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Separate effect for syncing user data to Firestore to prevent blocking the loading state
  useEffect(() => {
    if (user) {
      const syncUser = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              provider: user.providerData[0]?.providerId || 'custom',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }, { merge: true });
            console.log('Created new user profile in Firestore');
          } else {
            await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
            console.log('Updated existing user profile in Firestore');
          }
        } catch (error) {
          console.error('Error syncing user with Firestore:', error);
        }
      };
      syncUser();
    }
  }, [user]);

  const signup = async (email: string, pass: string, name: string, phone: string) => {
    setIsAuthenticating(true);
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(newUser, { displayName: name });
      
      const userRef = doc(db, 'users', newUser.uid);
      await setDoc(userRef, {
        uid: newUser.uid,
        email,
        displayName: name,
        phone,
        provider: 'email',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return newUser;
    } catch (error) {
      console.error('Signup Error:', error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loginWithGoogle = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    console.log('Google Login Clicked');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      console.log('Calling signInWithPopup');
      const result = await signInWithPopup(auth, provider);
      console.log('signInWithPopup Result:', result.user.email);
    } catch (error: any) {
      console.error('Google Login Error:', error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loginWithApple = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Apple Login Error:', error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loginWithNaver = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const res = await fetch('/api/auth/naver/url');
      const { url } = await res.json();
      openOAuthPopup(url);
    } catch (error) {
      console.error('Naver Login Error:', error);
      setIsAuthenticating(false);
      throw error;
    }
  };

  const loginWithKakao = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const res = await fetch('/api/auth/kakao/url');
      const { url } = await res.json();
      openOAuthPopup(url);
    } catch (error) {
      console.error('Kakao Login Error:', error);
      setIsAuthenticating(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const loginEmailPassword = async (email: string, pass: string) => {
    setIsAuthenticating(true);
    try {
      await firebaseSignInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Email Login Error:', error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const openOAuthPopup = (url: string) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      url,
      'oauth-popup',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      alert('팝업 확인을 허용해 주세요.');
      setIsAuthenticating(false);
      return;
    }

    const messageHandler = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler);
        try {
          await signInWithCustomToken(auth, event.data.token);
        } catch (error) {
          console.error('Firebase Custom Token Login Error:', error);
        } finally {
          setIsAuthenticating(false);
        }
      } else if (event.data?.type === 'OAUTH_AUTH_CANCEL') {
        window.removeEventListener('message', messageHandler);
        setIsAuthenticating(false);
      }
    };

    window.addEventListener('message', messageHandler);

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        window.removeEventListener('message', messageHandler);
        setIsAuthenticating(false);
      }
    }, 1000);
  };

  return (
    <AuthContext.Provider value={{
      user, isAdmin, loading, isAuthenticating, 
      loginWithGoogle, loginWithApple, loginWithNaver, loginWithKakao, 
      logout, signup, loginEmailPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
