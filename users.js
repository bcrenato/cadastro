import { db } from './firebase-config.js';
import { ref, set, get, remove, query, orderByChild, equalTo, update, push } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Use bcrypt diretamente (certifique-se que o script está incluído no HTML)
const bcrypt = window.bcrypt;

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
    console.log("[Login] Iniciando processo para usuário:", username);
    
    // 1. Busca o usuário pelo username
    const usersRef = ref(db, 'users');
    const queryRef = query(usersRef, orderByChild('username'), equalTo(username));
    const snapshot = await get(queryRef);
    
    console.log("[Login] Resultado da consulta:", snapshot.exists() ? "usuário encontrado" : "usuário não encontrado");

    if (!snapshot.exists()) {
      // Mesma mensagem para usuário não encontrado e senha inválida por segurança
      throw new Error('Credenciais inválidas');
    }

    // 2. Extrai os dados do usuário
    let userData = null;
    let userId = null;
    snapshot.forEach((child) => {
      userData = child.val();
      userId = child.key;
      console.log(`[Login] Usuário encontrado - ID: ${userId}, Admin: ${userData.isAdmin}`);
    });

    // 3. Verifica se os dados necessários existem
    if (!userData || !userData.passwordHash || !userData.salt) {
      console.error("[Login] Estrutura de dados do usuário inválida");
      throw new Error('Erro no sistema. Contate o administrador.');
    }

    // 4. Compara a senha
    console.log("[Login] Verificando senha...");
    const isValidPassword = bcrypt.compareSync(password, userData.passwordHash);
    
    if (!isValidPassword) {
      console.log("[Login] Senha inválida para usuário:", username);
      throw new Error('Credenciais inválidas');
    }

    // 5. Retorna os dados seguros do usuário (sem passwordHash e salt)
    const { passwordHash, salt, ...safeUserData } = userData;
    console.log("[Login] Autenticação bem-sucedida para:", username);
    
    return { 
      ...safeUserData, 
      id: userId 
    };

  } catch (error) {
    console.error("[Login] Erro durante o processo:", error);
    
    // Mensagens amigáveis para diferentes tipos de erro
    if (error.message.includes('Permission')) {
      throw new Error('Sistema indisponível. Tente novamente mais tarde.');
    } else if (error.message.includes('Credenciais')) {
      throw error; // Mantém a mensagem original
    } else {
      throw new Error('Erro durante o login. Tente novamente.');
    }
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
