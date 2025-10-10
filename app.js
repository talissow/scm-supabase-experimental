// ===== INTEGRAÇÃO SUPABASE =====
let isSupabaseOnline = false;
let supabaseInitialized = false;
let currentUserId = null;

// Inicializar Supabase quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof supabase !== 'undefined' && isSupabaseConfigured()) {
        try {
            supabaseInitialized = initSupabase();
            if (supabaseInitialized && isOnline()) {
                isSupabaseOnline = true;
                
                // Obter usuário atual
                const { data: { session } } = await supabaseClient.auth.getSession();
                if (session) {
                    currentUserId = session.user.id;
                }
                
                console.log('🟢 SCM rodando em modo ONLINE (Supabase)');
                showConnectionStatus('online');
            } else {
                console.log('🔴 SCM rodando em modo OFFLINE (IndexedDB)');
                showConnectionStatus('offline');
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar Supabase:', error);
            showConnectionStatus('offline');
        }
    } else {
        console.log('⚪ SCM rodando em modo LOCAL (IndexedDB)');
        showConnectionStatus('local');
    }
});

// Mostrar status da conexão
function showConnectionStatus(status) {
    const header = document.querySelector('h1');
    if (!header) return;
    
    let statusIndicator = header.querySelector('.connection-status');
    if (!statusIndicator) {
        statusIndicator = document.createElement('span');
        statusIndicator.className = 'connection-status';
        header.appendChild(statusIndicator);
    }
    
    switch(status) {
        case 'online':
            statusIndicator.innerHTML = '<span style="color: #28a745; font-size: 1.2em;" title="Conectado ao Supabase">🟢</span>';
            break;
        case 'offline':
            statusIndicator.innerHTML = '<span style="color: #dc3545; font-size: 1.2em;" title="Sem conexão - modo offline">🔴</span>';
            break;
        case 'local':
            statusIndicator.innerHTML = '<span style="color: #6c757d; font-size: 1.2em;" title="Modo local - IndexedDB apenas">⚪</span>';
            break;
    }
}

// Verificar status online/offline
window.addEventListener('online', () => {
    if (supabaseInitialized) {
        isSupabaseOnline = true;
        showConnectionStatus('online');
        console.log('🟢 Conexão restaurada - modo ONLINE');
    }
});

window.addEventListener('offline', () => {
    isSupabaseOnline = false;
    showConnectionStatus('offline');
    console.log('🔴 Conexão perdida - modo OFFLINE');
});

// Sincronizar dados do Supabase com IndexedDB local
async function syncToLocalDB() {
    try {
        // Limpar dados locais
        await clearAllData();
        
        // Salvar produtos no IndexedDB
        for (const product of products) {
            await addProduct(product);
        }
        
        // Salvar movimentações no IndexedDB
        for (const movement of movements) {
            await addMovement(movement);
        }
        
        console.log('🔄 Dados sincronizados com IndexedDB local');
    } catch (error) {
        console.error('❌ Erro ao sincronizar com IndexedDB:', error);
    }
}

// Função para registrar auditoria manual (quando necessário)
async function logAuditAction(action, tableName, recordId, oldValues = null, newValues = null) {
    if (!isSupabaseOnline || !currentUserId) return;

    try {
        const auditData = {
            id: generateId(),
            user_id: currentUserId,
            action: action,
            table_name: tableName,
            record_id: recordId,
            old_values: oldValues ? JSON.stringify(oldValues) : null,
            new_values: newValues ? JSON.stringify(newValues) : null,
            created_at: new Date().toISOString()
        };

        const { error } = await supabaseClient
            .from('audit_log')
            .insert(auditData);

        if (error) {
            console.error('❌ Erro ao registrar auditoria:', error);
        }
    } catch (error) {
        console.error('❌ Erro inesperado na auditoria:', error);
    }
}

// ===== VALIDAÇÕES SIMPLES =====
function validateProduct(product, isEditing = false) {
    // Validar nome
    if (!product.name || product.name.trim().length < 3) {
        alert('❌ Nome do material deve ter pelo menos 3 caracteres!');
        return false;
    }
    
    // Verificar nome duplicado (apenas ao adicionar novo)
    if (!isEditing) {
        const duplicate = products.find(p => 
            p.name.toLowerCase().trim() === product.name.toLowerCase().trim()
        );
        if (duplicate) {
            alert(`❌ Já existe um material chamado "${product.name}"!\n\nPor favor, use um nome diferente.`);
            return false;
        }
    }
    
    // Validar tipo
    if (!product.type) {
        alert('❌ Por favor, selecione um tipo/categoria para o material!');
        return false;
    }
    
    // Validar quantidade
    if (isNaN(product.quantity) || product.quantity < 0) {
        alert('❌ Quantidade não pode ser negativa!');
        return false;
    }
    
    // Validar quantidade mínima
    if (isNaN(product.minQuantity) || product.minQuantity < 0) {
        alert('❌ Quantidade mínima não pode ser negativa!');
        return false;
    }
    
    // Avisar se quantidade mínima for maior que quantidade atual
    if (product.minQuantity > product.quantity && product.quantity >= 0) {
        const confirmar = confirm(`⚠️ ATENÇÃO:\n\nQuantidade Mínima (${product.minQuantity}) é maior que Quantidade Atual (${product.quantity}).\n\nO material será marcado como "Estoque Baixo".\n\nDeseja continuar mesmo assim?`);
        if (!confirmar) {
            return false;
        }
    }
    
    // Validar unidade
    if (!product.unit) {
        alert('❌ Por favor, selecione uma unidade de medida!');
        return false;
    }
    
    return true;
}

function validateMovement(quantity, availableQuantity, type, productName, unit) {
    // Validar quantidade
    if (!quantity || quantity <= 0) {
        alert('❌ Quantidade deve ser maior que zero!');
        return false;
    }
    
    // Validar estoque insuficiente
    if (type === 'saida' && quantity > availableQuantity) {
        alert(`❌ ESTOQUE INSUFICIENTE!\n\nMaterial: ${productName}\nDisponível: ${availableQuantity} ${unit}\nSolicitado: ${quantity} ${unit}\n\nNão é possível dar saída de ${quantity} ${unit}.`);
        return false;
    }
    
    return true;
}

