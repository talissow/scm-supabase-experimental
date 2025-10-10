// ===== MÓDULO DE AUTENTICAÇÃO SUPABASE =====
let currentUser = null;
let isAuthenticated = false;

// Inicializar autenticação
async function initAuth() {
    try {
        if (!supabaseClient) {
            console.error('❌ Supabase client não inicializado');
            return false;
        }

        // Verificar sessão ativa
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error('❌ Erro ao verificar sessão:', error);
            return false;
        }

        if (session) {
            currentUser = session.user;
            isAuthenticated = true;
            console.log('✅ Usuário autenticado:', currentUser.email);
            
            // Verificar se usuário existe na tabela users
            await ensureUserProfile();
            
            return true;
        } else {
            console.log('📱 Nenhuma sessão ativa');
            return false;
        }
    } catch (error) {
        console.error('❌ Erro na inicialização da autenticação:', error);
        return false;
    }
}

// Fazer login
async function login(email, password) {
    try {
        if (!supabaseClient) {
            console.log('🔄 Supabase client não inicializado, tentando inicializar...');
            const initialized = initSupabase();
            if (!initialized) {
                throw new Error('Falha ao inicializar Supabase client');
            }
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('❌ Erro no login:', error);
            return { success: false, error: error.message };
        }

        currentUser = data.user;
        isAuthenticated = true;
        
        // Verificar se usuário existe na tabela users
        await ensureUserProfile();
        
        console.log('✅ Login realizado com sucesso');
        return { success: true, user: currentUser };
        
    } catch (error) {
        console.error('❌ Erro inesperado no login:', error);
        return { success: false, error: 'Erro inesperado' };
    }
}

// Fazer logout
async function logout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        
        if (error) {
            console.error('❌ Erro no logout:', error);
            return false;
        }

        currentUser = null;
        isAuthenticated = false;
        
        console.log('✅ Logout realizado com sucesso');
        return true;
        
    } catch (error) {
        console.error('❌ Erro inesperado no logout:', error);
        return false;
    }
}

// Registrar novo usuário
async function signUp(email, password, fullName) {
    try {
        console.log('🔄 Tentando registrar usuário:', email);
        
        if (!supabaseClient) {
            console.log('🔄 Supabase client não inicializado, tentando inicializar...');
            const initialized = initSupabase();
            if (!initialized) {
                throw new Error('Falha ao inicializar Supabase client');
            }
        }

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) {
            console.error('❌ Erro no registro:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Registro realizado com sucesso:', data);
        return { success: true, user: data.user };
        
    } catch (error) {
        console.error('❌ Erro inesperado no registro:', error);
        return { success: false, error: error.message || 'Erro inesperado' };
    }
}

// Recuperar senha
async function resetPassword(email) {
    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login.html`
        });

        if (error) {
            console.error('❌ Erro ao enviar email de recuperação:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Email de recuperação enviado');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Erro inesperado na recuperação:', error);
        return { success: false, error: 'Erro inesperado' };
    }
}

// Verificar se usuário tem perfil na tabela users
async function ensureUserProfile() {
    try {
        if (!currentUser) return;

        // Verificar se usuário já existe na tabela users
        const { data: existingUser, error: selectError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = not found
            console.error('❌ Erro ao verificar perfil do usuário:', selectError);
            return;
        }

        // Se usuário não existe, criar perfil
        if (!existingUser) {
            const { error: insertError } = await supabaseClient
                .from('users')
                .insert({
                    id: currentUser.id,
                    email: currentUser.email,
                    full_name: currentUser.user_metadata?.full_name || null,
                    role: 'user', // Primeiro usuário será admin manualmente
                    is_active: true
                });

            if (insertError) {
                console.error('❌ Erro ao criar perfil do usuário:', insertError);
            } else {
                console.log('✅ Perfil do usuário criado');
            }
        }
    } catch (error) {
        console.error('❌ Erro inesperado ao verificar perfil:', error);
    }
}

// Obter usuário atual
function getCurrentUser() {
    return currentUser;
}

// Verificar se está autenticado
function isUserAuthenticated() {
    return isAuthenticated;
}

// Verificar se usuário é admin
async function isUserAdmin() {
    try {
        if (!currentUser) return false;

        const { data, error } = await supabaseClient
            .from('users')
            .select('role')
            .eq('id', currentUser.id)
            .single();

        if (error) {
            console.error('❌ Erro ao verificar role do usuário:', error);
            return false;
        }

        return data.role === 'admin';
    } catch (error) {
        console.error('❌ Erro inesperado ao verificar admin:', error);
        return false;
    }
}

// Redirecionar para login se não autenticado
function requireAuth() {
    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Obter dados completos do usuário
async function getUserProfile() {
    try {
        if (!currentUser) return null;

        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error) {
            console.error('❌ Erro ao obter perfil do usuário:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('❌ Erro inesperado ao obter perfil:', error);
        return null;
    }
}

// Escutar mudanças de autenticação
supabaseClient?.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Estado de autenticação mudou:', event);
    
    if (event === 'SIGNED_IN') {
        currentUser = session.user;
        isAuthenticated = true;
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        isAuthenticated = false;
    }
});

// Exportar funções para uso global
window.auth = {
    init: initAuth,
    login: login,
    logout: logout,
    signUp: signUp,
    resetPassword: resetPassword,
    getCurrentUser: getCurrentUser,
    isAuthenticated: isUserAuthenticated,
    isAdmin: isUserAdmin,
    requireAuth: requireAuth,
    getUserProfile: getUserProfile
};
