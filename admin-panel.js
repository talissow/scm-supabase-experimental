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
                
                // Mostrar botão gerenciar usuários
                const manageUsersButton = document.getElementById('manageUsersButton');
                if (manageUsersButton) {
                    manageUsersButton.style.display = 'inline-block';
                    console.log('✅ Botão gerenciar usuários exibido');
                }
                
                // Mostrar aba admin
                const adminTab = document.querySelector('[data-tab="admin"]');
                if (adminTab) {
                    adminTab.style.display = 'block';
                    console.log('✅ Aba admin exibida');
                }
                
                // Definir perfil do usuário globalmente
                window.currentUserProfile = userProfile;
                
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
async function showCreateUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('userModalTitle');
    const form = document.getElementById('userForm');

    if (userId) {
        modalTitle.textContent = '✏️ Editar Usuário';
        
        try {
            // Buscar dados do usuário
            const { data: user, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            // Preencher formulário
            document.getElementById('userId').value = user.id;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userFullName').value = user.full_name || '';
            document.getElementById('userRole').value = user.role;
            document.getElementById('userIsActive').checked = user.is_active;
            
            // Ocultar campo de senha para edição
            const passwordField = document.getElementById('userPassword').parentElement;
            passwordField.style.display = 'none';
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            alert('❌ Erro ao carregar dados do usuário');
            return;
        }
    } else {
        modalTitle.textContent = '➕ Novo Usuário';
        form.reset();
        document.getElementById('userId').value = '';
        
        // Mostrar campo de senha para criação
        const passwordField = document.getElementById('userPassword').parentElement;
        passwordField.style.display = 'block';
    }

    modal.style.display = 'block';
}

// Lidar com envio do formulário de usuário
async function handleUserSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userId = document.getElementById('userId').value;
    const userData = {
        email: formData.get('email'),
        full_name: formData.get('full_name'),
        role: formData.get('role'),
        is_active: formData.get('is_active') === 'on'
    };

    try {
        if (userId) {
            // Atualizar usuário existente
            const { error } = await supabaseClient
                .from('users')
                .update(userData)
                .eq('id', userId);

            if (error) throw error;
            
            alert('✅ Usuário atualizado com sucesso!');
        } else {
            // Criar novo usuário
            const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
                email: userData.email,
                password: formData.get('password'),
                email_confirm: true,
                user_metadata: {
                    full_name: userData.full_name
                }
            });

            if (authError) throw authError;

            const { error: userError } = await supabaseClient
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: userData.email,
                    full_name: userData.full_name,
                    role: userData.role,
                    is_active: userData.is_active
                });

            if (userError) throw userError;
            
            alert('✅ Usuário criado com sucesso!');
        }
        
        // Fechar modal
        closeUserModal();
        
        // Recarregar lista
        loadUsers();
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        alert('❌ Erro ao salvar usuário: ' + error.message);
    }
}

// Editar usuário
function editUser(userId) {
    showCreateUserModal(userId);
}

// Excluir usuário
async function deleteUser(userId) {
    try {
        // Buscar dados do usuário
        const { data: user, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        // Não permitir exclusão do admin padrão
        if (user.email === 'admin@scm.local') {
            alert('❌ Não é possível excluir o administrador padrão do sistema!');
            return;
        }

        const modal = document.getElementById('deleteUserModal');
        const userNameElement = document.getElementById('deleteUserName');
        
        if (userNameElement) {
            userNameElement.textContent = user.full_name || user.email;
        }
        
        modal.style.display = 'block';
        
        // Armazenar ID para exclusão
        modal.dataset.userId = userId;
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        alert('❌ Erro ao carregar dados do usuário');
    }
}

// Fechar modal de usuário
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Confirmar exclusão de usuário
async function confirmDeleteUser() {
    const modal = document.getElementById('deleteUserModal');
    const userId = modal.dataset.userId;
    
    if (!userId) {
        alert('❌ ID do usuário não encontrado');
        return;
    }

    try {
        // Excluir usuário da tabela users
        const { error: userError } = await supabaseClient
            .from('users')
            .delete()
            .eq('id', userId);

        if (userError) throw userError;

        // Excluir usuário do Auth (opcional - pode manter para histórico)
        // const { error: authError } = await supabaseClient.auth.admin.deleteUser(userId);
        // if (authError) console.warn('Aviso: Erro ao excluir do Auth:', authError);
        
        alert('✅ Usuário excluído com sucesso!');
        
        // Fechar modal
        closeDeleteUserModal();
        
        // Recarregar lista
        loadUsers();
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('❌ Erro ao excluir usuário: ' + error.message);
    }
}

// Fechar modal de confirmação de exclusão
function closeDeleteUserModal() {
    document.getElementById('deleteUserModal').style.display = 'none';
}

// Sistema simplificado - apenas admin@scm.local é admin
console.log('ℹ️ Sistema simplificado: apenas admin@scm.local tem acesso de administrador');

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que auth esteja inicializado
    setTimeout(() => {
        checkAdminAccess();
    }, 1500);
});