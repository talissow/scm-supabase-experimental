// ===== INDEXEDDB - GERENCIAMENTO DE BANCO DE DADOS =====
const DB_NAME = 'EstoqueMateriais';
const DB_VERSION = 2; // Atualizado para criar customTypes store
let db = null;

// ===== INICIALIZAÇÃO DO BANCO =====
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('Erro ao abrir IndexedDB:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('IndexedDB inicializado com sucesso!');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            
            // Criar object store para produtos
            if (!db.objectStoreNames.contains('products')) {
                const productStore = db.createObjectStore('products', { keyPath: 'id' });
                productStore.createIndex('name', 'name', { unique: false });
                productStore.createIndex('type', 'type', { unique: false });
                productStore.createIndex('quantity', 'quantity', { unique: false });
                console.log('Object store "products" criado');
            }
            
            // Criar object store para movimentações
            if (!db.objectStoreNames.contains('movements')) {
                const movementStore = db.createObjectStore('movements', { keyPath: 'id' });
                movementStore.createIndex('productId', 'productId', { unique: false });
                movementStore.createIndex('timestamp', 'timestamp', { unique: false });
                console.log('Object store "movements" criado');
            }
            
            // Criar object store para tipos customizados
            if (!db.objectStoreNames.contains('customTypes')) {
                const typesStore = db.createObjectStore('customTypes', { keyPath: 'id' });
                typesStore.createIndex('name', 'name', { unique: true });
                console.log('Object store "customTypes" criado');
            }
        };
    });
}

// ===== OPERAÇÕES DE PRODUTOS =====

// Salvar todos os produtos
async function saveAllProducts(products) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');
        
        // Limpar store
        store.clear();
        
        // Adicionar todos os produtos
        products.forEach(product => {
            store.add(product);
        });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

// Obter todos os produtos
async function getAllProducts() {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readonly');
        const store = transaction.objectStore('products');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// Adicionar produto
async function addProduct(product) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');
        const request = store.add(product);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Atualizar produto
async function updateProduct(product) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');
        const request = store.put(product);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Deletar produto
async function deleteProduct(id) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Buscar produtos por nome (otimizado)
async function searchProductsByName(searchTerm) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readonly');
        const store = transaction.objectStore('products');
        const request = store.getAll();
        
        request.onsuccess = () => {
            const products = request.result || [];
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            resolve(filtered);
        };
        request.onerror = () => reject(request.error);
    });
}

// Buscar produtos por tipo
async function getProductsByType(type) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readonly');
        const store = transaction.objectStore('products');
        const index = store.index('type');
        const request = index.getAll(type);
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// ===== OPERAÇÕES DE MOVIMENTAÇÕES =====

// Salvar todas as movimentações
async function saveAllMovements(movements) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['movements'], 'readwrite');
        const store = transaction.objectStore('movements');
        
        // Limpar store
        store.clear();
        
        // Adicionar todas as movimentações
        movements.forEach(movement => {
            store.add(movement);
        });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

// Obter todas as movimentações
async function getAllMovements() {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['movements'], 'readonly');
        const store = transaction.objectStore('movements');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// Adicionar movimentação
async function addMovement(movement) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['movements'], 'readwrite');
        const store = transaction.objectStore('movements');
        const request = store.add(movement);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Obter movimentações de um produto
async function getMovementsByProductId(productId) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['movements'], 'readonly');
        const store = transaction.objectStore('movements');
        const index = store.index('productId');
        const request = index.getAll(productId);
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// Deletar movimentações de um produto
async function deleteMovementsByProductId(productId) {
    if (!db) await initDB();
    
    return new Promise(async (resolve, reject) => {
        try {
            const movements = await getMovementsByProductId(productId);
            const transaction = db.transaction(['movements'], 'readwrite');
            const store = transaction.objectStore('movements');
            
            movements.forEach(movement => {
                store.delete(movement.id);
            });
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        } catch (error) {
            reject(error);
        }
    });
}

// ===== MIGRAÇÃO DE DADOS DO LOCALSTORAGE =====
async function migrateFromLocalStorage() {
    const localProducts = localStorage.getItem('products');
    const localMovements = localStorage.getItem('movements');
    
    if (localProducts || localMovements) {
        console.log('Migrando dados do localStorage para IndexedDB...');
        
        try {
            if (localProducts) {
                const products = JSON.parse(localProducts);
                await saveAllProducts(products);
                console.log(`${products.length} produtos migrados`);
            }
            
            if (localMovements) {
                const movements = JSON.parse(localMovements);
                await saveAllMovements(movements);
                console.log(`${movements.length} movimentações migradas`);
            }
            
            // Criar backup antes de limpar
            const backupData = {
                products: localProducts ? JSON.parse(localProducts) : [],
                movements: localMovements ? JSON.parse(localMovements) : [],
                migratedAt: new Date().toISOString()
            };
            localStorage.setItem('backup_before_migration', JSON.stringify(backupData));
            
            // Limpar localStorage (opcional - manter como backup)
            // localStorage.removeItem('products');
            // localStorage.removeItem('movements');
            
            console.log('Migração concluída com sucesso!');
            return true;
        } catch (error) {
            console.error('Erro na migração:', error);
            alert('Erro ao migrar dados. Os dados antigos foram preservados.');
            return false;
        }
    }
    
    return false;
}

// ===== OPERAÇÕES DE TIPOS CUSTOMIZADOS =====

// Obter todos os tipos customizados
async function getAllCustomTypes() {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['customTypes'], 'readonly');
        const store = transaction.objectStore('customTypes');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// Adicionar tipo customizado
async function addCustomType(type) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['customTypes'], 'readwrite');
        const store = transaction.objectStore('customTypes');
        const request = store.add(type);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Deletar tipo customizado
async function deleteCustomType(id) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['customTypes'], 'readwrite');
        const store = transaction.objectStore('customTypes');
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ===== BACKUP E LIMPEZA =====

// Limpar todo o banco (usar com cuidado!)
async function clearAllData() {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products', 'movements', 'customTypes'], 'readwrite');
        
        transaction.objectStore('products').clear();
        transaction.objectStore('movements').clear();
        transaction.objectStore('customTypes').clear();
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

// Obter estatísticas do banco
async function getDatabaseStats() {
    if (!db) await initDB();
    
    const products = await getAllProducts();
    const movements = await getAllMovements();
    
    return {
        totalProducts: products.length,
        totalMovements: movements.length,
        lowStockProducts: products.filter(p => p.quantity <= p.minQuantity).length,
        outOfStockProducts: products.filter(p => p.quantity === 0).length
    };
}

// ===== FALLBACK PARA LOCALSTORAGE (em caso de erro) =====
const useFallback = false;

async function initDBWithFallback() {
    try {
        await initDB();
        
        // Tentar migrar dados do localStorage se existirem
        await migrateFromLocalStorage();
        
        return true;
    } catch (error) {
        console.error('IndexedDB não disponível, usando localStorage como fallback:', error);
        alert('Aviso: Sistema usando armazenamento limitado. Funcionalidade normal, mas com menor capacidade.');
        return false;
    }
}

