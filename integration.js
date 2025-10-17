// ===== INTEGRAÇÃO DAS MELHORIAS =====
// Este arquivo integra todas as melhorias implementadas

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de toast
    if (typeof initToastSystem === 'function') {
        initToastSystem();
    }
    
    // Inicializar monitoramento de estoque
    if (typeof startLowStockMonitoring === 'function') {
        startLowStockMonitoring();
    }
    
    // Adicionar controles de paginação onde necessário
    setupPagination();
});

// Configurar paginação nas páginas relevantes
function setupPagination() {
    // Verificar se estamos na página de produtos
    const productTableBody = document.getElementById('productTableBody');
    if (productTableBody) {
        // Criar container de paginação se não existir
        let paginationControls = document.getElementById('paginationControls');
        if (!paginationControls) {
            paginationControls = document.createElement('div');
            paginationControls.id = 'paginationControls';
            paginationControls.className = 'mt-3';
            productTableBody.parentNode.parentNode.appendChild(paginationControls);
        }
    }
    
    // Verificar se estamos na página de movimentações
    const movementTableBody = document.getElementById('movementTableBody');
    if (movementTableBody) {
        // Criar container de paginação se não existir
        let paginationControls = document.getElementById('paginationControls');
        if (!paginationControls) {
            paginationControls = document.createElement('div');
            paginationControls.id = 'paginationControls';
            paginationControls.className = 'mt-3';
            movementTableBody.parentNode.parentNode.appendChild(paginationControls);
        }
    }
}

// Função para carregar produtos com paginação
async function loadProductsWithPagination(page = 1, pageSize = 10) {
    try {
        // Tentar obter do cache primeiro
        const cachedProducts = typeof getCachedData === 'function' 
            ? await getCachedData('products', getAllProducts, 60) 
            : await getAllProducts();
        
        const allProducts = cachedProducts;
        
        // Aplicar paginação
        const paginatedData = typeof paginateResults === 'function'
            ? paginateResults(allProducts, page, pageSize)
            : { items: allProducts, currentPage: 1, totalPages: 1 };
        
        // Renderizar produtos
        const tableBody = document.getElementById('productTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        paginatedData.items.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.description || ''}</td>
                <td>${product.quantity}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-product" data-id="${product.id}">Editar</button>
                    <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">Excluir</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Adicionar event listeners para os botões
        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                editProduct(productId);
            });
        });
        
        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                deleteProduct(productId);
            });
        });
        
        // Criar controles de paginação
        const paginationContainer = document.getElementById('paginationControls');
        if (paginationContainer && typeof createPaginationControls === 'function') {
            createPaginationControls(paginatedData, '#paginationControls', (newPage) => {
                loadProductsWithPagination(newPage, pageSize);
            });
        }
        
        // Verificar estoque baixo
        if (typeof checkLowStockItems === 'function') {
            checkLowStockItems(allProducts);
        }
        
        // Mostrar toast de sucesso
        if (typeof showSuccessToast === 'function') {
            showSuccessToast('Produtos carregados com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        
        // Mostrar toast de erro
        if (typeof showErrorToast === 'function') {
            showErrorToast('Erro ao carregar produtos: ' + error.message);
        }
    }
}

// Substituir a função original de carregamento de produtos
if (typeof window.loadProducts === 'function') {
    window.originalLoadProducts = window.loadProducts;
    window.loadProducts = function() {
        loadProductsWithPagination();
    };
}