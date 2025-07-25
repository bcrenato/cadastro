// /js/js/session-timeout.js
import { auth } from '../firebase-config.js';

const timeoutMillis = 2 * 60 * 1000;
let logoutTimeoutId;

function resetTimer() {
    clearTimeout(logoutTimeoutId);
    logoutTimeoutId = setTimeout(logout, timeoutMillis);
}

function logout() {
    console.log("Sessão expirada por inatividade.");

    // Salva a URL atual antes de deslogar
    localStorage.setItem("lastVisitedPage", window.location.href);

    auth.signOut().then(() => {
        window.location.href = "/cadastro/login.html";
    }).catch((error) => {
        console.error("Erro ao deslogar:", error);
        window.location.href = "/cadastro/login.html";
    });
}

// Detecta atividades do usuário
['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, resetTimer, false);
});

resetTimer();

// Redirecionar para última página salva após login, se houver
auth.onAuthStateChanged((user) => {
    if (user) {
        const lastPage = localStorage.getItem("lastVisitedPage");

        if (lastPage && lastPage !== window.location.href && !window.location.href.includes("/cadastro/login.html")) {
            // Limpa e redireciona
            localStorage.removeItem("lastVisitedPage");
            window.location.href = lastPage;
        }
    }
});
