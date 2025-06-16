// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "xxxxxxx",
  appId: "xxxxxxx",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, RecaptchaVerifier };