function validateCustomType(name, icon) {
    // Validar nome
    if (!name || name.trim().length < 2) {
        alert('❌ Nome do tipo deve ter pelo menos 2 caracteres!');
        return false;
    }
    
    // Verificar duplicado
    const duplicate = customTypes.find(t => 
        t.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    if (duplicate) {
        alert(`❌ Já existe um tipo chamado "${name}"!\n\nPor favor, use um nome diferente.`);
        return false;
    }
    
    return true;
}

// ===== CACHE INTELIGENTE =====
let productsCache = null;
let movementsCache = null;
let customTypesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function invalidateCache() {
    productsCache = null;
    movementsCache = null;
    customTypesCache = null;
    cacheTimestamp = null;
    console.log('🔄 Cache invalidado');
}

function isCacheValid() {
    if (!productsCache || !cacheTimestamp) {
        return false;
    }
    const age = Date.now() - cacheTimestamp;
    return age < CACHE_DURATION;
}

// ===== MODELO DE DADOS =====
let products = [];
let movements = [];
let customTypes = [];
let editingProductId = null;
let dbReady = false;

// ===== IMPORTAÇÃO RÁPIDA =====
let lastImportedFile = null;
let lastImportType = null;

// ===== PAGINAÇÃO =====
let currentPage = 1;
let itemsPerPage = 25;
let filteredProducts = [];

// ===== FILTROS =====
let columnFilters = {
    name: '',
    type: '',
    description: '',
    quantityMin: '',
    minQuantityMin: '',
    unit: '',
    status: ''
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Inicializar IndexedDB
        await initDBWithFallback();
        dbReady = true;
        
        // Carregar dados
        await loadDataFromDB();
        
        // Carregar tipos customizados
        await loadCustomTypes();
        
        // Renderizar interface
        populateFilterSelects();
        renderProducts();
        renderGroupedView();
        updateAlertCounter();
        initEventListeners();
        
        console.log('Sistema inicializado com IndexedDB!');
    } catch (error) {
        console.error('Erro na inicialização:', error);
        alert('Erro ao inicializar o sistema. Tente recarregar a página.');
    }
});

// ===== PERSISTÊNCIA DE DADOS =====
async function saveToDatabase() {
    try {
        await saveAllProducts(products);
        await saveAllMovements(movements);
        
        // Invalidar cache após salvar
        invalidateCache();
    } catch (error) {
        console.error('Erro ao salvar no banco:', error);
        // Fallback para localStorage em caso de erro
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('movements', JSON.stringify(movements));
    }
}

async function loadDataFromDB() {
    const startTime = performance.now();
    
    // Verificar se cache é válido
    if (isCacheValid()) {
        products = productsCache;
        movements = movementsCache || [];
        const loadTime = (performance.now() - startTime).toFixed(2);
        console.log(`⚡ CACHE HIT! Carregados ${products.length} produtos em ${loadTime}ms (instantâneo!)`);
        return;
    }
    
    // Cache inválido - carregar do banco
    try {
        // Tentar carregar do Supabase primeiro se online
        if (isSupabaseOnline && supabaseInitialized) {
            console.log('🌐 Carregando do Supabase...');
            try {
                const { data: supabaseProducts, error: productsError } = await supabaseClient
                    .from('products')
                    .select('*')
                    .order('name');
                
                const { data: supabaseMovements, error: movementsError } = await supabaseClient
                    .from('movements')
                    .select('*')
                    .order('timestamp', { ascending: false });
                
                if (productsError) throw productsError;
                if (movementsError) throw movementsError;
                
                // Converter dados do Supabase para formato local
                products = (supabaseProducts || []).map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description || '',
                    type: p.type,
                    quantity: p.quantity,
                    minQuantity: p.min_quantity,
                    unit: p.unit
                }));
                
                movements = (supabaseMovements || []).map(m => ({
                    id: m.id,
                    productId: m.product_id,
                    type: m.type,
                    quantity: m.quantity,
                    timestamp: m.timestamp
                }));
                
                console.log(`✅ Carregados ${products.length} produtos e ${movements.length} movimentações do Supabase`);
                
                // Sincronizar com IndexedDB local
                await syncToLocalDB();
                
            } catch (supabaseError) {
                console.error('❌ Erro ao carregar do Supabase:', supabaseError);
                console.log('📂 Fallback: carregando do IndexedDB...');
                products = await getAllProducts();
                movements = await getAllMovements();
            }
        } else {
            console.log('📂 Carregando do IndexedDB...');
            products = await getAllProducts();
            movements = await getAllMovements();
        }
        
        // Atualizar cache
        productsCache = [...products];
        movementsCache = [...movements];
        cacheTimestamp = Date.now();
        
        const loadTime = (performance.now() - startTime).toFixed(2);
        console.log(`✅ Carregados ${products.length} produtos e ${movements.length} movimentações em ${loadTime}ms`);
        console.log(`💾 Dados armazenados em cache por 5 minutos`);
    } catch (error) {
        console.error('Erro ao carregar do banco:', error);
        // Fallback para localStorage
        const savedProducts = localStorage.getItem('products');
        const savedMovements = localStorage.getItem('movements');
        
        if (savedProducts) {
            products = JSON.parse(savedProducts);
        }
        
        if (savedMovements) {
            movements = JSON.parse(savedMovements);
        }
    }
}

// ===== TIPOS CUSTOMIZADOS =====
async function loadCustomTypes() {
    try {
        customTypes = await getAllCustomTypes();
        updateTypeSelect();
        console.log(`${customTypes.length} tipos customizados carregados`);
    } catch (error) {
        console.error('Erro ao carregar tipos customizados:', error);
        customTypes = [];
    }
}

function updateTypeSelect() {
    const select = document.getElementById('productType');
    const currentValue = select.value;
    
    // Remover optgroup de tipos customizados se existir
    const existingCustom = select.querySelector('optgroup[label="✨ Tipos Personalizados"]');
    if (existingCustom) {
        existingCustom.remove();
    }
    
    // Adicionar tipos customizados se houver
    if (customTypes.length > 0) {
        const customOptgroup = document.createElement('optgroup');
        customOptgroup.label = '✨ Tipos Personalizados';
        
        customTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = `${type.icon} ${type.name}`;
            customOptgroup.appendChild(option);
        });
        
        select.appendChild(customOptgroup);
    }
    
    // Restaurar valor selecionado
    if (currentValue) {
        select.value = currentValue;
    }
}

function openManageTypesModal() {
    renderCustomTypesList();
    document.getElementById('manageTypesModal').style.display = 'block';
}

