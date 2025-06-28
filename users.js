import { db, auth } from './firebase-config.js';
import { ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser as deleteAuthUser
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Função para excluir usuário
export async function deleteUser(userId) {
  try {
    // Verifica se o usuário atual é admin
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Usuário não autenticado");
    
    const currentUserData = await get(ref(db, `users/${currentUser.uid}`));
    if (!currentUserData.exists() || !currentUserData.val().isAdmin) {
      throw new Error("Apenas administradores podem excluir usuários");
    }

    // Remove o usuário do Realtime Database
    await remove(ref(db, `users/${userId}`));
    
    return true;
  } catch (error) {
    console.error("Erro detalhado ao excluir:", error);
    throw new Error(`Erro ao excluir usuário: ${error.message}`);
  }
}

// Cadastra usuário com username (e-mail fictício)
export async function registerUser(username, password, fullName, isAdmin = false, adminPassword) {
  const email = `${username}@igreja.local`;
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Nenhum usuário autenticado");
    
    // Verifica se é admin
    const currentUserData = await get(ref(db, `users/${currentUser.uid}`));
    if (!currentUserData.exists() || !currentUserData.val().isAdmin) {
      throw new Error("Apenas administradores podem cadastrar usuários");
    }
    
    // Reautentica o admin
    const adminEmail = `${currentUserData.val().username}@igreja.local`;
    const credential = EmailAuthProvider.credential(adminEmail, adminPassword);
    await reauthenticateWithCredential(currentUser, credential);
    
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

// Login com username
export async function loginUser(username, password) {
  const email = `${username}@igreja.local`;
  return await signInWithEmailAndPassword(auth, email, password);
}

// Verifica se o usuário atual é admin
export async function isUserAdmin() {
  const user = auth.currentUser;
  if (!user) return false;
  const snapshot = await get(ref(db, `users/${user.uid}/isAdmin`));
  return snapshot.val() === true;
}

// Obtém dados do usuário logado (para exibir na navbar)
export async function getCurrentUserData() {
  const user = auth.currentUser;
  if (!user) return null;
  const snapshot = await get(ref(db, `users/${user.uid}`));
  return snapshot.val();
}

// Listar todos os usuários
export async function getAllUsers() {
  const snapshot = await get(ref(db, 'users'));
  const users = [];
  snapshot.forEach((child) => {
    users.push({
      id: child.key,
      ...child.val()
    });
  });
  return users;
}
