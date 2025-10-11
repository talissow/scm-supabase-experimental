// ===== BUILD DE PRODUÇÃO COM OFUSCAÇÃO =====
// Script para criar versão de produção com código ofuscado

const fs = require('fs');
const path = require('path');

// Função para ofuscar JavaScript
function obfuscateJS(code) {
    // Remover comentários
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    code = code.replace(/\/\/.*$/gm, '');
    
    // Remover espaços extras
    code = code.replace(/\s+/g, ' ').trim();
    
    // Minificar (versão simples)
    code = code.replace(/;\s*/g, ';');
    code = code.replace(/{\s*/g, '{');
    code = code.replace(/}\s*/g, '}');
    code = code.replace(/,\s*/g, ',');
    
    return code;
}

// Função para ofuscar HTML
function obfuscateHTML(html) {
    // Remover comentários HTML
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    
    // Remover espaços extras
    html = html.replace(/\s+/g, ' ').trim();
    
    return html;
}

// Função para ofuscar CSS
function obfuscateCSS(css) {
    // Remover comentários CSS
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remover espaços extras
    css = css.replace(/\s+/g, ' ').trim();
    
    return css;
}

// Lista de arquivos para processar
const filesToProcess = [
    'SCM_Supabase.html',
    'login.html',
    'admin-interno.html',
    'app.js',
    'auth.js',
    'router.js',
    'admin-panel.js',
    'security.js',
    'styles.css'
];

console.log('🔒 Iniciando build de produção com proteção...');

// Criar pasta de produção
if (!fs.existsSync('production')) {
    fs.mkdirSync('production');
}

// Processar cada arquivo
filesToProcess.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        if (file.endsWith('.js')) {
            content = obfuscateJS(content);
        } else if (file.endsWith('.html')) {
            content = obfuscateHTML(content);
        } else if (file.endsWith('.css')) {
            content = obfuscateCSS(content);
        }
        
        fs.writeFileSync(`production/${file}`, content);
        console.log(`✅ Processado: ${file}`);
    }
});

// Copiar arquivos de configuração
const configFiles = [
    'supabase-config.js',
    'supabase-adapter.js',
    'db.js',
    'auth-guard.js',
    'vercel.json'
];

configFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, `production/${file}`);
        console.log(`📋 Copiado: ${file}`);
    }
});

console.log('🎉 Build de produção concluído!');
console.log('📁 Arquivos protegidos estão na pasta "production/"');
console.log('🚀 Faça upload da pasta "production/" para produção');
