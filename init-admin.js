// ===== INICIALIZADOR DO ADMIN PADRÃO =====
// Script para garantir que a conta admin padrão existe

async function ensureAdminExists() {
    try {
        console.log('🔍 Verificando se admin padrão existe...');
        
        // Verificar se admin@scm.local existe
        const { data: adminUser, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('email', 'admin@scm.local')
            .eq('role', 'admin')
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('❌ Erro ao verificar admin:', error);
            return false;
        }

        if (adminUser) {
            console.log('✅ Admin padrão já existe:', adminUser.email);
            return true;
        }

        console.log('⚠️ Admin padrão não encontrado. Criando...');
        
        // Criar admin padrão
        const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
            email: 'admin@scm.local',
            password: 'admin123456',
            email_confirm: true,
            user_metadata: {
                full_name: 'Administrador do Sistema'
            }
        });

        if (authError) {
            console.error('❌ Erro ao criar admin no Auth:', authError);
            return false;
        }

        const userId = authData.user.id;
        console.log('✅ Usuário criado no Auth:', userId);

        // Criar registro na tabela users
        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .insert({
                id: userId,
                email: 'admin@scm.local',
                full_name: 'Administrador do Sistema',
                role: 'admin',
                is_active: true
            })
            .select()
            .single();

        if (userError) {
            console.error('❌ Erro ao criar registro na tabela users:', userError);
            return false;
        }

        console.log('✅ Admin padrão criado com sucesso!');
        console.log('📧 Email: admin@scm.local');
        console.log('🔑 Senha: admin123456');
        console.log('⚠️ Altere a senha após o primeiro login!');
        
        return true;
    } catch (error) {
        console.error('❌ Erro inesperado ao criar admin:', error);
        return false;
    }
}

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que supabaseClient esteja disponível
    setTimeout(async () => {
        if (typeof supabaseClient !== 'undefined') {
            await ensureAdminExists();
        } else {
            console.warn('⚠️ supabaseClient não disponível para inicialização do admin');
        }
    }, 2000);
});
