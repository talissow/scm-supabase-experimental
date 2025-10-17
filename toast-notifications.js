// ===== SISTEMA DE NOTIFICAÇÕES TOAST =====
// Este módulo gerencia notificações visuais para feedback ao usuário

// Estilos CSS para as notificações
const toastStyles = `
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.toast {
    min-width: 250px;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    color: white;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    opacity: 0;
    transform: translateX(50px);
    transition: all 0.3s ease;
}

.toast.show {
    opacity: 1;
    transform: translateX(0);
}

.toast-success {
    background: linear-gradient(135deg, #28a745 0%, #218838 100%);
}

.toast-error {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.toast-warning {
    background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
}

.toast-info {
    background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.toast-close {
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    margin-left: 10px;
    opacity: 0.7;
}

.toast-close:hover {
    opacity: 1;
}
`;

// Inicializar sistema de notificações
function initToastSystem() {
    // Adicionar estilos CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = toastStyles;
    document.head.appendChild(styleElement);
    
    // Criar container para as notificações
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    
    console.log('✅ Sistema de notificações inicializado');
}

// Mostrar notificação toast
function showToast(message, type = 'info', duration = 3000) {
    // Verificar se o container existe
    let container = document.querySelector('.toast-container');
    if (!container) {
        initToastSystem();
        container = document.querySelector('.toast-container');
    }
    
    // Criar elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Adicionar conteúdo
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    // Adicionar ao container
    container.appendChild(toast);
    
    // Adicionar evento de fechar
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // Mostrar toast com animação
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remover automaticamente após duração
    if (duration > 0) {
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    return toast;
}

// Tipos de notificações
function showSuccessToast(message, duration = 3000) {
    return showToast(message, 'success', duration);
}

function showErrorToast(message, duration = 4000) {
    return showToast(message, 'error', duration);
}

function showWarningToast(message, duration = 3500) {
    return showToast(message, 'warning', duration);
}

function showInfoToast(message, duration = 3000) {
    return showToast(message, 'info', duration);
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initToastSystem);