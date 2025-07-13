
import { db, auth, firebaseConfig } from './firebase-config.js';
import { ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { deleteUser as deleteAuthUser, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

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
    console.error("Erro detalhado ao excluir:", error);
    throw new Error(`Erro ao excluir usuário: ${error.message}`);
  }
}

export async function registerUser(username, password, fullName, isAdmin = false) {
  const email = `${username}@igreja.local`;
  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);

    await set(ref(db, `users/${userCredential.user.uid}`), {
      username,
      fullName,
      isAdmin,
      isEnabled: false,
      createdAt: new Date().toISOString()
    });

    await secondaryAuth.signOut();
    return userCredential.user;
  } catch (error) {
    throw new Error(`Erro ao registrar: ${error.message}`);
  }
}

export async function loginUser(username, password) {
  const email = `${username}@igreja.local`;
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function toggleUserEnabled(userId, enabled) {
  try {
    await set(ref(db, `users/${userId}/isEnabled`), enabled);
  } catch (err) {
    throw new Error(`Erro ao atualizar habilitação: ${err.message}`);
  }
}

export async function isUserAdmin() {
  const user = auth.currentUser;
  if (!user) return false;
  const snapshot = await get(ref(db, `users/${user.uid}/isAdmin`));
  return snapshot.val() === true;
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
