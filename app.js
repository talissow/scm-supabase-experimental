// ===== INTEGRAÇÃO SUPABASE =====
let isSupabaseOnline = false;
let supabaseInitialized = false;
let currentUserId = null;

// Inicializar Supabase quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const configured = typeof isSupabaseConfigured === 'function' ? isSupabaseConfigured() : false;
        if (configured && typeof initSupabase === 'function') {
            supabaseInitialized = initSupabase();
        }

        const mode = typeof getOperationMode === 'function'
            ? getOperationMode()
            : (navigator.onLine ? 'local' : 'offline');

        if (mode === 'online' && supabaseInitialized) {
            isSupabaseOnline = true;

            // Obter usuário atual
            try {
                const { data: { session } } = await supabaseClient.auth.getSession();
                if (session) {
                    currentUserId = session.user.id;
                }
            } catch (err) {
                console.warn('⚠️ Não foi possível obter sessão do usuário:', err);
            }

            console.log('🟢 SCM rodando em modo ONLINE (Supabase)');
            showConnectionStatus('online');
        } else if (mode === 'offline') {
            isSupabaseOnline = false;
            console.log('🔴 SCM rodando em modo OFFLINE (IndexedDB)');
            showConnectionStatus('offline');
        } else {
            isSupabaseOnline = false;
            console.log('⚪ SCM rodando em modo LOCAL (IndexedDB)');
            showConnectionStatus('local');
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
        isSupabaseOnline = false;
        showConnectionStatus('offline');
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

// Utilitário: valida UUID v4
function isValidUUID(id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id));
}

// Indicador visual de sincronização (no cabeçalho)
function updateSyncStatus(state, message = '') {
    const header = document.querySelector('h1');
    if (!header) return;
    let syncIndicator = header.querySelector('.sync-status');
    if (!syncIndicator) {
        syncIndicator = document.createElement('span');
        syncIndicator.className = 'sync-status';
        header.appendChild(syncIndicator);
    }
    let content = '';
    switch (state) {
        case 'syncing':
            content = '<span style="color: #ffc107; font-size: 1.2em;" title="' + (message || 'Sincronizando...') + '">🟡</span>';
            break;
        case 'done':
            content = '<span style="color: #28a745; font-size: 1.2em;" title="' + (message || 'Sincronização concluída') + '">✅</span>';
            break;
        case 'error':
            content = '<span style="color: #dc3545; font-size: 1.2em;" title="' + (message || 'Erro na sincronização') + '">⚠️</span>';
            break;
        default:
            content = '';
    }
    syncIndicator.innerHTML = content;
}

// Verificar status online/offline
window.addEventListener('online', () => {
    const mode = typeof getOperationMode === 'function' ? getOperationMode() : 'online';
    isSupabaseOnline = mode === 'online' && supabaseInitialized;
    showConnectionStatus(isSupabaseOnline ? 'online' : 'local');
    console.log(isSupabaseOnline ? '🟢 Conexão restaurada - modo ONLINE' : '⚪ Conexão restaurada - modo LOCAL');

    // Disparar sincronização automática ao recuperar conexão se estivermos realmente online (Supabase)
    if (isSupabaseOnline) {
        (async () => {
            try {
                updateSyncStatus('syncing', 'Sincronizando com Supabase...');
                if (typeof syncLocalToSupabase === 'function') {
                    await syncLocalToSupabase();
                }
                // REMOVIDO: syncToLocalDB - Supabase é fonte de verdade
                updateSyncStatus('done', 'Sincronização concluída');
            } catch (err) {
                console.error('Erro na sincronização pós-reconexão:', err);
                updateSyncStatus('error', 'Falha na sincronização');
            }
        })();
    }
});

window.addEventListener('offline', () => {
    isSupabaseOnline = false;
    showConnectionStatus('offline');
    console.log('🔴 Conexão perdida - modo OFFLINE');
});

