-- 👑 SCRIPT PARA TORNAR USUÁRIO ADMIN
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário existe
SELECT 
    id,
    email, 
    full_name, 
    role, 
    is_active,
    created_at
FROM public.users 
WHERE email = 'talissonsousa10@gmail.com';

-- 2. Se existir, atualizar para admin
UPDATE public.users 
SET 
    role = 'admin',
    is_active = true
WHERE email = 'talissonsousa10@gmail.com';

-- 3. Se NÃO existir, criar novo usuário admin
-- IMPORTANTE: Substitua 'ID_DO_AUTH_USERS' pelo ID real do Supabase Auth
INSERT INTO public.users (id, email, full_name, role, is_active)
VALUES (
    'ID_DO_AUTH_USERS', -- ⚠️ SUBSTITUIR PELO ID REAL
    'talissonsousa10@gmail.com',
    'Talisson Sousa de Santana',
    'admin',
    true
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    is_active = true,
    full_name = 'Talisson Sousa de Santana';

-- 4. Verificar resultado
SELECT 
    id,
    email, 
    full_name, 
    role, 
    is_active,
    created_at,
    updated_at
FROM public.users 
WHERE email = 'talissonsousa10@gmail.com';

-- ✅ Pronto! O usuário agora é admin.
