import { getCurrentUserData, isUserAdmin } from './users.js';

// Verificação de autenticação
export async function checkAuth() {
  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    redirectToLogin();
    return null;
  }
  
  try {
    const userData = await getCurrentUserData(userId);
    await updateUserDisplay(userData);
    return userData;
  } catch (error) {
    redirectToLogin();
    return null;
  }
}

// Verificação de admin
export async function checkAdminAuth() {
  const userId = sessionStorage.getItem('userId');
  if (!userId || !(await isUserAdmin(userId))) {
    showAccessDenied();
    redirectToHome();
    return false;
  }
  return true;
}

// Atualiza a navbar
async function updateUserDisplay(userData) {
  try {
    const userDisplay = document.getElementById('currentUserDisplay');
    const adminMenu = document.getElementById('adminMenu');
    
    if (userDisplay) {
      userDisplay.textContent = userData?.fullName || userData?.username || 'Usuário';
    }
    
    if (adminMenu) {
      adminMenu.style.display = userData?.isAdmin ? 'block' : 'none';
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
  }
}

// Funções auxiliares
function redirectToLogin() {
  if (!window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
  }
}

function redirectToHome() {
  window.location.href = 'index.html';
}

function showAccessDenied() {
  if (!window.location.pathname.includes('login.html')) {
    alert('Acesso restrito a administradores');
  }
}

// Configura eventos
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('userId');
      redirectToLogin();
    });
  }
  
  if (!window.location.pathname.includes('login.html')) {
    checkAuth();
  }
});
