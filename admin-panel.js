// ===== PAINEL DE ADMINISTRAÇÃO =====

// Verificar se usuário é admin e mostrar elementos
async function checkAdminAccess() {
    try {
        if (typeof auth !== 'undefined' && typeof auth.isUserAdmin === 'function') {
            const isAdmin = await auth.isUserAdmin();
            
            if (isAdmin) {
                // Mostrar botão admin no header
                const adminButton = document.getElementById('adminButton');
                if (adminButton) {
                    adminButton.style.display = 'block';
                }
                
                // Mostrar aba admin
                const adminTab = document.querySelector('[data-tab="admin"]');
                if (adminTab) {
                    adminTab.style.display = 'block';
                }
                
                console.log('✅ Acesso de administrador concedido');
            } else {
                console.log('ℹ️ Usuário não é administrador');
            }
        }
    } catch (error) {
        console.error('❌ Erro ao verificar acesso de admin:', error);
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
            showToast('Erro ao carregar usuários', 'error');
            return;
        }

        renderUsersTable(users || []);
        updateAdminStats(users || []);
    } catch (error) {
        console.error('❌ Erro inesperado ao carregar usuários:', error);
        showToast('Erro inesperado ao carregar usuários', 'error');
    }
}

// Renderizar tabela de usuários
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum usuário cadastrado.</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.full_name}</td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role}">${user.role}</span></td>
            <td><span class="status-badge status-${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Ativo' : 'Inativo'}</span></td>
            <td>${new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
            <td>
                <div class="user-actions-btns">
                    <button class="btn-sm btn-edit" onclick="editUser('${user.id}')" title="Editar usuário">
                        ✏️
                    </button>
                    <button class="btn-sm btn-delete" onclick="deleteUser('${user.id}', '${user.full_name}')" title="Excluir usuário">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Atualizar estatísticas de admin
function updateAdminStats(users) {
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const activeUsers = users.filter(u => u.is_active).length;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('adminUsers').textContent = adminUsers;
    document.getElementById('activeUsers').textContent = activeUsers;
}

// Filtrar usuários
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    // Implementar filtro (simplificado por enquanto)
    loadUsers(); // Recarregar todos os usuários
}

// Mostrar modal de criação de usuário
function showCreateUserModal() {
    document.getElementById('userModalTitle').textContent = 'Novo Usuário';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userPassword').required = true;
    document.getElementById('userModal').style.display = 'block';
}

// Editar usuário
function editUser(userId) {
    // Implementar edição de usuário
    showToast('Funcionalidade de edição será implementada', 'info');
}

// Excluir usuário
function deleteUser(userId, userName) {
    document.getElementById('deleteUserName').textContent = userName;
    document.getElementById('confirmDeleteUser').onclick = () => confirmDeleteUser(userId);
    document.getElementById('deleteUserModal').style.display = 'block';
}

// Confirmar exclusão de usuário
async function confirmDeleteUser(userId) {
    try {
        const { error } = await supabaseClient
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) {
            console.error('❌ Erro ao excluir usuário:', error);
            showToast('Erro ao excluir usuário', 'error');
            return;
        }

        closeDeleteUserModal();
        loadUsers();
        showToast('Usuário excluído com sucesso', 'success');
    } catch (error) {
        console.error('❌ Erro inesperado ao excluir usuário:', error);
        showToast('Erro inesperado ao excluir usuário', 'error');
    }
}

// Fechar modais
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function closeDeleteUserModal() {
    document.getElementById('deleteUserModal').style.display = 'none';
}

// Event listeners para admin
document.addEventListener('DOMContentLoaded', () => {
    // Verificar acesso de admin
    setTimeout(() => {
        checkAdminAccess();
    }, 1000);

    // Formulário de usuário
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(userForm);
            const userId = document.getElementById('userId').value;
            const isEdit = userId !== '';
            
            try {
                if (isEdit) {
                    // Implementar edição
                    showToast('Funcionalidade de edição será implementada', 'info');
                } else {
                    // Criar novo usuário
                    const userData = {
                        full_name: document.getElementById('userFullName').value,
                        email: document.getElementById('userEmail').value,
                        role: document.getElementById('userRole').value,
                        is_active: document.getElementById('userIsActive').checked
                    };
                    
                    // Criar usuário no Supabase Auth
                    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
                        email: userData.email,
                        password: document.getElementById('userPassword').value,
                        email_confirm: true
                    });
                    
                    if (authError) {
                        console.error('❌ Erro ao criar usuário no auth:', authError);
                        showToast('Erro ao criar usuário: ' + authError.message, 'error');
                        return;
                    }
                    
                    // Criar perfil na tabela users
                    const { error: profileError } = await supabaseClient
                        .from('users')
                        .insert({
                            id: authData.user.id,
                            email: userData.email,
                            full_name: userData.full_name,
                            role: userData.role,
                            is_active: userData.is_active
                        });
                    
                    if (profileError) {
                        console.error('❌ Erro ao criar perfil:', profileError);
                        showToast('Erro ao criar perfil do usuário', 'error');
                        return;
                    }
                    
                    closeUserModal();
                    loadUsers();
                    showToast('Usuário criado com sucesso', 'success');
                }
            } catch (error) {
                console.error('❌ Erro inesperado:', error);
                showToast('Erro inesperado ao salvar usuário', 'error');
            }
        });
    }

    // Event listeners para botão admin
    const adminButton = document.getElementById('adminButton');
    if (adminButton) {
        adminButton.addEventListener('click', () => {
            switchTab('admin');
        });
    }

    // Fechar modais ao clicar no X
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});

// Atualizar switchTab para incluir admin
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabName) {
    if (originalSwitchTab) {
        originalSwitchTab(tabName);
    }
    
    if (tabName === 'admin') {
        document.getElementById('adminTab').classList.add('active');
        loadUsers();
    }
};
