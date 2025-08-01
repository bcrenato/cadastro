// auth.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getCurrentUserData, getUserRole } from './users.js';


// Verificação de autenticação básica
export async function checkAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Atualiza a navbar com o nome do usuário
        await updateUserDisplay();
        resolve(user);
      } else {
        redirectToLogin();
        resolve(null);
      }
    });
  });
}


export async function checkRoleAuth(allowedRoles) {
  const user = await checkAuth();
  if (!user) return false;
  const role = await getUserRole();
  if (!allowedRoles.includes(role)) {
    alert('Acesso negado!');
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
       
    if (userDisplay) {
      userDisplay.textContent = userData?.fullName || 'Usuário';
    }
    
  
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
  }
}

// Logout com tratamento de erros
export async function logout() {
  try {
    await signOut(auth);
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
  
  // Verifica autenticação automaticamente em páginas protegidas
  if (!window.location.pathname.includes('login.html')) {
    checkAuth();
  }
});
