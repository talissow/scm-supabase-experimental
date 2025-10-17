(function() {
  // Credenciais do Supabase (configuradas com suas credenciais)
  const DEFAULT_CONFIG = {
    url: 'https://kaqkzrngebxfuvquromi.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthcWt6cm5nZWJ4ZnV2cXVyb21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzQ5MDQsImV4cCI6MjA3NTYxMDkwNH0.3O09SWqE4oajOfZMdhb-waVXlAw-FwYb0qr6IsZxZro'
  };

  const SUPABASE_CONFIG = window.SUPABASE_CONFIG || DEFAULT_CONFIG;
  const SUPABASE_URL = SUPABASE_CONFIG.url;
  const SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;

  function isSupabaseConfigured() {
    return (
      typeof SUPABASE_URL === 'string' && SUPABASE_URL.startsWith('http') &&
      typeof SUPABASE_ANON_KEY === 'string' && SUPABASE_ANON_KEY.length > 20
    );
  }

  function initSupabase() {
    try {
      if (!isSupabaseConfigured()) {
        console.warn('⚪ Supabase não configurado (usando IndexedDB local)');
        return false;
      }
      if (typeof supabase === 'undefined') {
        console.error('❌ Biblioteca Supabase não carregada');
        return false;
      }
      if (window.supabaseClient) {
        return true;
      }
      window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase client inicializado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar Supabase:', error);
      return false;
    }
  }

  function isOnline() {
    return navigator.onLine;
  }

  function getOperationMode() {
    if (typeof supabase !== 'undefined' && isSupabaseConfigured() && isOnline()) {
      return 'online';
    }
    return isOnline() ? 'local' : 'offline';
  }

  // Exportar globais esperadas por outras partes do sistema
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
  window.SUPABASE_URL = SUPABASE_URL;
  window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
  window.isSupabaseConfigured = window.isSupabaseConfigured || isSupabaseConfigured;
  window.initSupabase = window.initSupabase || initSupabase;
  window.isOnline = window.isOnline || isOnline;
  window.getOperationMode = window.getOperationMode || getOperationMode;
})();

