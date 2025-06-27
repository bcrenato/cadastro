// auth-guard.js
import { auth } from './firebase-config.js';

export const initializeAuthGuard = () => {
  auth.onAuthStateChanged((user) => {
    const currentPath = window.location.pathname.split('/').pop();
    
    if (!user && currentPath !== 'login.html') {
      // Redireciona para login se não estiver autenticado
      window.location.href = 'login.html';
    } else if (user && currentPath === 'login.html') {
      // Redireciona para index se já estiver autenticado
      window.location.href = 'index.html';
    }
    
    // Atualiza a UI baseada no estado de autenticação
    updateAuthUI(user);
  });
};

const updateAuthUI = (user) => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.style.display = user ? 'block' : 'none';
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const logout = async () => {
  try {
    await auth.signOut();
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};