function renderCustomTypesList() {
    const container = document.getElementById('customTypesList');
    
    if (customTypes.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum tipo personalizado cadastrado.</p>';
        return;
    }
    
    container.innerHTML = customTypes.map(type => `
        <div class="type-item">
            <div class="type-item-info">
                <span class="type-item-icon">${type.icon || '📦'}</span>
                <span class="type-item-name">${type.name}</span>
            </div>
            <div class="type-item-actions">
                <button class="btn-delete-type" onclick="deleteCustomTypeFromSystem('${type.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

async function handleAddType(e) {
    e.preventDefault();
    
    const name = document.getElementById('newTypeName').value;
    const icon = document.getElementById('newTypeIcon').value || '📦';
    
    // Validar tipo antes de adicionar
    if (!validateCustomType(name, icon)) {
        return; // Validação falhou, mensagem já foi exibida
    }
    
    const newType = {
        id: 'custom-' + Date.now().toString(),
        name: name,
        icon: icon
    };
    
    try {
        await addCustomType(newType);
        customTypes.push(newType);
        
        updateTypeSelect();
        renderCustomTypesList();
        
        document.getElementById('addTypeForm').reset();
        alert('Tipo adicionado com sucesso! ✅');
    } catch (error) {
        console.error('Erro ao adicionar tipo:', error);
        if (error.name === 'ConstraintError') {
            alert('Já existe um tipo com esse nome!');
        } else {
            alert('Erro ao adicionar tipo. Tente novamente.');
        }
    }
}

async function deleteCustomTypeFromSystem(id) {
    if (!confirm('Tem certeza que deseja excluir este tipo?\n\nObs: Os materiais deste tipo não serão excluídos.')) return;
    
    try {
        await deleteCustomType(id);
        customTypes = customTypes.filter(t => t.id !== id);
        
        updateTypeSelect();
        renderCustomTypesList();
        
        alert('Tipo excluído com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir tipo:', error);
        alert('Erro ao excluir tipo. Tente novamente.');
    }
}

// ===== INICIALIZAÇÃO DE EVENT LISTENERS =====
function initEventListeners() {
    // Formulário de produto
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
    
    // Formulário de adicionar tipo
    document.getElementById('addTypeForm').addEventListener('submit', handleAddType);
    
    // Abas
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    // Busca
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Filtros de coluna
    document.getElementById('filterName').addEventListener('input', handleColumnFilters);
    document.getElementById('filterType').addEventListener('change', handleColumnFilters);
    document.getElementById('filterDescription').addEventListener('input', handleColumnFilters);
    document.getElementById('filterQuantityMin').addEventListener('input', handleColumnFilters);
    document.getElementById('filterMinQuantityMin').addEventListener('input', handleColumnFilters);
    document.getElementById('filterUnit').addEventListener('change', handleColumnFilters);
    document.getElementById('filterStatus').addEventListener('change', handleColumnFilters);
    
    // Export
    document.getElementById('exportJSON').addEventListener('click', exportJSON);
    document.getElementById('exportCSV').addEventListener('click', exportCSV);
    document.getElementById('exportXLSX').addEventListener('click', exportXLSX);
    
    // Import
    document.getElementById('importJSON').addEventListener('click', () => importFile('json'));
    document.getElementById('importCSV').addEventListener('click', () => importFile('csv'));
    document.getElementById('importXLSX').addEventListener('click', () => importFile('xlsx'));
    document.getElementById('fileInput').addEventListener('change', handleFileImport);
    
    // Botão de importação rápida
    document.getElementById('quickImportBtn').addEventListener('click', quickImport);
    
    // Carregar informações do último arquivo
    loadLastImportInfo();
    
    // Modais
    const movementModal = document.getElementById('movementModal');
    const historyModal = document.getElementById('historyModal');
    const manageTypesModal = document.getElementById('manageTypesModal');
    const closeButtons = document.getElementsByClassName('close');
    
    Array.from(closeButtons).forEach(btn => {
        btn.addEventListener('click', function() {
            movementModal.style.display = 'none';
            historyModal.style.display = 'none';
            manageTypesModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === movementModal) {
            movementModal.style.display = 'none';
        }
        if (event.target === historyModal) {
            historyModal.style.display = 'none';
        }
        if (event.target === manageTypesModal) {
            manageTypesModal.style.display = 'none';
        }
    });
    
    // Formulário de movimentação
    document.getElementById('movementForm').addEventListener('submit', handleMovementSubmit);
}

// ===== CRUD DE PRODUTOS =====
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const product = {
        id: editingProductId || Date.now().toString(),
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        type: document.getElementById('productType').value,
        quantity: parseInt(document.getElementById('productQuantity').value),
        minQuantity: parseInt(document.getElementById('productMinQuantity').value),
        unit: document.getElementById('productUnit').value
    };
    
    // Validar produto antes de salvar
    if (!validateProduct(product, !!editingProductId)) {
        return; // Validação falhou, mensagem já foi exibida
    }
    
    try {
        if (editingProductId) {
            // Editar produto existente
            const index = products.findIndex(p => p.id === editingProductId);
            if (index !== -1) {
                products[index] = product;
                
                // Salvar no Supabase se online
                if (isSupabaseOnline && supabaseInitialized) {
                    try {
                        const { error } = await supabaseClient
                            .from('products')
                            .update({
                                name: product.name,
                                description: product.description,
                                type: product.type,
                                quantity: product.quantity,
                                min_quantity: product.minQuantity,
                                unit: product.unit,
                                updated_by: currentUserId,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', product.id);
                        
                        if (error) throw error;
                        console.log('✅ Produto atualizado no Supabase');
                    } catch (error) {
                        console.error('❌ Erro ao atualizar no Supabase:', error);
                    }
                }
                
                await updateProduct(product);
            }
            editingProductId = null;
        } else {
            // Adicionar novo produto
            products.push(product);
            
            // Salvar no Supabase se online
            if (isSupabaseOnline && supabaseInitialized) {
                try {
                    const { error } = await supabaseClient
                        .from('products')
                        .insert({
                            id: product.id,
                            name: product.name,
                            description: product.description,
                            type: product.type,
                            quantity: product.quantity,
                            min_quantity: product.minQuantity,
                            unit: product.unit,
                            created_by: currentUserId,
                            updated_by: currentUserId,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        });
                    
                    if (error) throw error;
                    console.log('✅ Produto salvo no Supabase');
                } catch (error) {
                    console.error('❌ Erro ao salvar no Supabase:', error);
                }
            }
            
            await addProduct(product);
        }
        
        // Atualizar cache otimizado
        if (editingProductId) {
            // Edição - atualizar item no cache
            if (productsCache) {
                const cacheIndex = productsCache.findIndex(p => p.id === editingProductId);
                if (cacheIndex !== -1) {
                    productsCache[cacheIndex] = {...product};
                }
            }
        } else {
            // Novo produto - adicionar ao cache
            if (productsCache) {
                productsCache.push({...product});
            }
        }
        
        populateFilterSelects();
        renderProducts();
        renderGroupedView();
        updateAlertCounter();
        resetForm();
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        alert('Erro ao salvar produto. Tente novamente.');
    }
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    editingProductId = id;
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productType').value = product.type || 'outros';
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productMinQuantity').value = product.minQuantity;
    
    // Definir unidade, criando option se não existir
    const unitSelect = document.getElementById('productUnit');
    const unitValue = product.unit || 'unid';
    
    // Verificar se a unidade existe no select
    const optionExists = Array.from(unitSelect.options).some(opt => opt.value === unitValue);
    
    if (optionExists) {
        unitSelect.value = unitValue;
    } else {
        // Criar nova option para unidades antigas/customizadas
        const newOption = document.createElement('option');
        newOption.value = unitValue;
        newOption.textContent = unitValue;
        unitSelect.insertBefore(newOption, unitSelect.firstChild);
        unitSelect.value = unitValue;
    }
    
    document.getElementById('formTitle').textContent = 'Editar Material';
    document.getElementById('submitBtn').textContent = 'Atualizar Material';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    // Scroll para o formulário
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

async function deleteProductFromSystem(id) {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;
    
    try {
        // Excluir do Supabase se online
        if (isSupabaseOnline && supabaseInitialized) {
            try {
                // Excluir movimentações primeiro (devido à foreign key)
                const { error: movementsError } = await supabaseClient
                    .from('movements')
                    .delete()
                    .eq('product_id', id);
                
                if (movementsError) throw movementsError;
                
                // Excluir produto
                const { error: productError } = await supabaseClient
                    .from('products')
                    .delete()
                    .eq('id', id);
                
                if (productError) throw productError;
                
                console.log('✅ Produto excluído do Supabase');
            } catch (error) {
                console.error('❌ Erro ao excluir do Supabase:', error);
            }
        }
        
        // Excluir localmente
        products = products.filter(p => p.id !== id);
        movements = movements.filter(m => m.productId !== id);
        
        await deleteProduct(id);
        await deleteMovementsByProductId(id);
        
        // Remover do cache também
        if (productsCache) {
            productsCache = productsCache.filter(p => p.id !== id);
        }
        if (movementsCache) {
            movementsCache = movementsCache.filter(m => m.productId !== id);
        }
        
        renderProducts();
        renderGroupedView();
        updateAlertCounter();
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto. Tente novamente.');
    }
}

function cancelEdit() {
    editingProductId = null;
    resetForm();
}

function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('formTitle').textContent = 'Cadastrar Material';
    document.getElementById('submitBtn').textContent = 'Adicionar Material';
    document.getElementById('cancelBtn').style.display = 'none';
}

// ===== RENDERIZAÇÃO =====
function renderProducts(productsToFilter = null) {
    filteredProducts = productsToFilter || products;
    currentPage = 1; // Reset para primeira página ao renderizar
    renderPaginatedProducts();
}

function renderPaginatedProducts() {
    const tbody = document.getElementById('productsTableBody');
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Nenhum material encontrado.</td></tr>';
        updatePaginationControls(0, 0, 0);
        return;
    }
    
    // Calcular paginação
    const totalItems = filteredProducts.length;
    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / itemsPerPage);
    
    // Garantir que a página atual seja válida
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
    
    // Calcular itens a mostrar
    let startIndex, endIndex;
    if (itemsPerPage === 'all') {
        startIndex = 0;
        endIndex = totalItems;
    } else {
        startIndex = (currentPage - 1) * itemsPerPage;
        endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    }
    
    const productsToRender = filteredProducts.slice(startIndex, endIndex);
    
    // Renderizar produtos
    tbody.innerHTML = productsToRender.map(product => {
        const status = getProductStatus(product);
        const rowClass = product.quantity <= product.minQuantity ? 'low-stock' : '';
        const typeName = getTypeName(product.type);
        
        return `
            <tr class="${rowClass}">
                <td><strong>${product.name}</strong></td>
                <td>${typeName}</td>
                <td>${product.description || '-'}</td>
                <td>${product.quantity} ${product.unit || 'unid'}</td>
                <td>${product.minQuantity} ${product.unit || 'unid'}</td>
                <td>${product.unit || 'unid'}</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-small" onclick="openMovementModal('${product.id}')">📊 Movimentar</button>
                        <button class="btn btn-info btn-small" onclick="openHistoryModal('${product.id}')">📜 Histórico</button>
                        <button class="btn btn-secondary btn-small" onclick="editProduct('${product.id}')">✏️ Editar</button>
                        <button class="btn btn-danger btn-small" onclick="deleteProductFromSystem('${product.id}')">🗑️ Excluir</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Atualizar controles de paginação
    updatePaginationControls(startIndex + 1, endIndex, totalItems);
    renderPageNumbers(totalPages);
}

function renderGroupedView() {
    const container = document.getElementById('groupedContent');
    
    if (products.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum material cadastrado.</p>';
        return;
    }
    
    // Agrupar produtos por tipo
    const grouped = {};
    products.forEach(product => {
        const type = product.type || 'outros';
        if (!grouped[type]) {
            grouped[type] = [];
        }
        grouped[type].push(product);
    });
    
    // Renderizar cada grupo (incluindo tipos customizados)
    const typeOrder = [
        'cimento-argamassa',
        'areia-brita',
        'tijolos-blocos',
        'ferragens',
        'hidraulica',
        'eletrica',
        'tintas-vernizes',
        'madeiras',
        'ferramentas',
        'acabamento',
        'outros',
        ...customTypes.map(t => t.id)
    ];
    
    container.innerHTML = typeOrder
        .filter(type => grouped[type] && grouped[type].length > 0)
        .map(type => {
            const items = grouped[type];
            const typeName = getTypeName(type);
            const typeIcon = getTypeIcon(type);
            
            return `
                <div class="grouped-category">
                    <div class="category-header">
                        <h3>${typeIcon} ${typeName}</h3>
                        <span class="category-count">${items.length} ${items.length === 1 ? 'item' : 'itens'}</span>
                    </div>
                    <div class="category-items">
                        ${items.map(product => renderMaterialCard(product)).join('')}
                    </div>
                </div>
            `;
        }).join('');
}

function renderMaterialCard(product) {
    const status = getProductStatus(product);
    const cardClass = product.quantity === 0 ? 'critical-stock' : 
                     product.quantity <= product.minQuantity ? 'low-stock' : '';
    
    return `
        <div class="material-card ${cardClass}">
            <div class="material-card-header">
                <h4 class="material-name">${product.name}</h4>
                <span class="status-badge ${status.class}">${status.text}</span>
            </div>
            ${product.description ? `<p class="material-description">${product.description}</p>` : ''}
            <div class="material-info">
                <div class="info-item">
                    <span class="info-label">Atual</span>
                    <span class="info-value">${product.quantity}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Mínimo</span>
                    <span class="info-value">${product.minQuantity}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Unidade</span>
                    <span class="info-value">${product.unit || 'unid'}</span>
                </div>
            </div>
            <div class="material-actions">
                <button class="btn btn-warning btn-small" onclick="openMovementModal('${product.id}')">📊 Movimentar</button>
                <button class="btn btn-info btn-small" onclick="openHistoryModal('${product.id}')">📜 Histórico</button>
                <button class="btn btn-secondary btn-small" onclick="editProduct('${product.id}')">✏️</button>
                <button class="btn btn-danger btn-small" onclick="deleteProductFromSystem('${product.id}')">🗑️</button>
            </div>
        </div>
    `;
}

function getProductStatus(product) {
    if (product.quantity === 0) {
        return { text: 'Esgotado', class: 'status-critical' };
    } else if (product.quantity <= product.minQuantity) {
        return { text: 'Estoque Baixo', class: 'status-low' };
    } else {
        return { text: 'OK', class: 'status-ok' };
    }
}

function getTypeName(type) {
    const types = {
        'cimento-argamassa': 'Cimento e Argamassa',
        'areia-brita': 'Areia e Brita',
        'tijolos-blocos': 'Tijolos e Blocos',
        'ferragens': 'Ferragens',
        'hidraulica': 'Hidráulica',
        'eletrica': 'Elétrica',
        'tintas-vernizes': 'Tintas e Vernizes',
        'madeiras': 'Madeiras',
        'ferramentas': 'Ferramentas',
        'acabamento': 'Acabamento',
        'outros': 'Outros'
    };
    
    // Verificar se é tipo customizado
    const customType = customTypes.find(t => t.id === type);
    if (customType) {
        return customType.name;
    }
    
    return types[type] || 'Outros';
}

function getTypeIcon(type) {
    const icons = {
        'cimento-argamassa': '🏗️',
        'areia-brita': '⛰️',
        'tijolos-blocos': '🧱',
        'ferragens': '🔩',
        'hidraulica': '🚰',
        'eletrica': '⚡',
        'tintas-vernizes': '🎨',
        'madeiras': '🪵',
        'ferramentas': '🔨',
        'acabamento': '✨',
        'outros': '📦'
    };
    
    // Verificar se é tipo customizado
    const customType = customTypes.find(t => t.id === type);
    if (customType) {
        return customType.icon || '📦';
    }
    
    return icons[type] || '📦';
}

// ===== ABAS =====
function switchTab(tabName) {
    // Atualizar botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'list') {
        document.getElementById('listTab').classList.add('active');
    } else if (tabName === 'grouped') {
        document.getElementById('groupedTab').classList.add('active');
        renderGroupedView();
    }
}

