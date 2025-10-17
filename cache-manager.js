// ===== SISTEMA DE CACHE INTELIGENTE =====
// Este módulo gerencia o cache de dados para melhorar a performance do sistema

const cacheManager = {
    data: {},
    maxAge: 5 * 60 * 1000, // 5 minutos por padrão
    
    // Configurar tempo máximo de cache
    setMaxAge(milliseconds) {
        this.maxAge = milliseconds;
    },
    
    // Armazenar item no cache
    set(key, value, customMaxAge = null) {
        this.data[key] = {
            value,
            timestamp: Date.now(),
            maxAge: customMaxAge || this.maxAge
        };
        return value;
    },
    
    // Obter item do cache
    get(key) {
        const item = this.data[key];
        if (!item) return null;
        
        // Verificar se o item expirou
        if (Date.now() - item.timestamp > item.maxAge) {
            this.remove(key);
            return null;
        }
        
        return item.value;
    },
    
    // Remover item do cache
    remove(key) {
        if (this.data[key]) {
            delete this.data[key];
            return true;
        }
        return false;
    },
    
    // Limpar todo o cache
    clear() {
        this.data = {};
    },
    
    // Verificar se item existe no cache e não expirou
    has(key) {
        const item = this.data[key];
        if (!item) return false;
        
        if (Date.now() - item.timestamp > item.maxAge) {
            this.remove(key);
            return false;
        }
        
        return true;
    },
    
    // Obter estatísticas do cache
    getStats() {
        const totalItems = Object.keys(this.data).length;
        let expiredItems = 0;
        let validItems = 0;
        
        for (const key in this.data) {
            if (Date.now() - this.data[key].timestamp > this.data[key].maxAge) {
                expiredItems++;
            } else {
                validItems++;
            }
        }
        
        return {
            totalItems,
            expiredItems,
            validItems,
            cacheSize: JSON.stringify(this.data).length
        };
    }
};

// Função para obter dados com cache
async function getCachedData(key, fetchFunction, maxAge = null) {
    // Verificar se existe no cache
    const cachedData = cacheManager.get(key);
    if (cachedData) {
        console.log(`🔄 Usando dados em cache para: ${key}`);
        return cachedData;
    }
    
    // Se não existe no cache, buscar dados
    try {
        console.log(`🔄 Buscando dados frescos para: ${key}`);
        const freshData = await fetchFunction();
        
        // Armazenar no cache
        cacheManager.set(key, freshData, maxAge);
        
        return freshData;
    } catch (error) {
        console.error(`❌ Erro ao buscar dados para: ${key}`, error);
        throw error;
    }
}