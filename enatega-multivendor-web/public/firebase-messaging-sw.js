/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/9.4.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.4.0/firebase-messaging-compat.js"
);
const app = firebase.initializeApp({
  apiKey: "AIzaSyAxruQ97Ex7iAj1FxFYyQZsYKOuiCI_sTA",
  authDomain: "tryon-e6b89.firebaseapp.com",
  projectId: "tryon-e6b89",
  storageBucket: "tryon-e6b89.firebasestorage.app",
  messagingSenderId: "461101874435",
  appId: "1:461101874435:web:b5e570d26ebb5917fabd36",
  measurementId: "G-SSV2SSXYRL"
});
const messaging = firebase.messaging(app);

messaging.onBackgroundMessage(function (payload) {
  // Customize notification here
  const { title, body } = payload.notification;
  const notificationOptions = {
    body,
    icon: "/favicon.png",
  };

  // eslint-disable-next-line no-restricted-globals
  self.registration.showNotification(title, notificationOptions);
});