// ===== PAGINAÇÃO =====
function updatePaginationControls(start, end, total) {
    const paginationInfo = document.getElementById('paginationInfo');
    const firstBtn = document.getElementById('firstPageBtn');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const lastBtn = document.getElementById('lastPageBtn');
    
    if (total === 0) {
        paginationInfo.textContent = 'Mostrando 0 de 0 materiais';
        firstBtn.disabled = true;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        lastBtn.disabled = true;
        return;
    }
    
    paginationInfo.textContent = `Mostrando ${start}-${end} de ${total} materiais`;
    
    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(total / itemsPerPage);
    
    firstBtn.disabled = currentPage === 1;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    lastBtn.disabled = currentPage === totalPages;
}

function renderPageNumbers(totalPages) {
    const pageNumbers = document.getElementById('pageNumbers');
    
    if (totalPages <= 1 || itemsPerPage === 'all') {
        pageNumbers.innerHTML = '';
        return;
    }
    
    let html = '';
    const maxButtons = 5;
    
    if (totalPages <= maxButtons) {
        // Mostrar todas as páginas
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        }
    } else {
        // Mostrar com elipses
        if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) {
                html += `<button class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
            }
            html += '<span class="page-ellipsis">...</span>';
            html += `<button class="page-number" onclick="goToPage(${totalPages})">${totalPages}</button>`;
        } else if (currentPage >= totalPages - 2) {
            html += `<button class="page-number" onclick="goToPage(1)">1</button>`;
            html += '<span class="page-ellipsis">...</span>';
            for (let i = totalPages - 3; i <= totalPages; i++) {
                html += `<button class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
            }
        } else {
            html += `<button class="page-number" onclick="goToPage(1)">1</button>`;
            html += '<span class="page-ellipsis">...</span>';
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                html += `<button class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
            }
            html += '<span class="page-ellipsis">...</span>';
            html += `<button class="page-number" onclick="goToPage(${totalPages})">${totalPages}</button>`;
        }
    }
    
    pageNumbers.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderPaginatedProducts();
}

function firstPage() {
    currentPage = 1;
    renderPaginatedProducts();
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPaginatedProducts();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderPaginatedProducts();
    }
}

function lastPage() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    currentPage = totalPages;
    renderPaginatedProducts();
}

function changeItemsPerPage() {
    const select = document.getElementById('itemsPerPage');
    itemsPerPage = select.value === 'all' ? 'all' : parseInt(select.value);
    currentPage = 1;
    renderPaginatedProducts();
}

// ===== FILTROS DE COLUNA =====
function populateFilterSelects() {
    // Popular filtro de tipo
    const filterType = document.getElementById('filterType');
    const filterUnit = document.getElementById('filterUnit');
    
    // Tipos padrão
    const defaultTypes = [
        { id: 'cimento-argamassa', name: '🏗️ Cimento e Argamassa' },
        { id: 'areia-brita', name: '⛰️ Areia e Brita' },
        { id: 'tijolos-blocos', name: '🧱 Tijolos e Blocos' },
        { id: 'ferragens', name: '🔩 Ferragens' },
        { id: 'hidraulica', name: '🚰 Hidráulica' },
        { id: 'eletrica', name: '⚡ Elétrica' },
        { id: 'tintas-vernizes', name: '🎨 Tintas e Vernizes' },
        { id: 'madeiras', name: '🪵 Madeiras' },
        { id: 'ferramentas', name: '🔨 Ferramentas' },
        { id: 'acabamento', name: '✨ Acabamento' },
        { id: 'outros', name: '📦 Outros' }
    ];
    
    // Adicionar tipos padrão
    defaultTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        filterType.appendChild(option);
    });
    
    // Adicionar tipos customizados
    customTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = `${type.icon} ${type.name}`;
        filterType.appendChild(option);
    });
    
    // Popular filtro de unidade
    const units = ['unid', 'kg', 'g', 't', 'saco', 'fardo', 'm', 'cm', 'mm', 'barra', 'rolo', 
                   'm²', 'cm²', 'chapa', 'placa', 'm³', 'cm³', 'caixa', 'pacote', 
                   'L', 'mL', 'galão', 'lata', 'balde', 'tambor', 'botijão', 'cilindro',
                   'peça', 'par', 'dúzia', 'cento', 'milheiro', 'conjunto', 'kit'];
    
    units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        filterUnit.appendChild(option);
    });
}

function handleColumnFilters() {
    // Atualizar valores dos filtros
    columnFilters.name = document.getElementById('filterName').value.toLowerCase();
    columnFilters.type = document.getElementById('filterType').value;
    columnFilters.description = document.getElementById('filterDescription').value.toLowerCase();
    columnFilters.quantityMin = document.getElementById('filterQuantityMin').value;
    columnFilters.minQuantityMin = document.getElementById('filterMinQuantityMin').value;
    columnFilters.unit = document.getElementById('filterUnit').value;
    columnFilters.status = document.getElementById('filterStatus').value;
    
    // Aplicar filtros
    applyColumnFilters();
}

function applyColumnFilters() {
    let filtered = [...products];
    
    // Filtro por nome
    if (columnFilters.name) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(columnFilters.name)
        );
    }
    
    // Filtro por tipo
    if (columnFilters.type) {
        filtered = filtered.filter(p => p.type === columnFilters.type);
    }
    
    // Filtro por descrição
    if (columnFilters.description) {
        filtered = filtered.filter(p => 
            p.description && p.description.toLowerCase().includes(columnFilters.description)
        );
    }
    
    // Filtro por quantidade mínima
    if (columnFilters.quantityMin) {
        const minQty = parseInt(columnFilters.quantityMin);
        filtered = filtered.filter(p => p.quantity >= minQty);
    }
    
    // Filtro por quantidade mínima configurada
    if (columnFilters.minQuantityMin) {
        const minMinQty = parseInt(columnFilters.minQuantityMin);
        filtered = filtered.filter(p => p.minQuantity >= minMinQty);
    }
    
    // Filtro por unidade
    if (columnFilters.unit) {
        filtered = filtered.filter(p => p.unit === columnFilters.unit);
    }
    
    // Filtro por status
    if (columnFilters.status) {
        filtered = filtered.filter(p => {
            const status = getProductStatus(p);
            if (columnFilters.status === 'ok') {
                return status.class === 'status-ok';
            } else if (columnFilters.status === 'low') {
                return status.class === 'status-low';
            } else if (columnFilters.status === 'critical') {
                return status.class === 'status-critical';
            }
            return true;
        });
    }
    
    renderProducts(filtered);
}

function clearAllFilters() {
    // Limpar inputs
    document.getElementById('filterName').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterDescription').value = '';
    document.getElementById('filterQuantityMin').value = '';
    document.getElementById('filterMinQuantityMin').value = '';
    document.getElementById('filterUnit').value = '';
    document.getElementById('filterStatus').value = '';
    
    // Limpar busca principal também
    document.getElementById('searchInput').value = '';
    
    // Reset filtros
    columnFilters = {
        name: '',
        type: '',
        description: '',
        quantityMin: '',
        minQuantityMin: '',
        unit: '',
        status: ''
    };
    
    // Renderizar todos
    renderProducts();
}

// ===== BUSCA =====
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    // Limpar filtros de coluna quando usa busca geral
    if (searchTerm) {
        clearColumnFiltersOnly();
    }
    
    if (searchTerm === '') {
        renderProducts();
        return;
    }
    
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );
    
    renderProducts(filtered);
}

function clearColumnFiltersOnly() {
    document.getElementById('filterName').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterDescription').value = '';
    document.getElementById('filterQuantityMin').value = '';
    document.getElementById('filterMinQuantityMin').value = '';
    document.getElementById('filterUnit').value = '';
    document.getElementById('filterStatus').value = '';
    
    columnFilters = {
        name: '',
        type: '',
        description: '',
        quantityMin: '',
        minQuantityMin: '',
        unit: '',
        status: ''
    };
}

// ===== ALERTAS =====
function updateAlertCounter() {
    const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);
    document.getElementById('alertCount').textContent = lowStockProducts.length;
}

// ===== MOVIMENTAÇÕES =====
function openMovementModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('movementProductId').value = productId;
    document.getElementById('modalProductName').textContent = `Produto: ${product.name} (Estoque atual: ${product.quantity})`;
    document.getElementById('movementQuantity').value = 1;
    document.querySelector('input[name="movementType"][value="entrada"]').checked = true;
    
    document.getElementById('movementModal').style.display = 'block';
}

async function handleMovementSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('movementProductId').value;
    const type = document.querySelector('input[name="movementType"]:checked').value;
    const quantity = parseInt(document.getElementById('movementQuantity').value);
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Validar movimentação
    if (!validateMovement(quantity, product.quantity, type, product.name, product.unit)) {
        return; // Validação falhou, mensagem já foi exibida
    }
    
    try {
        // Atualizar quantidade
        if (type === 'entrada') {
            product.quantity += quantity;
        } else {
            product.quantity -= quantity;
        }
        
        // Registrar movimentação
        const movement = {
            id: Date.now().toString(),
            productId: productId,
            type: type,
            quantity: quantity,
            timestamp: new Date().toISOString()
        };
        
        movements.push(movement);
        
        // Salvar movimentação no Supabase se online
        if (isSupabaseOnline && supabaseInitialized) {
            try {
                const { error: movementError } = await supabaseClient
                    .from('movements')
                    .insert({
                        id: movement.id,
                        product_id: movement.productId,
                        type: movement.type,
                        quantity: movement.quantity,
                        timestamp: movement.timestamp
                    });
                
                if (movementError) throw movementError;
                
                // Atualizar produto no Supabase também
                const { error: productError } = await supabaseClient
                    .from('products')
                    .update({
                        quantity: product.quantity,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', productId);
                
                if (productError) throw productError;
                
                console.log('✅ Movimentação salva no Supabase');
            } catch (error) {
                console.error('❌ Erro ao salvar movimentação no Supabase:', error);
            }
        }
        
        await updateProduct(product);
        await addMovement(movement);
        
        // Atualizar cache otimizado
        if (productsCache) {
            const cacheIndex = productsCache.findIndex(p => p.id === productId);
            if (cacheIndex !== -1) {
                productsCache[cacheIndex].quantity = product.quantity;
            }
        }
        if (movementsCache) {
            movementsCache.push({...movement});
        }
        
        renderProducts();
        renderGroupedView();
        updateAlertCounter();
        
        document.getElementById('movementModal').style.display = 'none';
        document.getElementById('movementForm').reset();
    } catch (error) {
        console.error('Erro ao registrar movimentação:', error);
        alert('Erro ao registrar movimentação. Tente novamente.');
    }
}

// ===== HISTÓRICO =====
function openHistoryModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('historyProductName').textContent = `Produto: ${product.name}`;
    
    const productMovements = movements.filter(m => m.productId === productId);
    const tbody = document.getElementById('historyTableBody');
    
    if (productMovements.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Nenhuma movimentação registrada.</td></tr>';
    } else {
        tbody.innerHTML = productMovements
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(m => {
                const date = new Date(m.timestamp);
                const formattedDate = date.toLocaleString('pt-BR');
                const typeText = m.type === 'entrada' ? '📥 Entrada' : '📤 Saída';
                const typeClass = m.type === 'entrada' ? 'status-ok' : 'status-low';
                
                return `
                    <tr>
                        <td>${formattedDate}</td>
                        <td><span class="status-badge ${typeClass}">${typeText}</span></td>
                        <td>${m.quantity}</td>
                    </tr>
                `;
            }).join('');
    }
    
    document.getElementById('historyModal').style.display = 'block';
}

// ===== EXPORTAÇÃO =====
function exportJSON(e) {
    e.preventDefault();
    
    const data = {
        products: products,
        movements: movements,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `estoque_backup_${getDateString()}.json`);
}

function exportCSV(e) {
    e.preventDefault();
    
    if (products.length === 0) {
        alert('Nenhum material para exportar!');
        return;
    }
    
    // Cabeçalho
    let csv = 'Nome,Tipo,Descrição,Quantidade,Quantidade Mínima,Unidade\n';
    
    // Dados
    products.forEach(product => {
        const typeName = getTypeName(product.type);
        csv += `"${product.name}","${typeName}","${product.description || ''}",${product.quantity},${product.minQuantity},"${product.unit || 'unid'}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `materiais_${getDateString()}.csv`);
}

