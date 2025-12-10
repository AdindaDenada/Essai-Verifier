// Import Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBJOcBuL3g3V4bqMZQTLr2BubX1DVCzSjU",
  authDomain: "essayverifier-5bfd9.firebaseapp.com",
  projectId: "essayverifier-5bfd9",
  storageBucket: "essayverifier-5bfd9.firebasestorage.app",
  messagingSenderId: "576166535548",
  appId: "1:576166535548:web:a0b0dbe61bceadbdfd44f9",
  measurementId: "G-0ZEG5RQHKJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export auth & firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
