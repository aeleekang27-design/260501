import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, browserSessionPersistence, browserPopupRedirectResolver } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use initializeAuth with explicit persistence to avoid internal assertion failures 
// like 'Pending promise was never set' which can occur with indexedDB in iframes.
// We must also include browserPopupRedirectResolver to avoid auth/argument-error when using popups.
export const auth = initializeAuth(app, {
  persistence: [browserLocalPersistence, browserSessionPersistence],
  popupRedirectResolver: browserPopupRedirectResolver
});

// Use initializeFirestore with settings to improve connectivity
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // This fixes 'Could not reach Cloud Firestore backend' in many proxy/iframe environments
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId);

export default app;
