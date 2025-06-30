import { db } from './firebase-config.js';
import { ref, set, get, remove, query, orderByChild, equalTo, update, push } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Solução definitiva para carregamento do BCrypt
const getBCrypt = () => {
  // Tenta acessar o BCrypt de 3 formas diferentes
  const bcrypt = window._secureBCrypt || window.bcrypt || window.dcodeIO?.bcrypt;
  
  if (!bcrypt) {
    const error = new Error(`
      BCrypt não disponível. Verifique:
      1. O script foi carregado antes deste módulo?
      2. Há bloqueadores de script (adblockers)?
      3. O CDN está acessível?
    `);
    console.error('Falha no BCrypt:', {
      windowSecure: window._secureBCrypt,
      windowGlobal: window.bcrypt,
      dcodeIO: window.dcodeIO?.bcrypt,
      error
    });
    throw error;
  }

  return bcrypt;
};

const bcrypt = getBCrypt();
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

    return newUserRef.key;
  } catch (error) {
    console.error('Erro no registro:', error);
    throw new Error(`Erro ao registrar: ${error.message}`);
  }
}

export async function loginUser(username, password) {
  try {
    console.group('[Login] Verificações iniciais');
    console.log('BCrypt disponível?', !!bcrypt.compareSync);
    
    // 1. Busca o usuário
    const usersRef = ref(db, 'users');
    const queryRef = query(usersRef, orderByChild('username'), equalTo(username));
    const snapshot = await get(queryRef);

    if (!snapshot.exists()) {
      console.log('Usuário não encontrado');
      throw new Error('Credenciais inválidas');
    }

    // 2. Extrai dados do usuário
    let userData = null;
    let userId = null;
    snapshot.forEach((child) => {
      userData = child.val();
      userId = child.key;
      console.log('Dados do usuário:', { 
        userId, 
        username: userData.username,
        hasPassword: !!userData.passwordHash
      });
    });

    // 3. Valida estrutura
    if (!userData?.passwordHash) {
      console.error('Estrutura inválida:', userData);
      throw new Error('Configuração de usuário inválida');
    }

    // 4. Verifica senha
    console.log('Iniciando verificação de senha...');
    const isValidPassword = bcrypt.compareSync(password, userData.passwordHash);
    console.log('Senha válida?', isValidPassword);

    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    // 5. Retorna dados seguros
    const { passwordHash, salt, ...safeUserData } = userData;
    console.groupEnd();
    return { ...safeUserData, id: userId };

  } catch (error) {
    console.groupEnd();
    console.error('Erro no login:', {
      username,
      error: error.message,
      stack: error.stack
    });
    throw error;
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
