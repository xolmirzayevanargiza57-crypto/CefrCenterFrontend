// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAhb2gZY4pZ-DPJ3v1j3Bf8L8POtzQlZyM",
  authDomain: "cefrcenter-a22f3.firebaseapp.com",
  projectId: "cefrcenter-a22f3",
  storageBucket: "cefrcenter-a22f3.firebasestorage.app",
  messagingSenderId: "19501884732",
  appId: "1:19501884732:web:ecbca22cdb4102395e6a39",
  measurementId: "G-4N0XZGFJMF"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Set persistence once at startup
setPersistence(auth, browserLocalPersistence);