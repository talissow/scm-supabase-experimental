// 🔐 Auth Guard - Proteção de Rotas
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
        
        const authenticated = await isAuthenticated();
        
        if (!authenticated) {
            console.log('❌ Usuário não autenticado - redirecionando para login');
            redirectToLogin();
            return;
        }
        
        console.log('✅ Usuário autenticado - acesso liberado');
    }
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
    isPublicPage
};
