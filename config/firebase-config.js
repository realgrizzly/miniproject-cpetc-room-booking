// Firebase App
import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

// Firebase Authentication
import { getAuth } from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

// Cloud Firestore
import { getFirestore } from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfLvMrqlUFiuBxDfqORPkaaU_iZjPGHIA",
  authDomain: "project-room-booking.firebaseapp.com",
  projectId: "project-room-booking",
  storageBucket: "project-room-booking.firebasestorage.app",
  messagingSenderId: "781182790396",
  appId: "1:781182790396:web:c18036ecd290037d4e0579",
  measurementId: "G-LVZD0TZHK9"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Firebase Authentication
const auth = getAuth(app);


// Cloud Firestore
const db = getFirestore(app);


export { app, auth, db };