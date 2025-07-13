// session-timeout.js
// js/session-timeout.js
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos (300000 ms)
const WARNING_TIMEOUT = 4 * 60 * 1000; // Aviso 1 minuto antes (240000 ms)
let inactivityTimer;
let warningTimer;

function resetInactivityTimer() {
    // Limpa os timers existentes
    clearTimeout(inactivityTimer);
    clearTimeout(warningTimer);
    
    // Configura novos timers
    inactivityTimer = setTimeout(logoutDueToInactivity, INACTIVITY_TIMEOUT);
    warningTimer = setTimeout(showInactivityWarning, WARNING_TIMEOUT);
}

function showInactivityWarning() {
    // Remove avisos anteriores se existirem
    const existingWarning = document.getElementById('inactivity-warning');
    if (existingWarning) {
        existingWarning.remove();
    }

    // Cria modal mobile-friendly
    const warningModal = document.createElement('div');
    warningModal.id = 'inactivity-warning';
    warningModal.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 10px;
        right: 10px;
        background-color: #ff9800;
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        text-align: center;
        font-size: 16px;
    `;
    
    warningModal.innerHTML = `
        <p>Sua sessão expirará em 1 minuto</p>
        <button style="
            background: white;
            color: #ff9800;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            margin-top: 10px;
            font-weight: bold;
            font-size: 16px;
            width: 80%;
        ">Continuar Logado</button>
    `;
    
    document.body.appendChild(warningModal);
    
    // Configura o botão para resetar o timer
    warningModal.querySelector('button').addEventListener('click', () => {
        resetInactivityTimer();
        warningModal.remove();
    });
}

function logoutDueToInactivity() {
    // Remove o aviso se estiver visível
    const warning = document.getElementById('inactivity-warning');
    if (warning) warning.remove();
    
    // Limpa o armazenamento
    localStorage.removeItem('savedUsername');
    sessionStorage.clear();
    
    // Redireciona para login
    window.location.href = 'login.html';
}

// Eventos para mobile e desktop
const activityEvents = [
    'mousedown', 'mousemove', 'keydown', 'scroll',
    'touchstart', 'touchmove', 'touchend', 'click',
    'pointerdown', 'pointermove' // Para dispositivos com stylus
];

// Adiciona listeners
activityEvents.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, { passive: true });
});

// Inicia quando a página carrega
document.addEventListener('DOMContentLoaded', resetInactivityTimer);

// Pausa quando o app está em segundo plano
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearTimeout(inactivityTimer);
        clearTimeout(warningTimer);
    } else {
        resetInactivityTimer();
    }
});

// Reset também quando a página ganha foco
window.addEventListener('focus', resetInactivityTimer);
