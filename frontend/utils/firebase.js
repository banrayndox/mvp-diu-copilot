// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ai-agent-4b1d2.firebaseapp.com",
  projectId: "ai-agent-4b1d2",
  storageBucket: "ai-agent-4b1d2.firebasestorage.app",
  messagingSenderId: "609037640565",
  appId: "1:609037640565:web:9f87c277e1b169e0d0a93c",
  measurementId: "G-KSREQBP3JN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();