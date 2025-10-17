// ===== SISTEMA DE PROTEÇÃO ANTI-DEBUG =====
// Proteção contra F12, DevTools, console e inspeção de código

(function() {
    'use strict';
    // ===== MODO DESENVOLVIMENTO: DESABILITAR PROTEÇÃO =====
    try {
        const params = new URLSearchParams(window.location.search);
        const isDevEnv = (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:' ||
            params.has('dev') ||
            params.has('noSecurity') ||
            params.has('debug') ||
            window.__DISABLE_SECURITY__ === true
        );

        if (isDevEnv) {
            console.log('🟡 Segurança desativada (ambiente de desenvolvimento/local).');
            // noop export para manter compatibilidade
            window.disableSecurity = function() {
                console.log('Segurança já desativada para desenvolvimento.');
            };
            return; // Não ativar bloqueios em ambiente dev
        }
    } catch (err) {
        console.warn('Aviso: falha ao verificar modo desenvolvimento', err);
    }
    
    // ===== DETECTAR E BLOQUEAR DEVTOOLS =====
    let devtools = {open: false, orientation: null};
    
    // Detectar abertura do DevTools
    const threshold = 160;
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.clear();
                console.log('%c🔒 ACESSO NEGADO', 'color: red; font-size: 50px; font-weight: bold;');
                console.log('%c❌ DevTools detectado!', 'color: red; font-size: 20px;');
                console.log('%c⚠️ Esta aplicação está protegida contra inspeção.', 'color: orange; font-size: 16px;');
                console.log('%c🚫 Fechar DevTools imediatamente!', 'color: red; font-size: 16px; font-weight: bold;');
                
                // Bloquear página
                document.body.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
                        color: white;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        font-family: Arial, sans-serif;
                        z-index: 999999;
                    ">
                        <h1 style="font-size: 60px; margin-bottom: 20px;">🔒</h1>
                        <h2 style="font-size: 40px; margin-bottom: 20px;">ACESSO NEGADO</h2>
                        <p style="font-size: 24px; margin-bottom: 30px; text-align: center;">
                            DevTools detectado!<br>
                            Esta aplicação está protegida contra inspeção.
                        </p>
                        <button onclick="location.reload()" style="
                            background: white;
                            color: #ff416c;
                            border: none;
                            padding: 15px 30px;
                            font-size: 18px;
                            border-radius: 25px;
                            cursor: pointer;
                            font-weight: bold;
                        ">
                            🔄 Recarregar Página
                        </button>
                    </div>
                `;
                
                // Desabilitar todas as funcionalidades
                document.addEventListener('keydown', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });
                
                document.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    return false;
                });
            }
        } else {
            devtools.open = false;
        }
    }, 500);

    // ===== BLOQUEAR F12 E ATALHOS =====
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Ctrl+U (Ver código fonte)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Ctrl+S (Salvar página)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Ctrl+A (Selecionar tudo)
        if (e.ctrlKey && e.keyCode === 65) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Ctrl+C (Copiar)
        if (e.ctrlKey && e.keyCode === 67) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Ctrl+V (Colar)
        if (e.ctrlKey && e.keyCode === 86) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Ctrl+X (Recortar)
        if (e.ctrlKey && e.keyCode === 88) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // Ctrl+P (Imprimir)
        if (e.ctrlKey && e.keyCode === 80) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    // ===== BLOQUEAR CLIQUE DIREITO =====
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // ===== BLOQUEAR SELEÇÃO DE TEXTO =====
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });

    // ===== BLOQUEAR ARRASTAR =====
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });

    // ===== DETECTAR CONSOLE ABERTO =====
    let consoleOpen = false;
    let start = Date.now();
    
    setInterval(function() {
        if (consoleOpen) {
            console.clear();
            console.log('%c🔒 CONSOLE BLOQUEADO', 'color: red; font-size: 30px; font-weight: bold;');
            console.log('%c❌ Esta aplicação não permite inspeção via console!', 'color: red; font-size: 16px;');
        }
        
        consoleOpen = true;
        setTimeout(function() {
            consoleOpen = false;
        }, 100);
    }, 1000);

    // ===== BLOQUEAR CONSOLE METHODS =====
    (function() {
        const noop = function() {};
        const methods = ['log', 'debug', 'info', 'warn', 'error', 'trace', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'count', 'clear', 'table', 'assert'];
        
        for (let i = 0; i < methods.length; i++) {
            console[methods[i]] = noop;
        }
    })();

    // ===== OFUSCAR CÓDIGO =====
    function obfuscateCode() {
        // Remover comentários
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src) return; // Não ofuscar scripts externos
            
            let code = script.innerHTML;
            // Remover comentários de linha
            code = code.replace(/\/\/.*$/gm, '');
            // Remover comentários de bloco
            code = code.replace(/\/\*[\s\S]*?\*\//g, '');
            // Remover espaços extras
            code = code.replace(/\s+/g, ' ').trim();
            
            script.innerHTML = code;
        });
    }

    // Executar ofuscação após carregamento
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', obfuscateCode);
    } else {
        obfuscateCode();
    }

    // ===== DETECTAR INSPEÇÃO DE ELEMENTOS =====
    let elementInspected = false;
    
    document.addEventListener('mouseover', function(e) {
        if (e.target && e.target !== document.body) {
            elementInspected = true;
        }
    });
    
    setInterval(function() {
        if (elementInspected) {
            console.clear();
            console.log('%c🔒 INSPEÇÃO BLOQUEADA', 'color: red; font-size: 30px; font-weight: bold;');
            console.log('%c❌ Não é possível inspecionar elementos desta página!', 'color: red; font-size: 16px;');
            elementInspected = false;
        }
    }, 100);

    // ===== PROTEÇÃO CONTRA DEBUGGING =====
    (function() {
        let devtools = false;
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function() {
                devtools = true;
                console.clear();
                console.log('%c🔒 DEBUG BLOQUEADO', 'color: red; font-size: 30px; font-weight: bold;');
                console.log('%c❌ Não é possível fazer debug desta aplicação!', 'color: red; font-size: 16px;');
                throw new Error('Debug blocked');
            }
        });
        
        setInterval(function() {
            devtools = false;
            console.log('%c', element);
            if (devtools) {
                document.body.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
                        color: white;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        font-family: Arial, sans-serif;
                        z-index: 999999;
                    ">
                        <h1 style="font-size: 60px; margin-bottom: 20px;">🚫</h1>
                        <h2 style="font-size: 40px; margin-bottom: 20px;">DEBUG BLOQUEADO</h2>
                        <p style="font-size: 24px; margin-bottom: 30px; text-align: center;">
                            Tentativa de debug detectada!<br>
                            Esta aplicação está protegida.
                        </p>
                        <button onclick="location.reload()" style="
                            background: white;
                            color: #ff416c;
                            border: none;
                            padding: 15px 30px;
                            font-size: 18px;
                            border-radius: 25px;
                            cursor: pointer;
                            font-weight: bold;
                        ">
                            🔄 Recarregar Página
                        </button>
                    </div>
                `;
            }
        }, 1000);
    })();

    // ===== BLOQUEAR IFrame EMBEDDING =====
    if (window.top !== window.self) {
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
                z-index: 999999;
            ">
                <h1 style="font-size: 60px; margin-bottom: 20px;">🚫</h1>
                <h2 style="font-size: 40px; margin-bottom: 20px;">FRAME BUSTING</h2>
                <p style="font-size: 24px; margin-bottom: 30px; text-align: center;">
                    Esta aplicação não pode ser incorporada em frames!<br>
                    Acesse diretamente a URL.
                </p>
                <button onclick="window.top.location.href = window.location.href" style="
                    background: white;
                    color: #ff416c;
                    border: none;
                    padding: 15px 30px;
                    font-size: 18px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    🚀 Abrir em Nova Aba
                </button>
            </div>
        `;
    }

    // ===== ADICIONAR MENSAGEM DE PROTEÇÃO =====
    console.log('%c🔒 SISTEMA PROTEGIDO', 'color: red; font-size: 20px; font-weight: bold;');
    console.log('%c⚠️ Esta aplicação está protegida contra inspeção e debug.', 'color: orange; font-size: 14px;');
    console.log('%c🚫 Não tente acessar o código-fonte ou usar DevTools.', 'color: red; font-size: 14px;');

    // ===== EXPORTAR FUNÇÃO PARA DESABILITAR PROTEÇÃO (APENAS PARA DESENVOLVIMENTO) =====
    window.disableSecurity = function() {
        if (confirm('⚠️ ATENÇÃO: Deseja realmente desabilitar a proteção de segurança?\n\nIsso deve ser usado APENAS para desenvolvimento!')) {
            location.reload();
        }
    };

})();
