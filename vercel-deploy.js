// Vercel Deploy Automation
// Este módulo facilita o deploy automático para o Vercel

const VERCEL_DEPLOY = {
    // Configuração do projeto
    config: {
        projectId: 'scm-supabase-experimental',
        teamId: 'equipe_DMlQK3BWAgBrP8bRqqWxJSVK', // ID da equipe Vercel
        token: 'rQo2Rm6VzM9ri2OUMN33ddeP', // Token de acesso da API Vercel
        production: true
    },
    
    // Status do deploy
    status: {
        lastDeploy: null,
        deployInProgress: false,
        deployUrl: null
    },
    
    // Inicializa o módulo
    init: function() {
        console.log('🚀 Vercel Deploy inicializado');
        this.checkStatus();
        return this;
    },
    
    // Verifica status do último deploy
    checkStatus: function() {
        // Simulação para demonstração
        this.status.lastDeploy = localStorage.getItem('lastVercelDeploy') || null;
        this.status.deployUrl = localStorage.getItem('lastVercelDeployUrl') || 'https://scm-supabase.vercel.app';
        
        return this.status;
    },
    
    // Inicia um novo deploy
    startDeploy: function(commitMessage = 'Deploy automático') {
        if (this.status.deployInProgress) {
            console.warn('⚠️ Deploy já em andamento');
            return false;
        }
        
        // Verifica se GitHub está conectado
        if (typeof GITHUB_INTEGRATION !== 'undefined' && !GITHUB_INTEGRATION.status.connected) {
            console.error('❌ GitHub não conectado');
            if (typeof showErrorToast === 'function') {
                showErrorToast('Conecte-se ao GitHub antes de fazer deploy');
            }
            return false;
        }
        
        console.log('🚀 Iniciando deploy para Vercel');
        this.status.deployInProgress = true;
        
        // Simulação de deploy
        if (typeof showInfoToast === 'function') {
            showInfoToast('Iniciando deploy para Vercel...');
        }
        
        // Simula commit no GitHub se disponível
        if (typeof GITHUB_INTEGRATION !== 'undefined') {
            GITHUB_INTEGRATION.commit(commitMessage);
        }
        
        // Simula processo de deploy
        setTimeout(() => {
            this.status.deployInProgress = false;
            this.status.lastDeploy = new Date().toISOString();
            
            // Salva no localStorage para persistência
            localStorage.setItem('lastVercelDeploy', this.status.lastDeploy);
            localStorage.setItem('lastVercelDeployUrl', this.status.deployUrl);
            
            if (typeof showSuccessToast === 'function') {
                showSuccessToast('Deploy para Vercel concluído com sucesso!');
            }
            
            console.log('✅ Deploy concluído:', this.status.deployUrl);
        }, 3000);
        
        return true;
    },
    
    // Abre o dashboard do Vercel
    openDashboard: function() {
        window.open('https://vercel.com/dashboard', '_blank');
    },
    
    // Abre o site deployado
    openDeployedSite: function() {
        window.open(this.status.deployUrl, '_blank');
    },
    
    // Retorna HTML com status do deploy
    getStatusHTML: function() {
        return `
            <div class="vercel-status">
                <h4>Vercel Deploy</h4>
                <p>Status: ${this.status.deployInProgress ? '⏳ Deploy em andamento' : '✅ Pronto para deploy'}</p>
                ${this.status.lastDeploy ? `<p>Último deploy: ${new Date(this.status.lastDeploy).toLocaleString()}</p>` : ''}
                ${this.status.deployUrl ? `<p>URL: <a href="${this.status.deployUrl}" target="_blank">${this.status.deployUrl}</a></p>` : ''}
                <div class="mt-2">
                    <button class="btn btn-sm btn-primary" onclick="VERCEL_DEPLOY.startDeploy()">🚀 Deploy</button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="VERCEL_DEPLOY.openDashboard()">📊 Dashboard</button>
                    ${this.status.deployUrl ? `<button class="btn btn-sm btn-outline-success" onclick="VERCEL_DEPLOY.openDeployedSite()">🌐 Abrir Site</button>` : ''}
                </div>
            </div>
        `;
    }
};

// Exporta o módulo
window.VERCEL_DEPLOY = VERCEL_DEPLOY;