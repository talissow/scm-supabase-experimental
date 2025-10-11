// Script para tornar talissonsousa10@gmail.com admin
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kaqkzrngebxfuvquromi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcWt6cm5nZWJ4ZnV2cXVyb21pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzNDkwNCwiZXhwIjoyMDc1NjEwOTA0fQ.Ce_3TCj5YCDeWzqr3LY_aovit1-DH0Qx61FA7ESqh7g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function tornarAdmin() {
    console.log('🔧 Tornando talissonsousa10@gmail.com admin...');
    
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                role: 'admin',
                is_active: true,
                updated_at: new Date().toISOString()
            })
            .eq('email', 'talissonsousa10@gmail.com')
            .select();
        
        if (error) {
            console.error('❌ Erro:', error);
            return;
        }
        
        console.log('✅ SUCESSO!', data);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

tornarAdmin();

