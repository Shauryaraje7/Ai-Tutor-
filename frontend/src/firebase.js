import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGPIpF_dTE4knGtnumBI5H6KT_2nEU5ls",
  authDomain: "study-buddy-77ce3.firebaseapp.com",
  projectId: "study-buddy-77ce3",
  storageBucket: "study-buddy-77ce3.firebasestorage.app", // Note: corrected to "firebasestorage.app" domain
  messagingSenderId: "126306071482",
  appId: "1:126306071482:web:69d1880d4235afac4ba383",
  measurementId: "G-9FNG1ZMXY4" // Optional, only if you enabled Google Analytics
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);