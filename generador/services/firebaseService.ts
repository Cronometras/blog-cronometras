// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from "firebase/auth";
import { 
  getDatabase, 
  ref, 
  set, 
  remove,
  onValue,
  off,
  push,
  update
} from "firebase/database";
import type { WordPressCredentials } from '../types';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARhp5jJYMs9CJaBRMAC4he8SsACYJNFxg",
  authDomain: "generador-de-articulos-d7319.firebaseapp.com",
  projectId: "generador-de-articulos-d7319",
  storageBucket: "generador-de-articulos-d7319.firebasestorage.app",
  messagingSenderId: "33524981407",
  appId: "1:33524981407:web:0051a2ba30acab71dbccaa",
  measurementId: "G-HEXBGKYQRH",
  databaseURL: "https://generador-de-articulos-d7319-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export const signUpWithEmail = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
}

export const signInWithEmail = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
}

export const signOut = () => {
    return firebaseSignOut(auth);
}

export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
}

// --- Realtime Database Functions for Credentials ---

const getCredentialsRef = (userId: string) => ref(db, `users/${userId}/credentials`);

export const listenToCredentials = (userId: string, callback: (credentials: WordPressCredentials[]) => void) => {
    const credentialsRef = getCredentialsRef(userId);
    const listener = onValue(credentialsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const credentialsArray = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            callback(credentialsArray);
        } else {
            callback([]);
        }
    });

    // Return a function to unsubscribe
    return () => off(credentialsRef, 'value', listener);
};

export const saveCredential = (userId: string, credential: Omit<WordPressCredentials, 'id'>) => {
    const credentialsListRef = getCredentialsRef(userId);
    const newCredentialRef = push(credentialsListRef);
    return set(newCredentialRef, credential).then(() => newCredentialRef.key);
}

export const updateCredential = (userId: string, credential: WordPressCredentials) => {
    const { id, ...data } = credential;
    const credentialRef = ref(db, `users/${userId}/credentials/${id}`);
    return update(credentialRef, data);
}

export const deleteCredential = (userId: string, credentialId: string) => {
    const credentialRef = ref(db, `users/${userId}/credentials/${credentialId}`);
    return remove(credentialRef);
}