// 🔐 Auth Guard - Proteção de Rotas Reforçada
// Este arquivo deve ser incluído em todas as páginas que precisam de autenticação

// Páginas que NÃO precisam de autenticação (públicas)
const PUBLIC_PAGES = [
    'login.html',
    'index.html',
    'CRIAR_ADMIN.html',
    'admin-interno.html',
    'TESTE_CONEXAO.html',
    'TESTE_CONFIG_SUPABASE.html',
    'TESTE_SIMPLES.html',
    'TESTE_PAGINAS.html',
    'TESTE_DIRETO.html',
    'TESTE_AUTENTICACAO.html',
    'TESTE_TABELAS.html',
    'TESTE_EXCLUSAO.html',
    'TESTE_IMPORTACAO.html',
    'TESTE_FUNCIONALIDADES.html'
];

// Páginas que precisam de autenticação (protegidas)
const PROTECTED_PAGES = [
    'SCM_Supabase.html',
    'usuarios.html'
];

// Verificar se acesso foi feito diretamente (sem referrer válido)
function isDirectAccess() {
    const referrer = document.referrer;
    const currentDomain = window.location.origin;
    const referrerDomain = referrer ? new URL(referrer).origin : '';
    
    // Se não há referrer ou é de domínio externo, pode ser acesso direto
    const isDirect = !referrer || referrerDomain !== currentDomain;
    
    console.log('🔍 Verificação de acesso direto:', {
        referrer: referrer,
        currentDomain: currentDomain,
        referrerDomain: referrerDomain,
        isDirect: isDirect
    });
    
    return isDirect;
}

// Verificar se a página atual precisa de autenticação
function isProtectedPage() {
    const currentPage = window.location.pathname.split('/').pop();
    return PROTECTED_PAGES.includes(currentPage);
}

// Verificar se a página atual é pública
function isPublicPage() {
    const currentPage = window.location.pathname.split('/').pop();
    return PUBLIC_PAGES.includes(currentPage);
}

// Verificar se o usuário está autenticado
async function isAuthenticated() {
    try {
        // Verificar se Supabase está inicializado
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            console.log('🔴 Supabase não inicializado');
            return false;
        }

        // Verificar sessão ativa
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.log('🔴 Erro ao verificar sessão:', error);
            return false;
        }

        if (!session) {
            console.log('🔴 Nenhuma sessão ativa');
            return false;
        }

        // Verificar se a sessão não expirou
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at < now) {
            console.log('🔴 Sessão expirada');
            return false;
        }

        console.log('🟢 Usuário autenticado:', session.user.email);
        return true;
    } catch (error) {
        console.log('🔴 Erro na verificação de autenticação:', error);
        return false;
    }
}

// Redirecionar para login
function redirectToLogin() {
    console.log('🔄 Redirecionando para login...');
    window.location.href = '/login.html';
}

// Proteger página
async function protectPage() {
    // Se for página pública, não fazer nada
    if (isPublicPage()) {
        console.log('🟢 Página pública - acesso liberado');
        return;
    }

    // Se for página protegida, verificar autenticação
    if (isProtectedPage()) {
        console.log('🔐 Página protegida - verificando autenticação...');
        
        // Verificar se é acesso direto
        const isDirect = isDirectAccess();
        if (isDirect) {
            console.log('⚠️ Possível acesso direto detectado');
        }
        
        const authenticated = await isAuthenticated();
        
        if (!authenticated) {
            console.log('❌ Usuário não autenticado - redirecionando para login');
            
            // Se for acesso direto, mostrar mensagem mais específica
            if (isDirect) {
                showAccessDeniedMessage();
            }
            
            redirectToLogin();
            return;
        }
        
        console.log('✅ Usuário autenticado - acesso liberado');
        
        // Marcar que o usuário passou pelo processo de login
        sessionStorage.setItem('scm_authenticated_via_login', 'true');
    }
}

// Mostrar mensagem de acesso negado
function showAccessDeniedMessage() {
    // Criar overlay de bloqueio
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        font-family: Arial, sans-serif;
    `;
    
    const message = document.createElement('div');
    message.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    
    message.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
        <h2 style="color: #e74c3c; margin-bottom: 15px;">Acesso Negado</h2>
        <p style="color: #666; margin-bottom: 20px;">
            Esta página só pode ser acessada após fazer login no sistema.
        </p>
        <button onclick="window.location.href='/login.html'" 
                style="background: #3498db; color: white; border: none; 
                       padding: 12px 24px; border-radius: 8px; cursor: pointer;
                       font-size: 16px;">
            Ir para Login
        </button>
    `;
    
    overlay.appendChild(message);
    document.body.appendChild(overlay);
    
    // Remover overlay após 5 segundos
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }, 5000);
}

// Inicializar proteção quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🛡️ Auth Guard inicializado');
    
    // Aguardar um pouco para garantir que outros scripts carregaram
    setTimeout(async () => {
        await protectPage();
    }, 100);
});

// Exportar funções para uso em outros scripts
window.AuthGuard = {
    isAuthenticated,
    protectPage,
    redirectToLogin,
    isProtectedPage,
    isPublicPage,
    isDirectAccess,
    showAccessDeniedMessage
};
