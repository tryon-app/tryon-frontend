// Import the functions you need from the SDKs you need
import * as firebase from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyAxruQ97Ex7iAj1FxFYyQZsYKOuiCI_sTA",
  authDomain: "tryon-e6b89.firebaseapp.com",
  projectId: "tryon-e6b89",
  storageBucket: "tryon-e6b89.firebasestorage.app",
  messagingSenderId: "461101874435",
  appId: "1:461101874435:web:b5e570d26ebb5917fabd36",
  measurementId: "G-SSV2SSXYRL"
};

export const initialize = () => {
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  return messaging;
};

export const isFirebaseSupported = async () => {
  return await isSupported();
};
