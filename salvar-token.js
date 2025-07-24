// salvar-token.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

getToken(messaging, {
  vapidKey: "SUA_CHAVE_VAPID_PUBLICA"
}).then((currentToken) => {
  if (currentToken) {
    console.log("Token FCM:", currentToken);

    // Envia para o PHP no x10hosting
    fetch("https://igrejamine.x10.mx/igreja/PWA/salvar_token.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "token=" + encodeURIComponent(currentToken)
    })
    .then(response => response.text())
    .then(data => console.log("Token salvo:", data))
    .catch(error => console.error("Erro ao salvar token:", error));
  } else {
    console.warn("Não foi possível obter token.");
  }
});
