import { loginUser } from './users.js';

// Gerencia o estado da sessão
export function checkAuthState() {
  return sessionStorage.getItem('currentUserId');
}

export async function login(username, password) {
  try {
    const user = await loginUser(username, password);
    sessionStorage.setItem('currentUserId', user.id);
    return user;
  } catch (error) {
    throw error;
  }
}

export function logout() {
  sessionStorage.removeItem('currentUserId');
}