function exportXLSX(e) {
    e.preventDefault();
    
    if (products.length === 0) {
        alert('Nenhum material para exportar!');
        return;
    }
    
    // Preparar dados para a planilha
    const data = products.map(product => ({
        'Nome': product.name,
        'Tipo': getTypeName(product.type),
        'Descrição': product.description || '',
        'Quantidade': product.quantity,
        'Quantidade Mínima': product.minQuantity,
        'Unidade': product.unit || 'unid'
    }));
    
    // Criar workbook e worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Materiais');
    
    // Download
    XLSX.writeFile(wb, `materiais_${getDateString()}.xlsx`);
}

// ===== IMPORTAÇÃO =====
let currentImportType = null;

function importFile(type) {
    currentImportType = type;
    const fileInput = document.getElementById('fileInput');
    
    if (type === 'json') {
        fileInput.accept = '.json';
    } else if (type === 'csv') {
        fileInput.accept = '.csv';
    } else if (type === 'xlsx') {
        fileInput.accept = '.xlsx';
    }
    
    fileInput.click();
}

function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (currentImportType === 'json') {
        importJSON(file);
    } else if (currentImportType === 'csv') {
        importCSV(file);
    } else if (currentImportType === 'xlsx') {
        importXLSX(file);
    }
    
    // Salvar informações do último arquivo
    saveLastImportInfo(file);
    
    // Limpar input
    e.target.value = '';
}

