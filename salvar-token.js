import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Config Firebase - igual do firebase-config.js
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

auth.onAuthStateChanged((user) => {
  if (user) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        getToken(messaging, {
          vapidKey: 'BFBqbUaRosOn6954OA7OgVwC1I-YIsMlRjBSLDDCkfxT7BYVpqIJHmxpJkYVPYnSQftVVkrRqKPrjuJfodnjFF4', // Troque aqui pela sua VAPID Key real
          serviceWorkerRegistration: registration
        }).then((currentToken) => {
          if (currentToken) {
            console.log('Token FCM:', currentToken);
            // Envia token para o servidor (painel x10)
            fetch('https://igrejamine.x10.mx/PWA/salvar_token.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: currentToken })
            });
          } else {
            console.log('Nenhum token disponível. Solicite permissão para notificações.');
          }
        }).catch((err) => {
          console.error('Erro ao obter token:', err);
        });
      });
    } else {
      console.warn('Service Worker não suportado neste navegador.');
    }
  } else {
    console.log('Usuário não está autenticado. Token FCM não será obtido.');
  }
});
