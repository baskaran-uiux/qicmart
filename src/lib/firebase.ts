import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2w5xH5ZHGAMuSidHzyR5sj1yN5Uh_sqQ",
  authDomain: "qicmart-1c98a.firebaseapp.com",
  projectId: "qicmart-1c98a",
  storageBucket: "qicmart-1c98a.firebasestorage.app",
  messagingSenderId: "342693204568",
  appId: "1:342693204568:web:b84c7e6536a7909ddc702d",
  measurementId: "G-0CFRZ3H7JX"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
