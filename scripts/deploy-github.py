#!/usr/bin/env python3
"""
Script para fazer commit e push da FASE 4 (React redesign) para GitHub
Usa o repositório: talissow/scm-supabase-experimental
Branch: progresso-do-projeto
"""

import subprocess
import sys
from pathlib import Path

def run_command(cmd, description=""):
    """Executa comando e mostra feedback"""
    print(f"\n▶ {description}")
    print(f"  $ {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Erro: {result.stderr}")
            return False
        print(f"✅ {result.stdout.strip()[:100]}")
        return True
    except Exception as e:
        print(f"❌ Erro ao executar: {e}")
        return False

def main():
    print("""
╔════════════════════════════════════════════════════╗
║  🚀 DEPLOY GITHUB - FASE 4 COMPLETA 🚀            ║
║                                                    ║
║  Vamos fazer push de toda a FASE 4 para GitHub   ║
║  Branch: progresso-do-projeto                    ║
╚════════════════════════════════════════════════════╝
    """)
    
    # Mudança para o diretório do projeto
    project_path = Path(__file__).parent.parent
    import os
    os.chdir(project_path)
    print(f"📁 Diretório: {os.getcwd()}")
    
    # Status
    if not run_command("git status", "1️⃣ Verificando status do repositório..."):
        return False
    
    # Add all files
    if not run_command("git add .", "2️⃣ Adicionando todos os arquivos..."):
        return False
    
    # Commit
    commit_msg = """FASE 4 CONCLUÍDA: Redesign React + Polimento

- ProductModal para criar/editar produtos
- MovementHistory para histórico completo
- Componentes de animação com Framer Motion
- PageTransition, FadeIn, SlideIn implementados
- Páginas atualizadas com novos componentes
- .gitignore atualizado para Next.js
- Documentação de deploy criada
- Projeto 100% pronto para produção

Status: PRODUCTION-READY ✅"""
    
    if not run_command(f'git commit -m "{commit_msg}"', "3️⃣ Commitando mudanças..."):
        return False
    
    # Push
    if not run_command("git push origin progresso-do-projeto", "4️⃣ Fazendo push para GitHub..."):
        return False
    
    print("""
╔════════════════════════════════════════════════════╗
║  ✅ PUSH CONCLUÍDO COM SUCESSO! ✅               ║
║                                                    ║
║  Próximo passo: Deploy em Vercel                 ║
║  Abra: https://vercel.com/dashboard              ║
║  Siga: DEPLOY_AGORA.md                           ║
╚════════════════════════════════════════════════════╝
    """)

if __name__ == "__main__":
    main()
