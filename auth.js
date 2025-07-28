// auth.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getCurrentUserData, isUserAdmin } from './users.js';

let currentUser = null;  // nova variável para guardar usuário atual

// Listener global para mudanças de autenticação
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    await updateUserDisplay();
    // Se estiver na página login e o usuário já está logado, redireciona para home
    if (window.location.pathname.includes('login.html')) {
      window.location.href = 'index.html';
    }
  } else {
    clearUserDisplay();
    // Se não estiver na página login, redireciona para login
    if (!window.location.pathname.includes('login.html')) {
      redirectToLogin();
    }
  }
});

// Verificação de autenticação básica
export async function checkAuth() {
  return currentUser;
}

// Verificação específica para administradores
export async function checkAdminAuth() {
  const user = await checkAuth();
  if (!user || !(await isUserAdmin())) {
    showAccessDenied();
    redirectToHome();
    return false;
  }
  return true;
}

// Atualiza a exibição do usuário na navbar
async function updateUserDisplay() {
  try {
    const userData = await getCurrentUserData();
    const userDisplay = document.getElementById('currentUserDisplay');
    const adminMenu = document.getElementById('adminMenu');
    
    if (userDisplay) {
      userDisplay.textContent = userData?.fullName || 'Usuário';
    }
    
    if (adminMenu) {
      adminMenu.style.display = (await isUserAdmin()) ? 'block' : 'none';
    }
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
  }
}

function clearUserDisplay() {
  const userDisplay = document.getElementById('currentUserDisplay');
  const adminMenu = document.getElementById('adminMenu');
  
  if (userDisplay) userDisplay.textContent = '';
  if (adminMenu) adminMenu.style.display = 'none';
}

// Logout com tratamento de erros
export async function logout() {
  try {
    await signOut(auth);
    clearUserDisplay();
    redirectToLogin();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    alert('Ocorreu um erro ao tentar sair do sistema');
  }
}

// Redirecionamentos
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
    alert(' Restrito a Administradores');
  }
}

// Configura o listener de logout quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  // Listener para o botão de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // Não precisa mais chamar checkAuth() aqui, pois o onAuthStateChanged está globalmente ativo
});
