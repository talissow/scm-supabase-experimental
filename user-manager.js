// ===== GERENCIADOR COMPLETO DE USUÁRIOS =====
// Sistema de logs e gerenciamento de usuários

let allUsers = [];
let allLogs = [];
let filteredUsers = [];
let filteredLogs = [];

// Variáveis de paginação
let usersCurrentPage = 1;
let usersItemsPerPage = 10; // Padrão fixo em 10
let usersTotalPages = 1;

// Inicializar gerenciador
function initUserManager() {
    console.log('🔧 Inicializando gerenciador de usuários...');
    
    // Event listeners
    document.getElementById('manageUsersButton').addEventListener('click', openUserManager);
    document.getElementById('confirmDeleteUser').addEventListener('click', confirmDeleteUser);
    
    // Carregar dados iniciais se for admin
    if (isAdmin()) {
        loadUsersData();
        loadLogsData();
    }
}

// Verificar se é admin
function isAdmin() {
    const userProfile = window.currentUserProfile;
    return userProfile && userProfile.email === 'admin@scm.local' && userProfile.role === 'admin';
}

// Mostrar botão gerenciar usuários
function showManageUsersButton() {
    if (isAdmin()) {
        document.getElementById('manageUsersButton').style.display = 'inline-block';
    }
}

// Abrir gerenciador de usuários
function openUserManager() {
    if (!isAdmin()) {
        alert('❌ Acesso negado. Apenas administradores podem gerenciar usuários.');
        return;
    }
    
    document.getElementById('userManagerModal').style.display = 'block';
    switchUserTab('users');
    loadUsersData();
    loadLogsData();
}

// Fechar gerenciador de usuários
function closeUserManagerModal() {
    document.getElementById('userManagerModal').style.display = 'none';
}

