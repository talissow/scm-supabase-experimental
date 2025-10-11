// ===== PAINEL DE ADMINISTRAÇÃO SIMPLIFICADO =====
// Apenas admin@scm.local tem acesso de administrador

// Verificar se usuário é admin e mostrar elementos
async function checkAdminAccess() {
    try {
        console.log('🔍 Verificando acesso de admin...');
        
        if (typeof auth !== 'undefined' && typeof auth.getUserProfile === 'function') {
            const userProfile = await auth.getUserProfile();
            // Apenas admin@scm.local é admin
            const isAdmin = userProfile && userProfile.email === 'admin@scm.local' && userProfile.role === 'admin';
            console.log('🧪 Verificando admin:', userProfile?.email, 'é admin:', isAdmin);
            
            if (isAdmin) {
                // Mostrar botão admin no header
                const adminButton = document.getElementById('adminButton');
                if (adminButton) {
                    adminButton.style.display = 'block';
                    console.log('✅ Botão admin exibido');
                }
                
                // Mostrar aba admin
                const adminTab = document.querySelector('[data-tab="admin"]');
                if (adminTab) {
                    adminTab.style.display = 'block';
                    console.log('✅ Aba admin exibida');
                }
                
                console.log('✅ Acesso de administrador concedido para admin@scm.local');
            } else {
                console.log('❌ Acesso negado - apenas admin@scm.local tem acesso de administrador');
                console.log('👤 Email atual:', userProfile?.email);
                console.log('💡 Use a conta admin padrão: admin@scm.local / admin123456');
            }
        } else {
            console.error('❌ Módulo de autenticação não disponível');
        }
    } catch (error) {
        console.error('❌ Erro ao verificar acesso admin:', error);
    }
}

// Carregar lista de usuários
async function loadUsers() {
    try {
        const { data: users, error } = await supabaseClient
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro ao carregar usuários:', error);
            return;
        }

        renderUsersTable(users);
        updateAdminStats(users);
    } catch (error) {
        console.error('❌ Erro inesperado ao carregar usuários:', error);
    }
}

// Renderizar tabela de usuários
function renderUsersTable(users) {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.email}</td>
            <td>${user.full_name || 'N/A'}</td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
            <td><span class="status-badge ${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Ativo' : 'Inativo'}</span></td>
            <td>${new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
            <td>
                <div class="user-actions-btns">
                    <button onclick="editUser('${user.id}')" class="btn btn-sm btn-primary">✏️ Editar</button>
                    <button onclick="deleteUser('${user.id}')" class="btn btn-sm btn-danger">🗑️ Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Atualizar estatísticas do admin
function updateAdminStats(users) {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    const adminUsers = users.filter(u => u.role === 'admin').length;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('adminUsers').textContent = adminUsers;
}

// Mostrar modal de criar/editar usuário
function showCreateUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('userModalTitle');
    const form = document.getElementById('userForm');

    if (userId) {
        modalTitle.textContent = '✏️ Editar Usuário';
        // Preencher formulário com dados do usuário
        // Implementar busca de dados do usuário
    } else {
        modalTitle.textContent = '➕ Novo Usuário';
        form.reset();
    }

    modal.style.display = 'block';
}

// Lidar com envio do formulário de usuário
async function handleUserSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        email: formData.get('email'),
        full_name: formData.get('full_name'),
        role: formData.get('role'),
        is_active: formData.get('is_active') === 'on'
    };

    try {
        // Implementar criação/atualização de usuário
        console.log('Dados do usuário:', userData);
        
        // Fechar modal
        closeUserModal();
        
        // Recarregar lista
        loadUsers();
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
    }
}

// Editar usuário
function editUser(userId) {
    showCreateUserModal(userId);
}

// Excluir usuário
function deleteUser(userId) {
    const modal = document.getElementById('deleteUserModal');
    modal.style.display = 'block';
    
    // Armazenar ID para exclusão
    modal.dataset.userId = userId;
}

// Fechar modal de usuário
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Fechar modal de confirmação de exclusão
function closeDeleteUserModal() {
    document.getElementById('deleteUserModal').style.display = 'none';
}

// Sistema simplificado - apenas admin@scm.local é admin
console.log('ℹ️ Sistema simplificado: apenas admin@scm.local tem acesso de administrador');