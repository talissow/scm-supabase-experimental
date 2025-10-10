// ===== CONFIGURAÇÃO DO SUPABASE =====
// Substitua com suas credenciais do Supabase

// Variáveis globais para compatibilidade
const SUPABASE_URL = 'https://kaqkzrngebxfuvquromi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcWt6cm5nZWJ4ZnV2cXVyb21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzQ5MDQsImV4cCI6MjA3NTYxMDkwNH0.3O09SWqE4oajOfZMdhb-waVXlAw-FwYb0qr6IsZxZro';

const SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
};

// Inicializar cliente Supabase
let supabaseClient = null;

function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase library não carregada!');
        console.log('Adicione no HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return false;
    }
    
    try {
        supabaseClient = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        console.log('✅ Supabase inicializado com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
        return false;
    }
}

// Verificar se está online
function isOnline() {
    return navigator.onLine;
}

// Verificar se Supabase está configurado
function isSupabaseConfigured() {
    return SUPABASE_CONFIG.url !== 'COLE_SUA_URL_AQUI' &&
           SUPABASE_CONFIG.anonKey !== 'COLE_SUA_CHAVE_PUBLICA_AQUI';
}

// Modo de operação do sistema
function getOperationMode() {
    if (!isSupabaseConfigured()) {
        return 'local'; // Modo offline (IndexedDB)
    }
    
    if (!isOnline()) {
        return 'offline'; // Offline temporário
    }
    
    return 'online'; // Online com Supabase
}