// Sincronizar dados do Supabase com IndexedDB local
async function syncToLocalDB(forceFullSync = false) {
    try {
        const lastSyncTimestamp = localStorage.getItem('lastSyncTimestamp');
        const currentTimestamp = Date.now();
        
        // Mostrar notificação de início
        updateSyncStatus('syncing', 'Sincronizando dados do Supabase...');
        if (typeof showInfoToast === 'function') {
            showInfoToast('Sincronizando dados...', 2000);
        }
        
        // Se última sincronização foi há menos de 5 minutos e não é forçada
        if (lastSyncTimestamp && !forceFullSync && 
            (currentTimestamp - parseInt(lastSyncTimestamp) < 5 * 60 * 1000)) {
            console.log('🔄 Usando dados em cache (última sincronização recente)');
            
            if (typeof showInfoToast === 'function') {
                showInfoToast('Usando dados em cache (sincronização recente)', 2000);
            }
            updateSyncStatus('done', 'Dados atualizados (cache)');
            return;
        }
        
        // Sincronizar apenas dados alterados desde a última sincronização
        if (lastSyncTimestamp && !forceFullSync) {
            const lastSync = new Date(parseInt(lastSyncTimestamp)).toISOString();
            
            // Buscar apenas produtos alterados
            const { data: updatedProducts } = await supabaseClient
                .from('products')
                .select('*')
                .gt('updated_at', lastSync);
                
            // Atualizar apenas produtos modificados
            for (const product of updatedProducts || []) {
                await updateProduct({
                    id: product.id,
                    name: product.name,
                    description: product.description || '',
                    type: product.type,
                    quantity: product.quantity,
                    minQuantity: product.min_quantity,
                    unit: product.unit
                });
            }

            updateSyncStatus('done', 'Produtos sincronizados');
        
            // Buscar movimentações novas
            const { data: newMovements } = await supabaseClient
                .from('movements')
                .select('*')
                .gt('created_at', lastSync);
                
            // Adicionar novas movimentações
            for (const movement of newMovements || []) {
                await addMovement({
                    id: movement.id,
                    productId: movement.product_id,
                    type: movement.type,
                    quantity: movement.quantity,
                    timestamp: movement.timestamp,
                    description: movement.description || ''
                });
            }
            
            console.log(`🔄 Sincronização incremental concluída: ${updatedProducts?.length || 0} produtos, ${newMovements?.length || 0} movimentações`);
            
            if (typeof showSuccessToast === 'function') {
                showSuccessToast(`Sincronização concluída: ${updatedProducts?.length || 0} produtos atualizados`);
            }
        } else {
            // Sincronização completa
            await clearAllData();
            
            // Salvar produtos no IndexedDB
            for (const product of products) {
                await addProduct(product);
            }
            
            // Salvar movimentações no IndexedDB
            for (const movement of movements) {
                await addMovement(movement);
            }
            
            console.log('🔄 Sincronização completa concluída');
            
            if (typeof showSuccessToast === 'function') {
                showSuccessToast('Sincronização completa concluída');
            }
        }
        
        localStorage.setItem('lastSyncTimestamp', currentTimestamp.toString());
    } catch (error) {
        console.error('❌ Erro ao sincronizar com IndexedDB:', error);
        
        if (typeof showErrorToast === 'function') {
            showErrorToast('Erro ao sincronizar dados: ' + error.message);
        }
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
        // PRIORIDADE SUPABASE: Se online, salvar apenas no Supabase
        if (isSupabaseOnline && supabaseInitialized) {
            console.log('🌐 PRIORIDADE SUPABASE: Dados salvos na nuvem');
            // IndexedDB apenas como backup offline
            await saveAllProducts(products);
            await saveAllMovements(movements);
            invalidateCache();
            return;
        }
        
        // MODO OFFLINE: Salvar no IndexedDB
        console.log('📂 MODO OFFLINE: Salvando no IndexedDB');
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
    
    // PRIORIDADE SUPABASE: Não usar cache quando online
    const mode = typeof getOperationMode === 'function'
        ? getOperationMode()
        : (navigator.onLine ? 'local' : 'offline');
    
    // Só usar cache se estiver offline
    if (mode === 'offline' && isCacheValid()) {
        products = productsCache;
        movements = movementsCache || [];
        const loadTime = (performance.now() - startTime).toFixed(2);
        console.log(`⚡ CACHE OFFLINE: Carregados ${products.length} produtos em ${loadTime}ms`);
        return;
    }
    
    try {
        // PRIORIDADE SUPABASE: Se online, Supabase é fonte de verdade
        if (mode === 'online' && supabaseInitialized && typeof supabaseClient !== 'undefined') {
            console.log('🌐 PRIORIDADE SUPABASE: Carregando dados da nuvem...');
            
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
                    unit: p.unit,
                    cost: p.cost || 0
                }));
                
                movements = (supabaseMovements || []).map(m => ({
                    id: m.id,
                    productId: m.product_id,
                    type: m.type,
                    quantity: m.quantity,
                    destination: m.destination,
                    timestamp: m.timestamp,
                    description: m.description || ''
                }));
                
                console.log(`✅ SUPABASE: ${products.length} produtos e ${movements.length} movimentações carregados`);
                
                // Salvar no IndexedDB como backup (sem sobrescrever Supabase)
                await saveToDatabase();
                
            } catch (supabaseError) {
                console.error('❌ Erro ao carregar do Supabase:', supabaseError);
                console.log('📂 FALLBACK: Carregando do IndexedDB...');
                products = await getAllProducts();
                movements = await getAllMovements();
            }
        } else {
            // MODO OFFLINE: Usar IndexedDB
            console.log('📂 MODO OFFLINE: Carregando do IndexedDB...');
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
    
    // Botão de limpar estoque
    document.getElementById('clearAllBtn').addEventListener('click', clearAllStock);
    
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
    
    // Controlar exibição do campo destino
    document.querySelectorAll('input[name="movementType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const destinationGroup = document.getElementById('destinationGroup');
            const destinationSelect = document.getElementById('movementDestination');
            
            if (this.value === 'saida') {
                destinationGroup.style.display = 'block';
                destinationSelect.required = true;
            } else {
                destinationGroup.style.display = 'none';
                destinationSelect.required = false;
                destinationSelect.value = '';
            }
        });
    });
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
                
                // Salvar no Supabase se modo ONLINE
                const mode = typeof getOperationMode === 'function'
                    ? getOperationMode()
                    : (navigator.onLine ? 'local' : 'offline');
                if (mode === 'online' && supabaseInitialized) {
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
            
            // Salvar no Supabase se modo ONLINE
            const mode = typeof getOperationMode === 'function'
                ? getOperationMode()
                : (navigator.onLine ? 'local' : 'offline');
            if (mode === 'online' && supabaseInitialized) {
                try {
                    const payload = {
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
                    };
                    // Apenas envia o ID se já for um UUID válido
                    if (isValidUUID(product.id)) {
                        payload.id = product.id;
                    }

                    const { data: inserted, error } = await supabaseClient
                        .from('products')
                        .insert(payload)
                        .select('*');

                    if (error) throw error;
                    // Se o ID não era UUID, refletir o ID gerado pelo banco
                    if (!isValidUUID(product.id) && inserted && inserted[0] && inserted[0].id) {
                        product.id = inserted[0].id;
                    }
                    console.log('✅ Produto salvo no Supabase', inserted ? inserted[0] : '');
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
        // Excluir do Supabase se modo ONLINE
        const mode = typeof getOperationMode === 'function'
            ? getOperationMode()
            : (navigator.onLine ? 'local' : 'offline');
        if (mode === 'online' && supabaseInitialized) {
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
    } else if (tabName === 'dashboard') {
        document.getElementById('dashboardTab').classList.add('active');
        renderDashboard();
    }
    
    // Atualizar URL no browser (se router estiver disponível)
    if (window.scmRouter) {
        const routes = {
            'dashboard': '/dashboard',
            'list': '/lista', 
            'grouped': '/agrupado'
        };
        
        if (routes[tabName]) {
            window.history.pushState({ route: routes[tabName] }, '', routes[tabName]);
        }
    }
    
    // Atualizar breadcrumbs (se router estiver disponível)
    if (window.scmRouter && window.scmRouter.updateBreadcrumbs) {
        window.scmRouter.updateBreadcrumbs();
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
    
    // Resetar campo destino
    const destinationGroup = document.getElementById('destinationGroup');
    const destinationSelect = document.getElementById('movementDestination');
    destinationGroup.style.display = 'none';
    destinationSelect.required = false;
    destinationSelect.value = '';
    
    document.getElementById('movementModal').style.display = 'block';
}

async function handleMovementSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('movementProductId').value;
    const type = document.querySelector('input[name="movementType"]:checked').value;
    const quantity = parseInt(document.getElementById('movementQuantity').value);
    const destination = document.getElementById('movementDestination').value;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Validar destino para saída
    if (type === 'saida' && !destination) {
        alert('Por favor, selecione o destino da movimentação.');
        return;
    }
    
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
            destination: type === 'saida' ? destination : null,
            timestamp: new Date().toISOString()
        };
        
        movements.push(movement);
        
        // Salvar movimentação no Supabase se online
        if (isSupabaseOnline && supabaseInitialized) {
            try {
                const movementPayload = {
                    product_id: movement.productId,
                    type: movement.type,
                    quantity: movement.quantity,
                    timestamp: movement.timestamp
                };
                if (isValidUUID(movement.id)) {
                    movementPayload.id = movement.id;
                }

                const { data: movementInserted, error: movementError } = await supabaseClient
                    .from('movements')
                    .insert(movementPayload)
                    .select('*');

                if (movementError) throw movementError;
                if (!isValidUUID(movement.id) && movementInserted && movementInserted[0] && movementInserted[0].id) {
                    movement.id = movementInserted[0].id;
                }
                
                // Atualizar produto no Supabase também
                const { error: productError } = await supabaseClient
                    .from('products')
                    .update({
                        quantity: product.quantity,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', productId);
                
                if (productError) throw productError;
                
                console.log('✅ Movimentação salva no Supabase', movementInserted ? movementInserted[0] : '');
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
                const destinationText = m.destination ? ` → ${m.destination}` : '';
                const typeClass = m.type === 'entrada' ? 'status-ok' : 'status-low';
                
                return `
                    <tr>
                        <td>${formattedDate}</td>
                        <td><span class="status-badge ${typeClass}">${typeText}${destinationText}</span></td>
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

// ===== LIMPAR TODO O ESTOQUE =====
async function clearAllStock() {
    // Verificar se há produtos
    if (products.length === 0) {
        alert('Não há materiais para limpar!');
        return;
    }
    
    // Primeira confirmação
    const confirmMsg1 = `⚠️ ATENÇÃO - AÇÃO IRREVERSÍVEL!\n\n` +
                       `Você está prestes a EXCLUIR TODOS os ${products.length} materiais do estoque.\n\n` +
                       `Essa ação NÃO pode ser desfeita!\n\n` +
                       `Deseja continuar?`;
    
    if (!confirm(confirmMsg1)) {
        return;
    }
    
    // Segunda confirmação (segurança adicional)
    const confirmMsg2 = `⚠️ ÚLTIMA CONFIRMAÇÃO!\n\n` +
                       `Tem CERTEZA ABSOLUTA que deseja excluir TODOS os ${products.length} materiais?\n\n` +
                       `Digite "CONFIRMAR" para prosseguir (ou clique em Cancelar para abortar)`;
    
    const userInput = prompt(confirmMsg2);
    
    if (userInput !== 'CONFIRMAR') {
        alert('Operação cancelada. Nenhum material foi excluído.');
        return;
    }
    
    try {
        // Mostrar mensagem de processamento
        alert('Processando... Por favor aguarde.');
        
        // Limpar do Supabase se online
        if (isSupabaseOnline && supabaseInitialized) {
            try {
                console.log('🗑️ Limpando dados do Supabase...');
                
                // Excluir todas as movimentações primeiro (foreign key)
                const { error: movementsError } = await supabaseClient
                    .from('movements')
                    .delete()
                    .neq('id', ''); // Delete all records
                
                if (movementsError) {
                    console.error('Erro ao excluir movimentações:', movementsError);
                }
                
                // Excluir todos os produtos
                const { error: productsError } = await supabaseClient
                    .from('products')
                    .delete()
                    .neq('id', ''); // Delete all records
                
                if (productsError) {
                    throw productsError;
                }
                
                console.log('✅ Dados excluídos do Supabase');
            } catch (error) {
                console.error('❌ Erro ao limpar Supabase:', error);
                alert('Erro ao limpar dados na nuvem. Continuando com limpeza local...');
            }
        }
        
        // Limpar do IndexedDB local
        await clearAllData();
        
        // Limpar arrays na memória
        products = [];
        movements = [];
        
        // Invalidar cache
        invalidateCache();
        
        // Limpar localStorage também
        localStorage.removeItem('products');
        localStorage.removeItem('movements');
        
        // Atualizar interface
        populateFilterSelects();
        renderProducts();
        renderGroupedView();
        updateAlertCounter();
        
        alert('✅ Estoque limpo com sucesso!\n\nTodos os materiais foram excluídos do sistema.');
        
        console.log('✅ Estoque completamente limpo!');
    } catch (error) {
        console.error('❌ Erro ao limpar estoque:', error);
        alert('❌ Erro ao limpar estoque: ' + error.message);
    }
}

// ===== DASHBOARD =====
let dashboardCharts = {
    category: null,
    value: null,
    status: null,
    topMaterials: null
};

function renderDashboard() {
    updateDashboardStats();
    renderCategoryChart();
    renderValueChart();
    renderStatusChart();
    renderTopMaterialsChart();
    renderCriticalMaterials();
}

function updateDashboardStats() {
    // Total de materiais
    document.getElementById('statTotalMaterials').textContent = products.length;
    
    // Valor total (assumindo que existe campo cost)
    const totalValue = products.reduce((sum, p) => {
        return sum + (p.quantity * (p.cost || 0));
    }, 0);
    document.getElementById('statTotalValue').textContent = 
        `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    
    // Estoque baixo
    const lowStock = products.filter(p => 
        p.quantity > 0 && p.quantity <= p.minQuantity
    ).length;
    document.getElementById('statLowStock').textContent = lowStock;
    
    // Esgotados
    const outOfStock = products.filter(p => p.quantity === 0).length;
    document.getElementById('statOutOfStock').textContent = outOfStock;
}

function renderCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (dashboardCharts.category) {
        dashboardCharts.category.destroy();
    }
    
    // Agrupar por categoria
    const categories = {};
    products.forEach(p => {
        const type = getTypeName(p.type);
        categories[type] = (categories[type] || 0) + 1;
    });
    
    dashboardCharts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                    '#8BC34A', '#FF5722', '#607D8B'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderValueChart() {
    const ctx = document.getElementById('valueChart');
    if (!ctx) return;
    
    if (dashboardCharts.value) {
        dashboardCharts.value.destroy();
    }
    
    // Calcular valor por categoria
    const categoryValues = {};
    products.forEach(p => {
        const type = getTypeName(p.type);
        const value = p.quantity * (p.cost || 0);
        categoryValues[type] = (categoryValues[type] || 0) + value;
    });
    
    // Ordenar por valor
    const sorted = Object.entries(categoryValues)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    dashboardCharts.value = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(([label]) => label),
            datasets: [{
                label: 'Valor (R$)',
                data: sorted.map(([, value]) => value),
                backgroundColor: '#28a745',
                borderColor: '#1e7e34',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `R$ ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

function renderStatusChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    if (dashboardCharts.status) {
        dashboardCharts.status.destroy();
    }
    
    // Contar por status
    const ok = products.filter(p => p.quantity > p.minQuantity).length;
    const low = products.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity).length;
    const out = products.filter(p => p.quantity === 0).length;
    
    dashboardCharts.status = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['OK', 'Estoque Baixo', 'Esgotado'],
            datasets: [{
                data: [ok, low, out],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderTopMaterialsChart() {
    const ctx = document.getElementById('topMaterialsChart');
    if (!ctx) return;
    
    if (dashboardCharts.topMaterials) {
        dashboardCharts.topMaterials.destroy();
    }
    
    // Top 10 por valor
    const sorted = products
        .map(p => ({
            name: p.name,
            value: p.quantity * (p.cost || 0)
        }))
        .filter(p => p.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    
    dashboardCharts.topMaterials = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
            datasets: [{
                label: 'Valor (R$)',
                data: sorted.map(p => p.value),
                backgroundColor: '#17a2b8',
                borderColor: '#117a8b',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `R$ ${context.parsed.x.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

function renderCriticalMaterials() {
    const container = document.getElementById('criticalMaterialsList');
    if (!container) return;
    
    // Materiais críticos (estoque baixo ou esgotado)
    const critical = products
        .filter(p => p.quantity <= p.minQuantity)
        .sort((a, b) => a.quantity - b.quantity);
    
    if (critical.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #28a745;">✅ Todos os materiais com estoque adequado!</p>';
        return;
    }
    
    container.innerHTML = critical.map(p => `
        <div class="critical-material-item">
            <div class="critical-material-info">
                <strong>${p.name}</strong>
                <small>${getTypeName(p.type)} • ${p.unit}</small>
            </div>
            <div class="critical-material-stock">
                <div class="stock-current">${p.quantity} ${p.unit}</div>
                <div class="stock-min">Mín: ${p.minQuantity} ${p.unit}</div>
            </div>
        </div>
    `).join('');
}

// Atualizar função switchTab para incluir dashboard
const originalSwitchTab = switchTab;
function switchTab(tabName) {
    // Chamar função original
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    if (tabName === 'list') {
        document.getElementById('listTab').classList.add('active');
    } else if (tabName === 'grouped') {
        document.getElementById('groupedTab').classList.add('active');
        renderGroupedView();
    } else if (tabName === 'dashboard') {
        document.getElementById('dashboardTab').classList.add('active');
        renderDashboard();
    }
}

// ===== GERAÇÃO DE PDFs =====

// Função auxiliar para inicializar jsPDF
function createPDF() {
    const { jsPDF } = window.jspdf;
    return new jsPDF('p', 'mm', 'a4');
}

// Cabeçalho melhorado dos relatórios
function addPDFHeader(doc, title) {
    // Fundo do cabeçalho
    doc.setFillColor(52, 152, 219);
    doc.rect(0, 0, 210, 50, 'F');
    
    // Logo/Título principal
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('SCM - Sistema de Controle de Materiais', 105, 15, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(12);
    doc.setTextColor(240, 240, 240);
    doc.setFont('helvetica', 'normal');
    doc.text('Relatórios e Gestão de Estoque', 105, 22, { align: 'center' });
    
    // Título do relatório específico
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 32, { align: 'center' });
    
    // Data e hora
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, 40, { align: 'center' });
    
    // Linha separadora elegante
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(2);
    doc.line(15, 52, 195, 52);
    
    return 58; // Retorna a posição Y após o cabeçalho
}

// Rodapé melhorado
function addPDFFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Linha separadora do rodapé
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(15, 280, 195, 280);
        
        // Informações do rodapé
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Página ${i} de ${pageCount}`,
            20,
            285
        );
        
        doc.text(
            'Desenvolvido por Talishow Tech © 2025',
            105,
            285,
            { align: 'center' }
        );
        
        doc.text(
            `SCM v1.2.0 - Sistema de Controle de Materiais`,
            190,
            285,
            { align: 'right' }
        );
    }
}

// 1. RELATÓRIO COMPLETO MELHORADO
function exportFullReportToPDF() {
    const doc = createPDF();
    let yPos = addPDFHeader(doc, 'Relatório Completo do Estoque');
    
    // Seção de Resumo com design melhorado
    yPos += 15;
    
    // Fundo da seção de resumo
    doc.setFillColor(248, 249, 250);
    doc.rect(15, yPos - 5, 180, 25, 'F');
    
    // Título da seção
    doc.setFontSize(14);
    doc.setTextColor(52, 152, 219);
    doc.setFont('helvetica', 'bold');
    doc.text('■ Resumo Executivo', 20, yPos);
    
    // Estatísticas em colunas
    yPos += 8;
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * (p.cost || 0)), 0);
    const lowStock = products.filter(p => p.quantity <= p.minQuantity).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    
    // Coluna 1
    doc.text(`• Total de Materiais: ${products.length}`, 25, yPos);
    doc.text(`• Valor Total: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 25, yPos + 5);
    
    // Coluna 2
    doc.text(`! Estoque Baixo: ${lowStock}`, 110, yPos);
    doc.text(`X Esgotados: ${outOfStock}`, 110, yPos + 5);
    
    // Tabela de materiais melhorada
    yPos += 20;
    doc.setFontSize(12);
    doc.setTextColor(52, 152, 219);
    doc.setFont('helvetica', 'bold');
    doc.text('■ Lista Completa de Materiais', 15, yPos);
    
    yPos += 5;
    doc.autoTable({
        startY: yPos,
        head: [['Nome do Material', 'Categoria', 'Quantidade', 'Unidade', 'Mínimo', 'Status']],
        body: products.map(p => [
            p.name,
            getTypeName(p.type),
            p.quantity.toString(),
            p.unit,
            p.minQuantity.toString(),
            p.quantity === 0 ? 'X Esgotado' : 
            p.quantity <= p.minQuantity ? '! Baixo' : 'OK'
        ]),
        styles: { 
            fontSize: 9,
            cellPadding: 4,
            overflow: 'linebreak',
            halign: 'left'
        },
        headStyles: { 
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        columnStyles: {
            0: { cellWidth: 60 }, // Nome
            1: { cellWidth: 30 }, // Tipo
            2: { cellWidth: 20, halign: 'center' }, // Qtd
            3: { cellWidth: 20, halign: 'center' }, // Un
            4: { cellWidth: 20, halign: 'center' }, // Mín
            5: { cellWidth: 25, halign: 'center' } // Status
        },
        didParseCell: function(data) {
            if (data.column.index === 5) {
                const status = data.cell.raw;
                if (status.includes('❌')) {
                    data.cell.styles.textColor = [220, 53, 69];
                    data.cell.styles.fontStyle = 'bold';
                } else if (status.includes('⚠️')) {
                    data.cell.styles.textColor = [255, 193, 7];
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [40, 167, 69];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
    });
    
    addPDFFooter(doc);
    doc.save(`Relatorio_Completo_${getDateString()}.pdf`);
    alert('Relatório PDF gerado com sucesso!');
}

// 2. RELATÓRIO DE MATERIAIS EM FALTA
function exportLowStockToPDF() {
    const lowStockItems = products.filter(p => p.quantity <= p.minQuantity);
    
    if (lowStockItems.length === 0) {
        alert('ℹ️ Não há materiais em falta!');
        return;
    }
    
    const doc = createPDF();
    let yPos = addPDFHeader(doc, 'Relatório de Materiais em Falta');
    
    // Seção de alerta melhorada
    yPos += 15;
    
    // Fundo do alerta
    doc.setFillColor(255, 243, 205);
    doc.rect(15, yPos - 5, 180, 20, 'F');
    doc.setDrawColor(255, 193, 7);
    doc.setLineWidth(1);
    doc.rect(15, yPos - 5, 180, 20, 'S');
    
    // Ícone e texto do alerta
    doc.setFontSize(14);
    doc.setTextColor(133, 100, 4);
    doc.setFont('helvetica', 'bold');
    doc.text(`! ALERTA DE ESTOQUE BAIXO`, 25, yPos + 5);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${lowStockItems.length} materiais precisam de reposição urgente`, 25, yPos + 12);
    
    yPos += 30;
    
    // Título da tabela
    doc.setFontSize(12);
    doc.setTextColor(52, 152, 219);
    doc.setFont('helvetica', 'bold');
    doc.text('■ Materiais que Precisam de Reposição', 15, yPos);
    
    yPos += 5;
    doc.autoTable({
        startY: yPos,
        head: [['Nome do Material', 'Categoria', 'Estoque Atual', 'Estoque Mínimo', 'Quantidade Necessária']],
        body: lowStockItems.map(p => [
            p.name,
            getTypeName(p.type),
            `${p.quantity} ${p.unit}`,
            `${p.minQuantity} ${p.unit}`,
            `${Math.max(0, p.minQuantity - p.quantity)} ${p.unit}`
        ]),
        styles: { 
            fontSize: 9,
            cellPadding: 4,
            overflow: 'linebreak',
            halign: 'left'
        },
        headStyles: { 
            fillColor: [255, 193, 7],
            textColor: [133, 100, 4],
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: { fillColor: [255, 248, 225] },
        columnStyles: {
            0: { cellWidth: 70 }, // Nome
            1: { cellWidth: 30 }, // Tipo
            2: { cellWidth: 25, halign: 'center' }, // Atual
            3: { cellWidth: 25, halign: 'center' }, // Mínimo
            4: { cellWidth: 30, halign: 'center' } // Necessário
        }
    });
    
    addPDFFooter(doc);
    doc.save(`Materiais_em_Falta_${getDateString()}.pdf`);
    alert('Relatório de falta gerado com sucesso!');
}

// 3. RELATÓRIO POR CATEGORIA
function exportByCategoryToPDF() {
    const doc = createPDF();
    let yPos = addPDFHeader(doc, 'Relatório por Categoria');
    
    // Agrupar por tipo
    const grouped = {};
    products.forEach(p => {
        const type = getTypeName(p.type);
        if (!grouped[type]) {
            grouped[type] = [];
        }
        grouped[type].push(p);
    });
    
    Object.keys(grouped).sort().forEach(type => {
        const items = grouped[type];
        
        // Cabeçalho da categoria
        yPos += 10;
        
        // Verificar se precisa de nova página
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(52, 152, 219);
        doc.text(`■ ${type} (${items.length} itens)`, 15, yPos);
        
        yPos += 5;
        doc.autoTable({
            startY: yPos,
            head: [['Nome', 'Qtd', 'Un', 'Mín', 'Status']],
            body: items.map(p => [
                p.name,
                p.quantity,
                p.unit,
                p.minQuantity,
                p.quantity === 0 ? 'X' : p.quantity <= p.minQuantity ? '!' : 'OK'
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [52, 152, 219] },
            margin: { left: 20 }
        });
        
        yPos = doc.lastAutoTable.finalY + 5;
    });
    
    addPDFFooter(doc);
    doc.save(`Relatorio_por_Categoria_${getDateString()}.pdf`);
    alert('Relatório por categoria gerado!');
}

// 4. RELATÓRIO FINANCEIRO
function exportFinancialToPDF() {
    const doc = createPDF();
    let yPos = addPDFHeader(doc, 'Relatório Financeiro do Estoque');
    
    // Calcular totais
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * (p.cost || 0)), 0);
    const withCost = products.filter(p => p.cost > 0);
    const noCost = products.filter(p => !p.cost || p.cost === 0);
    
    // Resumo financeiro
    yPos += 10;
    doc.setFontSize(12);
    doc.text('■ Resumo Financeiro', 15, yPos);
    
    yPos += 7;
    doc.setFontSize(10);
    doc.text(`Valor Total em Estoque: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPos);
    
    yPos += 5;
    doc.text(`Materiais com Custo: ${withCost.length}`, 20, yPos);
    
    yPos += 5;
    doc.text(`Materiais sem Custo: ${noCost.length}`, 20, yPos);
    
    // Tabela detalhada
    yPos += 10;
    doc.autoTable({
        startY: yPos,
        head: [['Nome', 'Qtd', 'Un', 'Custo Unit.', 'Total']],
        body: withCost
            .sort((a, b) => (b.quantity * b.cost) - (a.quantity * a.cost))
            .map(p => [
                p.name,
                p.quantity,
                p.unit,
                `R$ ${(p.cost || 0).toFixed(2)}`,
                `R$ ${(p.quantity * (p.cost || 0)).toFixed(2)}`
            ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [40, 167, 69] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        foot: [[
            'TOTAL',
            '',
            '',
            '',
            `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        ]],
        footStyles: { fillColor: [40, 167, 69], textColor: [255, 255, 255], fontStyle: 'bold' }
    });
    
    addPDFFooter(doc);
    doc.save(`Relatorio_Financeiro_${getDateString()}.pdf`);
    alert('Relatório financeiro gerado!');
}

// 5. EXPORTAR DASHBOARD
function exportDashboardToPDF() {
    const doc = createPDF();
    let yPos = addPDFHeader(doc, 'Dashboard do Estoque');
    
    // Cards de estatísticas
    yPos += 10;
    const stats = [
        ['Total de Materiais', products.length],
        ['Valor Total', `R$ ${products.reduce((sum, p) => sum + (p.quantity * (p.cost || 0)), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Estoque Baixo', products.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity).length],
        ['Esgotados', products.filter(p => p.quantity === 0).length]
    ];
    
    doc.autoTable({
        startY: yPos,
        head: [['Indicador', 'Valor']],
        body: stats,
        styles: { fontSize: 11 },
        headStyles: { fillColor: [52, 152, 219] },
        columnStyles: {
            0: { fontStyle: 'bold' },
            1: { halign: 'right', fontStyle: 'bold', fontSize: 14 }
        }
    });
    
    // Top 10 materiais
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text('🔝 Top 10 Materiais (Valor)', 15, yPos);
    
    const top10 = products
        .map(p => ({ name: p.name, value: p.quantity * (p.cost || 0) }))
        .filter(p => p.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    
    yPos += 5;
    doc.autoTable({
        startY: yPos,
        head: [['Posição', 'Material', 'Valor Total']],
        body: top10.map((p, index) => [
            `${index + 1}º`,
            p.name,
            `R$ ${p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [23, 162, 184] }
    });
    
    addPDFFooter(doc);
    doc.save(`Dashboard_${getDateString()}.pdf`);
    alert('Dashboard exportado em PDF!');
}

// Função auxiliar para ícone do tipo
function getTypeIcon(type) {
    const icons = {
        'Cimento e Argamassa': '🏗️',
        'Areia e Brita': '⛰️',
        'Tijolos e Blocos': '🧱',
        'Ferragens': '🔩',
        'Hidráulica': '🚰',
        'Elétrica': '⚡',
        'Tintas e Vernizes': '🎨',
        'Madeiras': '🪵',
        'Ferramentas': '🔨',
        'Acabamento': '✨',
        'Outros': '📦'
    };
    
    // Verificar se é tipo customizado
    const customType = customTypes.find(t => t.name === type);
    if (customType) {
        return customType.icon || '📦';
    }
    
    return icons[type] || '📦';
}

