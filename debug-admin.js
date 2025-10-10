// 🔍 Script de Diagnóstico para Problema de Admin
// Execute no console do navegador para debugar

async function debugAdminAccess() {
    console.log('🔍 Iniciando diagnóstico de acesso admin...');
    
    try {
        // 1. Verificar se Supabase está inicializado
        if (typeof supabaseClient === 'undefined') {
            console.error('❌ Supabase client não inicializado');
            return;
        }
        
        // 2. Verificar sessão atual
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError) {
            console.error('❌ Erro ao verificar sessão:', sessionError);
            return;
        }
        
        if (!session) {
            console.error('❌ Nenhuma sessão ativa');
            return;
        }
        
        console.log('✅ Sessão ativa:', {
            userId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || 'N/A'
        });
        
        // 3. Verificar se usuário existe na tabela users
        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
        
        if (userError) {
            console.error('❌ Erro ao buscar usuário na tabela users:', userError);
            
            // Tentar buscar por email
            const { data: userByEmail, error: emailError } = await supabaseClient
                .from('users')
                .select('*')
                .eq('email', session.user.email)
                .single();
            
            if (emailError) {
                console.error('❌ Usuário não encontrado na tabela users por ID nem por email');
                console.log('💡 Solução: Criar registro na tabela users');
                return;
            } else {
                console.log('✅ Usuário encontrado por email:', userByEmail);
                console.log('⚠️ ID do auth.users diferente do ID na tabela users');
                console.log('💡 Solução: Atualizar ID na tabela users');
                return;
            }
        }
        
        console.log('✅ Usuário encontrado na tabela users:', userData);
        
        // 4. Verificar role
        if (userData.role === 'admin') {
            console.log('✅ Usuário é ADMIN - botão deveria aparecer');
        } else {
            console.log('❌ Usuário NÃO é admin, role atual:', userData.role);
            console.log('💡 Solução: Atualizar role para admin');
        }
        
        // 5. Verificar status
        if (!userData.is_active) {
            console.log('⚠️ Usuário está INATIVO');
            console.log('💡 Solução: Ativar usuário');
        }
        
        // 6. Testar função isUserAdmin
        if (typeof auth !== 'undefined' && typeof auth.isUserAdmin === 'function') {
            const isAdmin = await auth.isUserAdmin();
            console.log('🧪 Teste isUserAdmin():', isAdmin);
        }
        
    } catch (error) {
        console.error('❌ Erro inesperado no diagnóstico:', error);
    }
}

// Função para corrigir o usuário (executar apenas se necessário)
async function fixAdminUser() {
    console.log('🔧 Iniciando correção do usuário admin...');
    
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!session) {
            console.error('❌ Nenhuma sessão ativa');
            return;
        }
        
        // Verificar se já existe na tabela users
        const { data: existingUser } = await supabaseClient
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();
        
        if (existingUser) {
            // Atualizar usuário existente
            const { error: updateError } = await supabaseClient
                .from('users')
                .update({
                    id: session.user.id,
                    full_name: session.user.user_metadata?.full_name || 'Talisson Sousa de Santana',
                    role: 'admin',
                    is_active: true
                })
                .eq('email', session.user.email);
            
            if (updateError) {
                console.error('❌ Erro ao atualizar usuário:', updateError);
                return;
            }
            
            console.log('✅ Usuário atualizado com sucesso!');
        } else {
            // Criar novo usuário
            const { error: insertError } = await supabaseClient
                .from('users')
                .insert({
                    id: session.user.id,
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || 'Talisson Sousa de Santana',
                    role: 'admin',
                    is_active: true
                });
            
            if (insertError) {
                console.error('❌ Erro ao criar usuário:', insertError);
                return;
            }
            
            console.log('✅ Usuário criado com sucesso!');
        }
        
        // Recarregar página para aplicar mudanças
        console.log('🔄 Recarregando página...');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erro inesperado na correção:', error);
    }
}

// Executar diagnóstico automaticamente
console.log('🚀 Script de diagnóstico carregado!');
console.log('Para executar o diagnóstico, digite: debugAdminAccess()');
console.log('Para corrigir o usuário, digite: fixAdminUser()');

// Exportar funções globalmente
window.debugAdminAccess = debugAdminAccess;
window.fixAdminUser = fixAdminUser;
