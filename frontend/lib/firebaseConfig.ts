// firebaseConfig.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDx_QNeZfJQO9ONqXWK1aheVXv7AFLgqDQ",
  authDomain: "deepgr-f7e6c.firebaseapp.com",
  databaseURL: "https://deepgr-f7e6c-default-rtdb.firebaseio.com",
  projectId: "deepgr-f7e6c",
  storageBucket: "deepgr-f7e6c.appspot.com",
  messagingSenderId: "289397234095",
  appId: "1:289397234095:web:1f19e37d3b44a3ba5af75a",
  measurementId: "G-DY6PZJZQFC",
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);
const auth = getAuth(app);
// Initialize Analytics only if the environment supports it (e.g., browser)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("Analytics initialized.");
    } else {
      console.warn("Analytics not supported in this environment.");
    }
  });
}

export { auth, db };
