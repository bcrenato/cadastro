// session-timeout.js
const INACTIVITY_TIMEOUT = 300000; // 5 minutos
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logoutDueToInactivity, INACTIVITY_TIMEOUT);
}

function logoutDueToInactivity() {
    // Limpa dados de sessão
    localStorage.removeItem('savedUsername');
    sessionStorage.clear();
    
    // Redireciona para login
    window.location.href = 'login.html';
    
    // Opcional: mostra mensagem
    alert('Sessão encerrada por inatividade');
}

// Eventos que resetam o timer
const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
activityEvents.forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
});

// Inicia o timer quando a página carrega
resetInactivityTimer();

// Opcional: aviso antes de encerrar
const WARNING_TIMEOUT = INACTIVITY_TIMEOUT - 60000; // 1 minuto antes
let warningTimer;

function showWarning() {
    if (confirm('Sua sessão irá expirar em 1 minuto. Deseja continuar?')) {
        resetInactivityTimer();
    }
}

warningTimer = setTimeout(showWarning, WARNING_TIMEOUT);