function importJSON(file) {
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.products || !Array.isArray(data.products)) {
                alert('Arquivo JSON inválido!');
                return;
            }
            
            if (confirm('Importar dados? Isso irá substituir todos os dados atuais!')) {
                // Salvar no Supabase se online
                if (isSupabaseOnline && supabaseInitialized) {
                    try {
                        // Limpar dados existentes no Supabase
                        await supabaseClient.from('movements').delete().neq('id', '');
                        await supabaseClient.from('products').delete().neq('id', '');
                        
                        // Inserir novos produtos
                        if (data.products && data.products.length > 0) {
                            const supabaseProducts = data.products.map(p => ({
                                id: p.id,
                                name: p.name,
                                description: p.description || '',
                                type: p.type,
                                quantity: p.quantity,
                                min_quantity: p.minQuantity,
                                unit: p.unit,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            }));
                            
                            const { error: productsError } = await supabaseClient
                                .from('products')
                                .insert(supabaseProducts);
                            
                            if (productsError) throw productsError;
                        }
                        
                        // Inserir movimentações
                        if (data.movements && data.movements.length > 0) {
                            const supabaseMovements = data.movements.map(m => ({
                                id: m.id,
                                product_id: m.productId,
                                type: m.type,
                                quantity: m.quantity,
                                timestamp: m.timestamp
                            }));
                            
                            const { error: movementsError } = await supabaseClient
                                .from('movements')
                                .insert(supabaseMovements);
                            
                            if (movementsError) throw movementsError;
                        }
                        
                        console.log('✅ Dados JSON importados para o Supabase');
                    } catch (error) {
                        console.error('❌ Erro ao importar JSON para o Supabase:', error);
                    }
                }
                
                // Salvar localmente
                products = data.products;
                movements = data.movements || [];
                
                await saveToDatabase();
                
                // Atualizar cache com novos dados
                productsCache = [...products];
                movementsCache = [...movements];
                cacheTimestamp = Date.now();
                
                populateFilterSelects();
                renderProducts();
                renderGroupedView();
                updateAlertCounter();
                
                alert('Dados importados com sucesso!');
            }
        } catch (error) {
            alert('Erro ao ler arquivo JSON: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

function importCSV(file) {
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            
            if (lines.length < 2) {
                alert('Arquivo CSV vazio!');
                return;
            }
            
            const newProducts = [];
            
            // Pular cabeçalho (linha 0) e processar dados
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                // Parse CSV considerando aspas
                const values = parseCSVLine(line);
                
                if (values.length >= 6) {
                    // Converter nome do tipo para o código
                    const typeCode = getTypeCodeFromName(values[1]);
                    
                    newProducts.push({
                        id: Date.now().toString() + i,
                        name: values[0],
                        type: typeCode,
                        description: values[2],
                        quantity: parseInt(values[3]) || 0,
                        minQuantity: parseInt(values[4]) || 0,
                        unit: values[5] || 'unid'
                    });
                }
            }
            
            if (newProducts.length === 0) {
                alert('Nenhum material válido encontrado no CSV!');
                return;
            }
            
            if (confirm(`Importar ${newProducts.length} materiais? Isso irá adicionar aos materiais existentes!`)) {
                // Salvar no Supabase se online
                if (isSupabaseOnline && supabaseInitialized) {
                    try {
                        const supabaseProducts = newProducts.map(p => ({
                            id: p.id,
                            name: p.name,
                            description: p.description || '',
                            type: p.type,
                            quantity: p.quantity,
                            min_quantity: p.minQuantity,
                            unit: p.unit,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }));
                        
                        const { error } = await supabaseClient
                            .from('products')
                            .insert(supabaseProducts);
                        
                        if (error) throw error;
                        
                        console.log(`✅ ${newProducts.length} produtos importados para o Supabase`);
                    } catch (error) {
                        console.error('❌ Erro ao importar para o Supabase:', error);
                    }
                }
                
                // Salvar localmente
                products = [...products, ...newProducts];
                await saveToDatabase();
                
                // Atualizar cache com novos dados
                if (productsCache) {
                    productsCache = [...productsCache, ...newProducts];
                }
                
                populateFilterSelects();
                renderProducts();
                renderGroupedView();
                updateAlertCounter();
                
                alert(`${newProducts.length} materiais importados com sucesso!`);
            }
        } catch (error) {
            alert('Erro ao ler arquivo CSV: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

function importXLSX(file) {
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Pegar primeira planilha
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Converter para JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
                alert('Planilha vazia!');
                return;
            }
            
            const newProducts = jsonData.map((row, index) => {
                // Converter nome do tipo para código
                const typeName = row['Tipo'] || row['tipo'] || '';
                const typeCode = getTypeCodeFromName(typeName);
                
                return {
                    id: Date.now().toString() + index,
                    name: row['Nome'] || row['nome'] || '',
                    type: typeCode,
                    description: row['Descrição'] || row['Descricao'] || row['descrição'] || row['descricao'] || '',
                    quantity: parseInt(row['Quantidade'] || row['quantidade']) || 0,
                    minQuantity: parseInt(row['Quantidade Mínima'] || row['Quantidade Minima'] || row['quantidade mínima'] || row['quantidade minima']) || 0,
                    unit: row['Unidade'] || row['unidade'] || 'unid'
                };
            }).filter(p => p.name);
            
            if (newProducts.length === 0) {
                alert('Nenhum material válido encontrado na planilha!');
                return;
            }
            
            if (confirm(`Importar ${newProducts.length} materiais? Isso irá adicionar aos materiais existentes!`)) {
                products = [...products, ...newProducts];
                
                await saveToDatabase();
                
                // Atualizar cache com novos dados
                if (productsCache) {
                    productsCache = [...productsCache, ...newProducts];
                }
                
                populateFilterSelects();
                renderProducts();
                renderGroupedView();
                updateAlertCounter();
                
                alert(`${newProducts.length} materiais importados com sucesso!`);
            }
        } catch (error) {
            alert('Erro ao ler arquivo XLSX: ' + error.message);
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// ===== UTILITÁRIOS =====
function getTypeCodeFromName(typeName) {
    const typeMapping = {
        'Cimento e Argamassa': 'cimento-argamassa',
        'Areia e Brita': 'areia-brita',
        'Tijolos e Blocos': 'tijolos-blocos',
        'Ferragens': 'ferragens',
        'Hidráulica': 'hidraulica',
        'Elétrica': 'eletrica',
        'Tintas e Vernizes': 'tintas-vernizes',
        'Madeiras': 'madeiras',
        'Ferramentas': 'ferramentas',
        'Acabamento': 'acabamento',
        'Outros': 'outros'
    };
    
    return typeMapping[typeName] || 'outros';
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// ===== IMPORTAÇÃO RÁPIDA (ÚLTIMO ARQUIVO) =====

function saveLastImportInfo(file) {
    lastImportedFile = {
        name: file.name,
        path: file.path || file.name, // path pode não estar disponível em alguns navegadores
        lastModified: file.lastModified,
        size: file.size
    };
    
    lastImportType = currentImportType;
    
    // Salvar no localStorage
    localStorage.setItem('lastImportedFile', JSON.stringify(lastImportedFile));
    localStorage.setItem('lastImportType', lastImportType);
    
    // Mostrar botão de importação rápida
    showQuickImportButton();
}

function loadLastImportInfo() {
    const savedFile = localStorage.getItem('lastImportedFile');
    const savedType = localStorage.getItem('lastImportType');
    
    if (savedFile && savedType) {
        try {
            lastImportedFile = JSON.parse(savedFile);
            lastImportType = savedType;
            showQuickImportButton();
        } catch (error) {
            console.error('Erro ao carregar informações do último arquivo:', error);
        }
    }
}

function showQuickImportButton() {
    const btn = document.getElementById('quickImportBtn');
    if (lastImportedFile) {
        btn.style.display = 'inline-block';
        btn.title = `Reimportar: ${lastImportedFile.name}`;
    }
}

function quickImport() {
    if (!lastImportedFile) {
        alert('Nenhum arquivo importado anteriormente!');
        return;
    }
    
    // Abrir seletor de arquivo com sugestão
    const fileInput = document.getElementById('fileInput');
    
    if (lastImportType === 'json') {
        fileInput.accept = '.json';
    } else if (lastImportType === 'csv') {
        fileInput.accept = '.csv';
    } else if (lastImportType === 'xlsx') {
        fileInput.accept = '.xlsx';
    }
    
    currentImportType = lastImportType;
    fileInput.click();
}

