import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Config Firebase (igual do firebase-config.js)
const firebaseConfig = {
  apiKey: "AIzaSyCv6pzl34tyPTARtGxV6g2AJfkrtQeA-xU",
  authDomain: "cadastro-igreja-23042.firebaseapp.com",
  databaseURL: "https://cadastro-igreja-23042-default-rtdb.firebaseio.com",
  projectId: "cadastro-igreja-23042",
  messagingSenderId: "977906864836",
  appId: "1:977906864836:web:1a21a29f4b941ac5aeaf91"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const auth = getAuth(app);

async function ativarNotificacoes() {
  if (!('Notification' in window)) {
    alert('Navegador não suporta notificações');
    return;
  }

  const perm = await Notification.requestPermission();
  if (perm !== 'granted') {
    alert('Permissão negada para notificações');
    return;
  }

  if (!('serviceWorker' in navigator)) {
    alert('Service Worker não suportado no navegador');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const currentToken = await getToken(messaging, {
      vapidKey: 'BFBqbUaRosOn6954OA7OgVwC1I-YIsMlRjBSLDDCkfxT7BYVpqIJHmxpJkYVPYnSQftVVkrRqKPrjuJfodnjFF4',
      serviceWorkerRegistration: registration
    });

    if (currentToken) {
      console.log('Token FCM:', currentToken);
      // Enviar token para seu servidor
      const res = await fetch('https://igrejamine.x10.mx/PWA/salvar_token.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: currentToken })
      });

      const data = await res.text();
      console.log('Resposta do servidor:', data);
      alert('Notificações ativadas com sucesso!');
    } else {
      alert('Não foi possível obter o token. Tente novamente.');
    }
  } catch (error) {
    console.error('Erro ao ativar notificações:', error);
    alert('Erro ao ativar notificações: ' + error.message);
  }
}

// Só roda após autenticação
auth.onAuthStateChanged(async (user) => {
  if (user) {
    await ativarNotificacoes();
  } else {
    console.log('Usuário não autenticado, notificações não ativadas.');
  }
});
