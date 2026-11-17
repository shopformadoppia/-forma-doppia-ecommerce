

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFG89ZrF_SfNJfyAfX5IHZtMPYcCQY_Uo",
  authDomain: "forma-doppia.firebaseapp.com",
  projectId: "forma-doppia",
  storageBucket: "forma-doppia.firebasestorage.app",
  messagingSenderId: "785041343",
  appId: "1:785041343:web:d4b5d159542642aa78030a",
  measurementId: "G-T29DY5VE3B"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
