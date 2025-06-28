import { db, auth } from './firebase-config.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Cadastra usuário com username (e-mail fictício)
export async function registerUser(username, password, fullName, isAdmin = false) {
  const email = `${username}@igreja.local`;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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

// Excluir usuário
export async function deleteUser(userId) {
  try {
    await set(ref(db, `users/${userId}`), null);
    return true;
  } catch (error) {
    throw new Error(`Erro ao deletar usuário: ${error.message}`);
  }
}
