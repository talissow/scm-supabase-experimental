// GitHub Integration Module
// Este módulo facilita a integração com GitHub para controle de versão

const GITHUB_INTEGRATION = {
    // Configuração do repositório
    repo: {
        name: 'scm-supabase-experimental',
        owner: '', // Será preenchido pelo usuário na interface
        branch: 'main'
    },
    
    // Status da conexão
    status: {
        connected: false,
        lastSync: null,
        pendingChanges: 0
    },
    
    // Inicializa a integração com GitHub
    init: function(ownerName) {
        this.repo.owner = ownerName;
        this.updateStatus();
        console.log(`🔗 GitHub Integration inicializado para ${this.repo.owner}/${this.repo.name}`);
        return this;
    },
    
    // Atualiza o status da conexão
    updateStatus: function() {
        // Em uma implementação real, faria uma chamada à API do GitHub
        // Simulação para demonstração
        this.status.connected = !!this.repo.owner;
        this.status.lastSync = new Date().toISOString();
        this.status.pendingChanges = 0;
        
        // Atualiza a UI se o elemento existir
        const statusElement = document.getElementById('github-status');
        if (statusElement) {
            statusElement.innerHTML = this.getStatusHTML();
        }
        
        return this.status;
    },
    
    // Retorna HTML com status da conexão
    getStatusHTML: function() {
        return `
            <div class="github-status ${this.status.connected ? 'connected' : 'disconnected'}">
                <h4>GitHub: ${this.status.connected ? '✅ Conectado' : '❌ Desconectado'}</h4>
                <p>Repositório: ${this.repo.owner}/${this.repo.name}</p>
                <p>Branch: ${this.repo.branch}</p>
                <p>Última sincronização: ${this.status.lastSync ? new Date(this.status.lastSync).toLocaleString() : 'Nunca'}</p>
                <p>Alterações pendentes: ${this.status.pendingChanges}</p>
            </div>
        `;
    },
    
    // Simula um commit para o GitHub
    commit: function(message) {
        if (!this.status.connected) {
            console.error('❌ Não conectado ao GitHub');
            return false;
        }
        
        console.log(`📤 Simulando commit para GitHub: "${message}"`);
        
        // Em uma implementação real, usaria a API do GitHub
        // Para demonstração, apenas atualizamos o status
        this.status.lastSync = new Date().toISOString();
        this.updateStatus();
        
        // Exibe notificação de sucesso
        if (typeof showSuccessToast === 'function') {
            showSuccessToast(`Commit realizado: ${message}`);
        }
        
        return true;
    },
    
    // Gera URL para abrir o repositório no GitHub
    getRepoURL: function() {
        return `https://github.com/${this.repo.owner}/${this.repo.name}`;
    },
    
    // Abre o repositório no GitHub
    openRepo: function() {
        if (!this.status.connected) {
            console.error('❌ Não conectado ao GitHub');
            return false;
        }
        
        window.open(this.getRepoURL(), '_blank');
        return true;
    },
    
    // Gera instruções para configuração manual
    getSetupInstructions: function() {
        return `
            <h3>Configuração do GitHub</h3>
            <ol>
                <li>Crie um repositório no GitHub chamado <code>${this.repo.name}</code></li>
                <li>Execute os seguintes comandos no terminal:</li>
                <pre>
git init
git add .
git commit -m "Primeiro commit"
git branch -M main
git remote add origin https://github.com/${this.repo.owner}/${this.repo.name}.git
git push -u origin main
                </pre>
            </ol>
        `;
    }
};

// Exporta o módulo
window.GITHUB_INTEGRATION = GITHUB_INTEGRATION;