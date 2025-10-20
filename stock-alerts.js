// ===== SISTEMA DE ALERTAS DE ESTOQUE =====
// Este módulo gerencia alertas para produtos com estoque baixo

// Verificar produtos com estoque baixo
async function checkLowStockItems() {
    try {
        // Obter todos os produtos
        const products = await getAllProducts();
        
        // Filtrar produtos com estoque abaixo do mínimo
        const lowStockItems = products.filter(p => p.quantity <= p.minQuantity);
        
        // Se existem itens com estoque baixo
        if (lowStockItems.length > 0) {
            // Mostrar alerta na interface
            showLowStockAlert(lowStockItems);
            
            // Mostrar notificação toast se disponível
            if (typeof showWarningToast === 'function') {
                showWarningToast(`⚠️ ${lowStockItems.length} itens com estoque baixo`, 5000);
            }
            
            return lowStockItems;
        }
        
        return [];
    } catch (error) {
        console.error('❌ Erro ao verificar estoque baixo:', error);
        return [];
    }
}

// Mostrar alerta de estoque baixo na interface
function showLowStockAlert(items) {
    // Verificar se o container de alertas existe
    let alertContainer = document.getElementById('stock-alerts');
    
    // Se não existe, criar
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'stock-alerts';
        alertContainer.className = 'alert-container';
        
        // Adicionar estilos
        alertContainer.style.position = 'fixed';
        alertContainer.style.bottom = '20px';
        alertContainer.style.left = '20px';
        alertContainer.style.zIndex = '1000';
        
        // Adicionar ao body
        document.body.appendChild(alertContainer);
    }
    
    // Criar alerta
    const alert = document.createElement('div');
    alert.className = 'alert alert-warning';
    alert.style.backgroundColor = '#fff3cd';
    alert.style.color = '#856404';
    alert.style.padding = '15px';
    alert.style.borderRadius = '8px';
    alert.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    alert.style.marginBottom = '10px';
    alert.style.display = 'flex';
    alert.style.flexDirection = 'column';
    alert.style.gap = '10px';
    
    // Adicionar conteúdo
    alert.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 style="margin: 0; font-size: 16px;">⚠️ Alerta de Estoque Baixo</h4>
            <button class="close-alert" style="background: none; border: none; cursor: pointer; font-size: 18px;">&times;</button>
        </div>
        <p style="margin: 0;">${items.length} ${items.length === 1 ? 'item está' : 'itens estão'} abaixo do mínimo recomendado</p>
        <button class="btn-details" style="background: #ffc107; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Ver Detalhes</button>
    `;
    
    // Adicionar ao container
    alertContainer.appendChild(alert);
    
    // Adicionar evento para fechar
    const closeButton = alert.querySelector('.close-alert');
    closeButton.addEventListener('click', () => {
        alert.remove();
    });
    
    // Adicionar evento para ver detalhes
    const detailsButton = alert.querySelector('.btn-details');
    detailsButton.addEventListener('click', () => {
        showLowStockDetails(items);
    });
    
    return alert;
}

// Mostrar detalhes dos itens com estoque baixo
function showLowStockDetails(items) {
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';
    
    // Criar conteúdo do modal
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = 'white';
    modalContent.style.borderRadius = '8px';
    modalContent.style.padding = '20px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '600px';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    
    // Adicionar cabeçalho
    modalContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0;">Itens com Estoque Baixo</h3>
            <button class="close-modal" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
        </div>
    `;
    
    // Criar tabela de itens
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    // Adicionar cabeçalho da tabela
    table.innerHTML = `
        <thead>
            <tr>
                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Nome</th>
                <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Estoque Atual</th>
                <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Estoque Mínimo</th>
                <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Ação</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    
    // Adicionar itens à tabela
    const tbody = table.querySelector('tbody');
    items.forEach(item => {
        const tr = document.createElement('tr');
        
        // Calcular cor de fundo baseada na criticidade
        const ratio = item.quantity / item.minQuantity;
        let bgColor = '#fff3cd'; // Amarelo para alerta normal
        
        if (ratio === 0) {
            bgColor = '#f8d7da'; // Vermelho para estoque zero
        } else if (ratio < 0.5) {
            bgColor = '#ffe5d0'; // Laranja para muito crítico
        }
        
        tr.style.backgroundColor = bgColor;
        
        tr.innerHTML = `
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
            <td style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity} ${item.unit}</td>
            <td style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">${item.minQuantity} ${item.unit}</td>
            <td style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">
                <button class="btn-add-stock" data-id="${item.id}" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Adicionar</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Adicionar tabela ao modal
    modalContent.appendChild(table);
    
    // Adicionar modal ao body
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Adicionar evento para fechar modal
    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        modal.remove();
    });
    
    // Adicionar evento para fechar ao clicar fora
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
    
    // Adicionar eventos para botões de adicionar estoque
    const addButtons = modal.querySelectorAll('.btn-add-stock');
    addButtons.forEach(button => {
        button.addEventListener('click', (ev) => {
            // Evitar qualquer navegação inesperada
            if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
            if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
            const productId = button.getAttribute('data-id');
            // Abrir modal de movimentação na própria página com tipo 'entrada'
            if (typeof openMovementModal === 'function') {
                // Garantir que estamos na aba de lista onde o modal existe
                if (typeof switchTab === 'function') {
                    try { switchTab('list'); } catch (_) {}
                }
                openMovementModal(productId);
                const entradaRadio = document.querySelector('input[name="movementType"][value="entrada"]');
                if (entradaRadio) {
                    entradaRadio.checked = true;
                    entradaRadio.dispatchEvent(new Event('change'));
                }
                const qty = document.getElementById('movementQuantity');
                if (qty) qty.focus();
                // Fechar modal de detalhes
                modal.remove();
            }
        });
    });
}

// Verificar estoque baixo periodicamente
function startLowStockMonitoring(intervalMinutes = 60) {
    // Verificar imediatamente
    checkLowStockItems();
    
    // Configurar verificação periódica
    setInterval(checkLowStockItems, intervalMinutes * 60 * 1000);
}

// Iniciar monitoramento quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Iniciar após 5 segundos para garantir que outros componentes estejam carregados
    setTimeout(() => {
        startLowStockMonitoring(30); // Verificar a cada 30 minutos
    }, 5000);
});