// Alternar entre abas
function switchUserTab(tabName) {
    // Remover active de todas as abas
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.user-tab-content').forEach(content => content.classList.remove('active'));
    
    // Ativar aba selecionada
    document.querySelector(`[onclick="switchUserTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Carregar dados específicos da aba
    if (tabName === 'stats') {
        loadStats();
    }
}

// ===== GERENCIAMENTO DE USUÁRIOS =====

// Carregar dados dos usuários
async function loadUsersData() {
    try {
        const { data: users, error } = await supabaseClient
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao carregar usuários:', error);
            return;
        }

        allUsers = users;
        filteredUsers = [...users];
        renderUsersTable();
        updateUserFilters();
    } catch (error) {
        console.error('❌ Erro inesperado ao carregar usuários:', error);
    }
}

// Renderizar tabela de usuários
function renderUsersTable() {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Calcular paginação
    usersTotalPages = Math.ceil(filteredUsers.length / usersItemsPerPage);
    const startIndex = (usersCurrentPage - 1) * usersItemsPerPage;
    const endIndex = Math.min(startIndex + usersItemsPerPage, filteredUsers.length);
    const usersToShow = filteredUsers.slice(startIndex, endIndex);

    usersToShow.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.email}</td>
            <td>${user.full_name || 'N/A'}</td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
            <td><span class="status-badge ${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Ativo' : 'Inativo'}</span></td>
            <td>${new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
            <td>${getLastAccess(user.id)}</td>
            <td>
                <div class="user-actions-btns">
                    <button onclick="editUser('${user.id}')" class="btn btn-sm btn-primary">✏️ Editar</button>
                    <button onclick="deleteUserFromManager('${user.id}')" class="btn btn-sm btn-danger">🗑️ Excluir</button>
                    <button onclick="viewUserLogs('${user.id}')" class="btn btn-sm btn-info">📊 Logs</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Atualizar controles de paginação
    updateUsersPaginationControls();
}

// Filtrar usuários
function filterUsers() {
    const search = document.getElementById('userSearch').value.toLowerCase();
    const role = document.getElementById('roleFilter').value;
    const status = document.getElementById('statusFilter').value;

    filteredUsers = allUsers.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(search) || 
                            (user.full_name && user.full_name.toLowerCase().includes(search));
        const matchesRole = !role || user.role === role;
        const matchesStatus = status === '' || user.is_active.toString() === status;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Resetar para primeira página ao filtrar
    usersCurrentPage = 1;
    renderUsersTable();
}

// ===== FUNÇÕES DE PAGINAÇÃO =====

// Mudar itens por página
function usersChangeItemsPerPage() {
    const select = document.getElementById('usersItemsPerPage');
    usersItemsPerPage = parseInt(select.value);
    usersCurrentPage = 1; // Voltar para primeira página
    renderUsersTable();
}

// Atualizar controles de paginação
function updateUsersPaginationControls() {
    const paginationInfo = document.getElementById('usersPaginationInfo');
    const pageNumbers = document.getElementById('usersPageNumbers');
    const firstPage = document.getElementById('usersFirstPage');
    const prevPage = document.getElementById('usersPrevPage');
    const nextPage = document.getElementById('usersNextPage');
    const lastPage = document.getElementById('usersLastPage');

    if (!paginationInfo) return;

    // Atualizar informação de paginação
    const startIndex = (usersCurrentPage - 1) * usersItemsPerPage + 1;
    const endIndex = Math.min(usersCurrentPage * usersItemsPerPage, filteredUsers.length);
    paginationInfo.textContent = `Mostrando ${startIndex} a ${endIndex} de ${filteredUsers.length} usuários`;

    // Atualizar botões de navegação
    firstPage.disabled = usersCurrentPage === 1;
    prevPage.disabled = usersCurrentPage === 1;
    nextPage.disabled = usersCurrentPage === usersTotalPages;
    lastPage.disabled = usersCurrentPage === usersTotalPages;

    // Gerar números das páginas
    if (pageNumbers) {
        pageNumbers.innerHTML = '';
        
        // Mostrar até 5 páginas
        let startPage = Math.max(1, usersCurrentPage - 2);
        let endPage = Math.min(usersTotalPages, usersCurrentPage + 2);
        
        // Ajustar se estiver no início ou fim
        if (endPage - startPage < 4) {
            if (startPage === 1) {
                endPage = Math.min(usersTotalPages, startPage + 4);
            } else {
                startPage = Math.max(1, endPage - 4);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-number ${i === usersCurrentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => usersGoToPage(i);
            pageNumbers.appendChild(pageBtn);
        }
    }
}

// Ir para página específica
function usersGoToPage(page) {
    if (page >= 1 && page <= usersTotalPages && page !== usersCurrentPage) {
        usersCurrentPage = page;
        renderUsersTable();
    }
}

// Ir para página anterior
function usersGoToPreviousPage() {
    if (usersCurrentPage > 1) {
        usersGoToPage(usersCurrentPage - 1);
    }
}

// Ir para próxima página
function usersGoToNextPage() {
    if (usersCurrentPage < usersTotalPages) {
        usersGoToPage(usersCurrentPage + 1);
    }
}

// Ir para primeira página
function usersGoToFirstPage() {
    usersGoToPage(1);
}

// Ir para última página
function usersGoToLastPage() {
    usersGoToPage(usersTotalPages);
}

// Atualizar filtros de usuários
function updateUserFilters() {
    const logsUserFilter = document.getElementById('logsUserFilter');
    if (!logsUserFilter) return;

    // Limpar opções existentes (exceto "Todos os usuários")
    logsUserFilter.innerHTML = '<option value="">Todos os usuários</option>';

    // Adicionar usuários únicos
    const uniqueUsers = [...new Set(allUsers.map(user => user.email))];
    uniqueUsers.forEach(email => {
        const option = document.createElement('option');
        option.value = email;
        option.textContent = email;
        logsUserFilter.appendChild(option);
    });
}

// Obter último acesso do usuário
function getLastAccess(userId) {
    const userLogs = allLogs.filter(log => log.user_id === userId && log.action === 'login');
    if (userLogs.length === 0) return 'Nunca';
    
    const lastLogin = userLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return new Date(lastLogin.created_at).toLocaleDateString('pt-BR');
}

// ===== SISTEMA DE LOGS =====

// Carregar dados dos logs
async function loadLogsData() {
    try {
        const { data: logs, error } = await supabaseClient
            .from('audit_log')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao carregar logs:', error);
            return;
        }

        allLogs = logs;
        filteredLogs = [...logs];
        renderLogsTable();
    } catch (error) {
        console.error('❌ Erro inesperado ao carregar logs:', error);
    }
}

// Renderizar tabela de logs
function renderLogsTable() {
    const tbody = document.querySelector('#logsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    filteredLogs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(log.created_at).toLocaleString('pt-BR')}</td>
            <td>${log.user_email || 'N/A'}</td>
            <td><span class="action-badge ${log.action}">${getActionLabel(log.action)}</span></td>
            <td>${log.details || 'N/A'}</td>
            <td>${log.ip_address || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Filtrar logs
function filterLogs() {
    const dateFrom = document.getElementById('logsDateFrom').value;
    const dateTo = document.getElementById('logsDateTo').value;
    const user = document.getElementById('logsUserFilter').value;
    const action = document.getElementById('logsActionFilter').value;

    filteredLogs = allLogs.filter(log => {
        const logDate = new Date(log.created_at);
        const matchesDateFrom = !dateFrom || logDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || logDate <= new Date(dateTo + 'T23:59:59');
        const matchesUser = !user || log.user_email === user;
        const matchesAction = !action || log.action === action;

        return matchesDateFrom && matchesDateTo && matchesUser && matchesAction;
    });

    renderLogsTable();
}

// Obter label da ação
function getActionLabel(action) {
    const labels = {
        'login': '🔐 Login',
        'logout': '🚪 Logout',
        'create': '➕ Criar',
        'update': '✏️ Atualizar',
        'delete': '🗑️ Excluir',
        'export': '📄 Exportar',
        'import': '📥 Importar'
    };
    return labels[action] || action;
}

// ===== ESTATÍSTICAS =====

// Carregar estatísticas
function loadStats() {
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.is_active).length;
    const adminUsers = allUsers.filter(u => u.role === 'admin').length;
    
    const today = new Date().toDateString();
    const loginsToday = allLogs.filter(log => 
        log.action === 'login' && 
        new Date(log.created_at).toDateString() === today
    ).length;

    document.getElementById('totalUsersStat').textContent = totalUsers;
    document.getElementById('activeUsersStat').textContent = activeUsers;
    document.getElementById('adminUsersStat').textContent = adminUsers;
    document.getElementById('loginsTodayStat').textContent = loginsToday;

    renderStatsCharts();
}

// Renderizar gráficos de estatísticas
function renderStatsCharts() {
    // Gráfico de usuários por role
    const usersCtx = document.getElementById('usersChart');
    if (usersCtx) {
        const roleData = {
            admin: allUsers.filter(u => u.role === 'admin').length,
            user: allUsers.filter(u => u.role === 'user').length
        };

        new Chart(usersCtx, {
            type: 'doughnut',
            data: {
                labels: ['Administradores', 'Usuários'],
                datasets: [{
                    data: [roleData.admin, roleData.user],
                    backgroundColor: ['#ffc107', '#17a2b8']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição por Role'
                    }
                }
            }
        });
    }

    // Gráfico de atividade (últimos 7 dias)
    const activityCtx = document.getElementById('activityChart');
    if (activityCtx) {
        const last7Days = [];
        const activityData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            last7Days.push(date.toLocaleDateString('pt-BR'));
            activityData.push(
                allLogs.filter(log => 
                    new Date(log.created_at).toDateString() === dateStr
                ).length
            );
        }

        new Chart(activityCtx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Atividades',
                    data: activityData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Atividade dos Últimos 7 Dias'
                    }
                }
            }
        });
    }
}

// ===== EXPORTAÇÃO DE DADOS =====

// Exportar usuários para CSV
function exportUsersToCSV() {
    const headers = ['Email', 'Nome', 'Role', 'Status', 'Criado', 'Último Acesso'];
    const csvContent = [
        headers.join(','),
        ...filteredUsers.map(user => [
            user.email,
            user.full_name || 'N/A',
            user.role,
            user.is_active ? 'Ativo' : 'Inativo',
            new Date(user.created_at).toLocaleDateString('pt-BR'),
            getLastAccess(user.id)
        ].join(','))
    ].join('\n');

    downloadCSV(csvContent, 'usuarios.csv');
}

// Exportar logs para CSV
function exportLogsToCSV() {
    const headers = ['Data/Hora', 'Usuário', 'Ação', 'Detalhes', 'IP'];
    const csvContent = [
        headers.join(','),
        ...filteredLogs.map(log => [
            new Date(log.created_at).toLocaleString('pt-BR'),
            log.user_email || 'N/A',
            log.action,
            log.details || 'N/A',
            log.ip_address || 'N/A'
        ].join(','))
    ].join('\n');

    downloadCSV(csvContent, 'logs_uso.csv');
}

// Exportar logs para PDF
function exportLogsToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Logs de Uso do Sistema', 20, 20);
    
    // Data de geração
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
    
    // Dados dos logs
    doc.setFontSize(8);
    let y = 40;
    
    filteredLogs.slice(0, 50).forEach(log => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        
        doc.text(`${new Date(log.created_at).toLocaleString('pt-BR')}`, 20, y);
        doc.text(`${log.user_email}`, 80, y);
        doc.text(`${log.action}`, 140, y);
        doc.text(`${log.details || 'N/A'}`, 170, y);
        
        y += 5;
    });
    
    doc.save('logs_uso.pdf');
}

// Download CSV
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== AÇÕES DE USUÁRIO =====

// Editar usuário
function editUser(userId) {
    // Usar o modal de edição do admin-panel.js
    if (typeof showCreateUserModal === 'function') {
        showCreateUserModal(userId);
    } else {
        // Fallback para edição simples
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;

        const newName = prompt('Novo nome completo:', user.full_name || '');
        if (newName === null) return;

        const newRole = prompt('Novo role (admin/user):', user.role);
        if (newRole === null) return;

        const isActive = confirm('Usuário ativo?');
        
        updateUser(userId, {
            full_name: newName,
            role: newRole,
            is_active: isActive
        });
    }
}

// Atualizar usuário
async function updateUser(userId, updates) {
    try {
        const { error } = await supabaseClient
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (error) {
            console.error('❌ Erro ao atualizar usuário:', error);
            alert('❌ Erro ao atualizar usuário');
            return;
        }

        // Log da ação
        logAction('update', `Usuário ${userId} atualizado`);
        
        alert('✅ Usuário atualizado com sucesso!');
        loadUsersData();
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        alert('❌ Erro inesperado');
    }
}

// Excluir usuário
function deleteUserFromManager(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    if (user.email === 'admin@scm.local') {
        alert('❌ Não é possível excluir o administrador padrão!');
        return;
    }

    // Usar o modal de confirmação do admin-panel.js se disponível
    if (typeof window.deleteUser === 'function') {
        window.deleteUser(userId);
    } else {
        // Fallback para confirmação simples
        if (confirm(`Tem certeza que deseja excluir o usuário ${user.email}?`)) {
            confirmDeleteUser(userId);
        }
    }
}

// Confirmar exclusão
async function confirmDeleteUser(userId) {
    try {
        const { error } = await supabaseClient
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) {
            console.error('❌ Erro ao excluir usuário:', error);
            alert('❌ Erro ao excluir usuário');
            return;
        }

        // Log da ação
        logAction('delete', `Usuário ${userId} excluído`);
        
        alert('✅ Usuário excluído com sucesso!');
        loadUsersData();
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        alert('❌ Erro inesperado');
    }
}

// Ver logs de usuário específico
function viewUserLogs(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    // Filtrar logs do usuário
    document.getElementById('logsUserFilter').value = user.email;
    switchUserTab('logs');
    filterLogs();
}

// Limpar logs antigos
async function clearOldLogs() {
    if (!confirm('⚠️ Isso removerá logs com mais de 30 dias. Continuar?')) {
        return;
    }

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { error } = await supabaseClient
            .from('audit_log')
            .delete()
            .lt('created_at', thirtyDaysAgo.toISOString());

        if (error) {
            console.error('❌ Erro ao limpar logs:', error);
            alert('❌ Erro ao limpar logs');
            return;
        }

        // Log da ação
        logAction('delete', 'Logs antigos limpos');
        
        alert('✅ Logs antigos removidos com sucesso!');
        loadLogsData();
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        alert('❌ Erro inesperado');
    }
}

// ===== SISTEMA DE LOGS =====

// Registrar ação do usuário
async function logAction(action, details = '', ipAddress = null) {
    try {
        const userProfile = window.currentUserProfile;
        if (!userProfile) return;

        const { error } = await supabaseClient
            .from('audit_log')
            .insert({
                user_id: userProfile.id,
                user_email: userProfile.email,
                action: action,
                details: details,
                ip_address: ipAddress || await getClientIP(),
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('❌ Erro ao registrar log:', error);
        }
    } catch (error) {
        console.error('❌ Erro inesperado ao registrar log:', error);
    }
}

// Obter IP do cliente
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'N/A';
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que auth esteja inicializado
    setTimeout(() => {
        initUserManager();
    }, 2000);
});

// Também inicializar quando window estiver carregado
window.addEventListener('load', () => {
    setTimeout(() => {
        initUserManager();
    }, 1000);
});
