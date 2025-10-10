// 🚀 Router - Sistema de Navegação Avançado
// Gerencia rotas, URLs amigáveis e proteção contra acesso direto

class SCMRouter {
    constructor() {
        this.routes = {
            '/': 'login.html',
            '/login': 'login.html',
            '/dashboard': 'SCM_Supabase.html#dashboard',
            '/lista': 'SCM_Supabase.html#list',
            '/agrupado': 'SCM_Supabase.html#grouped',
            '/usuarios': 'usuarios.html',
            '/admin': 'admin-interno.html'
        };
        
        this.protectedRoutes = ['/dashboard', '/lista', '/agrupado', '/usuarios'];
        this.publicRoutes = ['/login', '/admin'];
        
        this.init();
    }
    
    init() {
        // Interceptar navegação do browser
        this.setupPopstateHandler();
        
        // Verificar rota inicial
        this.handleInitialRoute();
        
        // Interceptar cliques em links
        this.setupLinkInterception();
        
        console.log('🚀 Router inicializado');
    }
    
    // Interceptar mudanças de URL (back/forward)
    setupPopstateHandler() {
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.route) {
                this.navigateToRoute(event.state.route, false);
            } else {
                this.handleInitialRoute();
            }
        });
    }
    
    // Interceptar cliques em links internos
    setupLinkInterception() {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href^="/"]');
            if (link && !link.hasAttribute('data-bypass-router')) {
                event.preventDefault();
                const route = link.getAttribute('href');
                this.navigate(route);
            }
        });
    }
    
    // Verificar rota inicial ao carregar a página
    async handleInitialRoute() {
        const path = window.location.pathname;
        const hash = window.location.hash.substring(1);
        
        console.log('📍 Rota atual:', path, hash ? `#${hash}` : '');
        
        // Verificar se é rota protegida
        if (this.protectedRoutes.includes(path)) {
            const isAuth = await this.checkAuthentication();
            if (!isAuth) {
                console.log('🔒 Acesso negado - redirecionando para login');
                this.redirectToLogin();
                return;
            }
        }
        
        // Processar rota
        this.processRoute(path, hash);
    }
    
    // Verificar autenticação
    async checkAuthentication() {
        try {
            if (typeof supabaseClient === 'undefined' || !supabaseClient) {
                return false;
            }
            
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            return !error && session;
        } catch (error) {
            console.error('❌ Erro na verificação de auth:', error);
            return false;
        }
    }
    
    // Processar rota específica
    processRoute(path, hash = '') {
        const route = this.routes[path];
        
        if (!route) {
            console.log('❌ Rota não encontrada:', path);
            this.redirectToLogin();
            return;
        }
        
        // Se é uma rota que usa hash (SCM_Supabase.html)
        if (route.includes('#')) {
            const [page, tab] = route.split('#');
            this.loadPage(page, tab || hash);
        } else {
            this.loadPage(route);
        }
    }
    
    // Carregar página específica
    loadPage(page, tab = '') {
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage !== page) {
            console.log('🔄 Carregando página:', page);
            window.location.href = `/${page}${tab ? `#${tab}` : ''}`;
        } else if (tab && typeof switchTab === 'function') {
            console.log('📱 Mudando para aba:', tab);
            switchTab(tab);
        }
    }
    
    // Navegar para rota específica
    navigate(route, updateHistory = true) {
        console.log('🧭 Navegando para:', route);
        
        if (updateHistory) {
            // Adicionar ao histórico do browser
            window.history.pushState({ route }, '', route);
        }
        
        this.processRoute(route);
    }
    
    // Navegar para rota (método público)
    navigateToRoute(route, updateHistory = true) {
        this.navigate(route, updateHistory);
    }
    
    // Redirecionar para login
    redirectToLogin() {
        console.log('🔄 Redirecionando para login');
        window.history.replaceState(null, '', '/login');
        window.location.href = '/login.html';
    }
    
    // Obter rota atual
    getCurrentRoute() {
        return {
            path: window.location.pathname,
            hash: window.location.hash.substring(1),
            full: window.location.href
        };
    }
    
    // Verificar se rota é protegida
    isProtectedRoute(route) {
        return this.protectedRoutes.includes(route);
    }
    
    // Verificar se rota é pública
    isPublicRoute(route) {
        return this.publicRoutes.includes(route);
    }
    
    // Atualizar breadcrumbs
    updateBreadcrumbs() {
        const route = this.getCurrentRoute();
        const breadcrumbs = this.generateBreadcrumbs(route);
        
        const breadcrumbContainer = document.getElementById('breadcrumbs');
        if (breadcrumbContainer) {
            breadcrumbContainer.innerHTML = breadcrumbs;
        }
    }
    
    // Gerar breadcrumbs baseado na rota
    generateBreadcrumbs(route) {
        const breadcrumbs = ['🏠 Início'];
        
        switch (route.path) {
            case '/dashboard':
                breadcrumbs.push('📦 SCM', '📊 Dashboard');
                break;
            case '/lista':
                breadcrumbs.push('📦 SCM', '📋 Lista Completa');
                break;
            case '/agrupado':
                breadcrumbs.push('📦 SCM', '📦 Agrupado por Tipo');
                break;
            case '/usuarios':
                breadcrumbs.push('👥 Usuários');
                break;
            case '/admin':
                breadcrumbs.push('⚙️ Administração');
                break;
            default:
                if (route.path === '/login') {
                    breadcrumbs.push('🔐 Login');
                }
        }
        
        return breadcrumbs.map((crumb, index) => {
            if (index === breadcrumbs.length - 1) {
                return `<span class="breadcrumb-current">${crumb}</span>`;
            } else {
                return `<span class="breadcrumb-item">${crumb}</span>`;
            }
        }).join(' › ');
    }
}

// Instanciar router globalmente
let scmRouter;

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    scmRouter = new SCMRouter();
});

// Exportar para uso global
window.SCMRouter = SCMRouter;
window.scmRouter = scmRouter;
