import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

(function () {
    const timeoutMillis = 5 * 60 * 1000;      // 5 minutos total
    const warningMillis = timeoutMillis - 30 * 1000;  // avisa 30s antes
    let warningTimeoutId;
    let logoutTimeoutId;

    const auth = getAuth();

    function resetTimers() {
        clearTimeout(warningTimeoutId);
        clearTimeout(logoutTimeoutId);

        // programa o aviso para 4:30
        warningTimeoutId = setTimeout(showWarning, warningMillis);

        // programa logout para 5:00
        logoutTimeoutId = setTimeout(logout, timeoutMillis);
    }

    function showWarning() {
        const stay = confirm("Sua sessão vai expirar em 30 segundos por inatividade. Deseja continuar?");
        if (stay) {
            resetTimers(); // reinicia tudo se usuário responder
        }
        // se ele não clicar no alerta e não interagir, logout acontece em 30s
    }

    function logout() {
        console.log("Sessão expirada por inatividade.");
        signOut(auth).then(() => {
            alert("Você foi desconectado por inatividade.");
            window.location.href = "login.html"; // ajuste para sua página de login
        }).catch((error) => {
            console.error("Erro ao deslogar:", error);
            window.location.href = "login.html";
        });
    }

    // eventos de atividade do usuário
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, resetTimers, false);
    });

    resetTimers();
})();
