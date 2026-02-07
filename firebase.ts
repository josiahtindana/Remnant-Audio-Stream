
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBqavfVrQ8D2O8MZC8GH_Fq6GBsdzzpaoM",
  authDomain: "remnant-audio-stream.firebaseapp.com",
  projectId: "remnant-audio-stream",
  storageBucket: "remnant-audio-stream.firebasestorage.app",
  messagingSenderId: "761621194529",
  appId: "1:761621194529:web:2d76d238cfa565db5d0060",
  measurementId: "G-58KBC7XCJ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getDatabase(app);
