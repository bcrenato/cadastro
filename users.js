import { db } from './firebase-config.js';
import { ref, set, get, remove, query, orderByChild, equalTo, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function registerUser(username, password, fullName, isAdmin = false) {
  try {
    // Verifica se usuário já existe
    const snapshot = await get(query(ref(db, 'users'), orderByChild('username'), equalTo(username)));
    if (snapshot.exists()) {
      throw new Error('Nome de usuário já está em uso');
    }

    // Cria hash da senha
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Salva no banco de dados
    const newUserRef = push(ref(db, 'users'));
    await set(newUserRef, {
      username,
      passwordHash,
      salt,
      fullName,
      isAdmin,
      createdAt: new Date().toISOString()
    });

    return newUserRef.key; // Retorna o ID do novo usuário
  } catch (error) {
    throw new Error(`Erro ao registrar: ${error.message}`);
  }
}

export async function loginUser(username, password) {
  try {
    // Busca usuário no banco
    const snapshot = await get(query(ref(db, 'users'), orderByChild('username'), equalTo(username)));
    
    if (!snapshot.exists()) {
      throw new Error('Usuário não encontrado');
    }

    // Pega os dados do usuário
    let userData = null;
    let userId = null;
    
    snapshot.forEach((child) => {
      userData = child.val();
      userId = child.key;
    });

    // Verifica senha
    const isValidPassword = bcrypt.compareSync(password, userData.passwordHash);
    if (!isValidPassword) {
      throw new Error('Senha incorreta');
    }

    // Retorna dados sem informações sensíveis
    const { passwordHash, salt, ...safeUserData } = userData;
    return { ...safeUserData, id: userId };
  } catch (error) {
    throw new Error(`Erro no login: ${error.message}`);
  }
}

export async function deleteUser(userId) {
  try {
    await remove(ref(db, `users/${userId}`));
    return true;
  } catch (error) {
    throw new Error(`Erro ao excluir usuário: ${error.message}`);
  }
}

export async function isUserAdmin(userId) {
  const snapshot = await get(ref(db, `users/${userId}/isAdmin`));
  return snapshot.val() === true;
}

export async function getCurrentUserData(userId) {
  const snapshot = await get(ref(db, `users/${userId}`));
  if (!snapshot.exists()) return null;
  
  const userData = snapshot.val();
  const { passwordHash, salt, ...safeData } = userData;
  return safeData;
}

export async function getAllUsers() {
  const snapshot = await get(ref(db, 'users'));
  const users = [];
  
  snapshot.forEach((child) => {
    const userData = child.val();
    const { passwordHash, salt, ...safeData } = userData;
    users.push({
      id: child.key,
      ...safeData
    });
  });
  
  return users;
}

export async function changePassword(userId, newPassword) {
  try {
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    
    await update(ref(db, `users/${userId}`), { 
      passwordHash,
      salt
    });
    
    return true;
  } catch (error) {
    throw new Error(`Erro ao alterar senha: ${error.message}`);
  }
}
