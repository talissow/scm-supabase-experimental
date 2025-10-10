// 🔍 Script para Verificar Usuários Cadastrados
// Execute no console do navegador para ver todos os usuários

async function checkAllUsers() {
    console.log('🔍 Verificando usuários cadastrados no banco de dados...');
    
    try {
        // 1. Verificar se Supabase está inicializado
        if (typeof supabaseClient === 'undefined') {
            console.error('❌ Supabase client não inicializado');
            return;
        }
        
        console.log('📊 Buscando todos os usuários na tabela users...');
        
        // 2. Buscar todos os usuários da tabela users
        const { data: users, error: usersError } = await supabaseClient
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (usersError) {
            console.error('❌ Erro ao buscar usuários:', usersError);
            return;
        }
        
        console.log(`📋 Total de usuários encontrados: ${users.length}`);
        console.log('=' .repeat(60));
        
        if (users.length === 0) {
            console.log('❌ Nenhum usuário cadastrado na tabela users');
            return;
        }
        
        // 3. Exibir detalhes de cada usuário
        users.forEach((user, index) => {
            console.log(`👤 Usuário ${index + 1}:`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   👤 Nome: ${user.full_name || 'N/A'}`);
            console.log(`   🆔 ID: ${user.id}`);
            console.log(`   👑 Role: ${user.role}`);
            console.log(`   ✅ Status: ${user.is_active ? 'Ativo' : 'Inativo'}`);
            console.log(`   📅 Criado em: ${new Date(user.created_at).toLocaleString('pt-BR')}`);
            console.log(`   🔄 Atualizado em: ${new Date(user.updated_at).toLocaleString('pt-BR')}`);
            console.log('-'.repeat(40));
        });
        
        // 4. Estatísticas
        const adminCount = users.filter(u => u.role === 'admin').length;
        const userCount = users.filter(u => u.role === 'user').length;
        const activeCount = users.filter(u => u.is_active).length;
        const inactiveCount = users.filter(u => !u.is_active).length;
        
        console.log('📊 ESTATÍSTICAS:');
        console.log(`   👑 Administradores: ${adminCount}`);
        console.log(`   👤 Usuários comuns: ${userCount}`);
        console.log(`   ✅ Ativos: ${activeCount}`);
        console.log(`   ❌ Inativos: ${inactiveCount}`);
        
        // 5. Verificar usuários do Supabase Auth
        console.log('=' .repeat(60));
        console.log('🔐 Verificando usuários do Supabase Auth...');
        
        const { data: { users: authUsers }, error: authError } = await supabaseClient.auth.admin.listUsers();
        
        if (authError) {
            console.log('⚠️ Não foi possível acessar lista do Supabase Auth (normal para usuários não-admin)');
        } else {
            console.log(`🔐 Usuários no Supabase Auth: ${authUsers.length}`);
            authUsers.forEach((authUser, index) => {
                console.log(`   ${index + 1}. ${authUser.email} (ID: ${authUser.id})`);
            });
        }
        
        return users;
        
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
    }
}

// Função para buscar usuário específico por email
async function findUserByEmail(email) {
    console.log(`🔍 Buscando usuário: ${email}`);
    
    try {
        const { data: user, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error) {
            console.log(`❌ Usuário não encontrado: ${error.message}`);
            return null;
        }
        
        console.log('✅ Usuário encontrado:');
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Nome: ${user.full_name}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log(`   👑 Role: ${user.role}`);
        console.log(`   ✅ Status: ${user.is_active ? 'Ativo' : 'Inativo'}`);
        console.log(`   📅 Criado em: ${new Date(user.created_at).toLocaleString('pt-BR')}`);
        
        return user;
        
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
    }
}

// Função para criar usuário admin rapidamente
async function createAdminUser(email, fullName, password) {
    console.log(`➕ Criando usuário admin: ${email}`);
    
    try {
        // 1. Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName
            }
        });
        
        if (authError) {
            console.error('❌ Erro ao criar usuário no auth:', authError);
            return;
        }
        
        console.log('✅ Usuário criado no Supabase Auth:', authData.user.id);
        
        // 2. Criar perfil na tabela users
        const { error: profileError } = await supabaseClient
            .from('users')
            .insert({
                id: authData.user.id,
                email: email,
                full_name: fullName,
                role: 'admin',
                is_active: true
            });
        
        if (profileError) {
            console.error('❌ Erro ao criar perfil:', profileError);
            return;
        }
        
        console.log('✅ Usuário admin criado com sucesso!');
        console.log(`   📧 Email: ${email}`);
        console.log(`   👤 Nome: ${fullName}`);
        console.log(`   🆔 ID: ${authData.user.id}`);
        console.log(`   👑 Role: admin`);
        
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
    }
}

// Exportar funções globalmente
window.checkAllUsers = checkAllUsers;
window.findUserByEmail = findUserByEmail;
window.createAdminUser = createAdminUser;

// Executar automaticamente
console.log('🚀 Script de verificação de usuários carregado!');
console.log('📋 Comandos disponíveis:');
console.log('   checkAllUsers() - Ver todos os usuários');
console.log('   findUserByEmail("email@exemplo.com") - Buscar usuário específico');
console.log('   createAdminUser("email", "Nome", "senha") - Criar admin');

// Executar verificação automaticamente
checkAllUsers();
