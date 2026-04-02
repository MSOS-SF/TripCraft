import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    deleteDoc, 
    serverTimestamp,
    onSnapshot,
    getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Auth Providers
const googleProvider = new GoogleAuthProvider();

// Operation Types for Error Handling
export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

/**
 * Standardized Firestore Error Handler
 */
export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || 'anonymous',
      email: auth.currentUser?.email || 'none',
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth Helpers
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Sync user profile to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp()
        }, { merge: true });
        
        return user;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const logout = () => signOut(auth);

// Trip Helpers
export const saveTrip = async (tripData, itinerary) => {
    if (!auth.currentUser) throw new Error("Must be logged in to save trips");
    
    const tripId = `${auth.currentUser.uid}_${Date.now()}`;
    const path = `trips/${tripId}`;
    
    try {
        await setDoc(doc(db, 'trips', tripId), {
            ...tripData,
            uid: auth.currentUser.uid,
            itinerary,
            createdAt: serverTimestamp()
        });
        return tripId;
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
    }
};

export const getSavedTrips = (callback) => {
    if (!auth.currentUser) return () => {};
    
    const path = 'trips';
    const q = query(
        collection(db, path), 
        where('uid', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
        const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(trips);
    }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
    });
};

export const deleteTrip = async (tripId) => {
    const path = `trips/${tripId}`;
    try {
        await deleteDoc(doc(db, 'trips', tripId));
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
    }
};
