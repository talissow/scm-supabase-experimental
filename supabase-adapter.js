// ===== ADAPTER SUPABASE =====
// Funções para integrar com Supabase (substitui db.js)

// ===== PRODUTOS =====

async function getAllProductsSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        // Converter para formato do sistema
        return (data || []).map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            type: p.type,
            quantity: p.quantity,
            minQuantity: p.min_quantity,
            unit: p.unit
        }));
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
    }
}

async function addProductSupabase(product) {
    try {
        const { error } = await supabaseClient
            .from('products')
            .insert([{
                id: product.id,
                name: product.name,
                description: product.description || '',
                type: product.type,
                quantity: product.quantity,
                min_quantity: product.minQuantity,
                unit: product.unit
            }]);
        
        if (error) throw error;
        console.log('✅ Produto adicionado no Supabase');
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        throw error;
    }
}

async function updateProductSupabase(product) {
    try {
        const { error } = await supabaseClient
            .from('products')
            .update({
                name: product.name,
                description: product.description || '',
                type: product.type,
                quantity: product.quantity,
                min_quantity: product.minQuantity,
                unit: product.unit
            })
            .eq('id', product.id);
        
        if (error) throw error;
        console.log('✅ Produto atualizado no Supabase');
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
    }
}

async function deleteProductSupabase(id) {
    try {
        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        console.log('✅ Produto excluído do Supabase');
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        throw error;
    }
}

// ===== MOVIMENTAÇÕES =====

async function getAllMovementsSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('movements')
            .select('*')
            .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        return (data || []).map(m => ({
            id: m.id,
            productId: m.product_id,
            type: m.type,
            quantity: m.quantity,
            timestamp: m.timestamp
        }));
    } catch (error) {
        console.error('Erro ao buscar movimentações:', error);
        throw error;
    }
}

async function addMovementSupabase(movement) {
    try {
        const { error } = await supabaseClient
            .from('movements')
            .insert([{
                id: movement.id,
                product_id: movement.productId,
                type: movement.type,
                quantity: movement.quantity,
                timestamp: movement.timestamp
            }]);
        
        if (error) throw error;
        console.log('✅ Movimentação registrada no Supabase');
    } catch (error) {
        console.error('Erro ao adicionar movimentação:', error);
        throw error;
    }
}

// ===== TIPOS PERSONALIZADOS =====

async function getAllCustomTypesSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('custom_types')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar tipos:', error);
        throw error;
    }
}

async function addCustomTypeSupabase(customType) {
    try {
        const { error } = await supabaseClient
            .from('custom_types')
            .insert([customType]);
        
        if (error) throw error;
        console.log('✅ Tipo personalizado adicionado no Supabase');
    } catch (error) {
        console.error('Erro ao adicionar tipo:', error);
        throw error;
    }
}

async function deleteCustomTypeSupabase(id) {
    try {
        const { error } = await supabaseClient
            .from('custom_types')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        console.log('✅ Tipo personalizado excluído do Supabase');
    } catch (error) {
        console.error('Erro ao excluir tipo:', error);
        throw error;
    }
}

// ===== FUNÇÕES HÍBRIDAS (Local + Supabase) =====

async function saveProduct(product) {
    const mode = getOperationMode();
    
    if (mode === 'online') {
        // Salva no Supabase
        await addProductSupabase(product);
    } else {
        // Salva local (IndexedDB)
        await addProduct(product);
    }
}

// ===== SINCRONIZAÇÃO =====

async function syncLocalToSupabase() {
    console.log('🔄 Sincronizando dados locais → Supabase...');
    
    try {
        // Buscar dados locais
        const localProducts = await getAllProducts();
        const localMovements = await getAllMovements();
        
        // Enviar para Supabase
        for (const product of localProducts) {
            await addProductSupabase(product);
        }
        
        for (const movement of localMovements) {
            await addMovementSupabase(movement);
        }
        
        console.log('✅ Sincronização completa!');
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
    }
}

async function syncSupabaseToLocal() {
    console.log('🔄 Sincronizando Supabase → dados locais...');
    
    try {
        // Buscar do Supabase
        const cloudProducts = await getAllProductsSupabase();
        const cloudMovements = await getAllMovementsSupabase();
        
        // Salvar localmente
        await saveAllProducts(cloudProducts);
        await saveAllMovements(cloudMovements);
        
        console.log('✅ Dados baixados do Supabase!');
    } catch (error) {
        console.error('❌ Erro ao baixar dados:', error);
    }
}

