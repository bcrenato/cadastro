// auth.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Verifica o estado de autenticação
export function checkAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        // Se não estiver autenticado, redireciona para login
        if (!window.location.pathname.includes('login.html')) {
          window.location.href = 'login.html';
        }
        resolve(null);
      }
    });
  });
}

// Função de logout
export async function logout() {
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
}

// Adiciona o listener de logout ao botão (se existir)
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
