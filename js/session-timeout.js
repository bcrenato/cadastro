// js/session-timeout.js
import { auth } from '../firebase-config.js';

const timeoutMillis = 10 * 60 * 1000;
let logoutTimeoutId;

function resetTimer() {
    clearTimeout(logoutTimeoutId);
    logoutTimeoutId = setTimeout(logout, timeoutMillis);
}

function logout() {
    console.log("Sessão expirada por inatividade.");
    auth.signOut().then(() => {
        window.location.href = "/cadastro/login.html";
    }).catch((error) => {
        console.error("Erro ao deslogar:", error);
        window.location.href = "/cadastro/login.html";
    });
}

['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, resetTimer, false);
});

resetTimer();
