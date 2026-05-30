// ============================================================
// WINX DIGITAL SOLUTIONS — Firebase Configuration
// ============================================================
// SETUP INSTRUCTIONS:
//   1. Go to https://console.firebase.google.com
//   2. Create a new project named "winx-digital-solutions"
//   3. Register a Web App (</> icon)
//   4. Copy the firebaseConfig object below and paste it here
//   5. Replace all "YOUR_..." placeholders with your actual values
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCdLPygpThV48T9QKqec9yW4MwB9Yvt5xc",
  authDomain: "winx-digital-solutions.firebaseapp.com",
  projectId: "winx-digital-solutions",
  storageBucket: "winx-digital-solutions.firebasestorage.app",
  messagingSenderId: "182414908292",
  appId: "1:182414908292:web:642edd19808216b2f8dbd1"
};

// Initialize Firebase (compat SDK for use with AngularJS)
firebase.initializeApp(firebaseConfig);

// Expose globally so all scripts can access
const db   = firebase.firestore();
const auth = firebase.auth ? firebase.auth() : null;
