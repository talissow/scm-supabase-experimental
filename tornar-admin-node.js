// Script Node.js para tornar usuário admin
// Execute: node tornar-admin-node.js

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://kaqkzrngebxfuvquromi.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'COLE_SUA_CHAVE_AQUI';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function tornarAdmin() {
    console.log('🔧 Iniciando processo para tornar usuário admin...');
    console.log('📧 Email: talissonsousa10@gmail.com');
    console.log('');
    
    try {
        // Executar UPDATE SQL
        const { data, error } = await supabase
            .from('users')
            .update({
                role: 'admin',
                is_active: true
            })
            .eq('email', 'talissonsousa10@gmail.com')
            .select();
        
        if (error) {
            console.error('❌ Erro ao atualizar usuário:', error);
            
            // Se usuário não existe, tentar criar
            if (error.code === 'PGRST116') {
                console.log('⚠️ Usuário não encontrado, tentando criar...');
                
                const { data: createData, error: createError } = await supabase
                    .from('users')
                    .insert({
                        email: 'talissonsousa10@gmail.com',
                        full_name: 'Talisson Sousa de Santana',
                        role: 'admin',
                        is_active: true
                    })
                    .select();
                
                if (createError) {
                    console.error('❌ Erro ao criar usuário:', createError);
                    return;
                }
                
                console.log('✅ Usuário criado com sucesso!');
                console.log(createData);
            }
            
            return;
        }
        
        if (!data || data.length === 0) {
            console.log('❌ Usuário não encontrado na tabela users');
            console.log('💡 O usuário precisa fazer login primeiro para criar o registro');
            return;
        }
        
        console.log('✅ SUCESSO! Usuário atualizado para admin:');
        console.log('');
        console.log('📋 Dados atualizados:');
        console.log('   📧 Email:', data[0].email);
        console.log('   👤 Nome:', data[0].full_name);
        console.log('   👑 Role:', data[0].role);
        console.log('   ✅ Status:', data[0].is_active ? 'Ativo' : 'Inativo');
        console.log('   🆔 ID:', data[0].id);
        console.log('   🔄 Atualizado em:', new Date(data[0].updated_at).toLocaleString('pt-BR'));
        console.log('');
        console.log('🎉 Agora faça login e o botão admin aparecerá!');
        
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
    }
}

// Executar
tornarAdmin();

