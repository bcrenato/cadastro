
import { db, auth, firebaseConfig } from './firebase-config.js';
import { ref, set, get, remove, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { deleteUser as deleteAuthUser, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);


export async function toggleUserStatus(userId, currentStatus) {
  try {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, { isActive: !currentStatus });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do usuário:', error);
    throw new Error('Erro ao atualizar status do usuário: ' + error.message);
  }
}



// Excluir usuário (corrigido para usar "role")
export async function deleteUser(userId) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Usuário não autenticado");

    const currentUserData = await get(ref(db, `users/${currentUser.uid}`));
    if (!currentUserData.exists() || currentUserData.val().role !== 'admin') {
      throw new Error("Apenas administradores podem excluir usuários");
    }

    await remove(ref(db, `users/${userId}`));
    return true;
  } catch (error) {
    console.error("Erro detalhado ao excluir:", error);
    throw new Error(`Erro ao excluir usuário: ${error.message}`);
  }
}

export async function getUserRole() {
  const user = auth.currentUser;
  if (!user) return null;
  const snapshot = await get(ref(db, `users/${user.uid}/role`));
  return snapshot.val() || 'usuario';
}

export async function isUserInRole(roles) {
  const role = await getUserRole();
  return roles.includes(role);
}

export async function registerUser(username, password, fullName, role = 'usuario') {
  const email = `${username}@igreja.local`;
  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);

  await set(ref(db, `users/${userCredential.user.uid}`), {
    username,
    fullName,
    role,
    isActive: true,
    createdAt: new Date().toISOString()
  });

  await secondaryAuth.signOut();
  return userCredential.user;
}


export async function loginUser(username, password) {
  const email = `${username}@igreja.local`;
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  // Verifica se está ativo no Realtime Database
  const snapshot = await get(ref(db, `users/${userCredential.user.uid}`));
  const userData = snapshot.val();

  if (!userData.isActive) {
    throw new Error("Usuário desativado. Contate o administrador.");
  }

  return userCredential;
}


export async function getCurrentUserData() {
  const user = auth.currentUser;
  if (!user) return null;
  const snapshot = await get(ref(db, `users/${user.uid}`));
  return snapshot.val();
}

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
