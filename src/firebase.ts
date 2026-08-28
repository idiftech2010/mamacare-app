import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCymgr2m-9-j1TpjTvjRiMhb5fObunS2UU",
  authDomain: "mamacare-524f4.firebaseapp.com",
  projectId: "mamacare-524f4",
  storageBucket: "mamacare-524f4.firebasestorage.app",
  messagingSenderId: "319003957817",
  appId: "1:319003957817:web:44360310b20b33c8674be8",
  measurementId: "G-QJXQ1P06JG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 1. Export standard services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// 3. Helper functions for Auth
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google login error", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  return res.user;
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  await setDoc(doc(db, "users", res.user.uid), {
    uid: res.user.uid,
    email,
    name,
    role: 'user',
    createdAt: new Date().toISOString()
  });
  return res.user;
};