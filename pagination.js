// ===== SISTEMA DE PAGINAÇÃO =====
// Este módulo implementa paginação para consultas de dados

// Função para paginar resultados
function paginateResults(items, page = 1, pageSize = 20) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
        items: items.slice(startIndex, endIndex),
        totalItems: items.length,
        totalPages: Math.ceil(items.length / pageSize),
        currentPage: page,
        pageSize: pageSize,
        hasNextPage: endIndex < items.length,
        hasPreviousPage: page > 1
    };
}

// Criar controles de paginação
function createPaginationControls(paginationData, containerSelector, onPageChange) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    // Limpar container
    container.innerHTML = '';
    
    // Se não há páginas suficientes, não mostrar paginação
    if (paginationData.totalPages <= 1) return;
    
    // Criar elemento de paginação
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.style.display = 'flex';
    pagination.style.justifyContent = 'center';
    pagination.style.margin = '20px 0';
    pagination.style.gap = '5px';
    
    // Botão anterior
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&laquo; Anterior';
    prevButton.className = 'pagination-btn';
    prevButton.style.padding = '8px 12px';
    prevButton.style.border = '1px solid #ddd';
    prevButton.style.borderRadius = '4px';
    prevButton.style.background = paginationData.hasPreviousPage ? '#f8f9fa' : '#e9ecef';
    prevButton.style.cursor = paginationData.hasPreviousPage ? 'pointer' : 'not-allowed';
    prevButton.disabled = !paginationData.hasPreviousPage;
    
    prevButton.addEventListener('click', () => {
        if (paginationData.hasPreviousPage) {
            onPageChange(paginationData.currentPage - 1);
        }
    });
    
    pagination.appendChild(prevButton);
    
    // Botões de página
    const maxVisiblePages = 5;
    let startPage = Math.max(1, paginationData.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(paginationData.totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar startPage se necessário
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Primeira página
    if (startPage > 1) {
        const firstPageBtn = document.createElement('button');
        firstPageBtn.textContent = '1';
        firstPageBtn.className = 'pagination-btn';
        firstPageBtn.style.padding = '8px 12px';
        firstPageBtn.style.border = '1px solid #ddd';
        firstPageBtn.style.borderRadius = '4px';
        firstPageBtn.style.background = '#f8f9fa';
        firstPageBtn.style.cursor = 'pointer';
        
        firstPageBtn.addEventListener('click', () => {
            onPageChange(1);
        });
        
        pagination.appendChild(firstPageBtn);
        
        // Adicionar elipses se necessário
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '8px 12px';
            pagination.appendChild(ellipsis);
        }
    }
    
    // Páginas numeradas
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i.toString();
        pageBtn.className = 'pagination-btn';
        pageBtn.style.padding = '8px 12px';
        pageBtn.style.border = '1px solid #ddd';
        pageBtn.style.borderRadius = '4px';
        pageBtn.style.cursor = 'pointer';
        
        // Destacar página atual
        if (i === paginationData.currentPage) {
            pageBtn.style.background = '#007bff';
            pageBtn.style.color = 'white';
            pageBtn.style.borderColor = '#007bff';
        } else {
            pageBtn.style.background = '#f8f9fa';
        }
        
        pageBtn.addEventListener('click', () => {
            onPageChange(i);
        });
        
        pagination.appendChild(pageBtn);
    }
    
    // Última página
    if (endPage < paginationData.totalPages) {
        // Adicionar elipses se necessário
        if (endPage < paginationData.totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '8px 12px';
            pagination.appendChild(ellipsis);
        }
        
        const lastPageBtn = document.createElement('button');
        lastPageBtn.textContent = paginationData.totalPages.toString();
        lastPageBtn.className = 'pagination-btn';
        lastPageBtn.style.padding = '8px 12px';
        lastPageBtn.style.border = '1px solid #ddd';
        lastPageBtn.style.borderRadius = '4px';
        lastPageBtn.style.background = '#f8f9fa';
        lastPageBtn.style.cursor = 'pointer';
        
        lastPageBtn.addEventListener('click', () => {
            onPageChange(paginationData.totalPages);
        });
        
        pagination.appendChild(lastPageBtn);
    }
    
    // Botão próximo
    const nextButton = document.createElement('button');
    nextButton.innerHTML = 'Próximo &raquo;';
    nextButton.className = 'pagination-btn';
    nextButton.style.padding = '8px 12px';
    nextButton.style.border = '1px solid #ddd';
    nextButton.style.borderRadius = '4px';
    nextButton.style.background = paginationData.hasNextPage ? '#f8f9fa' : '#e9ecef';
    nextButton.style.cursor = paginationData.hasNextPage ? 'pointer' : 'not-allowed';
    nextButton.disabled = !paginationData.hasNextPage;
    
    nextButton.addEventListener('click', () => {
        if (paginationData.hasNextPage) {
            onPageChange(paginationData.currentPage + 1);
        }
    });
    
    pagination.appendChild(nextButton);
    
    // Adicionar ao container
    container.appendChild(pagination);
    
    // Adicionar informações de paginação
    const paginationInfo = document.createElement('div');
    paginationInfo.className = 'pagination-info';
    paginationInfo.style.textAlign = 'center';
    paginationInfo.style.margin = '10px 0';
    paginationInfo.style.fontSize = '14px';
    paginationInfo.style.color = '#6c757d';
    
    const startItem = (paginationData.currentPage - 1) * paginationData.pageSize + 1;
    const endItem = Math.min(startItem + paginationData.pageSize - 1, paginationData.totalItems);
    
    paginationInfo.textContent = `Mostrando ${startItem}-${endItem} de ${paginationData.totalItems} itens`;
    
    container.appendChild(paginationInfo);
    
    return pagination;
}