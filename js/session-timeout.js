(function () {
    const timeoutMillis = 5 * 60 * 1000;            // 5 minutos total
    const warningMillis = timeoutMillis - 30 * 1000;  // avisa 30s antes
    let warningTimeoutId;
    let logoutTimeoutId;

    function resetTimers() {
        clearTimeout(warningTimeoutId);
        clearTimeout(logoutTimeoutId);

        warningTimeoutId = setTimeout(showWarning, warningMillis);
        logoutTimeoutId = setTimeout(logout, timeoutMillis);
    }

    function showWarning() {
        const stay = confirm("Sua sessão vai expirar em 30 segundos por inatividade. Deseja continuar?");
        if (stay) {
            resetTimers();
        }
    }

    function logout() {
        console.log("Sessão expirada por inatividade.");
        firebase.auth().signOut().then(() => {
            alert("Você foi desconectado por inatividade.");
            window.location.href = "login.html"; // ajuste para sua página de login
        }).catch((error) => {
            console.error("Erro ao deslogar:", error);
            window.location.href = "login.html";
        });
    }

    // escuta eventos de atividade do usuário
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, resetTimers, false);
    });

    resetTimers();
})();
