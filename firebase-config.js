// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ✅ Exportando firebaseConfig para import por login.html
const firebaseConfig = {
  apiKey: "AIzaSyCv6pzl34tyPTARtGxV6g2AJfkrtQeA-xU",
  authDomain: "cadastro-igreja-23042.firebaseapp.com",
  databaseURL: "https://cadastro-igreja-23042-default-rtdb.firebaseio.com",
  projectId: "cadastro-igreja-23042",
  storageBucket: "cadastro-igreja-23042.firebasestorage.app",
  messagingSenderId: "977906864836",
  appId: "1:977906864836:web:1a21a29f4b941ac5aeaf91"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database(); // Agora usando Realtime Database

export { app, auth, db, firebaseConfig };
