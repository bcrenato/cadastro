// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ✅ Exportando firebaseConfig para import por login.html
export const firebaseConfig = {
  apiKey: "AIzaSyCv6pzl34tyPTARtQeA-xU",
  authDomain: "cadastro-igreja-23042.firebaseapp.com",
  databaseURL: "https://cadastro-igreja-23042-default-rtdb.firebaseio.com",
  projectId: "cadastro-igreja-23042",
  messagingSenderId: "977906864836",
  appId: "1:977906864836:web:1a21a29f4b941ac5aeaf91"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta instâncias
export const db = getDatabase(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
