import { db, auth } from './firebase-config.js';
import { ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Função para excluir usuário
export async function deleteUser(userId) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Usuário não autenticado");
    
    const currentUserData = await get(ref(db, `users/${currentUser.uid}`));
    if (!currentUserData.exists() || !currentUserData.val().isAdmin) {
      throw new Error("Apenas administradores podem excluir usuários");
    }

    await remove(ref(db, `users/${userId}`));
    return true;
  } catch (error) {
    throw new Error(`Erro ao excluir usuário: ${error.message}`);
  }
}

// Cadastra usuário sem deslogar o admin
export async function registerUser(username, password, fullName, isAdmin = false) {
  const email = `${username}@igreja.local`;
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Nenhum usuário autenticado");
    
    // Verifica se é admin
    const currentUserData = await get(ref(db, `users/${currentUser.uid}`));
    if (!currentUserData.exists() || !currentUserData.val().isAdmin) {
      throw new Error("Apenas administradores podem cadastrar usuários");
    }

    // Cria o novo usuário
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Salva os dados no Realtime Database
    await set(ref(db, `users/${userCredential.user.uid}`), {
      username,
      fullName,
      isAdmin,
      createdAt: new Date().toISOString()
    });
    
    return userCredential.user;
  } catch (error) {
    throw new Error(`Erro ao registrar: ${error.message}`);
  }
}

// ... (mantenha as outras funções como estão)
