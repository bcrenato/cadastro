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
    const currentURL = window.location.href;

    if (!user) {
        // Usuário não autenticado e não está na página de login
        if (!currentURL.includes("/cadastro/login.html")) {
            localStorage.setItem("lastVisitedPage", currentURL);
        }
    } else {
        const lastPage = localStorage.getItem("lastVisitedPage");

        try {
            if (lastPage && new URL(lastPage).origin === window.location.origin && lastPage !== window.location.href) {
                localStorage.removeItem("lastVisitedPage");
                window.location.href = lastPage;
            }
        } catch (e) {
            localStorage.removeItem("lastVisitedPage"); // URL malformada
        }
    }
});
